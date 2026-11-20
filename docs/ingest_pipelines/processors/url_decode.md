# URL decode 处理器

对字符串进行 URL 解码。如果字段是字符串数组，则数组中的所有成员都会被解码。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要解码的字段。 |
| `target_field` | 否 | `field` | 转换后的值写入的字段。默认原地更新 `field`。 |
| `ignore_missing` | 否 | `false` | 设为 `true` 时，如果字段不存在或为 `null`，处理器将安静地退出而不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

示例：

```json
{
  "urldecode": {
    "field": "my_url_to_decode"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/urldecode-processor.html)
