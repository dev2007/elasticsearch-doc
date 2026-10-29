# 8.18 新特性

以下是 Elasticsearch 8.18 中新增和改进的功能亮点！有关此版本的详细信息，请参阅[发布说明](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/release-notes-8.18.0.html)和[迁移指南](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/migrating-8.17-to-8.18.html)。

## RANK_VECTORS 字段类型现已可用于后期交互排序

**rank_vectors** 是 Elasticsearch 8.18 中作为实验性功能发布的新字段类型。它设计用于稠密向量，并支持后期交互（late-interaction）二阶排序。

后期交互模型是强大的重排序器。虽然它们的规模和总体成本不适合进行 HNSW 索引，但将它们用作二阶重排序可以显著提升相关性。新的 rank_vectors 映射允许对新的多向量后期交互模型（如 ColBERT 或 ColPali）进行重打分。

## ES|QL LOOKUP JOIN 现已进入技术预览

**LOOKUP JOIN** 现已进入技术预览。LOOKUP JOIN 将你的 ES|QL 查询中的数据与查找索引中匹配的记录相结合，使你能够：

- 使用参考数据丰富你的搜索结果
- 加速根因分析和安全调查
- 无需复杂查询即可跨索引连接数据
- 降低关联事件时的运维开销

## SEMANTIC_TEXT 字段类型现已 GA

**semantic_text** 现在是正式的 GA（正式发布）功能！此字段类型让你能够轻松设置并执行语义搜索，只需极少的学习成本。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/release-highlights.html)
