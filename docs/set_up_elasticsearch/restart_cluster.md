# 全集群重启和滚动重启

在某些情况下，你可能需要执行**全集群重启**或**滚动重启**。在全集群重启的情况下，你关闭并重启集群中的所有节点；而在滚动重启的情况下，你一次只关闭一个节点，因此服务保持不中断。

:::warning 警告

超过低水位线阈值的节点重启会很慢。在重启节点之前，将磁盘使用率降低到低水位线以下。

:::

## 全集群重启

### 1. 禁用分片分配

当你关闭一个数据节点时，分配过程会等待 `index.unassigned.node_left.delayed_timeout`（默认为一分钟）再开始将该节点上的分片复制到集群中的其他节点，这可能涉及大量 I/O。由于该节点很快就会重启，这些 I/O 是不必要的。你可以在关闭数据节点之前禁用副本的分配来避免与时间赛跑：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

重启大型集群时，你还可以考虑网关设置，以减少节点进行发现时的初始压力。

### 2. 停止索引并执行 flush

执行 flush 可以加快分片恢复速度：

```txt
POST /_flush
```

### 3. （可选）暂时停止与活跃机器学习作业和数据馈送关联的任务

机器学习功能需要特定的订阅。

关闭集群时，处理机器学习作业和数据馈送有两种选择：

- 使用设置升级模式 API **暂时中止**与你的机器学习作业和数据馈送关联的任务，并防止新作业打开：

  ```txt
  POST _ml/set_upgrade_mode?enabled=true
  ```

  禁用升级模式后，作业将使用自动保存的最后一个模型状态恢复。此选项避免了在关闭期间管理活跃作业的开销，比显式停止数据馈送和关闭作业更快。

- **停止所有数据馈送并关闭所有作业。** 此选项在关闭时保存模型状态。集群重启后重新打开作业时，它们使用完全相同的模型。但是，保存最新模型状态比使用升级模式耗时更长，特别是当你有很多作业或作业具有很大的模型状态时。

### 4. 关闭所有节点

- 如果你使用 systemd 运行 Elasticsearch：

  ```sh
  sudo systemctl stop elasticsearch.service
  ```

- 如果你使用 SysV init 运行 Elasticsearch：

  ```sh
  sudo -i service elasticsearch stop
  ```

- 如果你将 Elasticsearch 作为守护进程运行：

  ```sh
  kill $(cat pid)
  ```

### 5. 执行所需的更改

### 6. 重启节点

如果你有专用主节点，先启动它们，并在继续处理数据节点之前等待它们组成集群并选举一个主节点。你可以通过查看日志来检查进度。

一旦足够多的主合格节点相互发现，它们就会组成集群并选举一个主节点。此时，你可以使用 cat health 和 cat nodes API 监控加入集群的节点：

```txt
GET _cat/health
GET _cat/nodes
```

`_cat/health` 返回的 status 列显示集群中每个节点的健康状况：红色、黄色或绿色。

### 7. 等待所有节点加入集群并报告黄色状态

当节点加入集群时，它开始恢复存储在本地的任何主分片。`_cat/health` API 最初报告红色状态，表示并非所有主分片都已分配。

一旦节点恢复了其本地分片，集群状态切换为黄色，表示所有主分片已恢复，但并非所有副本分片都已分配。这是预期之中的，因为你尚未重新启用分配。将副本的分配延迟到所有节点都为黄色，可以让主节点将副本分配给已经拥有本地分片副本的节点。

### 8. 重新启用分配

当所有节点都加入了集群并恢复了它们的主分片后，通过将 `cluster.routing.allocation.enable` 恢复为其默认值来重新启用分配：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": null
  }
}
```

重新启用分配后，集群开始向数据节点分配副本分片。此时恢复索引和搜索是安全的，但如果你能等到所有主分片和副本分片都成功分配且所有节点的状态都为绿色，你的集群会恢复得更快。

你可以使用 `_cat/health` 和 `_cat/recovery` API 监控进度：

```txt
GET _cat/health
GET _cat/recovery
```

### 9. （可选）重启机器学习作业

如果你暂时中止了与机器学习作业关联的任务，使用设置升级模式 API 将它们恢复到活跃状态：

```txt
POST _ml/set_upgrade_mode?enabled=false
```

如果你在停止节点之前关闭了所有机器学习作业，从 Kibana 或使用打开作业和启动数据馈送 API 打开作业并启动数据馈送。

## 滚动重启

### 1. 禁用分片分配

与全集群重启相同的理由和 API：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": "primaries"
  }
}
```

重启大型集群时，你还可以考虑网关设置，以减少节点进行发现时的初始压力。

### 2. （可选）停止非必要的索引并执行 flush

虽然你可以在滚动重启期间继续索引，但如果你暂时停止非必要的索引并执行 flush，分片恢复可以更快：

```txt
POST /_flush
```

### 3. （可选）暂时停止与活跃机器学习作业和数据馈送关联的任务

机器学习功能需要特定的订阅。选项：

- 通过设置升级模式 API **暂时中止任务**：`POST _ml/set_upgrade_mode?enabled=true` — 作业使用最后自动保存的模型状态恢复；比显式停止数据馈送和关闭作业更快。
- **停止所有数据馈送并关闭所有作业** — 在关闭时保存确切的模型状态，但耗时更长，特别是当有很多作业或模型状态很大时。
- **仅限滚动重启：** 你还可以**让机器学习作业保持运行**。当你关闭一个机器学习节点时，其作业会自动移动到另一个节点并恢复模型状态。这使作业能够在关闭期间继续运行，但会给集群带来增加的负载。

### 4. 滚动重启时关闭单个节点

- systemd：`sudo systemctl stop elasticsearch.service`
- SysV init：`sudo -i service elasticsearch stop`
- 守护进程：`kill $(cat pid)`

### 5. 执行所需的更改

### 6. 重启你更改的节点

启动节点并通过检查日志文件或提交 `_cat/nodes` 请求确认它加入了集群：

```txt
GET _cat/nodes
```

### 7. 重新启用分片分配

对于数据节点，一旦节点加入了集群，移除 `cluster.routing.allocation.enable` 设置以启用分片分配并开始使用该节点：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.enable": null
  }
}
```

### 8. 滚动重启时重复以上步骤

当节点已恢复且集群稳定后，对每个需要更改的节点重复这些步骤。

### 9. （可选）重启机器学习作业

如果你暂时中止了与机器学习作业关联的任务：`POST _ml/set_upgrade_mode?enabled=false`。如果你在停止节点之前关闭了所有作业，从 Kibana 或使用打开作业和启动数据馈送 API 打开作业并启动数据馈送。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/restart-cluster.html)
