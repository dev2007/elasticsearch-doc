# Rename 处理器

重命名一个已存在的字段。如果该字段不存在，或新名称已被使用，将抛出异常。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要重命名的字段。支持模板片段。 |
| `target_field` | 是 | - | 字段的新名称。支持模板片段。 |
| `ignore_missing` | 否 | `false` | 设为 `true` 时，如果字段不存在，处理器将安静地退出而不修改文档。 |
| `override` | 否 | `false` | 设为 `true` 时，处理器会更新已存在的非空值字段。设为 `false` 时，此类字段不会被改动。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

示例：

```json
{
  "rename": {
    "field": "provider",
    "target_field": "cloud.provider"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rename-processor.html)
