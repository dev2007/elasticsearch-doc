# Append 处理器

如果字段已存在且为数组，则向该数组追加一个或多个值。如果字段存在且为标量，则将其转换为数组并追加一个或多个值。如果字段不存在，则创建一个包含所提供值的数组。接受单个值或值数组。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要追加到的字段。支持模板片段。 |
| `value` | 是 | - | 要追加的值。支持模板片段。 |
| `allow_duplicates` | 否 | `true` | 如果为 `false`，处理器不会追加字段中已存在的值。 |
| `media_type` | 否 | `application/json` | 用于编码 `value` 的媒体类型。仅当 `value` 为模板片段时适用。必须为 `application/json`、`text/plain` 或 `application/x-www-form-urlencoded` 之一。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{
  "append": {
    "field": "tags",
    "value": ["production", "{{{app}}}", "{{{owner}}}"]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/append-processor.html)
