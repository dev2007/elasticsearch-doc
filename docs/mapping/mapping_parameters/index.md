# index

`index` 选项控制字段值是否被索引。它接受 `true` 或 `false`，默认为 `true`。

对字段进行索引会创建使该字段可以被高效查询的数据结构。数值类型、日期类型、boolean 类型、`ip` 类型、`geo_point` 类型和 `keyword` 类型即使不被索引、只启用了 doc values，也可以被查询。对这些字段的查询很慢，因为必须对索引进行完整扫描。所有其他字段则不可查询。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-index.html)
