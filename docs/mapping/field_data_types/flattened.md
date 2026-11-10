# flattened 字段类型

默认情况下，对象中的每个子字段都会被分别映射和索引。如果子字段的名称或类型事先未知，则会对它们进行[动态映射](/mapping/dynamic_mapping)。

`flattened` 类型提供了另一种方法：将整个对象映射为单一字段。给定一个对象，`flattened` 映射会解析出其叶子值，并将它们作为关键字索引到一个字段中。之后可以通过简单的查询和聚合来搜索该对象的内容。

此数据类型适用于索引具有大量或未知数量唯一键的对象。整个 JSON 对象只创建一个字段映射，这有助于防止因字段映射过多而导致[映射爆炸](/mapping/#防止映射爆炸)。

另一方面，扁平化对象字段在搜索功能上有所取舍。只允许基本的查询，不支持数值范围查询或高亮显示。有关限制的更多信息参阅[支持的操作](#支持的操作)部分。

`flattened` 映射类型**不应**用于索引所有文档内容，因为它将所有值视为关键字，不提供完整的搜索功能。每个子字段在映射中拥有自己条目的默认方式在大多数情况下都能很好地工作。

可以按如下方式创建扁平化对象字段：

```bash
PUT bug_reports
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "labels": {
        "type": "flattened"
      }
    }
  }
}

POST bug_reports/_doc/1
{
  "title": "Results are not sorted correctly.",
  "labels": {
    "priority": "urgent",
    "release": ["v1.2.5", "v1.3.0"],
    "timestamp": {
      "created": 1541458026,
      "closed": 1541457010
    }
  }
}
```

在索引期间，会为 JSON 对象中的每个叶子值创建词元。这些值作为字符串关键字索引，不进行分析，也不对数字或日期做特殊处理。

查询顶层的 `flattened` 字段会搜索对象中的所有叶子值：

```bash
POST bug_reports/_search
{
  "query": {
    "term": {
      "labels": "urgent"
    }
  }
}
```

要查询扁平化对象中的特定键，需要使用对象点号表示法：

```bash
POST bug_reports/_search
{
  "query": {
    "term": {
      "labels.release": "v1.3.0"
    }
  }
}
```

## 支持的操作

由于值索引方式的相似性，`flattened` 字段与 [`keyword`](/mapping/field_data_types/keyword) 字段共享大部分相同的映射和搜索功能。

目前，扁平化对象字段可以与以下查询类型一起使用：

- `term`、`terms` 和 `terms_set`
- `prefix`
- `range`
- `match` 和 `multi_match`
- `query_string` 和 `simple_query_string`
- `exists`

查询时，不能使用通配符引用字段键，例如 `{ "term": {"labels.time*": 1541457010}}`。注意，所有查询（包括 `range`）都将值视为字符串关键字。`flattened` 字段不支持高亮显示。

可以对扁平化对象字段进行排序，也可以执行简单的关键字式聚合，例如 `terms` 聚合。与查询一样，对数值没有特殊支持，JSON 对象中的所有值都被视为关键字。排序时，这意味着值按字典序进行比较。

扁平化对象字段目前无法存储。无法在映射中指定 [`store`](/mapping/mapping_parameters/store) 参数。

## 检索扁平化字段

可以使用 [`fields` 参数](/search/search/fields)检索字段值和具体子字段。由于 `flattened` 字段将可能包含许多子字段的整个对象映射为单一字段，响应中会包含来自 `_source` 的未更改结构。

不过，可以通过在请求中显式指定单个子字段来获取它们。这只适用于具体路径，不支持通配符：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "flattened_field": {
        "type": "flattened"
      }
    }
  }
}

PUT my-index-000001/_doc/1?refresh=true
{
  "flattened_field": {
    "subfield": "value"
  }
}

POST my-index-000001/_search
{
  "fields": ["flattened_field.subfield"],
  "_source": false
}
```

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": 1.0,
        "fields": {
          "flattened_field.subfield": ["value"]
        }
      }
    ]
  }
}
```

你还可以使用 [Painless 脚本](/modules/modules_scripting/painless)从扁平化字段的子字段中检索值。在 Painless 脚本中不要使用 `doc['<field_name>'].value`，而应使用 `doc['<field_name>.<sub-field_name>'].value`。例如，如果你有一个名为 `labels` 的扁平化字段，其子字段为 `release`，那么你的 Painless 脚本应为 `doc['labels.release'].value`。

