# Fail 处理器

抛出一个异常。当你预期某个管道会失败，并希望向请求方传递一条特定的错误信息时，此处理器非常有用。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `message` | 是 | - | 处理器抛出的错误消息。支持模板片段。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{
  "fail": {
    "if" : "ctx.tags.contains('production') != true",
    "message": "The production tag is not present, found tags: {{{tags}}}"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/fail-processor.html)
