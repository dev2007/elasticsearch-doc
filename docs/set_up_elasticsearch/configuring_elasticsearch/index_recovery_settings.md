---
sidebar_position: 120
---

# 索引恢复设置

对等恢复将数据从主分片同步到新的或现有的分片副本。

当 Elasticsearch 自动出现对待恢复时：

- 重新创建节点故障期间丢失的分片

- 由于集群重平衡或[分片分配设置](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings.html)的更改，将分片重新定位到另一个节点

你可以使用 [cat 恢复 API](/rest_apis/compact_and_aligned_text_apis/cat_recovery.html) 查看正在进行和已完成的恢复列表。

## 恢复设置

- `indices.recovery.max_bytes_per_sec`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch)）限制每个节点的总入站和出站恢复流量。适用于对等恢复和快照恢复（即从快照恢复）。默认值为 `40mb`，除非节点是专用[冷](/data_management/data_tiers.html#冷层)节点或[冻结](/data_management/data_tiers.html#冻结层)节点，在这种情况下，默认值与节点可用的总内存有关：

  |总内存|在冷节点或冻结节点默认恢复率|
  |--|--|
  |≤ 4 GB|40 MB/s|
  |> 4 GB and ≤ 8 GB|60 MB/s|
  |> 8 GB and ≤ 16 GB|90 MB/s|
  |> 16 GB and ≤ 32 GB|125 MB/s|
  |> 32 GB|250 MB/s|

  此限制分别适用于每个节点。如果集群中的多个节点同时执行恢复，则集群的总恢复流量可能会超过此限制。

  如果此限制太高，则正在进行的恢复可能会消耗过多的带宽和其他资源，这可能会破坏集群的稳定。

  这是一个动态设置，这意味着你可以在每个节点的 `elasticsearch.yml` 配置文件中设置它，并且可以使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 动态更新它。如果动态设置，那么集群中的每个节点都会受到相同的限制。如果不动态设置，则可以在每个节点上设置不同的限制，这在某些节点的带宽比其他节点的带宽更好时非常有用。例如，如果你使用的是[索引生命周期管理](/data_management/overview.html)，那么你可以为热门节点提供比温和节点更高的恢复带宽限制。

## 专家对待恢复设置

你可以使用以下*expert（专家）*设置来管理对等恢复的资源。

- `indices.recovery.max_concurrent_file_chunks`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch.html)，专家）为每次恢复并行发送的文件块数。默认值为 `2`。

  当单个分片的恢复未达到 `indices.recovery.max_bytes_per_sec` 设置的流量限制，可以增加此值，最大值为 `8`。 

- `indices.recovery.max_concurrent_operations`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch.html)，专家）每个恢复并行发送的操作数。默认值为 `1`。

  在恢复过程中并发重放操作可能非常耗费资源，并且可能会干扰集群中的索引、搜索和其他活动。如果没有仔细验证集群是否有足够的资源来处理将导致的额外负载，请不要增加此设置。

- `indices.recovery.use_snapshots`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch.html)，专家）启用基于快照的对等恢复。

  Elasticsearch 使用对等恢复过程恢复副本并重新定位主分片，这涉及在目标节点上构建碎片的新副本。当标记恢复时。`use_snapshots` 为`false`, Elasticsearch 将通过从当前主节点传输索引数据来构建此新副本。如果此设置为 `true`，Elasticsearch 将首先尝试从最近的快照复制索引数据，如果无法识别合适的快照，则仅从主快照复制数据。默认为 `true`。

  如果集群在节点到节点的数据传输成本高于从快照恢复数据的成本的环境中运行，则将此选项设置为 `true` 可降低操作成本。它还减少了主服务器在恢复期间必须完成的工作量。

  此外，在恢复分片时，将参考设置为 `use_for_peer_recovery=true` 的仓库以找到一个好的快照。如果没有注册的仓库定义了此设置，则将从源节点恢复索引文件。

- `indices.recovery.max_concurrent_snapshot_file_downloads`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch.html)，专家）为每次恢复并行发送到目标节点的快照文件下载请求数。默认值为 `5`。

  如果没有仔细验证集群是否有足够的资源来处理将导致的额外负载，请不要增加此设置。

- `indices.recovery.max_concurrent_snapshot_file_downloads_per_node`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch.html)，专家）在目标节点中为所有恢复并行执行的快照文件下载请求数。默认值为 `25`。

  如果没有仔细验证集群是否有足够的资源来处理将导致的额外负载，请不要增加此设置。

