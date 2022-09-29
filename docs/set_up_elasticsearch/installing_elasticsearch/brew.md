# 使用 Homebrew 在 macOS 上安装 Elasticsearch

Elasticsearch 发布了 Homebrew formulae，所以你可以通过 [Homebrew](https://brew.sh/) 包管理器安装 Elasticsearch。

要使用 Homebrew 安装，你要先连接上（tap） Elastic Homebrew 仓库：

```bash
brew tap elastic/tap
```

如果你已经连接到了 Elasticsearch Homebrew 仓库，你可以使用 `brew install` 安装 Elasticsearch：

```bash
brew install elastic/tap/elasticsearch-full
```

这将安装最近发布的 Elasticsearch 版本。

## Homebrew 安装的目录结构

当你使用 `brew install` 安装 Elasticsearch，配置文件、日志和数据目录存储在以下位置。

| 类型 | 描述 | 默认位置 | 设置 |
| :-- | :-- | :-- | :-- |
|home| Elasticsearch 主目录或 `$ES_HOME`| `/usr/local/var/homebrew/linked/elasticsearch-full`| |
|bin| 二进制脚本，包括启动节点的 `elasticsearch` 和安装插件的 `elasticsearch-plugin`| `/usr/local/var/homebrew/linked/elasticsearch-full/bin`||
|conf| 配置文件，包括 `elasticsearch.yml`| `/usr/local/etc/elasticsearch`|[ES_PATH_CONF](/set_up_elasticsearch/config#配置文件位置)|
|data| 分配在节点上的每个索引和分片的数据文件位置。可以有多个位置。|`/usr/local/var/lib/elasticsearch`|`path.data`|
|logs| 日志文件位置| `/usr/local/var/log/elasticsearch` | `path.logs`|
|plugins| 插件文件位置。每个插件会包含在一个子目录中。| `/usr/local/var/homebrew/linked/elasticsearch/plugins`||
|repo| 共享文件系统仓库位置。可以有多个位置。文件系统仓库可以放在此处指定的任何目录的任何子目录中。|未配置|`path.repo`|

## 下一步

你现在有一个测试 Elasticsearch 环境部署好。在你使用 Elasticsearch 正式开始开发或者生产之前，你必须做一些额外的设置：

- 学习如何配置 [Elasticsearch](/set_up_elasticsearch/config)。
- 配置[重要的 Elasticsearch 设置](/set_up_elasticsearch/important_es_config)。
- 配置[重要的系统设置](/set_up_elasticsearch/important_system_config)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/brew.html)
