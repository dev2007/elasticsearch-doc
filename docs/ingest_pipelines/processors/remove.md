# Remove 处理器

移除已有字段。如果某个字段不存在，将抛出异常。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要移除的字段。支持模板片段。 |
| `ignore_missing` | 否 | `false` | 设为 `true` 时，如果字段不存在或为 `null`，处理器将安静地退出而不修改文档。 |
| `keep` | 否 | - | 要保留的字段。设置后，除指定字段以外的所有字段都会被移除。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

移除单个字段的示例：

```json
{
  "remove": {
    "field": "user_agent"
  }
}
```

移除多个字段，可以使用以下配置：

```json
{
  "remove": {
    "field": ["user_agent", "url"]
  }
}
```

也可以选择移除指定列表之外的所有字段：

```json
{
  "remove": {
    "keep": ["url"]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remove-processor.html)
