# Enrich 处理器

`enrich` 处理器可以使用来自另一个索引的数据丰富文档。有关如何设置的更多信息，参阅[丰富你的数据](/ingest_pipelines/enrich_your_data)章节。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `policy_name` | 是 | - | 要使用的富化策略的名称。 |
| `field` | 是 | - | 输入文档中与策略的 `match_field` 匹配、用于检索富化数据的字段。支持模板片段。 |
| `target_field` | 是 | - | 添加到传入文档、用于包含富化数据的字段。此字段同时包含富化策略中指定的 `match_field` 和 `enrich_fields`。支持模板片段。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且 `field` 不存在，处理器会静默退出而不修改文档。 |
| `override` | 否 | `true` | 处理器是否更新已存在非空值的字段。设置为 `false` 时，此类字段不会被改动。 |
| `max_matches` | 否 | `1` | 在配置的 `target` 字段下包含的匹配文档的最大数量。如果 `max_matches` 大于 1，`target_field` 将变为 JSON 数组，否则 `target_field` 将成为 JSON 对象。为避免文档过大，允许的最大值为 `128`。 |
| `shape_relation` | 否 | `INTERSECTS` | 用于将传入文档的 geoshape 与富化索引中文档的 geoshape 进行匹配的空间关系运算符。此选项仅用于 `geo_match` 富化策略类型。运算符及更多信息参阅[空间关系](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geo-shape.html#geo-shape-spatial-relations)。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-processor.html)
