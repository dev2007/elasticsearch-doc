# 节点

无论何时启动 Elasticsearch 实例，都是在启动一个节点。连接节点的集合称为集群。如果你运行的是 Elasticsearch 的单节点，那么你有一个单节点集群。

默认情况下，集群中的每个节点都可以处理 [HTTP 和传输](/set_up_elasticsearch/configuring_elasticsearch/networking.html)流量。传输层专门用于节点之间的通信；REST 客户端使用 HTTP 层。

所有节点都知道集群中的所有其他节点，并可以将客户端请求转发到适当的节点。

## 节点角色

可以通过在 `elasticsearch.yml` 中设置 `node.role` 来定义节点的角色。如果设置 `node.roles`，则仅为节点分配指定的角色。如果不设置 `node.role`，则会为节点指定以下角色：

- `master`
- `data`
- `data_content`
- `data_hot`
- `data_warm`
- `data_cold`
- `data_frozen`
- `ingest`
- `ml`
- `remote_cluster_client`
- `transform`

:::danger 重要
如果设置 `node.role`，请确保指定集群所需的每个节点角色。每个集群都需要以下节点角色：

- `master`
- `data_content` 和 `data_hot`，或 `data`

某些 Elastic 堆栈功能还需要特定的节点角色：

- 跨集群搜索和跨集群复制需要 `remote_cluster_client` 角色。
- 堆栈监视和摄取管道需要 `ingest` 角色。
- Elastic 安全应用 Fleet 和转换需要 `transform` 角色。还需要 `remote_cluster_client` 角色才能在这些功能中使用跨集群搜索。
- 机器学习功能，如异常检测，需要 `ml` 角色。
:::

随着集群的增长，特别是如果你有大型机器学习作业或连续转换，请考虑将专用的符合主机条件的节点与专用的数据节点、机器学习节点和转换节点分开。

