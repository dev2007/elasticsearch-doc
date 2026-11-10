# date 字段类型

JSON 没有日期数据类型，因此 Elasticsearch 中的日期可以是：

- 包含格式化日期的字符串，例如 `"2015-01-01"` 或 `"2015/01/01 12:10:30"`。
- 表示自纪元（epoch）以来的毫秒数的数字。
- 表示自纪元以来的秒数的数字（参阅[纪元秒](#纪元秒)）。

在内部，日期会被转换为 UTC（如果指定了时区），并存储为表示自纪元以来毫秒数的长整型数字。

如果需要纳秒精度，请使用 [`date_nanos`](/mapping/field_data_types/date_nanos) 字段类型。

对日期的查询会在内部转换为对该长整型表示的范围查询，聚合和存储字段的结果会根据与字段关联的日期格式转换回字符串。

日期始终会被渲染为字符串，即使它们最初在 JSON 文档中是以长整型提供的。

日期格式可以自定义，但如果未指定 `format`，则使用默认格式：

```bash
"strict_date_optional_time||epoch_millis"
```

这意味着它将接受带有可选时间戳、且符合 [`strict_date_optional_time`](/mapping/mapping_parameters/format) 支持格式的日期，或自纪元以来的毫秒数。

例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "date": {
        "type": "date"
      }
    }
  }
}

# 该文档使用普通日期
PUT my-index-000001/_doc/1
{ "date": "2015-01-01" }

# 该文档包含时间
PUT my-index-000001/_doc/2
{ "date": "2015-01-01T12:10:30Z" }

# 该文档使用自纪元以来的毫秒数
PUT my-index-000001/_doc/3
{ "date": 1420070400001 }

# 注意返回的 sort 值都是自纪元以来的毫秒数
GET my-index-000001/_search
{
  "sort" : { "date" : "asc" }
}
```

1. `date` 字段使用默认的 `format`。
2. 该文档使用普通日期。
3. 该文档包含时间。
4. 该文档使用自纪元以来的毫秒数。
5. 注意返回的 `sort` 值都是自纪元以来的毫秒数。

日期将接受带小数点的数字，例如 `{"date": 1618249875.123456}`，但在某些情况下（[#70085](https://github.com/elastic/elasticsearch/issues/70085)）这些日期会丢失精度，因此应避免使用。

文本日期格式接受的文本字符串以及周日期的计算取决于 Elasticsearch 运行所在的 JDK 版本。更多信息参阅[自定义日期格式](/mapping/mapping_parameters/format)。

## 多种日期格式

可以使用 `||` 作为分隔符指定多种格式。每种格式会依次尝试，直到找到匹配的格式为止。第一种格式将用于把自纪元以来的毫秒数转换回字符串。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "date": {
        "type": "date",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}
```

## `date` 字段的参数

`date` 字段接受以下参数：

- [`doc_values`](/mapping/mapping_parameters/doc_values)
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- [`format`](/mapping/mapping_parameters/format)
  （可选，字符串）可解析的日期格式。默认为 `strict_date_optional_time||epoch_millis`。
- `locale`
  （可选，字符串）解析日期时使用的本地化设置，因为并非所有语言中的月份名称和/或缩写都相同。默认为 `ENGLISH`。
- [`ignore_malformed`](/mapping/mapping_parameters/ignore_malformed)
  （可选，Boolean）如果为 `true`，则忽略格式错误的数字。如果为 `false`（默认），格式错误的数字会抛出异常并拒绝整个文档。注意，如果使用了 `script` 参数，则无法设置此项。
- [`index`](/mapping/mapping_parameters/index)
  （可选，Boolean）该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 [`doc_values`](/mapping/mapping_parameters/doc_values) 的日期字段也可以查询，只是速度较慢。
- [`null_value`](/mapping/mapping_parameters/null_value)
  （可选，字符串）接受配置的 `format` 之一格式的日期值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。注意，如果使用了 `script` 参数，则无法设置此项。
- `on_script_error`
  （可选，枚举）定义当 `script` 参数定义的脚本在索引时抛出错误时该怎么办。接受 `fail`（默认），它会导致整个文档被拒绝；以及 `continue`，它会将该字段记录到文档的 [`_ignored`](/mapping/metadata_fields/ignored) 元数据字段中并继续索引。只有同时设置了 `script` 字段时才能设置此参数。
- `script`
  （可选，字符串）如果设置了此参数，则该字段将索引由此脚本生成的值，而不是直接从源中读取值。如果输入文档中为该字段设置了值，文档将被拒绝并返回错误。脚本的格式与其[运行时字段等效格式](/mapping/runtime_fields/map_runtime_field)相同，并且应输出长整型时间戳。
- [`store`](/mapping/mapping_parameters/store)
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 [`_source`](/mapping/metadata_fields/source) 字段检索。接受 `true` 或 `false`（默认）。
- [`meta`](/mapping/mapping_parameters/meta)
  （可选，对象）关于该字段的元数据。

## 纪元秒

如果你需要以自纪元以来的秒数发送日期，请确保 `format` 中列出 `epoch_second`：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "date": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_second"
      }
    }
  }
}

PUT my-index-000001/_doc/example?refresh
{
  "date": 1618321898
}

POST my-index-000001/_search
{
  "fields": [ { "field": "date" } ],
  "_source": false
}
```

它将返回如下日期：

```json
{
  "hits": {
    "hits": [
      {
        "_id": "example",
        "_index": "my-index-000001",
        "_score": 1.0,
        "fields": {
          "date": [ "2021-04-13T13:51:38.000Z" ]
        }
      }
    ]
  }
}
```

## 合成 `_source`

合成 source 可能会对 `date` 字段的值进行排序。例如：

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
      "date": {
        "type": "date"
      }
    }
  }
}

PUT idx/_doc/1
{
  "date": ["2015-01-01T12:10:30Z", "2014-01-01T12:10:30Z"]
}
```

将变为：

```json
{
  "date": ["2014-01-01T12:10:30.000Z", "2015-01-01T12:10:30.000Z"]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/date.html)
