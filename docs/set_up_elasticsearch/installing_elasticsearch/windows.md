# 在 Windows 上用 `.zip` 安装 Elasticsearch

Elasticsearch 可以使用 Windows `.zip` 存档安装到 Windows 上。可以使用 `elasticsearch-service.bat` 安装 Elasticsearch 作为服务运行。

::: tip 提示
Elasticsearch 过去使用 `.zip` 存档安装到 Windows 上。[MSI 安装包](/set_up_elasticsearch/installing_elasticsearch/windows_msi)提供了最简单的 Windows 入门体验。如果你愿意可以继续使用 `.zip`。
:::

这个包包含免费和订阅的特性。[开始 30 天的试用](https://www.elastic.co/guide/en/elasticsearch/reference/current/license-settings.html)，尝试所有功能。

::: tip 提示
在 Windows 上，Elasticsearch 机器学习特性需要 Microsoft 通用 C 运行时库。它内置于 Windows 10、Windows Server 2016 和更高版本的 Windows 中。对于老版本的 Windows，它可以通过 Windows Update 安装，也可以从[独立下载](https://support.microsoft.com/en-us/help/2999226/update-for-universal-c-runtime-in-windows)安装。如果你不能安装 Microsoft 通用 C 运行时库，禁用机器学习特性你也能使用 Elasticsearch 的其他特性。
:::

Elasticsearch 的最新稳定版本，能在 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)找到。其他版本能在[历史发布页面](https://www.elastic.co/downloads/past-releases)找到。

::: tip 提示
Elasticsearch 包含 JDK 维护者（GPLv2+CE）提供的 [OpenJDK](https://openjdk.java.net/) 捆绑版本。要使用自己的 Java 版本，查阅 [JVM 版本要求](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html#jvm-version)。
:::

## 下载安装 `.zip` 包

Elasticsearch v7.11.1 的 `.zip` 存档可以从这里下载：

[](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-windows-x86_64.zip)

用你最喜欢的解压工具解压它。这会创建一个名为 `elasticsearch-7.11.1` 的文件夹，我们将其作为 `%ES_HOME%`。在终端窗口，`cd` 到 `%ES_HOME%` 目录，如：

```bash
cd c:\elasticsearch-7.11.1
```

## 启用系统索引自动创建 [`X-Pack`]

一些商业特性会在 Elasticsearch 中自动创建索引。默认情况下， Elasticsearch 配置为允许自动创建索引而不需要额外的步骤。然而，如果你在 Elasticsearch 中禁用了自动索引创建，则必须在 `elasticsearch.yml` 中配置 [`action.auto_create_index`](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html#index-creation) 以允许商业特性创建以下索引：

```yaml
action.auto_create_index: .monitoring*,.watches,.triggered_watches,.watcher-history*,.ml*
```

::: danger 警告
如果你在使用 [Logstash](https://www.elastic.co/products/logstash) 或 [Beats](https://www.elastic.co/products/beats)，那么你很可能需要在你的 `action.auto_create_index` 设置中使用额外的索引名字，具体的值取决于你的本地配置。如果你不确定你环境的正确值，可以考虑设置这个值为*以允许自动创建所有索引。
:::

## 从命令行运行 Elasticsearch

Elasticsearch 可以如以下从命令行启动：

```bash
.\bin\elasticsearch.bat
```

如果你对 Elasticsearch 密码库进行了密码保护，会提示输入密码库密码。查看[安全设置](https://www.elastic.co/guide/en/elasticsearch/reference/current/secure-settings.html)获取更多详情。

默认情况下，Elasticsearch 在前台运行，从标准输出（`stdout`）打印日志，且可以通过按 `Ctrl-C` 中止。

## 在命令行配置 Elasticsearch

Elasticsearch 默认从 `$ES_HOME/configuring_elasticsearch/elasticsearch.yml` 加载配置。配置文件的格式在[配置 Elasticsearch](/set_up_elasticsearch/config)中解释。

在配置文件中可以指定的设置，也能在命令行中指定，如下使用 `-E` 语法：

```bash
.\bin\elasticsearch.bat -Ecluster.name=my_cluster -Enode.name=node_1
```

::: tip 提示
包含空格的值必须使用引号括起来。如 `-Epath.logs="C:\My Logs\logs"`。
:::

::: tip 提示
通常，任意集群范围设置（如 `cluster.name`）应该添加到 `elasticsearch.yml` 配置文件中，而任何节点特定设置，如 `node.name`，应该在命令行中指定。
:::

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

## 在 Windows 上安装 Elasticsearch 作为服务

Elasticsearch 可以作为一项服务安装在后台运行，也可以无需用户交互的在启动时自动启动。这可以通过在 `bin\` 目录中的 `elasticsearch-service.bat` 脚本来在命令行允许安装、移除、管理或者配置服务，且能启动和停止服务。

```bash
c:\elasticsearch-7.11.1\bin>elasticsearch-service.bat

Usage: elasticsearch-service.bat install|remove|start|stop|manager [SERVICE_ID]
```

这脚本需要一个参数（要执行的命令），后面跟着一个可选参数表示服务的id（安装多个 Elasticsearch 服务时很有用）。

命令有：

| | |
|:-- |:-- |
|`install`|安装 Elasticsearch 作为服务|
|`remove`|移除安装的 Elasticsearch 服务（如果已启动，则停止服务）|
|`start`|启动 Elasticsearch 服务（如果已安装）|
|`stop`|停止 Elasticsearch 服务（如果已启动）|
|`manager`|启动图形化界面（GUI）管理已安装的服务|

在安装时，将提供服务的名字和 `JAVA_HOME` 的值：

```bash
c:\elasticsearch-7.11.1\bin>elasticsearch-service.bat install
Installing service      :  "elasticsearch-service-x64"
Using JAVA_HOME (64-bit):  "c:\jvm\jdk1.8"
The service 'elasticsearch-service-x64' has been installed.
```

::: tip 提示
虽然 JRE 可以用于 Elasticsearch 服务，由于它使用客户端 VM （而不是服务器 JVM——它为长时间运行的应用程序提供更好的性能），不鼓励使用，并将发出警告。
:::

::: tip 提示
系统环境变量 `JAVA_HOME` 应该设置为你想让服务使用的 JDK 的安装路径。如果你升级 JDK，你不必重装服务，但你必须设置系统环境变量 `JAVA_HOME` 为最新的 JDK 安装路径。然而，不支持跨 JVM 类型（如，JRE 对 SE）的升级，必须重装服务。
:::

## 自定义服务配置

可以在安装之前通过设置以下环境变量（使用命令行中的[设置（set）命令](https://technet.microsoft.com/en-us/library/cc754250(v=ws.10).aspx)，或通过`系统属性->环境变量` GUI）来配置 Elasticsearch 服务。

|||
|:--|:--|
|`SERVICE_ID`|服务唯一标识。在同一台机器上安装多个实例时有用。默认为 `elasticsearch-service-x64`。|
|`SERVICE_USERNAME`|运行服务的用户，默认为本地系统账户。|
|`SERVICE_PASSWORD`|在 `SERVICE_USERNAME` 中指定的用户的密码。|
|`SERVICE_DISPLAY_NAME`|服务名字。默认为 `Elasticsearch <version> %SERVICE_ID%`。|
|`SERVICE_DESCRIPTION`|服务描述。默认为 `Elasticsearch <version> Windows Service - https://elastic.co`。|
|`JAVA_HOME`|运行服务所需的 JVM 安装目录。|
|`SERVICE_LOG_DIR`|服务的日志目录，默认为 `%ES_HOME%\logs`。注意这不控制 Elasticsearch 日志路径，这个路径通过在配置文件 `elasticsearch.yml` 中的设置 `path.logs` 或在命令行中设置。|
|`ES_PATH_CONF`|配置文件目录（需要包含 `elasticsearch.yml`、`jvm.options` 和 `log4j2.properties` 文件），默认为 `%ES_HOME%\config`。|
|`ES_JAVA_OPTS`|你想应用的任何其他 JVM 系统属性。|
|`ES_START_TYPE`|服务启动模式。可以为 `auto` 或 `manual`（默认）。|
|`ES_STOP_TIMEOUT`|procrun 等待服务优雅退出的超时（秒）。默认为 `0`。|

::: tip 提示
作为它的核心，`elasticsearch-service.bat` 依赖于  Apache Commons Daemon 项目来安装服务。在服务安装之前设置的环境变量被复制，并在服务生命周期中使用。这意味着除非重装服务，否则在安装后对他们的变更都不会被获取。
:::

::: tip 提示
默认情况，Elasticsearch 依据节点的角色和总内存，自动调整 JVM 堆大小。对于大多数生产环境，我们推荐默认调整。如果需要，你可以手动设置堆大小来覆盖默认调整。
:::

::: tip 提示
当第一次在 Windows 上安装 Elasticsearch 作为服务或者从命令行运行 Elasticsearch 时，你可以按[JVM 堆大小设置](/set_up_elasticsearch/configuring_elasticsearch/advanced#JVM 堆大小设置)手工设置堆大小。为了调整已安装服务的堆大小，使用服务管理器：`bin\elasticsearch-service.bat manager`。
:::

::: tip 提示
该服务会自动配置一个私有临时目录供 Elasticsearch 运行时使用。该私有临时目录配置为用户运行安装的私有临时目录的子目录。如果这个服务要在不同的用户下运行，你可以在执行服务安装之前，通过设置环境变量 `ES_TMPDIR` 配置这个临时目录的优先位置。
:::

### 使用管理 GUI

也可以在安装后使用管理界面（`elasticsearch-service-mgr.exe`）来配置服务，它提供了对已安装服务的深入了解，包括其状态、启动类型、JVM、启动和停止设置等。从命令行调用 `elasticsearch-service.bat` 将会打开管理器窗口：

![service-manager-win](./_media/service-manager-win.png)

通过管理界面所做的大多数修改（如 JVM 设置），都需要重启服务才能生效。

## `.zip` 存档的目录结构

`.zip` 包是完全独立的。默认情况下，所有文件和目录都包含在 `$ES_HOME`——解压存档时创建的目录。

这样很方便，因为你不必创建任意目录去启用 Elasticsearch，且卸载 Elasticsearch 就像移除 `$ES_HOME` 目录一样简单。但是，建议修改默认的配置目录（config）和数据目录（data）以便以后不用删除重要数据。

| 类型 | 描述 | 默认位置 | 设置 |
| :-- | :-- | :-- | :-- |
|home| Elasticsearch 主目录或 `%ES_HOME%`| 解压存档创建的目录| |
|bin| 二进制脚本，包括启动节点的 `elasticsearch` 和安装插件的 `elasticsearch-plugin`| `%ES_HOME%\bin`||
|conf| 配置文件，包括 `elasticsearch.yml`| `%ES_HOME%\config`|[ES_PATH_CONF](/set_up_elasticsearch/config#配置文件位置)|
|data| 分配在节点上的每个索引和分片的数据文件位置。可以有多个位置。|`%ES_HOME%\data`|`path.data`|
|logs| 日志文件位置| `%ES_HOME%\logs` | `path.logs`|
|plugins| 插件文件位置。每个插件会包含在一个子目录中。| `%ES_HOME%\plugins`||
|repo| 共享文件系统仓库位置。可以有多个位置。文件系统仓库可以放在此处指定的任何目录的任何子目录中。|未配置|`path.repo`|

## 下一步

你现在有一个测试 Elasticsearch 环境部署好。在你使用 Elasticsearch 正式开始开发或者生产之前，你必须做一些额外的设置：

- 学习如何配置 [Elasticsearch](/set_up_elasticsearch/config)。
- 配置[重要的 Elasticsearch 设置](/set_up_elasticsearch/important_es_config)。
- 配置[重要的系统设置](/set_up_elasticsearch/important_system_config)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/zip-windows.html)
