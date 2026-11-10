# 元数据字段

每个文档都有与之关联的元数据，例如 `_index` 和 [`_id`](/mapping/metadata_fields/id) 元数据字段。在创建映射时，可以自定义其中一些元数据字段的行为。

## 身份元数据字段

- [`_index`](/mapping/metadata_fields/index)：文档所属的索引。
- [`_id`](/mapping/metadata_fields/id)：文档的 ID。

## 文档源元数据字段

- [`_source`](/mapping/metadata_fields/source)：表示文档主体的原始 JSON。
- [`_size`](/mapping/metadata_fields/source)：`_source` 字段的大小（以字节为单位），由 mapper-size 插件提供。

## 文档计数元数据字段

- [`_doc_count`](/mapping/metadata_fields/doc_count)：当文档表示预聚合数据时，用于存储文档计数的自定义字段。

## 索引元数据字段

- [`_field_names`](/mapping/metadata_fields/field_names)：文档中包含非空值的所有字段。
- [`_ignored`](/mapping/metadata_fields/ignored)：文档中在索引时因 `ignore_malformed` 而被忽略的所有字段。

## 路由元数据字段

- [`_routing`](/mapping/metadata_fields/routing)：将文档路由到特定分片的自定义路由值。

## 其他元数据字段

- [`_meta`](/mapping/metadata_fields/meta)：应用程序特定的元数据。
- [`_tier`](/mapping/metadata_fields/tier)：文档所属索引的当前数据层首选项。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-fields.html)
