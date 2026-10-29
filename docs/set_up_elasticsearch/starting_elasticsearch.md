# 启动 Elasticsearch

## 存档软件包（.tar.gz）

### 从命令行运行 Elasticsearch

```bash
./bin/elasticsearch
```

首次启动 Elasticsearch 时，安全功能默认启用并配置。以下安全配置会自动发生：

- 身份验证和授权已启用，并为 `elastic` 内置超级用户生成密码。
- 为传输层和 HTTP 层生成 TLS 的证书和密钥，并使用这些密钥和证书启用和配置 TLS。
- 为 Kibana 生成注册令牌，有效期 30 分钟。

`elastic` 用户的密码和 Kibana 的注册令牌会输出到你的终端。

我们建议将 `elastic` 密码作为环境变量存储在你的 shell 中。示例：

```bash
export ELASTIC_PASSWORD="your_password"
```

如果你对 Elasticsearch 密钥库进行了密码保护，将提示你输入密钥库的密码。更多详情参阅安全设置。

默认情况下，Elasticsearch 将日志打印到控制台（stdout）和 `logs` 目录中的 `<集群名称>.log` 文件。Elasticsearch 在启动期间会记录一些信息，但在完成初始化之后，它将继续在前台运行，不再记录任何内容，直到发生值得记录的事件。在 Elasticsearch 运行时，你可以通过其 HTTP 接口与它交互，该接口默认在端口 9200 上。

要停止 Elasticsearch，按 Ctrl-C。

Elasticsearch 附带的所有脚本都需要支持数组的 Bash 版本，并假定 Bash 在 `/bin/bash` 可用。因此，Bash 应该直接或通过符号链接在此路径可用。

### 将节点注册到现有集群

当 Elasticsearch 首次启动时，安全自动配置过程将 HTTP 层绑定到 `0.0.0.0`，但只将传输层绑定到 localhost。这一预期行为确保你无需任何额外配置即可启动默认启用安全功能的单节点集群。

在生产集群中，将新节点注册之前通常需要额外的操作，例如绑定到 localhost 以外的地址或满足引导检查。在此期间，自动生成的注册令牌可能会过期，这就是注册令牌不会自动生成的原因。

此外，只有同一主机上的节点才能在没有额外配置的情况下加入集群。如果你希望来自其他主机的节点加入你的集群，你需要将 `transport.host` 设置为受支持的值（例如取消注释建议的值 `0.0.0.0`），或设置为绑定到其他主机可以访问的接口的 IP 地址。更多信息参阅传输设置。

要将新节点注册到你的集群，使用 `elasticsearch-create-enrollment-token` 工具在集群中的任何现有节点上创建注册令牌。然后使用 `--enrollment-token` 参数启动新节点，使其加入现有集群。

1. 在运行 Elasticsearch 的终端之外的另一个终端中，导航到你安装 Elasticsearch 的目录，运行 `elasticsearch-create-enrollment-token` 工具为你的新节点生成注册令牌：

   ```bash
   bin/elasticsearch-create-enrollment-token -s node
   ```

   复制注册令牌，你将用它把新节点注册到你的 Elasticsearch 集群。

2. 在新节点的安装目录中，启动 Elasticsearch 并使用 `--enrollment-token` 参数传递注册令牌：

   ```bash
   bin/elasticsearch --enrollment-token <enrollment-token>
   ```

   Elasticsearch 会自动在以下目录中生成证书和密钥：

   ```txt
   config/certs
   ```

3. 对要注册的任何新节点重复上一步骤。

### 作为守护进程运行

要将 Elasticsearch 作为守护进程运行，在命令行上指定 `-d`，并使用 `-p` 选项将进程 ID 记录到文件中：

```bash
./bin/elasticsearch -d -p pid
```

如果你对 Elasticsearch 密钥库进行了密码保护，将提示你输入密钥库的密码。

日志消息可以在 `$ES_HOME/logs/` 目录中找到。

要关闭 Elasticsearch，终止 pid 文件中记录的进程 ID：

```bash
pkill -F pid
```

:::note 注意

Elasticsearch .tar.gz 软件包不包含 systemd 模块。要将 Elasticsearch 作为服务管理，请改用 Debian 或 RPM 软件包。

:::

## 存档软件包（.zip）— Windows

