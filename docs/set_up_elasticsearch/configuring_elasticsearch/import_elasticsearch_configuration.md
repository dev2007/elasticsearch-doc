---
sidebar_position: 10
---

# 重要的 Elasticsearch 配置

Elasticsearch 只需要很少的配置即可开始，但在生产中使用集群之前，必须考虑以下几点：

- [路径设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#路径设置)

- [集群名设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#集群名设置)

- [节点名设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#节点名设置])

- [网络主机设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#网络主机设置)

- [发现设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#发现和集群构成设置)

- [堆大小设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#堆大小设置)

- [JVM 堆转储路径设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#JVM-堆转储路径设置)

- [GC 日志设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#GC-日志设置)

- [临时目录设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#临时目录设置)

- [JVM 致命错误日志设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#JVM-致命错误日志设置)

- [集群备份](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#集群备份)

我们的[Elastic Cloud](https://www.elastic.co/cn/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)服务自动配置这些项目，默认情况下，使你的集群生产就绪。

## 路径设置

Elasticsearch 将索引的数据写入索引，并将数据流写入数据目录。Elasticsearch 将自己的应用程序日志写入日志目录，其中包含有关集群运行状况和操作的信息。

对于 [macOS .tar.gz](/set_up_elasticsearch/installing_elasticsearch/linux)，[Linux .tar.gz](/set_up_elasticsearch/installing_elasticsearch/linux) 和 [Windows .zip](/set_up_elasticsearch/installing_elasticsearch/windows) 安装，`data` 和 `logs` 默认是 `$ES_HOME` 的子目录。然而，`$ES_HOME` 中的文件可能在升级过程中被删除。

在生产中，我们强烈建议你设置 `elasticsearch.yml` 中的 `path.data` 和 `path.logs` 在 `$ES_HOME` 之外的位置。默认情况下，[Docker](/set_up_elasticsearch/installing_elasticsearch/docker)、[Debian](/set_up_elasticsearch/installing_elasticsearch/debian) 和 [RPM](/set_up_elasticsearch/installing_elasticsearch/rpm) 安装将数据和日志写入 `$ES_HOME` 之外的位置。

支持的 `path.data`和 `path.logs`。值因平台而异：

- 类 Unix 系统

Linux 和 macOS 安装支持 Unix 风格的路径：

```bash
path:
  data: /var/data/elasticsearch
  logs: /var/log/elasticsearch
```

- Windows

Windows 安装支持带转义反斜杠的 DOS 路径：

```bash
path:
  data: "C:\\Elastic\\Elasticsearch\\data"
  logs: "C:\\Elastic\\Elasticsearch\\logs"
```

:::danger 重要
不要修改数据目录中的任何内容或运行可能会干扰其内容的进程。如果 Elasticsearch 以外的其他内容修改了数据目录的内容，则 Elasticsearch 可能会失败，报告损坏或其他数据不一致，或者可能在默默丢失部分数据后正常工作。不要尝试对数据目录进行文件系统备份；不支持还原此类备份的方法。相反，请使用[快照和还原](/snapshot_and_restore/snapshot_and_restore)来安全地进行备份。不要在数据目录上运行病毒扫描程序。病毒扫描程序可能会阻止 Elasticsearch 正常工作，并可能会修改数据目录的内容。数据目录不包含可执行文件，因此病毒扫描只会发现误报。
:::

## 多数据路径

:::danger 重要
7.13.0 版本已弃用
:::

如果需要，可以在 `path.data` 中指定多个路径。Elasticsearch 跨所有提供的路径存储节点的数据，但将每个分片的数据保持在同一路径上。

Elasticsearch 不平衡节点数据路径上的分片。单个路径中的高磁盘使用率可以触发整个节点的[高磁盘利用率水印](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings#基于磁盘的分片分配设置
)。如果触发，Elasticsearch 将不会向节点添加分片，即使节点的其他路径具有可用磁盘空间。如果需要额外的磁盘空间，建议你添加新节点，而不是其他数据路径。

- 类 Unix 系统

Linux 和 macOS 安装支持 `path.data` 中的多个 Unix 样式路径：

```bash
path:
  data:
    - /mnt/elasticsearch_1
    - /mnt/elasticsearch_2
    - /mnt/elasticsearch_3
```

- Windwos

Windows 安装支持 `path.data` 中的多个 DOS 路径：

```bash
path:
  data:
    - "C:\\Elastic\\Elasticsearch_1"
    - "E:\\Elastic\\Elasticsearch_1"
    - "F:\\Elastic\\Elasticsearch_3"
```

## 从多个数据路径迁移

支持多数据路径在 7.13 中已被弃用，并将在未来版本中删除。

作为多数据路径的替代方案，你可以使用硬件虚拟化层（如 RAID）或软件虚拟化层，如 Linux 上的逻辑卷管理器（LVM）或 Windows 上的存储空间，创建跨越多个磁盘的文件系统。如果希望在一台计算机上使用多个数据路径，则必须为每个数据路径运行一个节点。

如果当前在[高可用集群](/set_up_a_cluster_for_high_availability/desining_for_resilicence/desining_for_resilicence)中使用多个数据路径，则可以迁移到为每个节点使用单一路径的设置，而无需使用类似于[滚动重启](/set_up_elasticsearch/full_cluster_restart_and_rolling_restart#滚动重启)的过程进行停机：依次关闭每个节点，并将其替换为一个或多个节点，每个节点都配置为使用单一数据路径。更详细地说，对于当前具有多个数据路径的每个节点，应遵循以下过程。原则上，你可以在滚动升级到 8.0 期间执行此迁移，但我们建议在开始升级之前迁移到单个数据路径设置。

1. 创建快照以在发生灾难时保护你的数据。

2. 可选地，通过使用[分配过滤器](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings#集群级分片分配过滤)将数据从目标节点迁移：

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": "target-node-name"
  }
}
```

你可以使用 [cat 分配 API](/rest_apis/cat_apis/cat_allocation) 跟踪数据迁移的进度。如果一些分片没有迁移，那么[集群分配解释 API](/rest_apis/cluster_apis/cluster_allocation_explain) 将帮助你确定原因。

3. 按照[滚动重启过程](/set_up_elasticsearch/full_cluster_restart_and_rolling_restart#滚动重启)中的步骤操作，直到关闭目标节点。

4. 确保集群运行状况为 `yellow（黄色）`或 `green（绿色）`，以便有分配给集群中至少一个其他节点的每个分片的副本。

5. 如果适用，请删除前面步骤中应用的分配筛选器。

```bash
PUT _cluster/settings
{
  "persistent": {
    "cluster.routing.allocation.exclude._name": null
  }
}
```

6. 通过删除已停止节点的数据路径的内容，丢弃已停止节点持有的数据。

7. 重新配置存储。例如，使用LVM或存储空间将磁盘合并到单个文件系统中。确保重新配置的存储具有足够的空间来存放数据。

8. 通过调整 `elasticsearch.yml` 文件中的 `path.data` 设置重新配置节点。如果需要，安装更多节点，每个节点都有自己的 `path.data` 设置指向单独数据路径。

9. 启动新节点，并对其执行其余的[滚动重启过程](/set_up_elasticsearch/full_cluster_restart_and_rolling_restart#滚动重启)过程。

10. 确保集群运行状况为绿色，以便已分配每个分片。

你也可以向集群添加一些单数据路径节点，使用[分配过滤器](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings#集群级分片分配过滤)将所有数据迁移到这些新节点，然后从集群中删除旧节点。这种方法将使集群的大小临时增加一倍，因此只有在你有能力这样扩展集群的情况下，它才能工作。

如果你当前使用多个数据路径，但你的群集不是高度可用的，则可以通过创建快照，再创建具有所需配置的新集群并将快照还原到其中，用以迁移到非弃用配置。

## 集群名设置

节点只能在加入集群后，向集群中其他所有节点共享其 `cluster.name`。默认名称是 `elasticsearch`，但你应该将其更改为描述集群用途的适当名称。

```bash
cluster.name: logging-prod
```

不要在不同的环境中重用相同的集群名称。否则，节点可能加入错误的集群。

## 节点名设置

Elasticsearch 使用 `node.name` 作为 Elasticsearch 特定实例的可读标识符。此名称包含在许多 API 的响应中。节点名称默认为 Elasticsearch 启动时机器的主机名，但可以在 `elasticsearch.yml` 中显式配置：

```bash
node.name: prod-data-2
```

## 网络主机设置

默认情况下，Elasticsearch 仅绑定到回环地址，如 `127.0.0.1` 和 `[：：1]`。这足以在单个服务器上运行一个或多个节点的集群进行开发和测试，但[弹性生产集群](/set_up_a_cluster_for_high_availability/desining_for_resilicence/desining_for_resilicence)必须涉及其他服务器上的节点。有许多[网络设置](/set_up_elasticsearch/configuring_elasticsearch/networking)，但通常只需要配置 `network.host`：

```bash
network.host: 192.168.1.10
```

:::danger 重要
当你提供 `network.host` 值，Elasticsearch 假设你正在从开发模式转移到生产模式，并将大量系统启动检查从警告升级为异常。查看[开发和生产模式](set_up_elasticsearch/import_system_configuration/import_system_configuration)之间的差异。
:::
## 发现和集群构成设置

在投入生产之前，配置两个重要的发现和群集形成设置，以便群集中的节点可以相互发现并选择主节点。

`discovery.seed_hosts`

开箱即用，无需任何网络配置，Elasticsearch 将绑定到可用的环回地址，并扫描本地端口 `9300` 至 `9305`，以与运行在同一服务器上的其他节点连接。这种行为提供了一种无需进行任何配置的自动集群体验。

当你希望与其他主机上的节点组成集群时，请使用[静态](/set_up_elasticsearch/configuring_elasticsearch#静态) `discovery.seed_hosts` 设置。此设置提供群集中其他节点的列表，这些节点具有主资格，并且可能处于活动状态，并且可以联系以启动[发现过程](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-discovery-hosts-providers.html)。此设置接受集群中所有主合格节点的 YAML 序列或地址数组。每个地址可以是 IP 地址，也可以是通过 DNS 解析为一个或多个 IP 地址的主机名。

```bash
discovery.seed_hosts:
   - 192.168.1.10:9300
   - 192.168.1.11 
   - seeds.mydomain.com 
   - [0:0:0:0:0:ffff:c0a8:10c]:9301 
```

1. `192.168.1.11`：端口可选，默认为 `9300`，但可以被[覆盖](/set_up_elasticsearch/discovery_and_cluster_formation/discovery)。

2. `seeds.mydomain.com`：如果主机名解析为多个 IP 地址，则节点将尝试在所有解析的地址发现其他节点。

3. `[0:0:0:0:0:ffff:c0a8:10c]:9301`：IPv6 地址必须用方括号括起来。

如果符合主节点条件的节点没有固定名称或地址，请使用备用主机提供程序动态查找其地址。

- `cluster.initial_master_nodes`

首次启动 Elasticsearch 集群时，群集引导步骤将确定在第一次选举中计算其投票的主合格节点集。在开发模式下，如果未配置发现设置，此步骤将由节点自己自动执行。

由于自动引导[原生不安全](/set_up_elasticsearch/discovery_and_cluster_formation/quorum_based_decision_making
)，因此在生产模式下启动新集群时，必须明确列出在第一次选举中应计算其投票的主合格节点。你可以使用 `cluster.initial_master_nodes` 设置此列表。

:::danger 重要
集群首次成功形成后，删除每个节点配置中的 `cluster.initial_master_nodes` 设置。重新启动集群或向现有集群添加新节点时，不要使用此设置。
:::

```bash
discovery.seed_hosts:
   - 192.168.1.10:9300
   - 192.168.1.11
   - seeds.mydomain.com
   - [0:0:0:0:0:ffff:c0a8:10c]:9301
cluster.initial_master_nodes: 
   - master-node-a
   - master-node-b
   - master-node-c
```

1. `cluster.initial_master_nodes`：按他们的 [`node.name`](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration#节点名设置) 标识初始主节点，默认为其主机名。确保 `cluster.initial_master_nodes` 中的值与 `node.name` 完全匹配。如果使用完全限定域名（FQDN），例如 `master-node-a.example.com` 作为节点名称，则必须使用此列表中的 FQDN。相反，如果 `node.name` 是一个没有任何尾部限定符的裸主机名，你还必须省略 `cluster.initial_master_nodes` 中的尾部限定符。

参阅[引导集群](/set_up_elasticsearch/discovery_and_cluster_formation/bootstrapping_a_cluster)以及[发现和集群构成设置](/set_up_elasticsearch/configuring_elasticsearch/discovery_and_cluster_formation_setting)。

## 堆大小设置

默认情况下，Elasticsearch 根据节点的[角色](/set_up_elasticsearch/configuring_elasticsearch/node#节点角色)和总内存自动设置 JVM 堆大小。我们建议大多数生产环境使用默认大小。

如果需要，可以通过手动[设置 JVM 堆大小](/set_up_elasticsearch/configuring_elasticsearch/advanced_configuration#设置-JVM-堆大小)来覆盖默认大小。

## JVM 堆转储路径设置

默认情况下，Elasticsearch 将 JVM 配置为将内存不足异常的堆转储到默认数据目录。在 RPM 和 Debian 软件包中，数据目录是 `/var/lib/elasticsearch`。在[Linux 和 MacOS](/set_up_elasticsearch/installing_elasticsearch/linux) 及 [Windows](/set_up_elasticsearch/installing_elasticsearch/windows) 发行版上，`data` 目录位于 Elasticsearch 安装的根目录下。

如果此路径不适合接收堆转储，请修改 [jvm.options](/set_up_elasticsearch/configuring_elasticsearch/advanced_configuration#设置-JVM-选项) 中的 `-XX:HeapDumpPath=…` 条目：

- 如果指定目录，JVM 将根据运行实例的 PID 为堆转储生成文件名。

- 如果指定固定文件名而不是目录，则当 JVM 需要对内存不足异常执行堆转储时，该文件必须不存在。否则，堆转储将失败。

## GC 日志设置

默认情况下，Elasticsearch 启用垃圾收集（GC）日志。这些是在 [jvm.options](/set_up_elasticsearch/configuring_elasticsearch/advanced_configuration#设置-JVM-选项) 中配置的，并输出到与 Elasticsearch 日志相同的默认位置。默认配置每 64 MB 旋转一次日志，最多可消耗 2 GB 的磁盘空间。

你可以使用[JEP 158：统一 JVM 日志](https://openjdk.java.net/jeps/158)中描述的命令行选项重新配置 JVM 日志。除非更改默认 `jvm.options` 文件中，除了你自己的设置之外，还将应用 Elasticsearch 默认配置。要禁用默认配置，首先通过提供 `-Xlog:disable` 选项禁用日志记录，然后提供你自己的命令行选项。这将禁用*所有* JVM 日志记录，因此请确保查看可用选项并启用所需的所有功能。

要查看原始 JEP 中未包含的其他选项，参阅[使用 JVM 统一日志框架启用日志](https://docs.oracle.com/en/java/javase/13/docs/specs/man/java.html#enable-logging-with-the-jvm-unified-logging-framework)。

## 示例

使用一些示例选项，通过创建 `$ES_HOME/config/jvm.options.d/gc.options` 来变更默认 GC 日志输出路径为 `/opt/my-app/gc.log`：

```bash
# Turn off all previous logging configuratons
-Xlog:disable

# Default settings from JEP 158, but with `utctime` instead of `uptime` to match the next line
-Xlog:all=warning:stderr:utctime,level,tags

# Enable GC logging to a custom location with a variety of options
-Xlog:gc*,gc+age=trace,safepoint:file=/opt/my-app/gc.log:utctime,pid,tags:filecount=32,filesize=64m
```

配置 Elasticsearch Docker 容器，将 GC 调试日志发送到标准错误（stderr）。这允许容器编排器处理输出。如果使用 `CLI_JAVA_OPTS` 环境变量，请指定：

```bash
MY_OPTS="-Xlog:disable -Xlog:all=warning:stderr:utctime,level,tags -Xlog:gc=debug:stderr:utctime"
docker run -e CLI_JAVA_OPTS="$MY_OPTS" # etc
```

## 临时目录设置

默认情况下，Elasticsearch 使用启动脚本在系统临时目录下创建的私有临时目录。

在某些 Linux 发行版上，如果文件和目录最近未被访问，系统实用程序将从 `/tmp` 中清除这些文件和目录。如果长时间未使用需要临时目录的功能，则此行为可能导致在Elasticsearch运行时删除专用临时目录。如果随后使用需要此目录的功能，则删除专用临时目录会导致问题。

如果使用 `.deb` 或 `.rpm` 软件包安装 Elasticsearch 并在 `systemd` 下运行，Elasticsearch 使用的私有临时目录将被排除在定期清理之外。

如果你打算运行 `.tar.gz` 在 Linux 或 MacOS 上的长期发行版，请考虑为 Elasticsearch 创建一个专用的临时目录，该目录不在将清除旧文件和目录的路径下。该目录应设置权限，以便只有运行 Elasticsearch 的用户才能访问该目录。然后，在启动 Elasticsearch 之前，将 `$ES_TMPDIR` 环境变量设置为指向该目录。

## JVM 致命错误日志设置

默认情况下，Elasticsearch 将 JVM 配置为将致命错误日志写入默认日志目录。在 [RPM](/set_up_elasticsearch/installing_elasticsearch/rpm) 和 [Debian](/set_up_elasticsearch/installing_elasticsearch/debian) 软件包中，这个目录是 `/var/log/elasticsearch`。在 [Linux 和 MacOS](/set_up_elasticsearch/installing_elasticsearch/linux) 和 [Windows](/set_up_elasticsearch/installing_elasticsearch/windows) 发行版上，日志目录位于 Elasticsearch 安装的根目录下。

这些是 JVM 遇到致命错误（如分段错误）时生成的日志。如果此路径不适合接收日志，请修改 [jvm.options](/set_up_elasticsearch/configuring_elasticsearch/advanced_configuration#设置-JVM-选项) 中的 `-XX:ErrorFile=…` 条目。

## 集群备份

在灾难中，[快照](/snapshot_and_restore/snapshot_and_restore)可以防止永久数据丢失。[快照生命周期管理](/snapshot_and_restore/create_a_snapshot#使用-SLM-自动化快照)是对集群进行定期备份的最简单方法。有关详细信息，参阅[创建快照](/snapshot_and_restore/create_a_snapshot)。

:::caution 警告
**快照是备份集群的唯一可靠且受支持的方法**。你无法通过复制 Elasticsearch 集群节点的数据目录来备份该集群。不支持从文件系统级备份中恢复任何数据的方法。如果尝试从这样的备份中恢复集群，它可能会失败，并报告损坏或丢失文件或其他数据不一致，或者它似乎成功又悄悄地丢失了一些数据。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/important-settings.html)
