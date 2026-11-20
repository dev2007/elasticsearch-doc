# HTML strip 处理器

从字段中移除 HTML 标签。如果字段是字符串数组，HTML 标签将从数组的所有成员中移除。

每个 HTML 标签会被替换为一个 `\n` 字符。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要移除 HTML 标签的字符串类型字段。 |
| `target_field` | 否 | `field` | 接收转换后值的字段。默认在原字段原地更新。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且字段不存在，处理器将静默退出而不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{
  "html_strip": {
    "field": "foo"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/htmlstrip-processor.html)
