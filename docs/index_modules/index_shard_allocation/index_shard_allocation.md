# 索引分片分配

该模块提供每个索引设置，以控制分片分配到节点：

- [分片分配过滤](/index_modules/index_shard_allocation/shard_allocation_filtering)：控制将哪些分片分配给哪些节点。
- [延迟分配](/index_modules/index_shard_allocation/delaying_allocation)：由于节点离开而导致的未分配分片的延迟分配。
- [每个节点的分片总数](/index_modules/index_shard_allocation/total_shards_per_node)：对每个节点来自同一索引的分片数的硬限制。
- [数据层分配](/index_modules/index_shard_allocation/data_tier_allocation_filtering)：控制索引到[数据层](/data_management/data_tier)的分配。
