# _field_names 字段

`_field_names` 字段过去会索引文档中每个包含除 `null` 之外任何值的字段的名称。此字段曾被 [`exists` 查询](/query_dsl/term_level_queries/exists)用来查找对特定字段具有或不具有任何非空值的文档。

现在，`_field_names` 字段只索引那些禁用了 `doc_values` 和 `norms` 的字段的名称。对于启用了 `doc_values` 或 `norms` 的字段，`exists` 查询仍然可用，但不会使用 `_field_names` 字段。

## 禁用 _field_names

不再可能禁用 `_field_names`。它现在默认启用，因为它不再像以前那样带来索引开销。

对禁用 `_field_names` 的支持已被移除。在新索引上使用它会抛出错误。在 8.0 之前的索引上使用它仍然是允许的，但会发出弃用警告。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-field-names-field.html)
