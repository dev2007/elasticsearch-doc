# 在集群中添加和移除节点

当你启动一个 Elasticsearch 实例时，你是在启动一个节点。Elasticsearch 集群是具有相同 `cluster.name` 属性的一组节点。随着节点加入或离开集群，集群会自动重新组织自身，以在可用节点之间均匀分布数据。

如果你运行单个 Elasticsearch 实例，你就拥有一个单节点集群。所有主分片都驻留在该单个节点上。无法分配副本分片，因此集群状态保持黄色。集群完全可用，但在发生故障时存在数据丢失的风险。

你向集群添加节点以增加其容量和可靠性。默认情况下，节点既是数据节点，又有资格被选举为控制集群的主节点。你还可以为特定目的配置新节点，例如处理摄取请求。更多信息参阅节点。

当你向集群添加更多节点时，它会自动分配副本分片。当所有主分片和副本分片都处于活动状态时，集群状态变为绿色。

## 将节点注册到现有集群

你可以在本地计算机上注册额外的节点，以试验多节点 Elasticsearch 集群的行为。

要向运行在多台计算机上的集群添加节点，你还必须设置 `discovery.seed_hosts`，以便新节点可以发现集群的其余部分。

当 Elasticsearch 首次启动时，安全自动配置过程将 HTTP 层绑定到 `0.0.0.0`，但只将传输层绑定到 localhost。这一预期行为确保你无需任何额外配置即可启动默认启用安全功能的单节点集群。

在生产集群中，将新节点注册之前通常需要额外的操作，例如绑定到 localhost 以外的地址或满足引导检查。在此期间，自动生成的注册令牌可能会过期，这就是注册令牌不会自动生成的原因。

此外，只有同一主机上的节点才能在没有额外配置的情况下加入集群。如果你希望来自其他主机的节点加入你的集群，你需要将 `transport.host` 设置为受支持的值（例如取消注释建议的值 `0.0.0.0`），或设置为绑定到其他主机可以访问的接口的 IP 地址。更多信息参阅传输设置。

要将新节点注册到你的集群，使用 `elasticsearch-create-enrollment-token` 工具在集群中的任何现有节点上创建注册令牌。然后使用 `--enrollment-token` 参数启动新节点，使其加入现有集群。

1. 在运行 Elasticsearch 的终端之外的另一个终端中，导航到你安装 Elasticsearch 的目录，运行 `elasticsearch-create-enrollment-token` 工具为你的新节点生成注册令牌：

   ```sh
   bin/elasticsearch-create-enrollment-token -s node
   ```

   复制注册令牌，你将用它把新节点注册到你的 Elasticsearch 集群。

2. 在新节点的安装目录中，启动 Elasticsearch 并使用 `--enrollment-token` 参数传递注册令牌：

   ```sh
   bin/elasticsearch --enrollment-token <enrollment-token>
   ```

   Elasticsearch 会自动在以下目录中生成证书和密钥：

   ```txt
   config/certs
   ```

3. 对要注册的任何新节点重复上一步骤。

有关发现和分片分配的更多信息，参阅发现与集群形成和集群级分片分配和路由设置。

## 主合格节点

随着节点的添加或移除，Elasticsearch 通过自动更新集群的投票配置来维持最佳的容错水平，投票配置是在做出决策（例如选举新主节点或提交新集群状态）时统计其响应的主合格节点集合。

建议在集群中保持少量固定数量的主合格节点，并通过仅添加和移除非主合格节点来扩缩集群。但在某些情况下，可能希望向集群添加或从中移除一些主合格节点。

### 添加主合格节点

如果你希望向集群添加一些节点，只需将新节点配置为找到现有集群并启动它们即可。Elasticsearch 在适当时会将新节点添加到投票配置。

在主节点选举期间或加入已形成的现有集群时，节点向主节点发送加入请求以便正式添加到集群。

### 移除主合格节点

移除主合格节点时，重要的是不要同时移除太多节点。例如，如果当前有七个主合格节点，而你想将其减少到三个，就不能简单地同时停止其中四个节点：这样做只会留下三个节点，少于投票配置的一半，这意味着集群无法采取任何进一步行动。

