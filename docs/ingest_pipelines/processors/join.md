# Join 处理器

使用分隔符将数组的每个元素连接为单个字符串。当字段不是数组时会抛出错误。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 包含要连接的数组值的字段。 |
| `separator` | 是 | - | 分隔符字符。 |
| `target_field` | 否 | `field` | 接收连接后值的字段。默认在原字段上就地更新。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{"join":{"field":"joined_array_field","separator":"-"}}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/join-processor.html)