## 托管服务的恢复设置

:::tip 注意
此功能旨在供 Elasticsearch Service、ElasticCloud Enterprise 和 Kubernetes 上的 Elasticcloud 间接使用。不支持直接使用。
:::

将 Elasticsearch 作为托管服务运行时，以下设置允许服务为每个节点上的磁盘读取、磁盘写入和网络流量指定绝对最大带宽，并允许你根据这些绝对最大值控制每个节点上最大恢复带宽。它们有两个效果：

1. 如果未设置 `indices.recovery.max_bytes_per_sec`，它们将确定用于恢复的带宽，覆盖上述默认行为。
2. 它们对恢复带宽施加了节点范围的限制，这与 `indices.recovery.max_bytes_per_sec` 的值无关。

如果未设置 `indices.recovery.max_bytes_per_sec`，则将最大恢复带宽计算为绝对最大带宽的一部分。读取和写入流量分别执行计算。该服务使用 `node.bandwidth.recovery.disk.read`、`node.bandwidth.recovery.disk.write` 和 `node.bandwidth.recovery.network` 定义磁盘读取、磁盘写入和网络传输的绝对最大带宽，你可以通过调整 `node.bandwidth.recovery.factor.read` 和 `node.bandwidth.recovery.factor.write` 来设置可用于恢复的绝对最大带宽的比例。如果启用了操作员权限功能，则服务还可以使用这些设置的仅操作员变体设置默认比例。

如果设置 `indices.recovery.max_bytes_per_sec`，则 Elasticsearch 将使用其值作为最大恢复带宽，只要这不超过节点范围的限制。Elasticsearch 通过将绝对最大带宽乘以 `node.bandwidth.recovery.operator.factor.max_overcommit` 因子来计算节点宽度限制。如果将 `indices.recovery.max_bytes_per_sec` 设置为超出节点范围限制，则节点范围限制优先。

服务应该通过实验确定绝对最大带宽设置的值，使用类似于恢复的工作负载，其中有几个并发工作器，每个工作器以 512kiB 的块顺序处理文件。

- `node.bandwidth.recovery.disk.read`

  （每秒[字节值](/rest_apis/api_conventions.html#字节大小单位)）节点上类似恢复的工作负载的绝对最大磁盘读取速度。如果设置了它，`node.bandwidth.recovery.disk.write` 和 `node.bandwidth.recovery.network` 也必须设置。

- `node.bandwidth.recovery.disk.write`

  （每秒[字节值](/rest_apis/api_conventions.html#字节大小单位)）节点上类似恢复的工作负载的绝对最大磁盘写入速度。如果设置了它，`node.bandwidth.recovery.disk.read` 和 `node.bandwidth.recovery.network` 也必须设置。

- `node.bandwidth.recovery.network`

  （每秒[字节值](/rest_apis/api_conventions.html#字节大小单位)）节点上类似恢复的工作负载的绝对最大磁盘写入速度节点上类似于恢复的工作负荷的绝对最大网络吞吐量，适用于读取和写入。如果设置了它，`node.bandwidth.recovery.disk.read` 和 `node.bandwidth.recovery.write` 也必须设置。

- `node.bandwidth.recovery.factor.read`

  （浮点数，[动态](/set_up_elasticsearch/configuring_elasticsearch)）如果 `indices.recovery.max_bytes_per_sec` 和 `node.bandwidth.recovery.factor.write` 可用于恢复的最大写入带宽的比例。必须大于 `0`，小于等于 `1`。如果未设置，将会使用 `node.bandwidth.recovery.operator.factor`。如果未设置因子设置，则使用值 `0.4`。启用操作员权限功能后，此设置只能由操作员用户更新。

- `node.bandwidth.recovery.operator.factor`

  （浮点数，[动态](/set_up_elasticsearch/configuring_elasticsearch)）如果 `indices.recovery.max_bytes_per_sec` 或其他任何因子都未设置，则为可用于恢复的最大带宽比例。必须大于 `0`，小于等于 `1`。默认为 `0.4`。启用操作员权限功能后，此设置只能由操作员用户更新。

- `node.bandwidth.recovery.operator.factor.max_overcommit`

  （浮点数，[动态](/set_up_elasticsearch/configuring_elasticsearch)）无论任何其他设置如何，可用于恢复的绝对最大带宽比例。必须大于 `0`。默认为 `100`。启用操作员权限功能后，此设置只能由操作员用户更新。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/recovery.html)
