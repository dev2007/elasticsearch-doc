---
sidebar_position: 160
---

# 日志

你可以使用 Elasticsearch 的应用程序日志来监视集群并诊断问题。如果将 Elasticsearch 作为服务运行，则日志的默认位置会因平台和安装方法而异：

- Docker

  在 [Docker](/set_up_elasticsearch/installing_elasticsearch/docker.html) 上，日志消息进入控制台，由配置的 Docker 日志驱动程序处理。要访问日志，请运行 `docker logs`。

- Debian（APT）

  对于 [Debian 安装](/set_up_elasticsearch/installing_elasticsearch/debian.html)，Elasticsearch 将日志写入 `/var/log/electricsearch`。

- RPM

  对于 [RPM 安装](/set_up_elasticsearch/installing_elasticsearch/rpm.html)，Elasticsearch 将日志写入 `/var/log/lelasticsearch`。

- macOS

  对于 [macOS .tar.gz](/set_up_elasticsearch/installing_elasticsearch/linux.html) 安装，Elasticsearch 将日志写入 `$ES_HOME/logs`。

  升级期间，`$ES_HOME` 中的文件可能会被删除。在生产中，我们强烈建议你设置 `path.logs` 以记录到 `$ES_HOME` 之外的位置。参阅[路径设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration.html#路径设置)。

- Linux

  对于 [Linux .tar.gz](/set_up_elasticsearch/installing_elasticsearch/linux.html) 安装，Elasticsearch 将日志写入 `$ES_HOME/logs`。

  升级期间，`$ES_HOME` 中的文件可能会被删除。在生产中，我们强烈建议你将 `path.logs` 设置在 `$ES_HOME` 之外的位置。参阅[路径设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration.html#路径设置)。

- Windows .zip

  对于 [Windows .zip](/set_up_elasticsearch/installing_elasticsearch/windows) 安装，Elasticsearch 将日志写入 `%ES_HOME%\logs`。
  
  `%ES_HOME%` 中的文件可能在升级过程中被删除。在生产环境中，我们强烈建议你将 `path.logs` 设置在 `%ES_HOME%` 之外的位置。参阅[路径设置](/set_up_elasticsearch/configuring_elasticsearch/import_elasticsearch_configuration.html#路径设置)。

如果从命令行运行 Elasticsearch，Elasticearch 会将日志打印到标准输出（`stdout`）。

## 日志配置

:::danger 重要
Elastic 强烈建议使用默认提供的 Log4j 2 配置。
:::

Elasticsearch 使用 Log4j 2 进行日志记录。可以使用 `log4j2.properties` 文件配置 Log4j 2。Elasticsearch 暴露了三个属性，`${sys:es.logs.base_path}`、`${sys:es.logs.cluster_name}` 和  `${sys:es.logs.node_name}`，它们可以在配置文件中引用以确定日志文件的位置。属性 `${sys:es.logs.base_path}` 会解析为日志目录，`${sys:es.logs.cluster_name}` 会解析为集群名字（在默认配置中用作日志文件名的前缀），以及 `${sys:es.logs.node_name}` 会解析为节点名字（如果显示设置了节点名字）。

例如，如果你的日志目录（`path.logs`）是 `/var/log/elasticsearch` 且你的集群被命名为 `production` 那么 `${sys:es.logs.base_path}` 会解析为 `/var/log/elasticsearch`，并且 `${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}.log` 会解析为 `/var/log/elasticsearch/production.log`。

```yaml
######## Server JSON ############################
appender.rolling.type = RollingFile 
appender.rolling.name = rolling
appender.rolling.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.json 
appender.rolling.layout.type = ECSJsonLayout 
appender.rolling.layout.dataset = elasticsearch.server 
appender.rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.json.gz 
appender.rolling.policies.type = Policies
appender.rolling.policies.time.type = TimeBasedTriggeringPolicy 
appender.rolling.policies.time.interval = 1 
appender.rolling.policies.time.modulate = true 
appender.rolling.policies.size.type = SizeBasedTriggeringPolicy 
appender.rolling.policies.size.size = 256MB 
appender.rolling.strategy.type = DefaultRolloverStrategy
appender.rolling.strategy.fileIndex = nomax
appender.rolling.strategy.action.type = Delete 
appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path}
appender.rolling.strategy.action.condition.type = IfFileName 
appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-* 
appender.rolling.strategy.action.condition.nested_condition.type = IfAccumulatedFileSize 
appender.rolling.strategy.action.condition.nested_condition.exceeds = 2GB 
################################################
```

1. `appender.rolling.type = RollingFile`：配置 `RollingFile` 附加器
2. `appender.rolling.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.json`：记录日志到 `/var/log/elasticsearch/production_server.json`
3. `appender.rolling.layout.type = ECSJsonLayout`：使用 JSON 布局
4. `appender.rolling.layout.dataset = elasticsearch.server`：`dataset` 是填充事件的标志。`ECSJsonLayout` 中的数据集字段。它可以用于在解析日志时更容易地区分不同类型的日志。
5. `appender.rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.json.gz`：将日志滚动到 `/var/log/lelasticsearch/production-yyyy-MM-dd-i.json`；日志将在每个卷上压缩，`i` 将递增
6. `appender.rolling.policies.time.type = TimeBasedTriggeringPolicy`： 使用基于时间的滚动策略
7. `appender.rolling.policies.time.interval = 1`：每天滚动日志
8. `appender.rolling.policies.time.modulate = true`：在白天边界上对齐滚动（而不是每 24 小时滚动一次）
9. `appender.rolling.policies.size.type = SizeBasedTriggeringPolicy`：使用基于大小的滚动策略
10. `appender.rolling.policies.size.size = 256MB`：256 MB 后滚动日志
11. `appender.rolling.strategy.action.type = Delete`：滚动日志时使用删除操作
12. `appender.rolling.strategy.action.condition.type = IfFileName`：仅删除与文件模式匹配的日志
13. `appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-*`：模式是只删除主日志
14. `appender.rolling.strategy.action.condition.nested_condition.type = IfAccumulatedFileSize`：仅当我们累积了太多压缩日志时才删除
15. `appender.rolling.strategy.action.condition.nested_condition.exceeds = 2GB`：压缩日志的大小条件为 2 GB

```yaml
######## Server -  old style pattern ###########
appender.rolling_old.type = RollingFile
appender.rolling_old.name = rolling_old
appender.rolling_old.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.log 
appender.rolling_old.layout.type = PatternLayout
appender.rolling_old.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %m%n
appender.rolling_old.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.old_log.gz
```

1. `appender.rolling_old.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.log`：`old style` 附加器的配置。这些日志将保存在 `*.log` 文件中，如果压缩，将在 `* .log.gz` 文件中。请注意，这些应被视为已弃用，将来将被删除。

:::tip 注意
Log4j 的配置解析被任何无关的空格所混淆；如果复制并粘贴此页面上的任何 Log4j 设置，或输入任何 Log4j 配置，请确保删除任何前导和尾随空格。
:::

注意，在 `appender.rolling.filePattern` 使用 `.zip` 格式替代 `.gz` 以通过 zip 格式压缩滚动日志。如果删除 `.gz` 扩展名，则日志在滚动时不会被压缩。

如果要在指定的时间段内保留日志文件，可以使用滚动策略和删除操作。

```yaml
appender.rolling.strategy.type = DefaultRolloverStrategy 
appender.rolling.strategy.action.type = Delete 
appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path} 
appender.rolling.strategy.action.condition.type = IfFileName 
appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-* 
appender.rolling.strategy.action.condition.nested_condition.type = IfLastModified 
appender.rolling.strategy.action.condition.nested_condition.age = 7D 
```

1. `appender.rolling.strategy.type = DefaultRolloverStrategy`：配置 `DefaultRolloverStrategy`
2. `appender.rolling.strategy.action.type = Delete`：配置用于处理回滚的 `Delete` 操作
3. `appender.rolling.strategy.action.basepath = ${sys:es.logs.base_path}`：Elasticsearch 日志的基本路径
4. `appender.rolling.strategy.action.condition.type = IfFileName`：处理滚动时应用的条件
5. `appender.rolling.strategy.action.condition.glob = ${sys:es.logs.cluster_name}-*`：从与 glob `${sys:es.logs.cluster_name}-*` 匹配的基本路径中删除文件；这是日志文件滚动到的 glob；这不仅需要删除滚动的 Elasticsearch 日志，还需要删除弃用日志和慢日志
6. `appender.rolling.strategy.action.condition.nested_condition.type = IfLastModified`：要应用于与 glob 匹配的文件的嵌套条件
7. `appender.rolling.strategy.action.condition.nested_condition.age = 7D`：日志保留七天

可以加载多个配置文件（在这种情况下，它们将被合并），只要它们被命名为 `log4j2.properties`，并将 Elasticsearch 配置目录作为前驱；这对于暴露附加记录器的插件很有用。logger 部分包含 java 包及其相应的日志级别。appender 部分包含日志的目标。有关如何自定义日志记录和所有支持的附加程序的详细信息，可以在 [Log4j 文档](https://logging.apache.org/log4j/2.x/manual/configuration.html)中找到。

## 配置日志级别

Elasticsearch 源代码中的每个 Java 包都有一个相关的记录器。例如，`org.elasticsearch.discovery` 包有 `logger.org.elasticsearch.discovery` 用于与[发现](/set_up_elasticsearch/discovery_and_cluster_formation/discovery.html)过程相关的日志。

要获取更多或更少的详细日志，请使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html) 更改相关记录器的日志级别。每个记录器都接受 Log4j 2 的内置日志级别，从最低到最详细：`OFF`、`FATAL`、`ERROR`、`WARN`、`INFO`、`DEBUG` 和 `TRACE`。默认日志级别为 `INFO`。以较高详细级别（`DEBUG` 和 `TRACE`）记录的消息仅供专家使用。

```bash
PUT /_cluster/settings
{
  "persistent": {
    "logger.org.elasticsearch.discovery": "DEBUG"
  }
}
```

更改日志级别的其他方法包括：

1. `elasticsearch.yml`：

```yaml
logger.org.elasticsearch.discovery: DEBUG
```

在单个节点上调试问题时，这是最合适的。

2. `log4j2.properties`：

```yaml
logger.discovery.name = org.elasticsearch.discovery
logger.discovery.level = debug
```

当你已经因为其他原因需要更改 Log4j 2 配置时，这是最合适的。例如，你可能希望将特定记录器的日志发送到另一个文件。然而，这些用例很少。

## 弃用的日志

Elasticsearch 还将弃用日志写入日志目录。当你使用已弃用的 Elasticsearch功能时，这些日志会记录一条消息。在将 Elasticsearch 升级到新的主要版本之前，你可以使用弃用日志来更新应用程序。

默认情况下，Elasticsearch 以 1GB 的速度滚动和压缩弃用日志。默认配置最多保留五个日志文件：四个滚动日志和一个活动日志。

Elasticsearch 在 `CRITICAL` 级别发出弃用日志消息。这些消息表明，在下一个主要版本中将删除使用过的弃用功能。`WARN` 级别的弃用日志消息表明使用了一个不太关键的功能，它不会在下一个主要版本中删除，但可能会在将来删除。

要停止写入弃用日志消息，请设置 `log4j2.properties` 中的 `logger.deprevention.level` 为 `OFF`：

```yaml
logger.deprecation.level = OFF
```

或者，你可以动态更改日志记录级别：

参考[配置日志级别](/set_up_elasticsearch/configuring_elasticsearch/logging.html#配置日志级别)

如果 `X-Opaque-Id` 用作 HTTP 头，你可以确定是什么触发了不推荐的功能。用户 ID 包含在弃用 JSON 日志的 `X-Opaque-ID` 字段中。

```json
{
  "type": "deprecation",
  "timestamp": "2019-08-30T12:07:07,126+02:00",
  "level": "WARN",
  "component": "o.e.d.r.a.a.i.RestCreateIndexAction",
  "cluster.name": "distribution_run",
  "node.name": "node-0",
  "message": "[types removal] Using include_type_name in create index requests is deprecated. The parameter will be removed in the next major version.",
  "x-opaque-id": "MY_USER_ID",
  "cluster.uuid": "Aq-c-PAeQiK3tfBYtig9Bw",
  "node.id": "D7fUYfnfTLa2D7y-xw6tZg"
}
```

 `cluster.deprecation_indexing.enabled` 设置被设置为 `true`，弃用日志可被索引到 `.logs-deprecation.elasticsearch-default` 数据流。

## 弃用日志限制

弃用日志基于弃用的功能键和 `x-opaque-id` 进行重复数据消除，这样，如果重复使用某个功能，则不会使弃用日志过载。这适用于索引的弃用日志和发送到日志文件的日志。通过将 `luster.deprecation_indexing.x_opaque_id_used.enabled` 更改为 `false`，你可以禁用在节流中使用 `x-opaque-id`。参阅 [RateLimitingFilter](https://www.elastic.co/guide/en/elasticsearch/reference/current/server/src/main/java/org/elasticsearch/common/logging/RateLimitingFilter.java)。

## JSON 日志格式

为了更容易解析 Elasticsearch 日志，日志现在以 JSON 格式打印。这由 Log4J 布局属性 `appender.rolling.layout.type=ECSJsonLayout` 配置。此布局需要设置数据集属性，该属性用于在分析时区分日志流。

```yaml
appender.rolling.layout.type = ECSJsonLayout
appender.rolling.layout.dataset = elasticsearch.server
```

每行包含一个 JSON 文档，属性在 `ECSJsonLayout` 中配置。有关详细信息，参阅此类 [javadoc](https://artifacts.elastic.co/javadoc/org/elasticsearch/elasticsearch/8.5.3/org/elasticsearch/common/logging/ESJsonLayout.html)。但是，如果 JSON 文档包含异常，则将在多行上打印。第一行将包含常规属性，随后的行将包含格式化为 JSON 数组的堆栈跟踪。

:::tip 注意
你仍然可以使用自己的自定义布局。为此，使用不同的布局替换行 `appender.rolling.layout`。参见以下示例：
:::

```yaml
appender.rolling.type = RollingFile
appender.rolling.name = rolling
appender.rolling.fileName = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}_server.log
appender.rolling.layout.type = PatternLayout
appender.rolling.layout.pattern = [%d{ISO8601}][%-5p][%-25c{1.}] [%node_name]%marker %.-10000m%n
appender.rolling.filePattern = ${sys:es.logs.base_path}${sys:file.separator}${sys:es.logs.cluster_name}-%d{yyyy-MM-dd}-%i.log.gz
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/logging.html)
