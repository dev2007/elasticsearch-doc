# 启动并运行 Elasticsearch

为了试用 Elasticsearch，你可以在 Elasticsearch 服务（`Elasticsearch Service`）中创建托管部署或者在自己的 Linux、macOS 或者 Windows 机器上设置一个多节点 Elasticsearch 集群。

## 在 Elastic Cloud 上运行 Elasticsearch

当你在 Elasticsearch 服务中创建部署时，这个服务提供一个三节点的 Elasticsearch 集群、Kibana 以及 APM。

为了创建部署：

1. 注册一个免费的试用并验证你的电子邮箱地址。
2. 为你的账户设置密码。
3. 点击创建部署。

一旦你创建了一个部署，你就能[索引一些文档](/getting_started/index)。

## 在 Linux、macOS 或 Windows 本地运行 Elasticsearch

当你在 Elasticsearch 服务中创建一个部署时，将会自动提供一个主节点和两个数据节点。通过用 `tar` 或者 `zip` 压缩包安装，你可以在本地启动多个 Elasticsearch 实例，以查看多节点集群的行为。

在本地运行一个三节点 Elasticsearch 集群：

1. 为你的操作系统下载 Elasticsearch 压缩包：

Linux: [elasticsearch-7.11.1-linux-x86_64.tar.gz](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-linux-x86_64.tar.gz)

```bash
curl -L -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-linux-x86_64.tar.gz
```

macOS: [elasticsearch-7.11.1-darwin-x86_64.tar.gz](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-darwin-x86_64.tar.gz)

```bash
curl -L -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-darwin-x86_64.tar.gz
```

Windows: [elasticsearch-7.11.1-windows-x86_64.zip](https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.11.1-windows-x86_64.zip)

2. 解压文件：

Linux:

```bash
tar -xvf elasticsearch-7.11.1-linux-x86_64.tar.gz
```

macOS:

```bash
tar -xvf elasticsearch-7.11.1-darwin-x86_64.tar.gz
```

Windows PowerShell:

```powershell
Expand-Archive elasticsearch-7.11.1-windows-x86_64.zip
```

3. 从 `bin` 目录中启动 Elasticsearch：

Linux and macOS:

```bash
cd elasticsearch-7.11.1/bin
./elasticsearch
```

Windows:

```bash
cd elasticsearch-7.11.1\bin
.\elasticsearch.bat
```

现在你就运行起了一个单节点 Elasticsearch 集群！

4. 再启动两个 Elasticsearch 实例，你就能看到典型的多节点集群行为。你需要为每个节点指定唯一的数据和日志路径。

Linux and macOS:

```bash
./elasticsearch -Epath.data=data2 -Epath.logs=log2
./elasticsearch -Epath.data=data3 -Epath.logs=log3
```

Windows:

```bash
.\elasticsearch.bat -E path.data=data2 -E path.logs=log2
.\elasticsearch.bat -E path.data=data3 -E path.logs=log3
```

额外的节点将被分配唯一的 ID。由于你在本地运行的所有三节点，他们将自动与第一个节点加入集群。

5. 使用 `cat health API` 验证你的三节点集群是否正运行。这个 `cat API` 以比原生 JSON 更易读的格式返回关于集群和索引的信息。

你可以通过 Elasticsearch REST API 提交 HTTP 请求，直接与集群交互。如果你安装和运行了 Kibana，你也可以打开 Kibana，并通过开发控制台（`Dev Console`）提交请求。

?> 当您准备在自己的应用程序中开始使用 Elasticsearch 时，您可能想查看[Elasticsearch 语言客户端](https://www.elastic.co/guide/en/elasticsearch/client/index.html)。

```bash
GET /_cat/health?v=true
```

响应应该指示 Elasticsearch 集群的状态是绿色，且它有三个节点：

```bash
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1565052807 00:53:27  elasticsearch green           3         3      6   3    0    0        0             0                  -                100.0%
```

?> 如果仅有一个 Elasticsearch 单实例，集群状态会保持为黄色。一个单节点集群是功能完整的，但数据不能被复制到另一个节点以提供弹性。集群状态为绿色时，副本分片必定可用。如果集群状态为红色，某些数据不可用。

## 使用 cURL 命令与 Elasticsearch 交互

本指南中的大部分示例，允许你复制合适的 cURL 命令，并从命令行中向本地 Elasticsearch 实例提交请求。

对 Elasticsearch 的请求包含与任何 HTTP 请求相同的部分：

```bash
curl -X<VERB> '<PROTOCOL>://<HOST>:<PORT>/<PATH>?<QUERY_STRING>' -d '<BODY>'
```

这个示例使用以下变量：

`<VERB>`

> 合适的 HTTP 方法或操作。例如，`GET`、`POST`、`PUT`、`HEAD` 或 `DELETE`。

`<PROTOCOL>`

> `http` 或 `https`。如果你在 Elasticsearch 之前有 HTTPS 代理，或者你使用的 Elasticsearch 安全特性去加密 HTTP 通信，使用后者。

`<HOST>`

> Elasticsearch 集群的任意节点主机名。或者对本地机器上的节点使用 `localhost`。

`<PORT>`

> 运行 Elasticsearch HTTP服务的端口，默认为 `9200`。

`<PATH>`

> API路径，可以包含多部分，比如 `_cluster/stats` 或 `_nodes/stats/jvm`。

`<QUERY_STRING>`

> 一些可选的查询字符串参数。比如，`?pretty` 将打印 JSON 响应以使其更易阅读。

`<BODY>`

> JSON 编码的请求体（如果必须）。

如果启用了 Elasticsearch 安全特性，你必须提供用于认证运行 API 的有效用户名（以及密码）。例如，使用 `-u` 或 `--u` 的 cURL 命令参数。有关运行每个 API 需要的安全权限的详情，参看 [REST API](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html)。

Elasticsearch 对每个 API 请求响应 HTTP 状态码，如 `200 ok`。除了 `HEAD` 请求外，它还会返回一个 JSON 编码的响应体。

## 其他安装方式

从压缩文件安装 Elasticsearch，使你可能轻松地在本地安装和运行多个实例，然后你可以去尝试。为了运行一个单实例，你可以在 Docker 容器中运行 Elasticsearch，可以在 Linux 上通过 `DEB` 或 `RPM` 包、在 macOS 上通过 `Homebrew`，或者在 Windows 上用 `MSI` 包安装 Elasticsearch。查看[安装 Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html) 获取更多信息。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-install.html)