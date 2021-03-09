# 在 Linux 或 MacOS 上用存档安装 Elasticsearch

Elasticsearch 在 Linux 和 MacOS 上是 `.tar.gz` 的存档。

这个包包含免费和订阅的特性。[开始 30 天的试用](https://www.elastic.co/guide/en/elasticsearch/reference/current/license-settings.html)，尝试所有功能。

Elasticsearch 的最新稳定版本，能在 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)找到。其他版本能在[历史发布页面](https://www.elastic.co/downloads/past-releases)找到。

?> Elasticsearch 包含 JDK 维护者（GPLv2+CE）提供的 [OpenJDK](https://openjdk.java.net/) 捆绑版本。要使用自己的 Java 版本，查阅 [JVM 版本要求](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html#jvm-version)。

## 为 Linux 下载和安装存档

Elasticsearch v7.11.1 的 Linux 存档，可以按以下操作进行下载和安装：

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-linux-x86_64.tar.gz.sha512
shasum -a 512 -c elasticsearch-7.11.1-linux-x86_64.tar.gz.sha512
tar -xzf elasticsearch-7.11.1-linux-x86_64.tar.gz
cd elasticsearch-7.11.1/
```

- `shasum -a 512 -c` 比较下载的 `.tar.gz` SHA 值和公开的校验值。正常应该输出 `elasticsearch-{version}-linux-x86_64.tar.gz: OK`。

- `cd elasticsearch-7.11.1/` 此目录一般也是环境变量里的 `$ES_HOME`。

## 为 MacOS 下载和安装存档

Elasticsearch v7.11.1 的 MacOS 压存档，可以如以下进行下载和安装：

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-darwin-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-darwin-x86_64.tar.gz.sha512
shasum -a 512 -c elasticsearch-7.11.1-darwin-x86_64.tar.gz.sha512
tar -xzf elasticsearch-7.11.1-darwin-x86_64.tar.gz
cd elasticsearch-7.11.1/
```

- `shasum -a 512 -c` 比较下载的 `.tar.gz` SHA 值和公开的校验值。正常应该输出 `elasticsearch-{version}-darwin-x86_64.tar.gz: OK`。

- `cd elasticsearch-7.11.1/` 此目录一般也是环境变量里的 `$ES_HOME`。

## 启用系统索引自动创建 [`X-Pack`]

一些商业特性会在 Elasticsearch 中自动创建索引。默认情况下， Elasticsearch 配置为允许自动创建索引而不需要额外的步骤。然而，如果你在 Elasticsearch 中禁用了自动索引创建，则必须在 `elasticsearch.yml` 中配置 [`action.auto_create_index`](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html#index-creation) 以允许商业特性创建以下索引：

```yaml
action.auto_create_index: .monitoring*,.watches,.triggered_watches,.watcher-history*,.ml*
```

!> 如果你在使用 [Logstash](https://www.elastic.co/products/logstash) 或 [Beats](https://www.elastic.co/products/beats)，那么你很可能需要在你的 `action.auto_create_index` 设置中使用额外的索引名字，具体的值取决于你的本地配置。如果你不确定你环境的正确值，可以考虑设置这个值为*以允许自动创建所有索引。

## 从命令行运行 Elasticsearch

Elasticsearch 可以如以下从命令行启动：

```bash
./bin/elasticsearch
```

如果你对 Elasticsearch 密码库进行了密码保护，会提示输入密码库密码。查看[安全设置](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-settings.html)获取更多详情。

默认情况下，Elasticsearch 在前台运行，从标准输出（`stdout`）打印日志，且可以通过按 `Ctrl-C` 中止。

?> 所有与 Elasticsearch 关联的脚本，需要一个支持数组版本的 Bash，且 Bash 要放在 `/bin/bash`中。因此，Bash 需要放在或者通过符号链接到这个路径中。

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

可以在命令行中通过 `-q` 或 `--quiet` 选项禁用日志输出到标准输出（`stdout`）。

## 作为守护进程运行

要作为守护进程运行 Elasticsearch，在命令行指定 `-d`，并使用 `-p` 选项在文件中记录进程 ID：

```bash
./bin/elasticsearch -d -p pid
```

如果你对 Elasticsearch 密码库进行了密码保护，会提示输入密码库密码。查看[安全设置](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-settings.html)获取更多详情。

日志信息可以在 `$ES_HOME/logs/` 目录中找到。

要关闭 Elasticsearch，杀死记录在 pid 文件中的 进程 ID：

```bash
pkill -F pid
```

?> Elasticsearch `.tar.gz` 包不包含 `systemd` 模块。要把 Elasticsearch 作为服务，改用 [Debian](https://www.elastic.co/guide/en/elasticsearch/reference/current/starting-elasticsearch.html#start-deb) 或者 [RPM](https://www.elastic.co/guide/en/elasticsearch/reference/current/starting-elasticsearch.html#start-rpm) 包。

## 在命令行配置 Elasticsearch

Elasticsearch 默认从 `$ES_HOME/config/elasticsearch.yml` 加载配置。配置文件的格式在[配置 Elasticsearch](/setup/config)中解释。

一些配置可以在配置文件中指定，也能在命令行中指定，如下使用 `-E` 语法：

```bash
./bin/elasticsearch -d -Ecluster.name=my_cluster -Enode.name=node_1
```

?> 通常，任意集群范围设置（如 `cluster.name`）应该添加到 `elasticsearch.yml` 配置文件中，而任何节点特定设置，如 `node.name`，应该在命令行中指定。

## 存档文件目录结构

存档发行版是完全独立的。默认情况下，所有文件和目录都包含在 `$ES_HOME`——解压存档时创建的目录。

这样很方便，因为你不必创建任意目录去启用 Elasticsearch，且卸载 Elasticsearch 就像移除 `$ES_HOME` 目录一样简单。但是，建议修改默认的配置目录（config）和数据目录（data）以便以后不用删除重要数据。

| 类型 | 描述 | 默认位置 | 设置 |
| :-- | :-- | :-- | :-- |
|home| Elasticsearch 主目录或 `$ES_HOME`| 解压存档创建的目录| |
|bin| 二进制脚本，包括启动节点的 `elasticsearch` 和安装插件的 `elasticsearch-plugin`| `$ES_HOME/bin`||
|conf| 配置文件，包括 `elasticsearch.yml`| `$ES_HOME/config`|[ES_PATH_CONF](/setup/config?id=配置文件位置)|
|data| 分配在节点上的每个索引和分片的数据文件位置。可以有多个位置。|`$ES_HOME/data`|`path.data`|
|logs| 日志文件位置| `$ES_HOME/logs` | `path.logs`|
|plugins| 插件文件位置。每个插件会包含在一个子目录中。| `$ES_HOME/plugins`||
|repo| 共享文件系统仓库位置。可以有多个位置。文件系统仓库可以放在此处指定的任何目录的任何子目录中。|未配置|`path.repo`|

## 下一步

你现在有一个测试 Elasticsearch 环境部署好。在你使用 Elasticsearch 正式开始开发或者生产之前，你必须做一些额外的设置：

- 学习如何配置 [Elasticsearch](/setup/config)。
- 配置[重要的 Elasticsearch 设置](/setup/important_es_config)。
- 配置[重要的系统设置](/setup/important_system_config)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/targz.html)
