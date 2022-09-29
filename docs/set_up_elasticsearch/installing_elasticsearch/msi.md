# 使用 Windows MSI 安装程序安装 Elasticsearch

::: danger 警告
此功能处于测试阶段，随时可能改变。该设计和代码是不够成熟的正式 GA 特性，并不提供保证。测试版本特性不属于支持 SLA 的正式 GA 特性。
:::

Elasticsearch 可以使用 `.msi` 包在 Windows 上安装。可以将 Elasticsearch 作为 Windows 服务安装，或者使用 `elasticsearch.exe` 手工运行。

::: tip 提示
Elasticsearch 过去使用 `.zip` 存档安装到 Windows 上。如果你愿意可以继续使用 `.zip`。
:::

这个包包含免费和订阅的特性。[开始 30 天的试用](https://www.elastic.co/guide/en/elasticsearch/reference/current/license-settings.html)，尝试所有功能。

::: tip 提示
在 Windows 上，Elasticsearch 机器学习特性需要 Microsoft 通用 C 运行时库。它内置于 Windows 10、Windows Server 2016 和更高版本的 Windows 中。对于老版本的 Windows，它可以通过 Windows Update 安装，也可以从[独立下载](https://support.microsoft.com/en-us/help/2999226/update-for-universal-c-runtime-in-windows)安装。如果你不能安装 Microsoft 通用 C 运行时库，禁用机器学习特性你也能使用 Elasticsearch 的其他特性。
:::

Elasticsearch 的最新稳定版本，能在 [Elasticsearch 下载页面](https://www.elastic.co/downloads/elasticsearch)找到。其他版本能在[历史发布页面](https://www.elastic.co/downloads/past-releases)找到。

::: tip 提示
Elasticsearch 包含 JDK 维护者（GPLv2+CE）提供的 [OpenJDK](https://openjdk.java.net/) 捆绑版本。要使用自己的 Java 版本，查阅 [JVM 版本要求](https://www.elastic.co/guide/en/elasticsearch/reference/current/setup.html#jvm-version)。
:::

## 下载 `.msi` 包

从 [https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.2.msi](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.2.msi) 下载 Elasticsearch v7.11.2 `.msi` 包。

### 使用图形化界面（GUI）安装

双击下载的 `.msi` 包以启动 GUI 向导，它会引导你完成安装过程。任何一步，你都可以通过点击 `?` 按钮浏览帮助，它会通过侧面板展示每一个输入的附加信息：

![msi_installer_help](./_media/msi_installer_help.png)

在每个界面，选择安装的目录。此外，选择数据、日志以及配置的目录或者[使用默认位置](/msi#命令行选项）：

![msi_installer_locations.png](./_media/msi_installer_locations.png)

接着，按需选择是作为服务安装还是手工启动 Elasticsearch。作为服务安装时，你还可以配置运行这个服务的 Windows 账户、安装后是否启动以及 Windows 启动行为。

![msi_installer_service](./_media/msi_installer_service.png)

::: danger 警告
当选择运行服务的 Windows 账户时，请确保选择的账户有足够的权限访问安装和其他选择的部署目录。还要确保这个账户能运行 Windows 服务。
:::

公共配置在配置页展示，除了内存和网络设置，还支持集群名字、节点名字以及角色设置：

![msi_installer_configuration](./_media/msi_installer_configuration.png)

作为安装的一部分，可以下载和安装一系列常见插件，通过配置 HTTPS 代理选项就可以下载这些插件。

::: tip 提示
确保安装机器可能访问互联网，且任何公司防火墙已配置允许从 `artifacts.elastic.co` 下载：
:::

![msi_installer_selected_plugins](./_media/msi_installer_selected_plugins.png)

从 6.3.0 版本开始，默认情况下 X-Pack 是捆绑的。除了安全配置和内置用户配置，最后一步允许选择要安装的授权类型：

![msi_installer_xpack](./_media/msi_installer_xpack.png)

在点击安装按钮后，安装开始：

![msi_installer_installing](./_media/msi_installer_installing.png)

然后安装成功后会展示：

![msi_installer_success](./_media/msi_installer_success.png)

### 使用命令行安装

`.msi` 也可以通过命令行安装 Elasticsearch。使用与图形化界面相同的默认配置的最简单安装，就是先定位到下载目录，然后运行：

```powershell
msiexec.exe /i elasticsearch-7.11.2.msi /qn
```

默认情况下， `msiexec.exe` 不会等待安装进程完成，因为它在 Windows 子系统中运行。要等待进程完成，并确保相应设置了 `%ERRORLEVEL%`，推荐使用 `start /wait` 去创建进程并等待它退出。

```powershell
start /wait msiexec.exe /i elasticsearch-7.11.2.msi /qn
```

与任何 MSI 安装包一样，安装过程的日志文件可以在 `%TEMP%` 目录中找到，随机生成文件名的格式为 `MSI<random>.LOG`。日志文件的路径 可以通过 `/l` 命令行参数提供。

```powershell
start /wait msiexec.exe /i elasticsearch-7.11.2.msi /qn /l install.log
```

Windows 安装程序支持的命令行参数可以通过以下查看：

```powershell
msiexec.exe /help
```

或者查阅 [Windows 安装程序 SDK命令行选项](https://msdn.microsoft.com/en-us/library/windows/desktop/aa367988(v=vs.85).aspx)

### 命令行选项

GUI 中展示的设置也可以用作命令行参数（在 Windows 安装程序文档中叫作属性），这些参数可传递给 `msiexec.exe`：

|||
|:--|:--|
|`INSTALLDIR`| 安装目录。目录结尾必须是 Elasticsearch 的版本。默认为 `%ProgramW6432%\Elastic\Elasticsearch\7.11.2.`|
|`DATADIRECTORY`| 存储数据的目录。默认为 `%ALLUSERSPROFILE%\Elastic\Elasticsearch\data` |
|`CONFIGDIRECTORY`| 存储配置的目录。默认为 `%ALLUSERSPROFILE%\Elastic\Elasticsearch\config`|
|`LOGSDIRECTORY`| 存储日志的目录。默认为 `%ALLUSERSPROFILE%\Elastic\Elasticsearch\logs`|
|`PLACEWRITABLELOCATIONSINSAMEPATH`| 是否在安装目录下创建数据、配置和日志目录。默认为 `false`|
|`INSTALLASSERVICE`| Elasticsearch 是否作为 Windows 服务安装和配置。默认为 `true`|
|`STARTAFTERINSTALL`| 在安装完成后是否启动此 Windows 服务。默认为 `true`|
|`STARTWHENWINDOWSSTARTS`| 当 Windows 启动时是否记启动此 Windows 服务。默认为 `true` |
|`USELOCALSYSTEM`| 此Windows 服务是否以 LocalSystem 账户运行。默认为 `true`|
|`USENETWORKSERVICE`| 此Windows 服务是否以 NetworkService 账户运行。默认为 `false`|
|`USEEXISTINGUSER`| 此Windows 服务是否以指定的现有账户运行。默认为 `false`|
|`USER`| 运行此 Windows 服务账户名。默认为 `“”`|
|`PASSWORD`| 运行此 Windows 服务的账户的密码。默认为`“”`|
|`CLUSTERNAME`| 集群名字。默认为 `elasticsearch`|
|`NODENAME`| 节点的名字。默认为 `%COMPUTERNAME%`|
|`MASTERNODE`| 此 Elasticsearch 是否配置作为主节点。默认为 `true`|
|`DATANODE`| 此 Elasticsearch 是否配置作为数据节点。默认为 `true`|
|`INGESTNODE`| 此 Elasticsearch 是否配置作为预处理节点。默认为 `true`|
|`SELECTEDMEMORY`| 分配给 Elasticsearch 的 JVM 堆内存大小。默认为 `2048`，除非目标机器内存总共小于 4 GB，这种情况默认为总内存的 50%|
|`LOCKMEMORY`| 是否 `bootstrap.memory_lock` 应用于尝试锁定进程地址空间到内存中。默认为 `false`|
|`UNICASTNODES`| 用逗号分割的用于单播发现的主机列表，格式为 `host:port` 或 `host` 。默认为 `“”`|
|`MINIMUMMASTERNODES`| 形成集群的符合主节点的节点最小数量。默认为 `“”`|
|`NETWORKHOST`| 要把节点绑定和发布（广播）该主机到集群中其他节点的主机名或者 IP 地址。默认为 `“”`|
|`HTTPPORT`| 用于通过 HTTP 暴露 Elasticsearch API 的端口。默认为 `9200`|
|`TRANSPORTPORT`| 用于集群内节点间内部通信的端口。默认为 `9300`|
|`PLUGINS`| 作为安装一部分，逗号分割的下载和安装的插件列表。默认为 `“”`|
|`HTTPSPROXYHOST`| 通过 HTTPS 下载插件的代理主机。默认为 `“”`|
|`HTTPSPROXYPORT`| 通过 HTTPS 下载插件的代理端口。默认为 `443`|
|`HTTPPROXYHOST`| 通过 HTTP 下载插件的代理主机。默认为 `“”`|
|`HTTPPROXYPORT`| 通过 HTTP 下载插件的代理端口。默认为 `80`|
|`XPACKLICENSE`| 安装的授权类型。`Basic` 或者 `Trial`。默认为 `Basic`|
|`XPACKSECURITYENABLED`| 使用 `Trial` 授权安装时，是否启用安全特性。默认为 `true`|
|`BOOTSTRAPPASSWORD`| 使用 `Trial` 授权安装时，且安全特性启用，用于引导集群并作为 `bootstrap.password` 设置存在密码库中。默认为随机值|
|`SKIPSETTINGPASSWORDS`| 使用 `Trial` 授权安装时，且安全特性启用，安装是否跳过设置内置用户。默认为 `false`|
|`ELASTICUSERPASSWORD`| 使用 `Trial` 授权安装时，且安全特性启用，用作内置用户 `elastic` 的密码。默认为 `“”`|
|`KIBANAUSERPASSWORD`| 使用 `Trial` 授权安装时，且安全特性启用，用作内置用户 `kibana` 的密码。默认为 `“”`|
|`LOGSTASHSYSTEMUSERPASSWORD`| 使用 `Trial` 授权安装时，且安全特性启用，用作内置用户 `logstash_system` 的密码。默认为 `“”`|

要传值，只需把属性名字和值，按格式 `<PROPERTYNAME>="<VALUE>"` 添加给安装命令。比如，使用与默认安装目录不同的目录：

```powershell
start /wait msiexec.exe /i elasticsearch-7.11.2.msi /qn INSTALLDIR="C:\Custom Install Directory{version}"
```

有关包含引号的值的其他规则，请参阅 [Windows 安装程序 SDK 命令行选项](https://msdn.microsoft.com/en-us/library/windows/desktop/aa367988(v=vs.85).aspx)。

## 启用系统索引自动创建 [`X-Pack`]

一些商业特性会在 Elasticsearch 中自动创建索引。默认情况下， Elasticsearch 配置为允许自动创建索引而不需要额外的步骤。然而，如果你在 Elasticsearch 中禁用了自动索引创建，则必须在 `elasticsearch.yml` 中配置 [`action.auto_create_index`](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html#index-creation) 以允许商业特性创建以下索引：

```yaml
action.auto_create_index: .monitoring*,.watches,.triggered_watches,.watcher-history*,.ml*
```

::: danger 警告
如果你在使用 [Logstash](https://www.elastic.co/products/logstash) 或 [Beats](https://www.elastic.co/products/beats)，那么你很可能需要在你的 `action.auto_create_index` 设置中使用额外的索引名字，具体的值取决于你的本地配置。如果你不确定你环境的正确值，可以考虑设置这个值为*以允许自动创建所有索引。
:::

## 从命令行运行 Elasticsearch

一旦安装，如果未作为服务安装以及配置安装完成后启动，Elasticsearch 可以从命令行启动，如下：

```powershell
.\bin\elasticsearch.exe
```

命令行终端将展示类似于以下的输出：

![elasticsearch_exe](/_media/elasticsearch_exe.png)

默认情况下，Elasticsearch 在前台运行，除了向 `LOGSDIRECTORY` 中 `<cluster name>.log` 文件打印日志，还将日志打印到标准输出（`STDOUT`），且可以通过 `Ctrl-C` 中止。

## 在命令行配置 Elasticsearch

Elasticsearch 默认从文件 `%ES_PATH_CONF%\elasticsearch.yml` 加载配置。在[配置 Elasticsearch](/set_up_elasticsearch/config) 中解释了配置文件的格式。

在配置文件中可以指定的设置，也能在命令行中指定，如下使用 `-E` 的语法：

```powershell
.\bin\elasticsearch.exe -E cluster.name=my_cluster -E node.name=node_1
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
    "number" : "7.11.2",
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

## 在 Windows 上作为服务安装 Elasticsearch

Elasticsearch 可以作为服务安装在后台运行，也可以没有任何用户交互下，在系统启动时自动启动。这可以在安装时使用以下命令行选项实现：

- INSTALLASSERVICE=true
- STARTAFTERINSTALL=true
- STARTWHENWINDOWSSTARTS=true

一旦安装，Elasticsearch 就会出现在服务控制面板：

![msi_installer_installed_service](/_media/msi_installer_installed_service.png)

而且，可以在控制面板中或从命令行使用以下命令停止和重启：

命令行：

```bash
sc.exe stop Elasticsearch
sc.exe start Elasticsearch
```

Powershell：

```powershell
Get-Service Elasticsearch | Stop-Service
Get-Service Elasticsearch | Start-Service
```

在安装后，可以修改 `jvm.options` 和 `elasticsearch.yml` 配置文件用来配置服务。大多数的修改（如 JVM 设置），都需要重启服务才能生效。

## 使用图形化界面（GUI）升级

`.msi` 包支持升级已安装的 Elasticsearch 版本到更新的版本。通过 GUI 的升级过程处理升级所有已安装的插件，以及保留数据和配置。

下载并双击更新版本的 `.msi` 包将启动 GUI 向导。第一步将列出之前安装的只读属性：

![msi_installer_upgrade_notice](/_media/msi_installer_upgrade_notice.png)

下一步允许更改某些配置选项：

![msi_installer_upgrade_configuration](/_media/msi_installer_upgrade_configuration.png)

最后，插件步骤允许升级或删除当前安装的插件，对于当前未安装的插件，可以下载并安装：

![msi_installer_upgrade_plugins](/_media/msi_installer_upgrade_plugins.png)

## 使用命令行升级

`.msi` 还可以使用命令行升级 Elasticsearch。

::: danger 警告
命令行升级需要传递与第一次安装一致的命令行属性；Windows 安装程序不会记录这些属性。  
例如，如果你最初使用命令行选项 `PLUGINS="ingest-geoip"` 和 `LOCKMEMORY="true"` 来安装，那通过命令行升级也要传递相同的值。  
例外是 `INSTALLDIR` 参数（如果最初指定了），它必须与当前安装目录不同。如果设置 `INSTALLDIR`，路径中的结尾必须是 Elasticsearch 的版本，如：  
`C:\Program Files\Elastic\Elasticsearch\7.11.2`
:::

如果 Elasticsearch 是使用所有默认值安装的，最简单的升级是先定位到下载目录，然后运行：

```powershell
start /wait msiexec.exe /i elasticsearch-7.11.2.msi /qn
```

与安装过程类似，可以通过传递 `/l` 命令行参数指定升级过程的日志文件路径：

```powershell
start /wait msiexec.exe /i elasticsearch-7.11.2.msi /qn /l upgrade.log
```

## 使用 添加/移除程序 卸载

`.msi` 包会处理作为安装的一部分的所有目录和文件的卸载。

::: danger 警告
卸载将删除作为安装部分创建的所有内容，数据、配置或日志目录除外。建议在升级前复制数据目录，或考虑使用快照 API。
:::

MSI 安装包不提供用于卸载 GUI。通过按 Windows 键并输入 `add or remove programs` 以打开系统设置，即可卸载已安装的程序。

一旦打开，在已安装应用列表中找到 Elasticsearch ，点击并选择卸载：

![msi_installer_uninstall](/_media/msi_installer_uninstall.png)

这会启动卸载过程。

## 使用命令行卸载

通过导航到包含 `.msi` 包的目录，并运行以下命令，可以从命令行执行卸载：

```powershell
start /wait msiexec.exe /x elasticsearch-7.11.2.msi /qn
```

与安装过程类似，可以使用 `/l` 命令行参数传递卸载过程的日志文件路径：

```powershell
start /wait msiexec.exe /x elasticsearch-7.11.2.msi /qn /l uninstall.log
```

## 下一步

你现在有一个测试 Elasticsearch 环境部署好。在你使用 Elasticsearch 正式开始开发或者生产之前，你必须做一些额外的设置：

- 学习如何配置 [Elasticsearch](/set_up_elasticsearch/config)。
- 配置[重要的 Elasticsearch 设置](/set_up_elasticsearch/important_es_config)。
- 配置[重要的系统设置](/set_up_elasticsearch/important_system_config)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/windows.html)