更准确地说，如果你同时关闭一半或更多的主合格节点，则集群通常会变得不可用。如果发生这种情况，你可以通过再次启动被移除的节点使集群恢复在线。

只要集群中至少有三个主合格节点，作为一般规则，最好一次移除一个节点，给集群留出足够的时间自动调整投票配置并将容错水平适应新的节点集合。

如果只剩下两个主合格节点，则这两个节点都不能被安全移除，因为可靠地取得进展需要这两个节点。要移除其中一个节点，你必须首先通知 Elasticsearch 它不应再属于投票配置，而应将投票权交给另一个节点。然后你可以将被排除的节点下线，而不会阻止另一个节点取得进展。添加到投票配置排除列表的节点仍正常工作，但 Elasticsearch 会尝试将其从投票配置中移除，因此不再需要其投票。重要的是，Elasticsearch 绝不会自动将投票排除列表上的节点移回投票配置。一旦被排除的节点已成功自动重新配置到投票配置之外，就可以安全地将其关闭而不影响集群的主节点级可用性。可以使用投票配置排除 API 将节点添加到投票配置排除列表。例如：

```txt
# Add node to voting configuration exclusions list and wait for the system
# to auto-reconfigure the node out of the voting configuration up to the
# default timeout of 30 seconds
POST /_cluster/voting_config_exclusions?node_names=node_name

# Add node to voting configuration exclusions list and wait for
# auto-reconfiguration up to one minute
POST /_cluster/voting_config_exclusions?node_names=node_name&timeout=1m
```

应添加到排除列表的节点使用 `?node_names` 查询参数按名称指定，或使用 `?node_ids` 查询参数按其持久节点 ID 指定。如果对投票配置排除 API 的调用失败，你可以安全地重试。只有成功的响应才能保证节点已实际从投票配置中移除且不会被重新加入。如果已选举的主节点被排除在投票配置之外，它将让位给投票配置中仍在的另一个主合格节点（如果存在这样的节点）。

虽然投票配置排除 API 对于将双节点集群缩减为单节点集群最有用，但它也可以用于同时移除多个主合格节点。将多个节点添加到排除列表会使系统尝试将所有这些节点自动重新配置到投票配置之外，允许在保持集群可用的同时安全地关闭它们。在上面描述的示例中，将七主节点集群缩减为只有三个主节点，你可以将四个节点添加到排除列表，等待确认，然后同时关闭它们。

只有在短时间内从集群中移除至少一半的主合格节点时才需要投票排除。移除非主合格节点时不需要投票排除，移除少于一半的主合格节点时也不需要。

为节点添加排除会在投票配置排除列表中为该节点创建一个条目，系统会自动尝试重新配置投票配置以移除该节点，并阻止它在移除后返回投票配置。当前的排除列表存储在集群状态中，可以按如下方式检查：

```txt
GET /_cluster/state?filter_path=metadata.cluster_coordination.voting_config_exclusions
```

此列表的大小受 `cluster.max_voting_config_exclusions` 设置限制，默认为 10。参阅发现和集群形成设置。由于投票配置排除是持久的且数量有限，必须对它们进行清理。通常在对集群执行某些维护时添加排除，维护完成后应清理排除。集群在正常操作中不应有任何投票配置排除。

如果一个节点因为要被永久关闭而被排除在投票配置之外，可以在它被关闭并从集群中移除后移除其排除。如果排除是错误创建的或只是临时需要的，也可以通过指定 `?wait_for_removal=false` 清除它们。

```txt
# Wait for all the nodes with voting configuration exclusions to be removed from
# the cluster and then remove all the exclusions, allowing any node to return to
# the voting configuration in the future.
DELETE /_cluster/voting_config_exclusions

# Immediately remove all the voting configuration exclusions, allowing any node
# to return to the voting configuration in the future.
DELETE /_cluster/voting_config_exclusions?wait_for_removal=false
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/add-elasticsearch-nodes.html)
