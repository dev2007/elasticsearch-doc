# 发现和集群组成设置

[发现和集群组成](/set_up_elasticsearch/discovery_and_cluster_formation/)受以下设置影响：

- `discovery.seed_hosts`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))提供群集中符合条件的主节点的地址列表。也可以是包含用逗号分隔的地址的单个字符串。每个地址的格式为 `host:port` 或 `host`。`host` 可以是由 DNS 解析的主机名、IPv4 地址或 IPv6 地址。IPv6 地址必须用方括号括起来。如果主机名通过 DNS 解析为多个地址，Elasticsearch 将使用所有地址。DNS 查找受 [JVM DNS 缓存]()的约束。如果未给出 `port`，则按顺序检查以下配置：

  1. `transport.profiles.default.port`
  2. `transport.port`

  如果两者都未设置，则默认端口为 `9300`。`discovery.seed_hosts` 默认值为 `["127.0.0.1", "[::1]"]`。参阅 [discovery.seed_hosts](/set_up_elasticsearch/configuring_elasticsearch/important_elasticsearch_configuration.html)。

- `discovery.seed_providers`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))指定要使用哪种类型的[种子主机提供器](/set_up_elasticsearch/discovery_and_cluster_formation/discovery.html#种子主机提供器)来获取用于启动发现过程的种子节点的地址。默认情况下，是[基于设置的种子主机提供器](/set_up_elasticsearch/discovery_and_cluster_formation/discovery.html#基于设置的种子主机提供器)从 `discovery.seed_hosts` 设置中获取种子节点地址。

- `discovery.type`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))指定 Elasticsearch 是否应形成多节点集群。默认为多节点，这意味着 Elasticsearch 在形成集群时发现其他节点，并允许其他节点稍后加入集群。如果设置为 `single-node`，Elasticsearch 将形成一个单节点集群，并抑制 `cluster.publish.timeout` 设置的超时。有关何时可以使用此设置的详细信息，请参阅[单节点发现](/set_up_elasticsearch/bootstrap_checks/)。

- `cluster.initial_master_nodes`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))在一个全新的集群中设置主合格节点的初始集合。默认情况下，此列表为空，这意味着此节点希望加入已引导的集群。集群形成后删除此设置。在重新启动节点或将新节点添加到现有群集时，不要使用此设置。请参见 [cluster.initial_master_nodes](/set_up_elasticsearch/configuring_elasticsearch/important_elasticsearch_configuration.html)。

## 专家设置

发现和集群形成也会受到以下*专家级*设置的影响，尽管不建议将这些设置中的任何一个更改为默认值。

::: warning 警告
如果你调整这些设置，那么你的集群可能无法正确形成，或者可能变得不稳定或无法容忍某些故障。
:::

- `discovery.cluster_formation_warning_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置节点在记录集群未形成的警告之前尝试形成集群的时间。默认值为 `10s`。如果在 `discovery.cluster_formation_warning_timeout` 后未形成集群，则节点将记录一条警告消息，该消息以短语 `master not discovery` 开头，描述发现过程的当前状态。

- `discovery.find_peers_interval`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置节点在尝试另一轮发现之前等待的时间。默认为 `1s`。

- `discovery.probe.connect_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置尝试连接到每个地址时等待的时间。默认为 `30s`。

- `discovery.probe.handshake_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置尝试通过握手标识远程节点时等待的时间。默认为 `30S`。

- `discovery.request_peers_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置节点在再次询问其对等方后等待多长时间后才认为请求失败。默认为 `3s`。

- `discovery.find_peers_warning_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置节点在开始记录描述连接尝试失败原因的详细消息之前尝试发现其对等方的时间。默认为 `3m`。

- `discovery.seed_resolver.max_concurrent_resolvers`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))指定解析种子节点地址时要执行的并发 DNS 查找数。默认为 `10`。

- `discovery.seed_resolver.timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))指定解析种子节点地址时执行的每次DNS查找的等待时间。默认为 `5s`。

- `cluster.auto_shrink_voting_configuration`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))控制[投票配置](/set_up_elasticsearch/discovery_and_cluster_formation/voting_configurations.html)是否自动丢弃离开的节点，只要它仍然包含至少 3 个节点。默认值为 `true`。如果设置为 `false`，投票配置永远不会自动收缩，你必须使用[投票配置排除 API](/rest_apis/cluster_apis/voting_configuration_exclustions.html) 手动删除离开的节点。

- `cluster.election.back_off_time`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置在每次选举失败时增加选举前等待时间额外值的上限。请注意，这是*线性*回退。默认为 `100ms`。从默认设置更改此设置可能会导致集群无法选择主节点。

- `cluster.election.duration`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置在节点认为每次选举失败并计划重试之前允许每次选举的时间。默认为 `500ms`。从默认设置更改此设置可能会导致集群无法选择主节点。

