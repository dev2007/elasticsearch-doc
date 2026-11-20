# Bytes 处理器

将人类可读的字节值（例如 `1kb`）转换为其以字节为单位的数值（例如 `1024`）。如果该字段是字符串数组，则数组中的所有成员都会被转换。

支持的人类可读单位为 `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"`、`"pb"`（不区分大小写）。如果字段不是受支持的格式，或转换结果超过 2^63，将发生错误。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要转换的字段。 |
| `target_field` | 否 | `field` | 存放转换后值的字段。默认情况下原字段被就地更新。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且字段不存在或为 `null`，处理器将静默退出，不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{
  "bytes": {
    "field": "file.size"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bytes-processor.html)