如果你使用 .zip 软件包在 Windows 上安装了 Elasticsearch，你可以从命令行启动 Elasticsearch。如果你希望 Elasticsearch 在开机时无需任何用户交互即可自动启动，请将 Elasticsearch 安装为服务。

### 从命令行运行 Elasticsearch

```powershell
.\bin\elasticsearch.bat
```

首次启动时的安全自动配置与 .tar.gz 部分相同：为 `elastic` 内置超级用户生成密码；为传输层和 HTTP 层生成 TLS 证书和密钥并启用 TLS；为 Kibana 生成有效期 30 分钟的注册令牌。密码和注册令牌输出到终端。

我们建议将 `elastic` 密码作为环境变量存储在你的 shell 中：

```powershell
$ELASTIC_PASSWORD = "your_password"
```

停止 Elasticsearch 按 Ctrl-C。

将节点注册到现有集群的步骤与 .tar.gz 部分相同（`bin\elasticsearch-create-enrollment-token -s node` 生成令牌，`bin\elasticsearch --enrollment-token <enrollment-token>` 注册，证书和密钥自动生成于 `config\certs`）。

## Debian 软件包

### 使用 systemd 运行 Elasticsearch

要将 Elasticsearch 配置为在系统启动时自动启动，运行以下命令：

```bash
sudo /bin/systemctl daemon-reload
sudo /bin/systemctl enable elasticsearch.service
```

Elasticsearch 可以按以下方式启动和停止：

```bash
sudo systemctl start elasticsearch.service
sudo systemctl stop elasticsearch.service
```

这些命令不提供 Elasticsearch 是否成功启动的反馈。相反，这些信息将写入位于 `/var/log/elasticsearch/` 的日志文件中。

如果你对 Elasticsearch 密钥库进行了密码保护，你需要使用本地文件和 systemd 环境变量向 systemd 提供密钥库密码。此本地文件在存在期间应受到保护，一旦 Elasticsearch 启动并运行即可安全删除：

```bash
echo "keystore_password" > /path/to/my_pwd_file.tmp
chmod 600 /path/to/my_pwd_file.tmp
sudo systemctl set-environment ES_KEYSTORE_PASSPHRASE_FILE=/path/to/my_pwd_file.tmp
sudo systemctl start elasticsearch.service
```

默认情况下，Elasticsearch 服务不在 systemd 日志中记录信息。要启用 journalctl 日志记录，必须从 `elasticsearch.service` 文件的 `ExecStart` 命令行中移除 `--quiet` 选项。

启用 systemd 日志记录后，可以使用 journalctl 命令获取日志信息：

跟踪日志：

```bash
sudo journalctl -f
```

列出 elasticsearch 服务的日志条目：

```bash
sudo journalctl --unit elasticsearch
```

列出从给定时间开始的 elasticsearch 服务的日志条目：

```bash
sudo journalctl --unit elasticsearch --since "2016-10-30 18:17:16"
```

更多命令行选项参阅 `man journalctl`。

**旧版 systemd 的启动超时**

默认情况下，Elasticsearch 将 systemd 的 `TimeoutStartSec` 参数设置为 900s。如果你运行的是 systemd 238 或更高版本，Elasticsearch 可以自动延长启动超时，并且会反复这样做，直到启动完成，即使耗时超过 900s。

238 之前的 systemd 版本不支持超时扩展机制，如果 Elasticsearch 在配置的超时时间内未完全启动，将终止 Elasticsearch 进程。如果发生这种情况，Elasticsearch 将在其日志中报告它在启动后不久正常关闭；而 systemd 日志将报告启动超时。为避免这种情况，请将 systemd 升级到至少 238 版本。你也可以通过延长 `TimeoutStartSec` 参数临时解决此问题。

## Docker 镜像

如果你安装了 Docker 镜像，你可以从命令行启动 Elasticsearch。根据你使用的是开发模式还是生产模式，有不同的方法。参阅"在 Docker 中运行 Elasticsearch"。

## RPM 软件包

### 使用 systemd 运行 Elasticsearch

与 Debian 软件包部分的内容相同（`systemctl daemon-reload`/`enable` 命令、启动/停止命令、通过 `ES_KEYSTORE_PASSPHRASE_FILE` 提供密钥库密码、journalctl 说明，以及包含相同日志示例的"旧版 systemd 的启动超时"部分）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/starting-elasticsearch.html)
