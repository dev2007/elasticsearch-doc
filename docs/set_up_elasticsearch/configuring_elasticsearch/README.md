# 配置 Elasticsearch

Elasticsearch 具有良好的默认值，只需要很少的配置。可以使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 在运行的集群上更改大多数设置。

配置文件应包含特定于节点的设置（如 `node.name` 和路径），或节点加入群集所需的设置，如 `cluster.name` 和 `network.host`。

## 配置文件位置

Elasticsearch有三个配置文件：

- `elasticsearch.yml` 用于配置 Elasticsearch

- `jvm.options` 用于配置 Elasticsearch JVM 设置

- `log4j2.properties` 用于配置 Elasticsearch 日志记录

这些文件位于 config 目录中，其默认位置取决于安装是来自存档发行版（`tar.gz` 或 `zip`）还是软件包发行版（Debian 或 RPM 软件包）。

对于压缩分发版，配置目录位置默认为 `$ES_HOME/config`。可以通过 `ES_PATH_CONF` 环境变量更改配置目录的位置，如下所示：

```bash
ES_PATH_CONF=/path/to/my/config ./bin/elasticsearch
```

或者，您可以通过命令行或shell概要文件导出ES_PATH_CONF环境变量。

对于包发行版，配置目录位置默认为 `/etc/elasticsearch`。还可以通过 `ES_PATH_CONF` 环境变量更改配置目录的位置，但请注意，在 shell 中设置此值是不够的。相反，这个变量来源于 `/etc/default/elasticsearch`（对于 Debian 包）和 `/etc/sysconfig/elasticsearch`（对于 RPM 包）。您需要相应地编辑其中一个文件中的 `ES_PATH_CONF=/etc/elasticsearch` 条目，以更改配置目录位置。

## 配置文件格式

配置格式为 [YAML](https://yaml.org/)。以下是更改数据和日志目录路径的示例：

```bash
path:
    data: /var/lib/elasticsearch
    logs: /var/log/elasticsearch
```

还可以按如下方式展平设置：

```bash
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
```

在 YAML 中，可以将非标量值格式化为序列：

```bash
discovery.seed_hosts:
   - 192.168.1.10:9300
   - 192.168.1.11
   - seeds.mydomain.com
```

虽然不太常见，但也可以将非标量值格式化为数组：

```bash
discovery.seed_hosts: ["192.168.1.10:9300", "192.168.1.11", "seeds.mydomain.com"]
```

## 环境变量替代

配置文件中使用 `${…}` 符号引用的环境变量将替换为环境变量的值。例如：

```bash
node.name:    ${HOSTNAME}
network.host: ${ES_NETWORK_HOST}
```

环境变量的值必须是简单字符串。使用逗号分隔的字符串提供 Elasticsearch 将解析为列表的值。例如，Elasticsearch 将以下字符串拆分为 `${HOSTNAME}` 环境变量的值列表：

```bash
export HOSTNAME="host1,host2"
```

## 集群和节点设置类型

集群和节点设置可以根据配置方式进行分类：

- **动态**

你可以使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 在正在运行的集群上配置和更新动态设置。你还可以使用 `elasticsearch.yml` 在未启动或关闭的节点上本地配置动态设置。

使用集群更新设置 API 进行的更新可以是持久的，适用于跨集群重新启动；也可以是瞬时的，在集群重新启动后重置。你还可以通过使用 API 为瞬态或持久设置分配 `null` 来重置它们。

如果你使用多个方法配置同一设置，Elasticsearch 将按以下优先顺序应用设置：

1. 瞬态设置
2. 持续设置
3. `elasticsearch.yml` 设置
4. 默认设置值

例如，可以应用瞬态设置来覆盖持久设置或 `elasticsearch.yml` 设置。但是，更改 `elasticsearch.yml` 设置不会覆盖已定义的瞬态或持久设置。

::: tip 提示
如果使用 Elasticsearch 服务，请使用[用户设置](https://www.elastic.co/guide/en/cloud/current/ec-add-user-settings.html)功能配置所有集群设置。此方法允许 Elasticsearch 服务自动拒绝可能破坏集群的不安全设置。<br> 如果你在自己的硬件上运行 Elasticsearch，请使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 配置动态集群设置。仅使用 `elasticsearch.yml` 用于静态集群设置和节点设置。API 不需要重新启动，并确保设置的值在所有节点上都相同。
:::

::: danger 警告
我们不再建议使用临时集群设置。请改用永久集群设置。如果集群变得不稳定，瞬态设置可能会意外清除，从而导致可能不需要的集群配置。参阅[瞬态设置迁移指南](/migration_guide/8.0/transient_settings_migration_guide)。
:::

- **静态**

只能使用 `elasticsearch.yml` 在未启动或关闭的节点上配置静态设置。

必须在集群中的每个相关节点上设置静态设置。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html)
