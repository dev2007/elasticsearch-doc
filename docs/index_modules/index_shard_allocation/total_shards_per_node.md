# 每节点分片总数

集群级分片分配器尝试将单个索引的分片分布在尽可能多的节点上。然而，根据你有多少分片和索引，以及它们有多大，可能并不总是能够均匀地分布分片。

以下的 `dynamic`（动态）设置允许你对每个节点允许的单索引的分片总数，指定硬限制：

- `index.routing.allocation.total_shards_per_node`

将分配给单节点的分片（副本和主分片）最大数量。默认为无界。

你也可以限制节点可以拥有的分片数量，而不用考虑索引：

- `cluster.routing.allocation.total_shards_per_node`

（[动态](/set_up_elasticsearch/configuring_elasticsearchconfig?id=集群和节点设置类型)）分配给每个节点的主分片和副本分片的最大数量。默认值为 `-1`（无限制）。

Elasticsearch 在分片分配期间检查此设置。例如，一个集群的 `cluster.routing.allocation.total_shards_per_node` 设置为 `100`，三个节点具有以下分片分配：

- 节点 A: 100 分片
- 节点 B: 98 分片
- 节点 C: 1 分片

如果节点 C 失败，Elasticsearch 重分配它的分片到节点 B。重分配分片到节点 A 会超出 A 的分片限制。

!> 这些设置强加了一个硬限制，这可能导致一些分片不被分配。  
小心使用。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/allocation-total-shards.html)
