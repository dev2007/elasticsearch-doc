# 读取旧版本 Elasticsearch 的索引

Elasticsearch 对在前一个主要版本中创建的索引提供完整的查询和写入支持。如果你有在 Elasticsearch 版本 5 或 6 中创建的索引，你现在也可以使用归档功能将它们导入到较新的 Elasticsearch 版本。

归档功能为旧 Elasticsearch 数据提供较慢的只读访问，适用于合规或监管原因、偶尔的回溯或调查，或重新水化（rehydrate）部分数据。对数据的访问预期是不频繁的，因此可以在有限的性能和查询能力下进行。

为此，Elasticsearch 具有访问旧快照仓库的能力（可以追溯到版本 5）。快照仓库中的旧索引既可以被恢复，也可以通过可搜索快照直接访问，这样归档数据甚至不需要完全驻留在本地磁盘上即可访问。

## 支持的字段类型

旧映射会尽可能"原样"导入到 Elasticsearch 8 中，但只有选定子集的字段提供常规查询能力：

- 数值类型
- boolean 类型
- ip 类型
- geo_point 类型
- date 类型：只要日期字段上的 date format 设置在这些版本之间行为类似即受支持。如果不类似（例如使用自定义日期格式时），可以在旧索引上更新此字段，以便用户在需要时进行更改。
- keyword 类型：只要 keyword 字段上的 normalizer 设置在这些版本之间行为类似即受支持。如果不类似，如有需要可以在旧索引上更新此字段。
- text 类型：评分能力受限，所有查询返回等于 1.0 的常量评分。只要 text 字段上的 analyzer 设置在这些版本之间行为类似即受支持。如果不类似，如有需要可以在旧索引上更新它们。
- 多字段（Multi-fields）
- 字段别名
- object 字段
- 一些基本的元数据字段，例如用于查询 Elasticsearch 5 索引的 `_type`
- runtime 字段
- `_source` 字段

具有多个映射类型的映射的 Elasticsearch 5 索引在导入之前会以尽力而为的方式合并在一起。

如果映射的自动导入不起作用，或者新的 Elasticsearch 版本无法理解该映射，它会回退为不带映射导入索引，但将原始映射存储在导入索引的 `_meta` 部分中。然后可以使用 GET mapping API 检查旧映射，并可以使用更新映射 API 手动设置更新后的映射，复制并调整旧映射的相关部分以适应当前的 Elasticsearch 版本。虽然自动导入预期在大多数情况下都能工作，但如遇失败应向 Elastic 团队反馈以便未来改进。

## 支持的 API

归档索引是只读的，并通过 search 和 field capabilities API 提供数据访问。它们不支持 Get API 或任何写入 API。

归档索引允许运行查询以及聚合（只要给定字段类型支持）。

由于可以访问 `_source`，数据还可以重新索引到与当前 Elasticsearch 版本完全兼容的新索引。

## 如何升级旧的 Elasticsearch 5 或 6 集群？

对旧集群中的索引拍摄快照，删除 ES 8 不直接支持的索引（即早于 7.0 的索引），在不包含旧索引的情况下升级集群，然后从快照恢复旧索引或通过可搜索快照挂载它们。

将来，我们计划进一步简化升级流程，使升级到未来的 Elasticsearch 主版本时更容易携带旧索引。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/archive-indices.html)
