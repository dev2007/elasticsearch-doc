# 路径设置

Elasticsearch 将你索引到索引和数据流中的数据写入**数据目录**（data directory），并将其自身包含集群健康状况和操作信息的应用程序日志写入**日志目录**（logs directory）。

- 对于 **macOS .tar.gz、Linux .tar.gz 和 Windows .zip** 安装，数据和日志默认是 `$ES_HOME` 的**子目录**。但是，`$ES_HOME` 中的文件**在升级期间有被删除的风险**。
- 在生产环境中，**强烈建议**在 `elasticsearch.yml` 中将 `path.data` 和 `path.logs` 设置为 **`$ES_HOME` 之外**的位置。
- **Docker、Debian 和 RPM** 安装默认将数据和日志写入 `$ES_HOME` 之外的位置。

### 各平台支持的值

**类 Unix 系统**（Linux 和 macOS 支持 Unix 风格路径）：

```yaml
path:
  data: /var/data/elasticsearch
  logs: /var/log/elasticsearch
```

**Windows**（使用转义反斜杠的 DOS 路径）：

```yaml
path:
  data: "C:\\Elastic\\Elasticsearch\\data"
  logs: "C:\\Elastic\\Elasticsearch\\logs"
```

### 警告

- **不要修改数据目录中的任何内容**，也不要运行可能干扰其内容的进程。如果 Elasticsearch 以外的东西修改了数据目录的内容，Elasticsearch 可能会失败，报告损坏或其他数据不一致，或者可能看起来运行正常但实际上已静默丢失了部分数据。
- **不要尝试对数据目录进行文件系统备份**；没有受支持的方法来恢复这样的备份。请改用**快照和恢复**来安全地进行备份。
- **不要在数据目录上运行病毒扫描程序。** 病毒扫描程序可能会阻止 Elasticsearch 正常工作，并可能修改数据目录的内容。数据目录中不包含可执行文件，因此病毒扫描只会发现误报。

## 多数据路径

> 在 7.13.0 中已弃用。

- 如有需要，你可以在 `path.data` 中指定**多个路径**。Elasticsearch 将节点的数据存储在所有提供的路径上，但**将每个分片的数据保持在同一路径上**。
- Elasticsearch **不会在节点的数据路径之间平衡分片**。单个路径中的高磁盘使用率可能触发**整个节点的高磁盘使用率水位线**。一旦触发，即使节点的其他路径有可用磁盘空间，Elasticsearch 也**不会向该节点添加分片**。
- 如果你需要额外的磁盘空间，**Elastic 建议添加新节点而不是额外的数据路径**。

**类 Unix 系统**（多个 Unix 风格路径）：

```yaml
path:
  data:
    - /mnt/elasticsearch_1
    - /mnt/elasticsearch_2
    - /mnt/elasticsearch_3
```

**Windows**（多个 DOS 路径）：

```yaml
path:
  data:
    - "C:\\Elastic\\Elasticsearch_1"
    - "E:\\Elastic\\Elasticsearch_1"
    - "F:\\Elastic\\Elasticsearch_3"
```

## 从多数据路径迁移

> 对多数据路径的支持已在 7.13 中弃用，并将在未来的版本中移除。

**替代方案**：

- 使用硬件虚拟化层（如 **RAID**）或软件虚拟化层（如 Linux 上的**逻辑卷管理器（LVM）**或 Windows 上的**存储空间（Storage Spaces）**）创建跨多个磁盘的文件系统。
- 如果你希望在单台机器上使用多个数据路径，则**必须为每个数据路径运行一个节点**。

**高可用集群的迁移**（无停机，类似于滚动重启）：如果可能，在开始升级到 8.0 之前迁移到单数据路径设置。对于具有多个数据路径的每个节点：

1. **拍摄快照**，以防发生灾难时保护你的数据。

2. （可选）使用分配过滤器将数据迁离目标节点：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": "target-node-name"
  }
}
```

   使用 **cat allocation API** 跟踪进度；如果某些分片未迁移，使用 **cluster allocation explain API**。

3. 按照**滚动重启流程**执行，直到关闭目标节点（含）。
4. 确保**集群健康状况为黄色或绿色**，即每个分片都有副本分配到至少另一个节点上。
5. 移除分配过滤器：

```txt
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

6. 通过删除其数据路径的内容来**丢弃**已停止节点持有的**数据**。
7. **重新配置存储** — 例如，使用 LVM 或存储空间将多个磁盘组合成单个文件系统。确保有足够的空间。
8. 通过调整 `elasticsearch.yml` 中的 `path.data` **重新配置节点**。如有需要，安装更多节点，每个节点的 `path.data` 指向单独的数据路径。
9. **启动新节点**并执行滚动重启流程的其余步骤。
10. 确保**集群健康状况为绿色**，即每个分片都已分配。

**替代方法**：向集群添加单数据路径节点，使用分配过滤器将所有数据迁移到它们，然后移除旧节点。⚠️ 注意：这会临时使**集群规模翻倍**，因此只有在有扩容空间的情况下才可行。

**非高可用集群**：拍摄**快照**，创建具有所需配置的**新集群**，然后将**快照恢复**到其中。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/path-settings-overview.html)
