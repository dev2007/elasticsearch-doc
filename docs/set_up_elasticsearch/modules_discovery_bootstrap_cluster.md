# 引导集群

首次启动 Elasticsearch 集群需要在集群中的一个或多个主合格节点上显式定义初始的主合格节点集合。这被称为集群引导（cluster bootstrapping）。这只在集群第一次启动时需要。加入运行中集群的新启动节点从集群的已选举主节点获取此信息。

初始的主合格节点集合在 `cluster.initial_master_nodes` 设置中定义。此设置应设置为一个列表，其中包含每个主合格节点的以下条目之一：

- 节点的节点名称。
- 如果未设置 `node.name`，则为节点的主机名，因为 `node.name` 默认为节点的主机名。根据你的系统配置，你必须使用完全限定的主机名或不带域名的主机名。
- 如果无法使用节点的 `node.name`，则为节点传输发布地址的 IP 地址。这通常是 `network.host` 解析到的 IP 地址，但可以覆盖。
- 如果无法使用节点的 `node.name` 且有多个节点共享单个 IP 地址，则为节点发布地址的 IP 地址和端口，形式为 IP:PORT。

不要在非主合格节点上设置 `cluster.initial_master_nodes`。

集群形成后，从每个节点的配置中移除 `cluster.initial_master_nodes` 设置，并且再也不要为该集群设置它。不要在加入现有集群的节点上配置此设置。不要在正在重启的节点上配置此设置。在执行全集群重启时不要配置此设置。

如果在集群形成后保留 `cluster.initial_master_nodes`，则存在未来配置错误可能导致在现有集群之外引导新集群的风险。在不丢失数据的情况下可能无法从此情况中恢复。

创建新集群的最简单方法是从你的主合格节点中选择一个将其自引导为单节点集群，然后所有其他节点加入该集群。这种简单方法在其他主合格节点加入集群之前不具备故障容错能力。例如，如果你有一个节点名称为 `master-a` 的主合格节点，则按如下方式配置它（从所有其他节点的配置中省略 `cluster.initial_master_nodes`）：

```yaml
cluster.initial_master_nodes: master-a
```

对于具备容错能力的集群引导，使用所有主合格节点。例如，如果你的集群有 3 个节点名称分别为 `master-a`、`master-b` 和 `master-c` 的主合格节点，则将它们全部配置如下：

```yaml
cluster.initial_master_nodes:
  - master-a
  - master-b
  - master-c
```

你必须在设置了 `cluster.initial_master_nodes` 的每个节点上将其设置为相同的节点列表，以确保在引导期间只形成一个集群。如果 `cluster.initial_master_nodes` 在设置了它的节点之间不同，你可能引导多个集群。通常在不丢失数据的情况下无法从这种情况中恢复。

## 节点名称格式必须匹配

`cluster.initial_master_nodes` 列表中使用的节点名称必须与节点的 `node.name` 属性完全匹配。默认情况下节点名称设置为机器的主机名，根据你的系统配置，它可能是也可能不是完全限定的。如果每个节点名称是完全限定的域名（如 `master-a.example.com`），则你也必须在 `cluster.initial_master_nodes` 列表中使用完全限定的域名；相反，如果你的节点名称是不带域名的主机名（没有 `.example.com` 后缀），则你必须在 `cluster.initial_master_nodes` 列表中使用不带域名的主机名。如果你混合使用完全限定和不带域名的主机名，或者 `node.name` 与 `cluster.initial_master_nodes` 之间存在其他不匹配，则集群将无法成功形成，你将看到类似以下的日志消息：

```txt
[master-a.example.com] master not discovered yet, this node has
not previously joined a bootstrapped (v7+) cluster, and this
node must discover master-eligible nodes [master-a, master-b] to
bootstrap a cluster: have discovered [{master-b.example.com}{...
```

此消息显示了节点名称 `master-a.example.com` 和 `master-b.example.com` 以及 `cluster.initial_master_nodes` 条目 `master-a` 和 `master-b`，从这个消息可以清楚地看出它们不精确匹配。

# 选择集群名称

`cluster.name` 设置使你能够创建彼此分离的多个集群。节点在首次相互连接时会验证它们的集群名称是否一致，Elasticsearch 只会由所有具有相同集群名称的节点组成集群。集群名称的默认值为 `elasticsearch`，但建议将其更改为反映集群的逻辑名称。

## 开发模式下的自动引导

默认情况下，每个节点在首次启动时会自动将其自引导为单节点集群。如果配置了以下任何设置，则不会发生自动引导：

- `discovery.seed_providers`
- `discovery.seed_hosts`
- `cluster.initial_master_nodes`

要将新节点添加到现有集群，配置 `discovery.seed_hosts` 或其他相关的发现设置，使新节点能够发现集群中现有的主合格节点。要引导新的多节点集群，按集群引导部分所述配置 `cluster.initial_master_nodes` 以及 `discovery.seed_hosts` 或其他相关的发现设置。

### 形成单一集群

一旦 Elasticsearch 节点加入了现有集群，或引导了新集群，它就不会加入另一个集群。Elasticsearch 在集群形成之后不会将单独的集群合并在一起，即使你随后尝试将所有节点配置为单个集群。这是因为没有办法在不冒数据丢失风险的情况下将这些单独的集群合并在一起。你可以通过检查每个节点上 `GET /` 报告的集群 UUID 来判断你是否形成了单独的集群。

如果你打算将节点添加到现有集群，但结果引导了一个单独的单节点集群，则你必须重新开始：

1. 关闭该节点。
2. 通过删除其数据文件夹的内容来完全擦除该节点。
3. 配置 `discovery.seed_hosts` 或 `discovery.seed_providers` 和其他相关的发现设置。确保未在任何节点上设置 `cluster.initial_master_nodes`。
4. 重启节点并验证它加入了现有集群而不是形成自己的单节点集群。

如果你打算形成一个新的多节点集群，但结果引导了一组单节点集群，则你必须重新开始：

1. 关闭所有节点。
2. 通过删除数据文件夹的内容来完全擦除每个节点。
3. 按上述说明配置 `cluster.initial_master_nodes`。
4. 配置 `discovery.seed_hosts` 或 `discovery.seed_providers` 和其他相关的发现设置。
5. 重启所有节点并验证它们已形成单一集群。
6. 从每个节点的配置中移除 `cluster.initial_master_nodes`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modules-discovery-bootstrap-cluster.html)