- [主资格节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#主资格节点)

具有 `master` 角色的节点，使其有资格被[选为主节点](/set_up_elasticsearch/discovery_and_cluster_formation.html)，用于控制集群。

- [数据节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#数据节点)

具有 `data` 角色的节点。数据节点保存数据并执行数据相关操作，如 CRUD、搜索和聚合。具有 `data` 角色的节点可以填充任何专用数据节点角色。

- [摄取节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#摄取节点)

具有 `ingest` 角色的节点。摄取节点能够将摄取管道应用于文档，以便在索引之前转换和丰富文档。对于繁重的摄取负载，使用专用摄取节点并且不包括具有主或数据角色的节点的摄取角色是有意义的。

- [远程资格节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#远程资格节点)

具有 `remote_cluster_client` 角色的节点，该角色使其有资格充当远程客户端。

- [机器学习节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#机器学习节点)

具有 `ml` 角色的节点。如果要使用机器学习功能，集群中必须至少有一个机器学习节点。更多信息，参阅[机器学习设置](/set_up_elasticsearch/configuring_elasticsearch/machine_learning_settings_in_elasticsearch.html)和 [Elastic 堆栈中的机器学习](https://www.elastic.co/guide/en/machine-learning/8.6/index.html)。

- [转换节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#转换节点)

具有 `transform` 角色的节点。如果要使用转换，则集群中必须至少有一个转换节点。详细信息，参阅[转换设置](/set_up_elasticsearch/configuring_elasticsearch/transforms_settings_in_elasticsearch.html)和[转换数据](/roll_up_or_transform_your_data/transforming_data.html)。

:::tip 注意
**协调节点**

搜索请求或批量索引请求等请求可能涉及保存在不同数据节点上的数据。例如，搜索请求分两个阶段执行，这两个阶段由接收客户端请求的节点协调——*协调节点*。

在 *scatter（分散）*阶段，协调节点将请求转发给持有数据的数据节点。每个数据节点在本地执行请求，并将其结果返回给协调节点。在 *gather （收集）*阶段，协调节点将每个数据节点的结果缩减为单个全局结果集。

每个节点都隐含地是一个协调节点。这意味着，通过 `node.role` 具有显式空角色列表的节点只能充当协调节点，不能禁用。因此，这样的节点需要有足够的内存和 CPU 来处理收集阶段。
:::

## 主资格节点

主节点负责轻量级集群范围的操作，例如创建或删除索引、跟踪哪些节点是集群的一部分，以及决定将哪些分片分配给哪些节点。拥有一个稳定的主节点对集群健康非常重要。

任何不是[仅投票节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#仅投票主资格节点)的主资格节点都可以通过[主选举过程](/set_up_elasticsearch/discovery_and_cluster_formation.html)被选为主节点。

:::danger 重要
主节点必须有一个 `path.data` 目录，该目录的内容与数据节点一样，在重新启动时持续存在，因为这是存储集群元数据的地方。集群元数据描述了如何读取存储在数据节点上的数据，因此，如果数据丢失，则无法读取数据节点上存储的数据。
:::

### 专用主资格节点

选择的主节点拥有履行其职责所需的资源对于集群的健康非常重要。如果选定的主节点被其他任务过载，那么集群将无法正常运行。避免其他任务使主机过载的最可靠方法是将所有主资格节点配置为仅具有 `master` 角色的*专用主资格节点*，从而使它们能够专注于管理集群。符合条件的 `master` 节点仍将充当[协调节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#协调节点)，将请求从客户端路由到集群中的其他节点，但*不*应为此使用专用主节点。

如果一个小型或负载较轻的集群的主资格节点具有其他角色和职责，那么它可以很好地运行，但是一旦你的集群包含多个节点，那么使用专用的主资格的节点通常是有意义的。

要创建专用的主资格节点，请设置：

```yaml
node.roles: [ master ]
```

### 仅投票主资格节点

只有投票权的主资格节点是指参与[主选举](/set_up_elasticsearch/discovery_and_cluster_formation.html)但不会充当集群的当选主节点的节点。特别是，只有投票权的节点可以在选举中充当决定者。

使用术语“主资格节点”来描述仅投票的节点可能会令人困惑，因为这样的节点实际上根本没有资格成为主节点。这个术语是历史的一个不幸后果：符合资格的主节点是那些在集群状态发布期间参与选举并执行特定任务的节点，而仅投票的节点具有相同的责任，即使它们永远无法成为当选的主节点。

要将符合资格的主节点配置为仅投票节点，请在角色列表中包括 `master` 和 `voting_only`。例如，要创建仅投票的数据节点：

```yaml
node.roles: [ data, master, voting_only ]
```

:::danger 重要
只有具有 `master` 角色的节点才能标记为具有 `voting_Only` 角色。
:::

高可用性（HA）集群需要至少三个主资格节点，其中至少两个不是仅投票的节点。即使其中一个节点发生故障，这样的集群也能够选择主节点。

仅投票主资格节点也可以担任集群中的其他角色。例如，节点既可以是数据节点，也可以是仅投票的主资格节点。*专用的*仅投票主资格节点是仅投票主资格节点，不填充集群中的其他角色。要创建专用的仅投票主资格节点，请设置：

```yaml
node.roles: [ master, voting_only ]
```

由于专用的仅投票节点从不充当集群的当选主节点，因此它们可能比真正的主节点需要更少的堆和更少的 CPU。但是，所有符合条件的主节点（包括仅投票的节点）都位于发布群集状态更新的关键路径上。群集状态更新通常独立于性能关键型工作负载（如索引或搜索），但它们涉及管理活动，如索引创建和滚动、映射更新以及故障后恢复。这些活动的性能特征取决于每个主合格节点上的存储速度，以及所选主节点和集群中其他节点之间网络互连的可靠性和延迟。因此，你必须确保集群中节点可用的存储和网络足够好，以满足你的性能目标。

## 数据节点

数据节点保存包含已编制索引的文档的分片。数据节点处理与数据相关的操作，如 CRUD、搜索和聚合。这些操作是 I/O 密集、内存密集和 CPU 密集型的。监视这些资源并在它们过载时添加更多数据节点非常重要。

拥有专用数据节点的主要好处是主角色和数据角色的分离。

要创建专用数据节点，请设置：

```yaml
node.roles: [ data ]
```

在多层部署架构中，你使用专门的数据角色将数据节点分配给特定的层：`data_content`、`data_hot`、`data_warm`、`data_cold` 或 `data_frozen`。节点可以属于多个层，但具有一个专用数据角色的节点不能具有通用数据角色。

## 内容数据节点

内容数据节点是内容层的一部分。存储在内容层中的数据通常是产品目录或文章归档等项目的集合。与时间序列数据不同，随着时间的推移，内容的价值保持相对恒定，因此随着时间的增长，将其移动到具有不同性能特征的层是没有意义的。内容数据通常具有较长的数据保留期要求，你希望能够快速检索项目，而不管项目的使用年限如何。

内容层节点通常针对查询性能进行优化-​它们将处理能力优先于 IO 吞吐量，以便能够处理复杂的搜索和聚合，并快速返回结果。虽然他们也负责索引，但内容数据的摄取率通常不如日志和度量等时间序列数据高。从弹性角度来看，应将此层中的索引配置为使用一个或多个副本。

需要内容层。不属于数据流的系统索引和其他索引将自动分配给内容层。

要创建专用内容节点，请设置：

```yaml
node.roles: [ data_content ]
```

## 热门数据节点

热门数据节点是热层的一部分。热层是时间序列数据的 Elasticsearch 入口点，保存最新、最频繁搜索的时间序列数据。热层中的节点需要快速读取和写入，这需要更多的硬件资源和更快的存储（SSD）。为了恢复，应将热层中的索引配置为使用一个或多个副本。

热层是必需的。作为[数据流](/data_streams.html)一部分的新索引将自动分配给热层。

要创建专用热节点，请设置：

```yaml
node.roles: [ data_hot ]
```

## 温数据节点

温数据节点是热层的一部分。一旦时间序列数据的查询频率低于热层中最近索引的数据，它就可以移动到温层。温层通常保存最近几周的数据。仍然允许更新，但可能不频繁。温层中的节点通常不需要像热层中那样快。为了恢复，应将温层中的索引配置为使用一个或多个副本。

要创建专用温节点，请设置：

```yaml
node.roles: [ data_warm ]
```

## 冷数据节点

冷数据节点是冷层的一部分。当你不再需要定期搜索时间序列数据时，它可以从温层移动到冷层。虽然仍然可以搜索，但这一层通常是为了降低存储成本而不是搜索速度而优化的。

为了更好地节省存储空间，你可以在冷层保留[可搜索快照](/data_management/index_lifecycle_actions/searchable_snapshots.html)的[完全挂载索引](/snapshot_and_restore/searchable_snapshorts.html#挂载选项)。与常规索引不同，这些完全装载的索引不需要副本以提高可靠性。如果发生故障，他们可以从基础快照恢复数据。这可能会使数据所需的本地存储减半。需要快照存储库才能在冷层中使用完全装载的索引。完全装入的索引是只读的。

或者，你可以使用冷层来存储带有副本的常规索引，而不是使用可搜索的快照。这允许你在较便宜的硬件上存储较旧的数据，但与热层相比，不会减少所需的磁盘空间。

要创建专用冷节点，请设置：

```yaml
node.roles: [ data_cold ]
```

## 冻结数据节点

冻结数据节点是冻结层的一部分。一旦数据不再被查询，或者很少被查询，它可能会从冷层移动到冻结层，在那里它会一直保存。

冻结层需要快照存储库。冻结层使用[部分挂载的索引](/snapshot_and_restore/searchable_snapshorts.html#挂载选项)来存储和加载快照存储库中的数据。这降低了本地存储和操作成本，同时仍允许你搜索冻结的数据。由于 Elasticsearch 有时必须从快照存储库获取冻结数据，因此冻结层上的搜索通常比冷层上的慢。

要创建专用冻结节点，请设置：

```yaml
node.roles: [ data_frozen ]
```

## 摄取节点

摄取节点可以执行由一个或多个摄取处理器组成的预处理管道。根据摄取处理器执行的操作类型和所需的资源，使用专用的摄取节点可能是有意义的，这些节点将仅执行此特定任务。

要创建专用摄取节点，请设置：

```yaml
node.roles: [ ingest ]
```

## 仅协调节点

如果你失去了处理主任务、保存数据和预处理文档的能力，那么你将剩下一个协调节点，它只能路由请求、处理搜索减少阶段和分发批量索引。本质上，仅协调节点充当智能负载平衡器。

仅协调节点可以通过将协调节点角色从符合数据和主资格的节点上卸下而使大型集群受益。它们加入集群并接收完整的集群状态，就像其他节点一样，它们使用集群状态将请求直接路由到适当的位置。

::: warning 警告
向集群添加太多的仅协调节点会增加整个集群的负担，因为所选的主节点必须等待来自每个节点的集群状态更新确认！仅协调节点的好处不应夸大——数据节点可以愉快地服务于相同的目的。
:::

要创建专用协调节点，请设置：

```yaml
node.roles: [ ]
```

## 远程资格节点

符合条件的远程节点充当跨集群客户端并连接到[远程集群](/set_up_elasticsearch/remote_clusters.html)。连接后，可以使用[跨集群搜索](/search_your_data/search_across_clusters.html)来搜索远程集群。你还可以使用[跨集群复制](/set_up_a_cluster_for_high_availability/cross_cluster_replication.html)在集群之间同步数据。

```yaml
node.roles: [ remote_cluster_client ]
```

## 机器学习节点

机器学习节点运行作业并处理机器学习 API 请求。有关更多信息，参阅[机器学习设置](/set_up_elasticsearch/configuring_elasticsearch/machine_learning_settings_in_elasticsearch.html)。

要创建专用机器学习节点，请设置：

```yaml
node.roles: [ ml, remote_cluster_client]
```

`remote_cluster_client` 角色是可选的，但强烈建议使用。否则，在机器学习作业或数据反馈中使用跨集群搜索时会失败。如果在异常检测作业中使用跨集群搜索，则所有符合条件的主节点上也需要 `remote_cluster_client` 角色。否则，无法启动数据馈送。参阅[远程资格节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#远程资格节点)。

## 转换节点

转换节点运行转换并处理转换 API 请求。有关详细信息，请参见变换设置。

要创建专用变换节点，请设置：

```yaml
node.roles: [ transform, remote_cluster_client ]
```

`remote_cluster_client` 角色是可选的，但强烈建议使用。否则，在转换中使用跨集群搜索时会失败。参阅[远程资格节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#远程资格节点)。

## 更改节点角色

每个数据节点在磁盘上维护以下数据：

- 分配给该节点的每个分片的分片数据，
- 与分配给该节点的每个分片相对应的索引元数据，以及
- 集群范围的元数据，如设置和索引模板。

同样，每个符合资格的主节点在磁盘上维护以下数据：

- 集群中每个索引的索引元数据，以及
- 集群范围的元数据，如设置和索引模板。

每个节点在启动时检查其数据路径的内容。如果它发现意外数据，那么它将拒绝启动。这是为了避免导入不需要的悬挂索引，这可能会导致红色集群运行状况。更准确地说，如果启动时在磁盘上发现任何碎片数据，则没有数据角色的节点将拒绝启动；如果启动时磁盘上有任何索引元数据，则没有 `master` 角色和 `data` 角色的节点将拒绝启动。

可以通过调整其 `elasticsearch.yml` 文件并重新启动它来更改节点的角色。这被称为重新调整节点的用途。为了满足对上述意外数据的检查，在启动没有 `data` 或 `master` 角色的节点时，必须执行一些额外的步骤来准备重新调整节点的用途。

- 如果你想通过删除数据角色来重新调整数据节点的用途，那么应该首先使用[分配过滤器]()/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings.html将所有分片数据安全地迁移到集群中的其他节点上。

- 如果你希望重新调整节点的用途，使其既不具有 `data` 角色，也不具有 `master` 角色，那么最简单的方法是启动一个具有空数据路径和所需角色的新节点。你可能会发现，首先使用[分配过滤器](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings.html)将分片数据迁移到集群中的其他位置是最安全的。

如果无法执行这些额外步骤，则可以使用 [elasticsearch 节点重新调整](/command_line_tools/elasticsearch_node.html#更改节点角色)用途工具删除阻止节点启动的任何多余数据。

## 节点路径数据设置

### `path.data`

每个符合条件的数据和主节点都需要访问数据目录，其中将存储分片、索引和集群元数据。`path.data` 默认为 `$ES_HOME/data`，但可以在 `elasticsearch.yml` 配置文件中配置绝对路径或相对于 `$ES_HOME`的路径，如下所示：

```yaml
path.data:  /var/elasticsearch/data
```

与所有节点设置一样，也可以在命令行中将其指定为：

```yaml
./bin/elasticsearch -Epath.data=/var/elasticsearch/data
```

`path.data` 目录的内容必须在重新启动期间保持，因为这是存储数据的位置。Elasticsearch 要求文件系统像由本地磁盘备份一样工作，但这意味着只要远程存储的行为与本地存储无异，它就可以在正确配置的远程块设备（如 SAN）和远程文件系统（如 NFS）上正常工作。你可以在同一文件系统上运行多个 Elasticsearch 节点，但每个 Elasticearch 节点必须有自己的数据路径。

Elasticsearch 集群的性能通常受到底层存储性能的限制，因此必须确保存储支持可接受的性能。某些远程存储性能非常差，特别是在 Elasticsearch 所施加的负载下，因此在使用特定存储体系结构之前，请确保仔细地对系统进行基准测试。

::: tip 提示
使用 `.zip` 或 `.tar.gz` 发行版时，应将 `path.data` 设置配置为查找 Elasticsearch 主目录之外的数据目录，以便在不删除数据的情况下删除主目录！RPM 和 Debian 发行版已经为你做到了这一点。
:::

::: warning 警告
不要修改数据目录中的任何内容或运行可能干扰其内容的进程。如果 Elasticsearch 以外的其他东西修改了数据目录的内容，那么 Elasticsearch 可能会失败，报告损坏或其他数据不一致，或者可能在默默丢失了一些数据后看起来工作正常。不要尝试对数据目录进行文件系统备份；没有支持的方法来恢复这样的备份。相反，请使用快照和恢复来安全地进行备份。不要在数据目录上运行病毒扫描程序。病毒扫描程序可以阻止 Elasticsearch 正常工作，并可能修改数据目录的内容。数据目录不包含可执行文件，因此病毒扫描只能发现误报。
:::

## 其他节点设置

更多节点设置可在[配置 Elasticsearch](/set_up_elasticsearch/configuring_elasticsearch) 和[重要 Elasticearch 配置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration.html)中找到，包括：

- `cluster.name`
- `node.name`
- [网络设置](/set_up_elasticsearch/configuring_elasticsearch/networking.html)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-node.html)
