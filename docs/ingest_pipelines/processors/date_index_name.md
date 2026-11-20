# Date index name 处理器

此处理器的目的是利用[日期数学索引名称](/rest_apis/api_convention/date_math_support_in_index_names)支持，根据文档中的日期或时间戳字段将文档指向正确的基于时间的索引。

该处理器基于提供的索引名称前缀、被处理文档中的日期或时间戳字段以及提供的日期舍入规则，使用日期数学索引名称表达式设置 `_index` 元数据字段。

首先，此处理器从被处理文档的某个字段中获取日期或时间戳。可以选择配置日期格式，指定字段值应如何解析为日期。然后，此日期、提供的索引名称前缀和提供的日期舍入规则会被格式化为日期数学索引名称表达式。这里同样可以选择指定日期格式，指定日期应如何格式化为日期数学索引名称表达式。

以下是一个示例管道，它基于 `date1` 字段中的日期，将文档指向以 `my-index-` 为前缀的按月索引：

```bash
PUT _ingest/pipeline/monthlyindex
{
  "description" : "monthly date-time index naming",
  "processors" : [
    {
      "date_index_name" : {
        "field" : "date1",
        "index_name_prefix" : "my-index-",
        "date_rounding" : "M"
      }
    }
  ]
}
```

将该管道用于索引请求：

```bash
PUT /my-index/_doc/1?pipeline=monthlyindex
{
  "date1" : "2016-04-25T12:02:01.789Z"
}
```

```json
{
  "_index" : "my-index-2016-04-01",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 55,
  "_primary_term" : 1
}
```

上面的请求不会将此文档索引到 `my-index` 索引，而是索引到 `my-index-2016-04-01` 索引，因为它按月进行了舍入。这是因为 date-index-name-processor 覆盖了文档的 `_index` 属性。

要查看实际索引请求中提供的索引的日期数学值（它导致上述文档被索引到 `my-index-2016-04-01`），我们可以使用模拟请求检查该处理器的效果。

```bash
POST _ingest/pipeline/_simulate
{
  "pipeline" :
  {
    "description": "monthly date-time index naming",
    "processors" : [
      {
        "date_index_name" : {
          "field" : "date1",
          "index_name_prefix" : "my-index-",
          "date_rounding" : "M"
        }
      }
    ]
  },
  "docs": [
    {
      "_source": {
        "date1": "2016-04-25T12:02:01.789Z"
      }
    }
  ]
}
```

```json
{
  "docs" : [
    {
      "doc" : {
        "_id" : "_id",
        "_index" : "<my-index-{2016-04-25||/M{yyyy-MM-dd|UTC}}>",
        "_version" : "-3",
        "_source" : {
          "date1" : "2016-04-25T12:02:01.789Z"
        },
        "_ingest" : {
          "timestamp" : "2016-11-08T19:43:03.850+0000"
        }
      }
    }
  ]
}
```

上面的示例显示 `_index` 被设置为 `<my-index-{2016-04-25||/M{yyyy-MM-dd|UTC}}>`。如[日期数学索引名称文档](/rest_apis/api_convention/date_math_support_in_index_names)中所解释的，Elasticsearch 将其理解为 `2016-04-01`。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要从中获取日期或时间戳的字段。 |
| `index_name_prefix` | 否 | - | 打印日期之前要附加到索引名称的前缀。支持模板片段。 |
| `date_rounding` | 是 | - | 将日期格式化到索引名称时如何对日期进行舍入。有效值为：`y`（年）、`M`（月）、`w`（周）、`d`（日）、`h`（小时）、`m`（分钟）和 `s`（秒）。支持模板片段。 |
| `date_formats` | 否 | `yyyy-MM-dd'T'HH:mm:ss.SSSXX` | 解析被预处理文档中的日期/时间戳时预期的日期格式数组。可以是 java time 模式，或以下格式之一：`ISO8601`、`UNIX`、`UNIX_MS` 或 `TAI64N`。 |
| `timezone` | 否 | `UTC` | 解析日期时以及日期数学索引支持将表达式解析为具体索引名称时使用的时区。 |
| `locale` | 否 | `ENGLISH` | 从被预处理文档解析日期时使用的区域设置，在解析月份名称或星期几时相关。 |
| `index_name_format` | 否 | `yyyy-MM-dd` | 将解析后的日期打印到索引名称时使用的格式。这里应为有效的 java time 模式。支持模板片段。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/date-index-name-processor.html)
