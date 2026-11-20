# Split 处理器

使用分隔符将一个字段拆分为数组。仅适用于字符串字段。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要拆分的字段。 |
| `separator` | 是 | - | 匹配分隔符的正则表达式，例如 `,` 或 `\s+`。 |
| `target_field` | 否 | `field` | 拆分后的值写入的字段。默认原地更新 `field`。 |
| `ignore_missing` | 否 | `false` | 设为 `true` 时，如果 `field` 不存在，处理器将安静地退出而不修改文档。 |
| `preserve_trailing` | 否 | `false` | 保留空尾部字段（如果有的话）。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

示例：

```json
{
  "split": {
    "field": "my_field",
    "separator": "\\s+"
  }
}
```

上述配置将所有连续的空白字符视为单个分隔符。

如果启用了 `preserve_trailing` 选项，输入中的任何尾部空字段将被保留。例如在以下配置中：

```json
{
  "split": {
    "field": "my_field",
    "separator": ",",
    "preserve_trailing": true
  }
}
```

`my_field` 属性的值 `A,,B,,` 将被拆分为一个包含五个元素的数组 `["A", "", "B", "", ""]`，其中包含两个空的尾部字段。如果未启用 `preserve_trailing` 属性，这两个空的尾部字段将被丢弃，得到三元素数组 `["A", "", "B"]`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/split-processor.html)