- `cluster.election.initial_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置节点在尝试第一次选择之前，最初等待多长时间的上限，或者在所选主节点失败后等待多长时间。默认为 `100ms`。从默认设置更改此设置可能会导致集群无法选择主节点。

- `cluster.election.max_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置节点在尝试第一次选举之前等待多长时间的最大上限，以便持续很长时间的网络分区不会导致过于稀疏的选举。默认为 `10s`。从默认设置更改此设置可能会导致集群无法选择主节点。

- `cluster.fault_detection.follower_check.interval`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置选定的主机在认为跟随者检查失败之前等待响应的时间。默认为 `10s`。从默认设置更改此设置可能会导致群集变得不稳定。

- `cluster.fault_detection.follower_check.retry_count`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置在选定的主节点认为该节点有故障并将其从集群中删除之前，每个节点必须连续发生多少次跟随器检查失败。默认值为 `3`。从默认值更改此设置可能会导致集群变得不稳定。

- `cluster.fault_detection.leader_check.interval`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置每个节点在检查选定主节点之间等待的时间。默认为 `1s`。从默认设置更改此设置可能会导致集群变得不稳定。

- `cluster.fault_detection.leader_check.timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置每个节点在认为其失败之前等待所选主节点对引线检查的响应的时间。默认为 `10s`。从默认设置更改此设置可能会导致集群变得不稳定。

- `cluster.fault_detection.leader_check.retry_count`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置在节点认为选定的主节点有故障并尝试查找或选择新主节点之前，必须发生多少次连续引线检查失败。默认值为 `3`。从默认值更改此设置可能会导致集群变得不稳定。

- `cluster.follower_lag.timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置主节点等待从滞后节点接收群集状态更新确认的时间。默认值为 `90s`。如果某个节点在这段时间内没有成功应用集群状态更新，则该节点将被视为已失败并从集群中删除。参阅[发布集群状态](/set_up_elasticsearch/discovery_and_cluster_formation/publishing_the_cluster_state.html)。

- `cluster.max_voting_config_exclusions`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))设置一次投票配置排除次数的限制。默认值为 `10`。参阅[添加和删除节点](/set_up_elasticsearch/add_and_remove_nodes_in_yours_cluster.html)。

- `cluster.publish.info_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置主节点等待每个集群状态更新完全发布到所有节点的时间，然后记录一条指示某些节点响应缓慢的消息。默认值为 `10s`。

- `cluster.publish.timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置主节点等待每个群集状态更新完全发布到所有节点的时间，除非 `discovery.type` 设置为 `single-node`。默认值为 `30s`。参阅[发布集群状态](/set_up_elasticsearch/discovery_and_cluster_formation/publishing_the_cluster_state.html)。

- `cluster.discovery_configuration_check.interval`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))设置将记录有关不正确发现配置的警告的某些检查的间隔。默认值为 `30s`。

- `cluster.join_validation.cache_timeout`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))当一个节点请求加入集群时，所选的主节点会向它发送最近集群状态的副本，以检测可能阻止新节点加入集群的某些问题。主节点缓存它发送的状态，如果另一个节点不久后加入集群，则使用缓存状态。此设置控制主机在清除此缓存之前等待的时间。默认为 `60s`。

- `cluster.no_master_block`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))指定集群中没有活动主机时拒绝哪些操作。此设置有三个有效值：

  - `all`

    节点上的所有操作（读操作和写操作）都被拒绝。这也适用于API集群状态读取或写入操作，如获取索引设置、更新映射和集群状态API。

  - `write`

    （默认）写入操作被拒绝。根据上次已知的集群配置，读取操作成功。这种情况可能导致部分读取过时数据，因为该节点可能与集群的其他部分隔离。

  - `metadata_write`

    只有元数据写入操作（例如，映射更新、路由表更改）被拒绝，但常规索引操作仍然有效。根据上次已知的集群配置，读取和写入操作成功。这种情况可能导致部分读取过时数据，因为该节点可能与集群的其他部分隔离。

::: tip 注意

- `cluster.no_master_block` 设置不适用于基于节点的 API（例如，集群统计、节点信息和节点统计 API）。对这些 API 的请求不会被阻止，可以在任何可用节点上运行。
- 要使集群完全运行，它必须有一个活动的主机。
:::

- `monitor.fs.health.enabled`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))如果为 `true`，则节点会定期运行[文件系统健康检查](/set_up_elasticsearch/discovery_and_cluster_formation/cluster_fault_detection.html#不稳定群集故障排除)。默认为 `true`。

- `monitor.fs.health.refresh_interval`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch))连续[文件系统健康检查](/set_up_elasticsearch/discovery_and_cluster_formation/cluster_fault_detection.html#不稳定群集故障排除)之间的间隔。默认为 `2m`。

- `monitor.fs.health.slow_path_logging_threshold`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch))如果[文件系统健康检查](/set_up_elasticsearch/discovery_and_cluster_formation/cluster_fault_detection.html#不稳定群集故障排除)花费的时间超过此阈值，则 Elasticsearch 会记录一条警告。默认为 `5s`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-settings.html)
