# Date 处理器

从字段中解析日期，然后使用该日期或时间戳作为文档的时间戳。默认情况下，date 处理器将解析后的日期作为名为 `@timestamp` 的新字段添加。你可以通过设置 `target_field` 配置参数指定其他字段。同一个 date 处理器定义中支持多种日期格式，这些格式将按定义时的顺序依次尝试解析日期字段。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要从中获取日期的字段。 |
| `target_field` | 否 | `@timestamp` | 保存解析后日期的字段。 |
| `formats` | 是 | - | 预期日期格式的数组。可以是 java time 模式，或以下格式之一：`ISO8601`、`UNIX`、`UNIX_MS` 或 `TAI64N`。 |
| `timezone` | 否 | `UTC` | 解析日期时使用的时区。支持模板片段。 |
| `locale` | 否 | `ENGLISH` | 解析日期时使用的区域设置，在解析月份名称或星期几时相关。支持模板片段。 |
| `output_format` | 否 | `yyyy-MM-dd'T'HH:mm:ss.SSSXXX` | 将日期写入 `target_field` 时使用的格式。必须是有效的 java time 模式。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例 1：基本用法

以下示例基于 `initial_date` 字段，将解析后的日期添加到 `timestamp` 字段：

```json
{
  "description" : "...",
  "processors" : [
    {
      "date" : {
        "field" : "initial_date",
        "target_field" : "timestamp",
        "formats" : ["dd/MM/yyyy HH:mm:ss"],
        "timezone" : "Europe/Amsterdam"
      }
    }
  ]
}
```

## 示例 2：模板化的时区与区域设置

`timezone` 和 `locale` 处理器参数支持模板化。这意味着它们的值可以从文档中的字段提取。下面的示例展示了如何从摄取文档中已有的字段 `my_timezone` 和 `my_locale` 提取区域设置/时区信息：

```json
{
  "description" : "...",
  "processors" : [
    {
      "date" : {
        "field" : "initial_date",
        "target_field" : "timestamp",
        "formats" : ["ISO8601"],
        "timezone" : "{{{my_timezone}}}",
        "locale" : "{{{my_locale}}}"
      }
    }
  ]
}
```

## 其他注意事项

文本日期格式接受的文本字符串，以及周日期（week-dates）的计算，取决于 Elasticsearch 运行所在的 JDK 版本。更多信息参阅[自定义日期格式](/mapping/mapping_parameters/format)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/date-processor.html)
