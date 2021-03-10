# 使用 Debian 包安装 Elasticsearch

Elasticsearch 的 Debian 包可以[从我们的网站](/setup/install/debian?id=手工下载和安装-Debian-包)或者从[我们的 APT 仓库](/setup/install/debian?id=从-APT-仓库安装)下载。它可以用于在任何基于 Debian 的系统（如 Debian 和 Ubuntu）上安装 Elasticsearch。

这个包包含免费和订阅的特性。[开始 30 天的试用](https://www.elastic.co/guide/en/elasticsearch/reference/current/license-settings.html)，尝试所有功能。

Elasticsearch 的最新稳定版本，能在 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)找到。其他版本能在[历史发布页面](https://www.elastic.co/downloads/past-releases)找到。

?> Elasticsearch 包含 JDK 维护者（GPLv2+CE）提供的 [OpenJDK](https://openjdk.java.net/) 捆绑版本。要使用自己的 Java 版本，查阅 [JVM 版本要求](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html#jvm-version)。

## 导入 Elasticsearch PGP 密钥

我们使用带指纹的 Elasticsearch 签名密钥（PGP 密钥 [D88E42B4](https://pgp.mit.edu/pks/lookup?op=vindex&search=0xD27D666CD88E42B4)，存在[https://pgp.mit.edu](https://pgp.mit.edu)上）签名所有的包：

`4609 5ACC 8548 582C 1A26 99A9 D27D 666C D88E 42B4`

下载和安装公共签名密钥：

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
```

## 从 APT 仓库安装

在继续之前，你可能需要在 Debian 上安装 `apt-transport-https`包：

```bash
sudo apt-get install apt-transport-https
```

将仓库定义保存到 `/etc/apt/sources.list.d/elastic-7.x.list`:

```bash
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
```

?> 由于以下原因，指南不使用 `add-apt-repository`：
?> 1. `add-apt-repository` 向系统 `/etc/apt/sources.list` 文件中添加条目，而不是 `/etc/apt/sources.list.d` 中的每个仓库的干净文件
?> 2. `add-apt-repository` 不是许多发行版本的默认安装部分，需要许多非默认的依赖
?> 3. 老版本的 `add-apt-repository` 总会添加一个 `deb-src` 条目，由于我们没有提供源包，这会导致错误。如果你已经添加了 `deb-src` 条目，在你删除 `deb-src` 条目前，你会看到如下错误：
?> `Unable to find expected entry 'main/source/Sources' in Release file
(Wrong sources.list entry or malformed file)`

你可以这样安装 Elasticsearch Debian 包：

```bash
sudo apt-get update && sudo apt-get install elasticsearch
```

!> 如果 Elasticsearch 仓库中存在两条相同的条目，你在 `apt-get update` 操作时，会看到如下错误：  
`Duplicate sources.list entry https://artifacts.elastic.co/packages/7.x/apt/ ...`  
检查 `/etc/apt/sources.list.d/elasticsearch-7.x.list` 的重复条目，或者在 `/etc/apt/sources.list.d/` 中的文件和 `/etc/apt/sources.list` 文件中定位重复条目。

?> 在基于 systemd 的发行版上，安装脚本尝试设置内核参数（如，`vm.max_map_count`）；你可以通过屏蔽 systemd-sysctl.service 单位来跳过这个操作。

## 手工下载和安装 Debian 包

Elasticsearch v7.11.1 的 Debian 包，可以按以下从网站下载和安装：

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-amd64.deb
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-amd64.deb.sha512
shasum -a 512 -c elasticsearch-7.11.1-amd64.deb.sha512
sudo dpkg -i elasticsearch-7.11.1-amd64.deb
```

- `shasum -a 512 -c` 比较下载的 `.tar.gz` SHA 值和公开的校验值。正常应该输出 `elasticsearch-{version}-amd64.deb: OK`。

## 启用系统索引自动创建 [`X-Pack`]

一些商业特性会在 Elasticsearch 中自动创建索引。默认情况下， Elasticsearch 配置为允许自动创建索引而不需要额外的步骤。然而，如果你在 Elasticsearch 中禁用了自动索引创建，则必须在 `elasticsearch.yml` 中配置 [`action.auto_create_index`](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html#index-creation) 以允许商业特性创建以下索引：

```yaml
action.auto_create_index: .monitoring*,.watches,.triggered_watches,.watcher-history*,.ml*
```

!> 如果你在使用 [Logstash](https://www.elastic.co/products/logstash) 或 [Beats](https://www.elastic.co/products/beats)，那么你很可能需要在你的 `action.auto_create_index` 设置中使用额外的索引名字，具体的值取决于你的本地配置。如果你不确定你环境的正确值，可以考虑设置这个值为*以允许自动创建所有索引。

## SysV `init` 对 `systemd`

Elasticsearch 在安装后不会自动启动。如何启动和停止 Elasticsearch，取决于你的系统用的 SysV `init` 还是 `systemd`（更新的发行版用的）。你可以通过以下命令来判断用的哪个：

```bash
ps -p 1
```

## 使用 SysV `init` 运行 Elasticsearch

使用 `update-rc.d` 命令配置当系统启动时自动启动 Elasticsearch：

```bash
sudo update-rc.d elasticsearch defaults 95 10
```

Elasticsearch 可以使用 `service` 命令来启动和停止：

```bash
sudo -i service elasticsearch start
sudo -i service elasticsearch stop
```

如果 Elasticsearch 由于任何原因启动失败，它会输出失败原因到标准输出（STDOUT）。日志文件可以在 `/var/log/elasticsearch/` 中被找到。

## 使用 `systemd` 运行 Elasticsearch

为了配置 Elasticsearch 在系统启动时自动启动，运行以下命令：

```bash
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable elasticsearch.service
```

Elasticsearch 可以按以下方式启动和停止：

```bash
sudo systemctl start elasticsearch.service
sudo systemctl stop elasticsearch.service
```

这些命令不提供 Elasticsearch 运行成功与否的反馈。相反，信息写在位于 `/var/log/elasticsearch/` 中的日志文件。

如果你的 Elasticsearch 密码库受密码保护，你需要使用本地文件和 `systemd` 环境变量向密码库提供密码。本地文件存在时，应该受到保护，一旦 Elasticsearch 启动并运行，就可以安全删除此文件。

```bash
echo "keystore_password" > /path/to/my_pwd_file.tmp
chmod 600 /path/to/my_pwd_file.tmp
sudo systemctl set-environment ES_KEYSTORE_PASSPHRASE_FILE=/path/to/my_pwd_file.tmp
sudo systemctl start elasticsearch.service
```

默认情况下，Elasticsearch 服务不会在 `systemd` 日志中记录信息。要启用 `journalctl` 日志，必须从文件 `elasticsearch.service` 中的 `ExecStart` 命令行移除 `--quiet` 选项。

当 `systemd` 日志启用时，使用 `journalctl` 命令日志信息可用。

要跟踪日志：

```bash
sudo journalctl -f
```

列出 Elasticsearch 服务的日志条目：

```bash
sudo journalctl --unit elasticsearch
```

要列出从给定时间开始的 Elasticsearch 服务的日志条目，请执行以下操作：

```bash
sudo journalctl --unit elasticsearch --since  "2016-10-30 18:17:16"
```

检查 `man journalctl` 或者 [https://www.freedesktop.org/software/systemd/man/journalctl.html](https://www.freedesktop.org/software/systemd/man/journalctl.html) 获取更多的命令行选项。

## 检查 Elasticsearch 是否正在运行

你可以通过向 `localhost` 的 `9200` 端口发送 HTTP 请求来测试 Elasticsearch 节点是否正在运行：

```bash
GET /
```

这会给你这样的响应：

```json
{
  "name" : "Cp8oag6",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "AT69_T_DTp-1qgIJlatQqA",
  "version" : {
    "number" : "7.11.1",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "f27399d",
    "build_date" : "2016-03-30T09:51:41.449Z",
    "build_snapshot" : false,
    "lucene_version" : "8.7.0",
    "minimum_wire_compatibility_version" : "1.2.3",
    "minimum_index_compatibility_version" : "1.2.3"
  },
  "tagline" : "You Know, for Search"
}
```

## 配置 Elasticsearch

`/etc/elasticsearch` 目录包含 Elasticsearch 默认运行时配置。该目录和所包含的所有文件所有权在包安装时设置为 `root:elasticsearch`。

`setgid ` 标志对目录 `/etc/elasticsearch` 应用组权限，以确保 Elasticsearch 能读取任何包含的文件和子目录。所有文件和子目录继承 `root:elasticsearch` 所有权。从该目录或者任何子目录运行命令，如 [elasticsearch-keystore 工具](/setup/config/secure)，需要 `root:elasticsearch` 权限。

Elasticsearch 默认从 `/etc/elasticsearch/elasticsearch.yml` 文件加载它的配置。在[配置 Elasticsearch](/setup/config) 中解释了配置文件的格式。

Debian 包也有一个系统配置文件（`/etc/default/elasticsearch`），它允许你设置以下的变量：

|||
|:--|:--|
|`JAVA_HOME`|设置使用的自定义 Java 路径|
|`MAX_OPEN_FILES`|打开文件的最大值，默认为 `65535`|
|`MAX_LOCKED_MEMORY`|最大锁定内存值。如果你在 elasticsearch.yml 中使用 `bootstrap.memory_lock` 选项，设置为 `unlimited`。|
|`MAX_MAP_COUNT`|进程可能具有的最大内存映射区域数。如果你使用 `mmapfs` 作为索引存储类型，请确保将其设置一个高值。有关更多的信息，请查看关于 `max_map_count` 的 [linux 内核文档](https://github.com/torvalds/linux/blob/master/Documentation/sysctl/vm.txt)。在 Elasticsearch 启动前，通过 `sysctl` 设置，默认为 `262144`。|
|`ES_PATH_CONF`|配置文件目录（需要包含 `elasticsearch.yml`、`jvm.options` 和 `log4j2.properties` 文件），默认为 `/etc/elasticsearch`。|
|`ES_JAVA_OPTS`|你想应用的任何其他 JVM 系统属性。|
|`RESTART_ON_UPGRADE`|在包升级时配置重启，默认为 `false`。这意味着你必须在手工安装包后重启你的 Elasticseach 实例。这样做的原因是为了确保集群的升级不会导致持续的分片重分配，进而导致的高网络流量和降低了集群的响应时间。|

?> 使用 `systemd` 的发行版本要求需要通过 `systemd` 配置系统资源限制，而不是通过 `/etc/sysconfig/elasticsearch` 文件。更多信息，请参阅 [Systemd 配置](/setup/important_system_config/system?id=Systemd-配置)。

## Debian 包目录结构

Debian 包将配置文件、日志和数据目录放在基于 Debian 系统的适当位置：


| 类型 | 描述 | 默认位置 | 设置 |
| :-- | :-- | :-- | :-- |
|home| Elasticsearch 主目录或 `$ES_HOME`| `/usr/share/elasticsearch`| |
|bin| 二进制脚本，包括启动节点的 `elasticsearch` 和安装插件的 `elasticsearch-plugin`| `/usr/share/elasticsearch/bin`||
|conf| 配置文件，包括 `elasticsearch.yml`| `/etc/elasticsearch`|[ES_PATH_CONF](/setup/config?id=配置文件位置)|
|conf| 环境变量，包括堆大小，文件描述符。| `/etc/default/elasticsearch`||
|data| 分配在节点上的每个索引和分片的数据文件位置。可以有多个位置。|`/var/lib/elasticsearch`|`path.data`|
|jdk|用于运行 Elasticsearch 的捆绑 Java 开发工具包。可以通过在 `/etc/default/elasticsearc` 中覆盖 `JAVA_HOME`环境变量。|`/usr/share/elasticsearch/jdk`||
|logs| 日志文件位置| `/var/log/elasticsearch` | `path.logs`|
|plugins| 插件文件位置。每个插件会包含在一个子目录中。| `/usr/share/elasticsearch/plugins`||
|repo| 共享文件系统仓库位置。可以有多个位置。文件系统仓库可以放在此处指定的任何目录的任何子目录中。|未配置|`path.repo`|

## 下一步

你现在有一个测试 Elasticsearch 环境部署好。在你使用 Elasticsearch 正式开始开发或者生产之前，你必须做一些额外的设置：

- 学习如何配置 [Elasticsearch](/setup/config)。
- 配置[重要的 Elasticsearch 设置](/setup/important_es_config)。
- 配置[重要的系统设置](/setup/important_system_config)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html)
