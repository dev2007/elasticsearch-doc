# 映射限制设置

使用以下设置来限制字段映射（手动创建或动态创建）的数量，防止文档导致映射爆炸。

- `index.mapping.total_fields.limit`
  （可选，整数）索引中的最大字段数。字段映射、对象映射以及字段别名都计入此限制。已映射的运行时字段也计入此限制。默认值为 1000。

  设置此限制是为了防止映射和搜索变得过大。更高的值可能导致性能下降和内存问题，尤其是在高负载或资源较少的集群中。

  如果你增加此设置，我们建议你同时增加 `indices.query.bool.max_clause_count` 设置，该设置限制查询中子句的最大数量。

  如果你的字段映射包含大量任意的键，考虑使用 [`flattened` 数据类型](/mapping/field_data_types/flattened)，或将索引设置 `index.mapping.total_fields.ignore_dynamic_beyond_limit` 设置为 `true`。

- `index.mapping.total_fields.ignore_dynamic_beyond_limit`
  （可选，Boolean）此设置决定当动态映射字段超过总字段数限制时会发生什么。设置为 `false`（默认）时，尝试向映射添加动态字段的文档的索引请求将失败，并返回消息 `Limit of total fields [X] has been exceeded`。设置为 `true` 时，索引请求不会失败。相反，超过限制的字段不会被添加到映射中，类似于 `dynamic: false`。未添加到映射中的字段会被添加到 `_ignored` 字段中。默认值为 `false`。

- `index.mapping.depth.limit`
  （可选，整数）字段的最大深度，以内层对象的数量衡量。例如，如果所有字段都定义在根对象级别，则深度为 1。如果有一个对象映射，则深度为 2，依此类推。默认值为 20。

- `index.mapping.nested_fields.limit`
  （可选，整数）索引中不同 `nested` 映射的最大数量。`nested` 类型只应在特殊情况（即需要独立查询对象数组）下使用。为防止设计不当的映射，此设置限制了每个索引唯一嵌套类型的数量。默认值为 50。

- `index.mapping.nested_objects.limit`
  （可选，整数）单个文档在所有 `nested` 类型中可以包含的嵌套 JSON 对象的最大数量。此限制有助于在文档包含过多嵌套对象时防止内存溢出错误。默认值为 10000。

- `index.mapping.field_name_length.limit`
  （可选，整数）字段名称最大长度的设置。此设置并不是真正针对映射爆炸的，但如果你想限制字段长度，它仍然可能有用。通常不需要设置此设置。除非用户开始添加大量名称非常长的字段，否则默认值就够了。默认值为 `Long.MAX_VALUE`（无限制）。

- `index.mapping.dimension_fields.limit`
  （可选，整数）索引的时序维度最大数量。默认值为 32768。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-settings-limit.html)
