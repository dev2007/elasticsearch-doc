# Gsub 处理器

通过应用正则表达式和替换字符串来转换字符串字段。如果该字段是字符串数组，数组中的所有成员都会被转换。如果遇到任何非字符串值，处理器将抛出异常。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要应用替换的字段。 |
| `pattern` | 是 | - | 要被替换的模式。 |
| `replacement` | 是 | - | 用于替换匹配模式的字符串。 |
| `target_field` | 否 | `field` | 接收转换后值的字段。默认情况下原字段被就地更新。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且字段不存在或为 null，处理器将静默退出而不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{
  "gsub": {
    "field": "field1",
    "pattern": "\\.",
    "replacement": "-"
  }
}
```

将 `field1` 字段中的所有 `.`（点号）替换为 `-`（连字符）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/gsub-processor.html)
