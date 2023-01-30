# 集群级分片分配和路由设置

*分片分配*是将分片分配给节点的过程。这可能发生在初始恢复、复制副本分配、重新平衡或添加或删除节点时。

主节点的主要角色之一是决定将哪些分片分配给哪些节点，以及何时在节点之间移动分片以重新平衡集群。

有许多设置可用于控制碎片分配过程：

- [集群级分片分配设置](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#集群级分片分配设置)控制分配和重新平衡操作。
- [基于磁盘的分片分配设置](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#基于磁盘的分片分配设置)解释了 Elasticsearch 如何考虑可用磁盘空间以及相关设置。
- [分片分配感知](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#分片分配感知)和[强制感知](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#强制感知)控制如何在不同机架或可用性区域中分配分片。
- [集群级分片分配过滤](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#集群级分片分配过滤)允许某些节点或节点组被排除在分配之外，以便它们可以停用。

除此之外，还有其他一些[杂项集群级设置](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#杂项集群级设置)。

## 集群级分片分配设置

你可以使用以下设置来控制分片分配和恢复：

- `cluster.routing.allocation.enable`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）为特定种类的分片启用或禁用分配：
  - `all` ——（默认）允许为所有类型的分片分配分片。
  - `primaries` ——仅允许主分片分配分片。
  - `new_primaries` ——仅允许为新索引的主分片分配分片。
  - `none` ——任何索引都不允许任何类型的分片分配。

  重新启动节点时，此设置不会影响本地主分片的恢复。具有未分配主分片副本的重新启动节点将立即恢复该主分片，前提是其分配 id 与集群状态中的活动分配 id 之一匹配。

- `cluster.routing.allocation.node_concurrent_incoming_recoveries`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）一个节点上允许发生多少并发传入分片恢复。传入恢复是指在节点上分配目标分片（除非分片正在重新定位，否则很可能是副本）的恢复。默认为 `2`。

- `cluster.routing.allocation.node_concurrent_outgoing_recoveries`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）一个节点上允许发生多少并发传出分片恢复。传出恢复是指在节点上分配源分片（除非分片正在重新定位，否则很可能是主分片）的恢复。默认为 `2`。

- `cluster.routing.allocation.node_concurrent_recoveries`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）快捷设置所有 `cluster.routing.allocation.node_concurrent_incoming_recoveries` 和 `cluster.routing.allocation.node_concurrent_outgoing_recoveries`。

- `cluster.routing.allocation.node_initial_primaries_recoveries`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）虽然副本的恢复是通过网络进行的，但节点重新启动后未分配的主副本的恢复将使用本地磁盘中的数据。这些恢复应该很快，因此可以在同一节点上并行进行更多的初始主恢复。默认为 `4`。

- `cluster.routing.allocation.same_shard.host`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）如果为 `true`，则禁止将分片的多个副本分配给同一主机上的不同节点，即具有相同网络地址的节点。默认为 `false`，这意味着有时可以将分片的副本分配给同一主机上的节点。只有在每个主机上运行多个节点时，此设置才有关。

## 分片重平衡设置

当集群在每个节点上具有相等数量的分片，而没有来自任何节点上任何索引的分片集中时，集群是*平衡的*。Elasticsearch 运行一个称为重新平衡的自动过程，该过程在集群中的节点之间移动碎片，以改善其平衡。重平衡遵循所有其他分片分配规则，如[分配过滤](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#集群级分片分配过滤)和[强制感知](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#强制感知)，这可能会阻止它完全平衡集群。在这种情况下，重平衡努力在你配置的规则内实现尽可能平衡的集群。如果你使用的是[数据层](/data_management/data_tiers)，Elasticsearch 会自动应用分配过滤规则，将每个分片放在适当的层中。这些规则意味着均衡器在每个层中独立工作。

你可以使用以下设置来控制集群中分片的重新平衡：

- `cluster.routing.rebalance.enable`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）为特定类型的分片启用或禁用重新平衡：
  - `all` ——（默认）允许为所有类型的分片进行分片平衡。
  - `primaries` ——仅允许主分片进行分片平衡。
  - `new_primaries` ——仅允许为新索引的主分片进行分片平衡。
  - `none` ——任何索引都不允许任何类型的分片平衡。

- `cluster.routing.allocation.allow_rebalance`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）指定何时允许分片重平衡：
  - `always` ——总是允许重平衡
  - `indices_primaries_active` ——仅当集群中的所有主节点都已分配时。
  - `indices_all_active` ——（默认）仅当集群中的所有分片（主分片和副本）都已分配时。

- `cluster.routing.allocation.cluster_concurrent_rebalance`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）允许控制集群范围内允许多少并发分片重平衡。默认值为 `2`。请注意，此设置仅控制由于集群中的不平衡而导致的并发分片重定位的数量。由于[分配筛选](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#集群级分片分配过滤)或[强制感知](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#强制感知)，此设置不会限制分片重定位。

## 分片平衡启发式设置

重平衡的工作方式是根据每个节点的分片分配计算每个节点的权重，然后在节点之间移动分片，以减少较重节点的权重并增加较轻节点的权重。当没有可能的分片移动使任何节点的权重接近任何其他节点的权重超过可配置的阈值时，集群是平衡的。以下设置允许你控制这些计算的详细信息。

- `cluster.routing.allocation.balance.shard`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）定义节点上分配的碎片总数的权重因子（浮点）。默认为 `0.45f`。提高这一点会使集群中所有节点的分片数量趋于均衡。

- `cluster.routing.allocation.balance.index`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）定义在特定节点（浮点）上分配的每个索引的碎片数的权重因子。默认为 `0.55f`。提高这一点会增加在集群中所有节点上均衡每个索引的分片数量的趋势。

- `cluster.routing.allocation.balance.threshold`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）应执行的操作的最小优化值（非负浮点）。默认值为 `1.0f`。提高此值将导致集群在优化分片平衡方面不太积极。

::: tip 注意
无论平衡算法的结果如何，由于强制感知或分配过滤，可能不允许重新平衡。
:::

## 基于磁盘的分片分配设置

基于磁盘的分片分配器可确保所有节点都有足够的磁盘空间，而无需执行超出必要的分片移动。它基于一对称为*低水位*和*高水位*的阈值来分配分片。它的主要目标是确保没有节点超过高水位，或者至少任何这样的水位只是暂时的。如果一个节点超过了高水位，Elasticsearch 将通过将其分片移动到集群中的其他节点来解决这个问题。

::: tip 注意
节点有时会暂时超出高水位，这是正常的。
:::

分配器还试图通过禁止向超过低水位的节点分配更多分片来保持节点远离高水位。重要的是，如果所有节点都超过了低水位，则无法分配新的分片，Elasticsearch 将无法在节点之间移动任何分片，以将磁盘使用率保持在高水位以下。你必须确保你的集群总共有足够的磁盘空间，并且总是有一些节点低于低水位线。

基于磁盘的分片分配器触发的分片移动，还必须满足所有其他分片分配规则，如[分配筛选](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#集群级分片分配过滤)和[强制感知](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#强制感知)。如果这些规则过于严格，那么它们还可以阻止分片移动，以控制节点的磁盘使用。如果你使用的是数据层，Elasticsearch会自动配置分配过滤规则，将碎片放置在适当的层中，这意味着基于磁盘的分片分配器在每个层中独立工作。

如果一个节点填满其磁盘的速度快于 Elasticsearch 将分片移动到其他地方的速度，则存在磁盘将完全填满的风险。为了防止这种情况，作为最后的手段，一旦磁盘使用率达到洪泛阶段，Elasticsearch 将阻止对受影响节点上具有分片的索引的写入。它还将继续将分片移动到集群中的其他节点上。当受影响节点上的磁盘使用率降至高水位以下时，Elasticsearch 会自动删除写块。

::: tip 提示
集群中的节点使用的磁盘空间量非常不同，这是正常的。集群的[平衡](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_setting#分片重平衡设置)只取决于每个节点上的碎片数量以及这些碎片所属的索引。它既不考虑这些碎片的大小，也不考虑每个节点上的可用磁盘空间，原因如下：

- 磁盘使用率随时间变化。平衡单个节点的磁盘使用将需要更多的分片移动，甚至可能会浪费掉先前的移动。移动分片会消耗资源，如 I/O 和网络带宽，并可能从文件系统缓存中收回数据。在可能的情况下，最好使用这些资源来处理搜索和索引。
- 只要没有磁盘太满，每个节点上的磁盘使用率相等的集群通常不会比磁盘使用率不相等的集群性能更好。
:::

你可以使用以下设置来控制基于磁盘的分配：

- `cluster.routing.allocation.disk.threshold_enabled`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）默认为 `true`。设置为 `false` 可禁用磁盘分配决策器。禁用后，它还将删除任何现有的 `index.blocks.read_only_allow_delete` 索引块。

- `cluster.routing.allocation.disk.watermark.low` ![cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）控制磁盘使用的低水位。默认为 `85%`，这意味着 Elasticsearch 不会将分片分配给磁盘使用率超过 `85%` 的节点。也可以将其设置为比率值，例如 `0.85`。也可以将它设置为绝对字节值（如 `500mb`），以防止 Elasticsearch 在可用空间少于指定数量时分配分片。此设置对新创建索引的主分片没有影响，但会阻止分配其副本。

- `cluster.routing.allocation.disk.watermark.high` ![cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）控制高水位。默认为 `90%`，这意味着 Elasticsearch 将尝试将分片从磁盘使用率高于 `90%` 的节点重新定位。也可以将其设置为比率值，例如 `0.9`。也可以将它设置为绝对字节值（类似于低水印），以便在节点的可用空间小于指定数量时将分片重新定位到远离节点的位置。此设置会影响所有分片的分配，无论以前是否分配。

- `cluster.routing.allocation.disk.watermark.enable_for_single_data_node`

  （[静态](/set_up_elasticsearch/configuring_elasticsearch)）在早期版本中，默认行为是在做出分配决策时忽略单个数据节点群集的磁盘水印。这是自 7.14 以来被弃用的行为，已在 8.0 中删除。此设置的唯一有效值现在为 `true`。该设置将在以后的版本中删除。

- `cluster.routing.allocation.disk.watermark.flood_stage` ![cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）控制危险水位，默认为 `95%`。Elasticsearch 对每个索引强制执行只读索引块（`index.blocks.read_only_allow_delete`），该索引在节点上分配了一个或多个分片，并且至少有一个磁盘超过危险水位。此设置是防止节点耗尽磁盘空间的最后手段。当磁盘利用率低于高水位时，索引块将自动释放。与低和高水位类似，也可以将其设置为比值，例如 `0.95` 或绝对字节值。

  ::: tip 注意
  不能在水印设置中混合使用百分比/比率值和字节值。要么将所有值设置为百分比/比率值，要么将所有设置为字节值。此强制是为了让 Elasticsearch 可以验证设置是否内部一致，确保低磁盘阈值小于高磁盘阈值，高磁盘阈值小于危险水位阈值。
  :::

重置 `my-index-000001` 索引上的只读索引块的示例：

```bash
PUT /my-index-000001/_settings
{
  "index.blocks.read_only_allow_delete": null
}
```

- `cluster.routing.allocation.disk.watermark.flood_stage.frozen` ![cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）控制专用冻结节点的危险水位，默认为 95%。

- `cluster.routing.allocation.disk.watermark.flood_stage.frozen.max_headroom` ![cloud](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）控制专用冻结节点的危险水位的最大净空。当 `cluster.routing.allocation.disk.watermark.flood_stage.frozen` 未明确设置时，默认为 20GB。这将限制专用冻结节点上所需的可用空间量。

- `cluster.info.update.interval`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）Elasticsearch 应该多久检查一次集群中每个节点的磁盘使用情况。默认为 `30s`。

::: tip 注意
百分比值表示已使用的磁盘空间，而字节值表示可用磁盘空间。这可能会让人困惑，因为它颠倒了高低的含义。例如，将低水位设置为 10gb，将高水位设置为 5gb 是有意义的，但反之亦然。
:::

将低水位更新为至少 100 GB 可用、高水位至少 50 GB 可用、洪水阶段水位线至少10 GB可用，并每分钟更新有关集群的信息的示例：

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.disk.watermark.low": "100gb",
    "cluster.routing.allocation.disk.watermark.high": "50gb",
    "cluster.routing.allocation.disk.watermark.flood_stage": "10gb",
    "cluster.info.update.interval": "1m"
  }
}
```

## 分片分配感知

你可以使用自定义节点属性作为感知属性，以使 Elasticsearch 在分配分片时考虑物理硬件配置。如果 Elasticsearch 知道哪些节点位于同一物理服务器上、同一机架中或同一区域中，它可以分发主分片及其副本分片，以最大限度地减少在发生故障时丢失所有分片副本的风险。

当使用动态 `cluster.routing.allocation.awareness.attributes` 启用分片分配感知时，分片仅分配给为指定感知属性设置了值的节点。如果使用多个感知属性，Elasticsearch 在分配分片时会分别考虑每个属性。

::: tip 注意
属性值的数量决定了在每个位置分配了多少分片副本。如果每个位置中的节点数量不平衡，并且有大量副本，则副本分片可能未分配。
:::

### 启用分片分配感知

为了启用分片分配感知：

1. 使用自定义节点属性指定每个节点的位置。例如，如果你希望 Elasticsearch 在不同的机架上分发分片，可以在每个节点的 `elasticsearch.yml` 配置文件中设置一个名为 `rack_id` 的感知属性。

```bash
node.attr.rack_id: rack_one
```

启动节点时，还可以设置自定义属性：

```bash
./bin/elasticsearch -Enode.attr.rack_id=rack_one
```

2. 告诉 Elasticsearch 在分配分片时，通过在每个符合主节点的 `elasticsearch.yml` 配置文件中设置 `cluster.routing.allocation.awareness.attributes` 来考虑一个或多个感知属性。

```bash
cluster.routing.allocation.awareness.attributes: rack_id
```

> 将多个属性指定为逗号分隔的列表。

你还可以使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 来设置或更新集群的感知属性。

在这个示例配置中，如果使用 `node.attr` 启动两个节点。`rack_id` 设置为 `rack_one` 并创建一个索引，其中包含 5 个主分片和每个主分片的 1 个副本，所有主分片和副本都在这两个节点上分配。

如果使用 `node.attr` 添加两个节点。`rack_id` 设置为 `rack_two`，Elasticsearch 将分片移动到新节点，确保（如果可能）同一分片的两个副本不在同一机架中。
如果 `rack_two` 失败并关闭其两个节点，默认情况下，Elasticsearch 会将丢失的碎片副本分配给 `rack_one` 中的节点。为了防止在同一位置分配特定分片的多个副本，可以启用强制感知。

### 强制感知

默认情况下，如果一个位置失败，Elasticsearch 会将所有丢失的副本分片分配给其余位置。虽然你可能在所有位置拥有足够的资源来托管主分片和副本分片，但单个位置可能无法托管所有分片。

为了防止单个位置在发生故障时过载，可以设置 `cluster.routing.allocation.awareness.force`，以便在其他位置的节点可用之前不分配副本。

例如，如果你有一个名为 `zone` 的感知属性，并在 `zone1` 和 `zone2` 中配置节点，则可以使用强制感知来防止 Elasticsearch 在只有一个可用区域的情况下分配副本：

```bash
cluster.routing.allocation.awareness.attributes: zone
cluster.routing.allocation.awareness.force.zone.values: zone1,zone2
```

1. `cluster.routing.allocation.awareness.force.zone.values: zone1,zone2`：指定感知属性的所有可能值。

在这个示例配置中，如果将 `node.attr.zone` 设置为 `zone1` 并创建一个包含 5 个分片和 1 个副本的索引，用于启动两个节点。Elasticsearch 创建索引并分配 5 个主分片，但不分配副本。只有 `node.attr.zone` 设置为 `zone1` 的节点可用时，才会分配副本。

## 集群级分片分配筛选

你可以使用集群级分片分配过滤器来控制 Elasticsearch 从任何索引分配分片的位置。这些集群范围的过滤器与按索引分配过滤和分配感知一起应用。

分片分配筛选器可以基于自定义节点属性或内置的 `_name`、`_host_ip`、`_publish_ip`、`_ip`、`_ host`、`_id` 和 `_tier` 属性。

`cluster.routing.allocation` 设置是动态的，允许将活动索引从一组节点移动到另一组节点。只有在不破坏另一个路由约束（例如从不在同一节点上分配主分片和副本分片）的情况下才能重新定位分片。

集群级分片分配过滤最常见的用例是，当你想要解除某个节点的授权时。要在关闭节点之前将分片移出该节点，可以创建一个过滤器，通过其 IP 地址排除该节点：

PUT _cluster/settings
{
  "persistent" : {
    "cluster.routing.allocation.exclude._ip" : "10.0.0.1"
  }
}

### 集群路由设置

- `cluster.routing.allocation.include.{attribute}`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）将分片分配给与 `｛attribute｝` 中至少有一个逗号分隔值匹配的节点。

- `cluster.routing.allocation.require.{attribute}`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）仅将分片分配给与 `｛attribute｝` 中所有逗号分隔值匹配的节点。

- `cluster.routing.allocation.exclude.{attribute}`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）不将分片分配给与 `｛attribute｝` 中任何逗号分隔值匹配的节点。

|||
|--|--|
|`_name`|按节点名字匹配节点|
|`_host_ip`|按 IP 地址匹配节点（IP 关联主机名）|
|`_publish_ip`|按公开 IP 地址匹配节点|
|`_ip`|匹配 `_host_ip` 或者 `_publish_ip`|
|`_host`|按主机名匹配|
|`_id`|按节点 id 匹配|
|`_tier`|按节点[数据层](/data_management/data_tiers)角色匹配节点|

::: tip 注意
`_tier` 过滤基于[节点](/set_up_elasticsearch/configuring_elasticsearch/node)角色。只有角色的子集是[数据层](/data_management/data_tiers)角色，通用[数据角色](/set_up_elasticsearch/configuring_elasticsearch/node#数据节点)将匹配任何层筛选。[数据层](/data_management/data_tiers)角色的角色子集，但通用[数据角色](/set_up_elasticsearch/configuring_elasticsearch/node#数据节点)将匹配任何层筛选。
:::

指定属性值时可以使用通配符，例如：

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._ip": "192.168.2.*"
  }
}
```

## 杂项集群级设置

### 元数据

可以使用以下设置将整个群集设置为只读：

- `cluster.blocks.read_only`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）将整个集群设为只读（索引不接受写入操作），不允许修改元数据（创建或删除索引）。

- `cluster.blocks.read_only_allow_delete`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）与 `cluster.blocks.read_only` 相同，但允许删除索引以释放资源。

::: warning 警告
不要依赖此设置来阻止更改集群。任何有权访问[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html)
 的用户都可以使集群再次读写。
:::

### 集群分片限制

根据集群中的节点数量，对集群中的碎片数量有一个软限制。这是为了防止可能无意中破坏集群稳定的操作。

::: danger 重要
此限制旨在作为安全网，而不是尺寸建议。集群可以安全支持的分片的确切数量取决于硬件配置和工作负载，但在几乎所有情况下都应该保持在这个限制之下，因为默认限制设置得很高。
:::

如果某个操作（如创建新索引、恢复索引快照或打开关闭的索引）会导致集群中的碎片数量超过此限制，则该操作将失败，并出现指示碎片限制的错误。

如果由于节点成员身份的更改或设置的更改，群集已超过限制，则创建或打开索引的所有操作都将失败，除非限制如下文所述增加，或者关闭或删除某些索引以使碎片数低于限制。

对于正常（非冻结）索引，群集分片限制默认为每个非冻结数据节点 1000 个碎片，对于冻结索引，每个冻结数据节点 3000 个分片。所有开放索引的主分片和副本分片都将计入限制，包括未分配的分片。例如，一个包含 5 个主分片和2个副本的开放索引计为 15 个分片。闭合索引不会影响分片计数。

你可以使用以下设置动态调整集群分片限制：

- `cluster.max_shards_per_node`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）限制集群的主分片和副本分片的总数。Elasticsearch 计算极限如下：

  `cluster.max_shards_per_node * 非冻结节点数`

  关闭索引的分片不计入此限制。默认为 `1000`。没有数据节点的集群是无限的。

  Elasticsearch 拒绝任何创建超过此限制的分片的请求。例如，一个 `cluster.max_shards_per_node` 设置为 `100` 且三个数据节点的集群的分片限制为 `300`。如果该集群已经包含 `296` 个分片，Elasticsearch 将拒绝任何向集群添加五个或更多分片的请求。

  请注意，冻结分片有自己的独立限制。

- `cluster.max_shards_per_node.frozen`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）限制集群的主节点和副本冻结分片的总数。Elasticsearch 计算极限如下：

  `cluster.max_shards_per_node * 冻结结点数量`

  关闭索引的碎片不计入此限制。默认为 `3000`。没有冻结数据节点的集群是无限的。

  Elasticsearch拒绝任何创建超过此限制的冻结分片的请求。例如，`cluster.max_shards_per_node.frozen` 设置为 `100` 且三个冻结数据节点的集群的冻结分片限制为 `300`。如果群集已包含 `296` 个分片，Elasticsearch 将拒绝向集群添加五个或更多冻结分片的任何请求。

  ::: tip 注意
  这些设置不限制单个节点的分片。要限制每个节点的分片数量，请使用 [cluster.routing.allocation.total_shards_per_node](/index_modules/index_shard_allocation/total_shards_per_node) 设置。
  :::

### 用户定义的集群元数据

可以使用群集群设置 API 存储和检索用户定义的元数据。这可以用于存储关于集群的任意、不经常更改的数据，而无需创建索引来存储数据。可以使用以 `cluster.metadata` 为前缀的任何密钥来存储此数据。例如，将集群管理员的电子邮件地址存储在密钥 `cluster.metadata.administrato` 下，发出此请求：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "cluster.metadata.administrator": "sysadmin@example.com"
  }
}
```

::: danger 重要
用户定义的集群元数据不用于存储敏感或机密信息。任何有权访问[集群获取设置 API](/rest_apis/cluster_apis/cluster_get_settings) 的人都可以查看存储在用户定义的集群元数据中的任何信息，并将其记录在 Elasticsearch 日志中。
:::

### 索引墓碑

集群状态维护索引逻辑删除，以明确表示已删除的索引。集群状态下维护的逻辑删除数由以下设置控制：

- `cluster.indices.tombstones.size`

  （[静态](/set_up_elasticsearch/configuring_elasticsearch)）索引逻辑删除防止在发生删除时不属于集群的节点加入集群并重新导入索引，就像从未发出删除一样。为了防止集群状态变大，我们只保留最后的 `cluster.indices.tombstones.size` 次删除，默认为 500 次。如果你希望节点不在集群中，并且错过了 500 次以上的删除，你可以增加它。我们认为这是罕见的，因此是违约。墓碑不会占用太多空间，但我们也认为像 50000 这样的数字可能太大了。

如果 Elasticsearch 遇到当前集群状态中不存在的索引数据，则认为这些索引是悬空的。例如，如果在 Elasticsearch 节点脱机时删除了多个 `cluster.indices.tombstones.size` 索引，则会发生这种情况。

你可以使用[悬空索引 API](/rest_apis/index_apis#悬空索引) 来管理这种情况。

### 日志器

可以使用 `logger.` 前缀动态更新控制日志记录的设置。例如，要将 `indices.recovery` 模块的日志级别提高到 `DEBUG`，发出以下请求：

```bash
PUT /_cluster/settings
{
  "persistent": {
    "logger.org.elasticsearch.indices.recovery": "DEBUG"
  }
}
```

### 持久性任务分配

插件可以创建一种称为持久任务的任务。这些任务通常是长寿命任务，存储在集群状态中，允许任务在完全集群重启后恢复。

每次创建持久任务时，主节点负责将任务分配给集群的一个节点，然后分配的节点将拾取任务并在本地执行。将持久任务分配给节点的过程由以下设置控制：

- `cluster.persistent_tasks.allocation.enable`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）启用或禁用永久任务的分配：
  - `all` ——（默认）允许将持久任务分配给节点
  - `none` ——任何类型的持久任务都不允许分配

  此设置不会影响已执行的持久任务。只有新创建的持久任务或必须重新分配的任务（例如，在节点离开集群后）才会受到此设置的影响。

- `cluster.persistent_tasks.allocation.recheck_interval`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）当集群状态发生显著变化时，主节点将自动检查是否需要分配持久任务。但是，可能还有其他因素，例如内存使用，会影响是否可以将持久任务分配给节点，但不会导致集群状态改变。此设置控制执行分配检查以对这些因素作出反应的频率。默认值为 30 秒。最小允许值为 10 秒。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-cluster.html)
