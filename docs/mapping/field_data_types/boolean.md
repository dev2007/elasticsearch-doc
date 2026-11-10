# boolean 字段类型

boolean 字段接受 JSON 的 `true` 和 `false` 值，但也可以接受被解释为 true 或 false 的字符串：

| 假值 | 真值 |
|:--|:--|
| `false`、`"false"`、`""`（空字符串） | `true`、`"true"` |

例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "is_published": {
        "type": "boolean"
      }
    }
  }
}

# 索引一个包含 "true" 的文档，它会被解释为 true
POST my-index-000001/_doc/1?refresh
{
  "is_published": "true"
}

# 使用 JSON true 搜索文档
GET my-index-000001/_search
{
  "query": {
    "term": {
      "is_published": true
    }
  }
}
```

像 `terms` 聚合这样的聚合使用 1 和 0 作为 key，使用字符串 `"true"` 和 `"false"` 作为 `key_as_string`。boolean 字段在脚本中使用时返回 `true` 和 `false`：

```bash
POST my-index-000001/_doc/1?refresh
{
  "is_published": true
}

POST my-index-000001/_doc/2?refresh
{
  "is_published": false
}

GET my-index-000001/_search
{
  "aggs": {
    "publish_state": {
      "terms": {
        "field": "is_published"
      }
    }
  },
  "sort": [ "is_published" ],
  "fields": [
    {"field": "weight"}
  ],
  "runtime_mappings": {
    "weight": {
      "type": "long",
      "script": "emit(doc['is_published'].value ? 10 : 0)"
    }
  }
}
```

## boolean 字段的参数

boolean 字段接受以下参数：

- `doc_values`
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- `index`
  （可选，Boolean）该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 `doc_values` 的字段仍然可以通过 term 或基于范围的查询进行查询，只是速度较慢。
- `ignore_malformed`
  （可选，Boolean）尝试将错误的数据类型索引到字段时，默认会抛出异常并拒绝整个文档。如果此参数设置为 `true`，则允许忽略该异常。格式错误的字段不会被索引，但文档中的其他字段会正常处理。接受 `true` 或 `false`。注意，如果使用了 `script` 参数，则无法设置此项。
- `null_value`
  （可选，Boolean）接受上面列出的任何 true 或 false 值。该值会替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。注意，如果使用了 `script` 参数，则无法设置此项。
- `on_script_error`
  （可选，枚举）定义当 `script` 参数定义的脚本在索引时抛出错误时该怎么办。接受 `fail`（默认），它会导致整个文档被拒绝；以及 `continue`，它会将该字段记录到文档的 `_ignored` 元数据字段中并继续索引。只有同时设置了 `script` 字段时才能设置此参数。
- `script`
  （可选，字符串）如果设置了此参数，则该字段将索引由此脚本生成的值，而不是直接从源中读取值。如果输入文档中为该字段设置了值，文档将被拒绝并返回错误。脚本的格式与其运行时字段等效格式相同。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。
- `meta`
  （可选，对象）关于该字段的元数据。
- `time_series_dimension`
  （可选，Boolean）将字段标记为时序维度。默认为 `false`。

  `index.mapping.dimension_fields.limit` 索引设置限制索引中的维度数量。

  维度字段具有以下约束：

  - `doc_values` 和 `index` 映射参数必须为 `true`。

## 合成 _source

boolean 字段在其默认配置下支持合成 `_source`。

合成 source 可能会对 boolean 字段的值进行排序。例如：

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
      "bool": { "type": "boolean" }
    }
  }
}

PUT idx/_doc/1
{
  "bool": [true, false, true, false]
}
```

将变为：

```json
{
  "bool": [false, false, true, true]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/boolean.html)
