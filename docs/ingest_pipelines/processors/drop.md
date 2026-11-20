# Drop 处理器

在不引发任何错误的情况下丢弃文档。这可用于基于某些条件阻止文档被索引。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{
  "drop": {
    "if" : "ctx.network_name == 'Guest'"
  }
}
```

当 `ctx.network_name` 等于 `'Guest'` 时，丢弃该文档，使其不被索引。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/drop-processor.html)