例如，假设你的映射包含两个字段，其中一个是 `flattened` 类型：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "labels": {
        "type": "flattened"
      }
    }
  }
}
```

索引几个包含已映射字段的文档。`labels` 字段有三个子字段：

```bash
POST /my-index-000001/_bulk?refresh
{"index":{}}
{"title":"Something really urgent","labels":{"priority":"urgent","release":["v1.2.5","v1.3.0"],"timestamp":{"created":1541458026,"closed":1541457010}}}
{"index":{}}
{"title":"Somewhat less urgent","labels":{"priority":"high","release":["v1.3.0"],"timestamp":{"created":1541458026,"closed":1541457010}}}
{"index":{}}
{"title":"Not urgent","labels":{"priority":"low","release":["v1.2.0"],"timestamp":{"created":1541458026,"closed":1541457010}}}
```

由于 `labels` 是 `flattened` 字段类型，整个对象被映射为单一字段。要在 Painless 脚本中从此子字段检索值，请使用 `doc['<field_name>.<sub-field_name>'].value` 格式：

```json
"script": {
  "source": """
    if (doc['labels.release'].value.equals('v1.3.0'))
    {emit(doc['labels.release'].value)}
    else{emit('Version mismatch')}
  """
}
```

## 扁平化对象字段的参数

接受以下映射参数：

- `depth_limit`
  （可选，整数）扁平化对象字段允许的最大深度，以嵌套内层对象的数量计。如果扁平化对象字段超过此限制，将抛出错误。默认为 `20`。注意，`depth_limit` 可以通过[更新映射 API](/rest_apis/index_apis/update_mapping) 动态更新。
- [`doc_values`](/mapping/mapping_parameters/doc_values)
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- [`eager_global_ordinals`](/mapping/mapping_parameters/eager_global_ordinals)
  （可选，Boolean）是否应该在刷新时立即加载全局序号？接受 `true` 或 `false`（默认）。对于经常用于 terms 聚合的字段，启用此项是个好主意。
- [`ignore_above`](/mapping/mapping_parameters/ignore_above)
  （可选，整数）超过此限制的叶子值不会被索引。默认情况下没有限制，所有值都会被索引。注意，此限制适用于扁平化对象字段内的叶子值，而不是整个字段的长度。
- [`index`](/mapping/mapping_parameters/index)
  （可选，Boolean）确定该字段是否可搜索。接受 `true`（默认）或 `false`。
- [`index_options`](/mapping/mapping_parameters/index_options)
  （可选，枚举）应在索引中存储哪些信息以用于评分。默认为 `docs`，但也可以设置为 `freqs`，以便在计算分数时考虑词元频率。
- [`null_value`](/mapping/mapping_parameters/null_value)
  （可选，字符串）用于替换扁平化对象字段内任何显式 `null` 值的字符串值。默认为 `null`，表示 null 字段被视为缺失。
- [`similarity`](/mapping/mapping_parameters/similarity)
  （可选，字符串）应使用哪种评分算法或相似性。默认为 `BM25`。
- `split_queries_on_whitespace`
  （可选，Boolean）[全文查询](/query_dsl/full_text_queries/full_text_queries)在为此字段构建查询时是否应按空白符拆分输入。接受 `true` 或 `false`（默认）。
- `time_series_dimensions`
  （可选，字符串数组）扁平化对象内部的字段列表，其中每个字段都是时序的一个维度。每个字段使用相对于根字段的路径指定，不包含根字段名称。

## 合成 `_source`

扁平化字段在其默认配置下支持[合成 `_source`](/mapping/metadata_fields/source)。

合成 source 可能会对 `flattened` 字段的值进行排序并删除重复项。例如：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "flattened": { "type": "flattened" }
    }
  }
}

PUT idx/_doc/1
{
  "flattened": {
    "field": ["apple", "apple", "banana", "avocado", "10", "200", "AVOCADO", "Banana", "Tangerine"]
  }
}
```

将变为：

```json
{"flattened":{"field":["10","200","AVOCADO","Banana","Tangerine","apple","avocado","banana"]}}
```

合成 source 始终使用嵌套对象而不是对象数组。例如：

```bash
PUT idx/_doc/1
{
  "flattened": {
    "field": [{"id":1,"name":"foo"},{"id":2,"name":"bar"},{"id":3,"name":"baz"}]
  }
}
```

将变为（注意是嵌套对象而不是扁平化的数组）：

```json
{"flattened":{"field":{"id":["1","2","3"],"name":["bar","baz","foo"]}}}
```

合成 source 对单元素数组始终使用单值字段。例如：

```bash
PUT idx/_doc/1
{
  "flattened": {
    "field": ["foo"]
  }
}
```

将变为：

```json
{"flattened":{"field":"foo"}}
```

扁平化字段允许一个键同时包含对象和标量值。例如，考虑以下扁平化字段 `flattened`：

```json
{"flattened":{"foo.bar":"10","foo":{"bar":{"baz":"20"}}}}
```

由于 `"foo.bar": "10"` 隐式等价于 `"foo": { "bar": "10" }`，`"bar"` 同时拥有标量值 `"10"` 和对象值 `{ "baz": "20" }`。

使用合成 source 时，为了生成有效的 JSON 输出，包含此类字段的对象在 `_source` 中的显示会有所不同。例如，如果该字段定义在配置了合成 source 的索引中，`_source` 的值将为：

```json
{"flattened":{"foo":{"bar":"10","bar.baz":"20"}}}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/flattened.html)
