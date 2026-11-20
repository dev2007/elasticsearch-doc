# CSV 处理器

从文档中单个文本字段内的 CSV 行提取字段。CSV 中的任何空字段都会被跳过。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要从中提取数据的字段。 |
| `target_fields` | 是 | - | 要将提取的值赋给的字段数组。 |
| `separator` | 否 | `,` | CSV 中使用的分隔符，必须是单个字符的字符串。 |
| `quote` | 否 | `"` | CSV 中使用的引号，必须是单个字符的字符串。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且 `field` 不存在，处理器会静默退出而不修改文档。 |
| `trim` | 否 | `false` | 去除未加引号字段中的空白字符。 |
| `empty_value` | 否 | - | 用于填充空字段的值。如果未提供，空字段将被跳过。空字段是指没有值（两个连续的分隔符）或引号为空（`""`）的字段。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

```json
{"csv":{"field":"my_field","target_fields":["field1","field2"]}}
```

如果启用了 `trim` 选项，则每个未加引号字段开头和结尾的空白字符都会被去除。例如，使用上方配置时，值为 `A, B` 将导致字段 `field2` 的值为 ` B`（开头带空格）。如果启用了 `trim`，`A, B` 将使字段 `field2` 的值为 `B`（无空白）。带引号的字段不会被改动。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/csv-processor.html)
