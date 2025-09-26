# 集群重路由 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

更改集群中分片的分配。

## 请求

```bash
POST /_cluster/reroute?metric=none
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `manage` 的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)以使用此 API。

## 描述

重路由命令允许手动更改集群中各个分片的分配。例如，可以显式地将分片从一个节点移动到另一个节点，可以取消分配，并且可以将未分配的分片显式分配给特定节点。

需要注意的是，在处理任何重新路由命令后，Elasticsearch 将正常执行重新平衡（尊重 `cluster.routing.rebalance.enable` 等设置的值），以保持平衡状态。例如，如果请求的分配包括将分片从 `node1` 移动到 `node2`，则这可能会导致分片从 `node2` 移回 `node1` 以平衡情况。

可以使用 `cluster.routing.allocation.enable` 设置将集群设置为禁用分配。如果禁用了分配，则将执行的唯一分配是使用重路由命令给出的显式分配，以及由于重新平衡而产生的随之而来的分配。

可以通过使用 `?dry_run` URI 查询参数或在请求正文中传递 `"dry_run":true` 在“试运行”模式下运行 `reroute` 命令。这将计算将命令应用于当前集群状态的结果，并在应用命令（和重新平衡）后返回生成的集群状态，但实际上不会执行请求的更改。

如果包含 `?explain` URI 查询参数，则响应中将包含命令可以执行或无法执行的原因的详细说明。

集群将尝试连续分配分片最多 `index.allocation.max_retries` 次数（默认为 `5`），然后放弃并让分片未分配。这种情况可能是由结构问题引起的，例如分析器引用并非所有节点上都存在的停用词文件。

问题得到纠正后，可以通过使用 `?retry_failed` URI 查询参数调用重新路由 API 来手动重试分配，这将尝试对这些分片进行单轮重试。

## 查询参数

- `dry_run`

  （可选，布尔值）如果为 `true`，则请求仅模拟作并返回结果状态。

- `explain`

  （可选，布尔值）如果为 `true`，则响应包含命令可以执行或不能执行的原因的说明。

- `metric`

  （可选，字符串）将返回的信息限制为指定的指标。除 `none` 之外的所有选项均已弃用，应避免用于此参数。默认为除元数据之外的所有数据。以下选项可用：

  - `metric` 选项

    - `_all`

      展示所有指标。

    - `blocks`

      展示响应的块部分。

    - `master_node`

      展示响应的当选 `master_node` 部分。

    - `metadata`

      展示响应的 `metadata` 部分。如果提供逗号分隔的索引列表，则返回的输出将仅包含这些索引的元数据。

    - `nodes`

      展示响应的 `nodes` 部分。

    - `none`

      从响应中排除整个 `state` 字段。

    - `routing_table`

      展示响应的 `routing_table` 部分。

    - `version`

      展示集群状态版本。

- `retry_failed`

  （可选，布尔值）如果为 `true`，则重试分配由于后续分配失败过多而被阻止的分片。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的时间段。如果主节点在超时到期之前不可用，则请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 以指示请求永远不会超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间段。如果在超时到期之前未收到响应，则集群元数据更新仍适用，但响应将指示未完全确认。默认为 `30s`。也可以设置为 `-1` 以指示请求永远不会超时。

## 请求体

- `commands`

  （必需，对象数组）定义要执行的命令。支持的命令包括：

  - `commands` 属性

    - `move`

      将已启动的分片从一个节点移动到另一个节点。接受 `index` 和 `shard` 的索引名称和分片编号，节点的 `from_node`，以及将分片移动到的节点的 `to_node`。

    - `cancel`

      取消分片（或恢复）的分配。接受索引名称和分片编号的 `index` 和 `shard`，以及要取消分片分配的节点的 `node`。这可用于通过取消现有副本并允许通过标准恢复过程重新初始化它们来强制从主分片重新同步现有副本。默认情况下，只能取消副本分片分配。如果需要取消主分片的分配，则请求中还必须包含 `allow_primary` 标志。

    - `allocate_replica`

      将未分配的副本分片分配给节点。接受索引名称和分片编号的`index` 和 `shard`，以及要将分片分配给的 `node`。把[分配决策器](/set_up_elasticsearch/configuration_elasticsearch/cluster_level_shard_allocation_and_routing_settings)纳入考虑。

    还有两个命令可用于将主分片分配给节点。但是，应格外小心使用这些命令，因为主分片分配通常由 Elasticsearch 完全自动处理。无法自动分配主分片的原因包括：

    - 创建了新索引，但没有满足分配决策器的节点。
    - 在集群中的当前数据节点上找不到数据的最新分片副本。为防止数据丢失，系统不会自动将过时的分片副本提升为主副本。

    以下两个命令很危险，可能会导致数据丢失。它们旨在用于无法恢复原始数据且集群管理员接受丢失的情况。如果您遇到可以修复的临时问题，请参阅上述 `retry_failed` 标志。需要强调的是：如果执行这些命令，然后节点加入保存受影响分片副本的集群，则新加入的节点上的副本将被删除或覆盖。

    - `allocate_stale_primary`

      将主分片分配给保存过时副本的节点。接受索引名称和分片编号的索引和分片，以及要将分片分配给的节点。使用此命令可能会导致提供的分片 ID 的数据丢失。如果具有良好数据副本的节点稍后重新加入集群，则该数据将被删除或覆盖为使用此命令强制分配的过时副本的数据。为了确保这些含义得到充分理解，此命令要求将标志 `accept_data_loss` 显式设置为 `true`。

    - `allocate_empty_primary`

      将空主分片分配给节点。接受索引名称和分片编号的索引和分片，以及要将分片分配给的节点。使用此命令会导致完全丢失索引到此分片中的所有数据（如果之前已启动）。如果具有数据副本的节点稍后重新加入集群，则该数据将被删除。为了确保这些含义得到充分理解，此命令要求将标志 `accept_data_loss` 显式设置为 `true`。

## 示例

这是一个简单的重新路由 API 调用的简短示例：

```bash
POST /_cluster/reroute?metric=none
{
  "commands": [
    {
      "move": {
        "index": "test", "shard": 0,
        "from_node": "node1", "to_node": "node2"
      }
    },
    {
      "allocate_replica": {
        "index": "test", "shard": 1,
        "node": "node3"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-reroute.html)
