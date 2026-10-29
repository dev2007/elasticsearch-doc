# 发现

发现是集群形成模块查找其他节点以组成集群的过程。此过程在你启动 Elasticsearch 节点时或节点认为主节点发生故障时运行，并持续到找到主节点或选出新的主节点为止。

此过程从一个或多个种子主机提供程序给出的种子地址列表开始，同时包括上一个已知集群中任何主合格节点的地址。此过程分两个阶段运行：首先，每个节点通过连接到每个种子地址来探测它们，尝试识别它连接到的节点并验证它是主合格节点。其次，如果成功，它与远程节点共享其所有已知主合格节点的列表，远程节点依次响应其节点。然后该节点探测它刚刚发现的所有新节点，请求它们的节点，依此类推。

如果节点不是主合格节点，它会继续此发现过程，直到发现一个已选举的主节点。如果未发现已选举的主节点，节点将在 `discovery.find_peers_interval`（默认为 1s）之后重试。

如果节点是主合格节点，它会继续此发现过程，直到它发现了一个已选举的主节点，或者发现了足够多的无主主合格节点来完成一次选举。如果这两者都没有足够快地发生，节点将在 `discovery.find_peers_interval`（默认为 1s）之后重试。

一旦选出了主节点，它通常会保持为已选举的主节点，直到被有意停止。如果故障检测确定集群出现故障，它也可能停止担任主节点。当节点不再是已选举的主节点时，它会重新开始发现过程。

有关发现问题的故障排除，参阅发现故障排除。

## 种子主机提供程序

默认情况下，集群形成模块提供两种用于配置种子节点列表的种子主机提供程序：基于设置的提供程序和基于文件的种子主机提供程序。它可以通过发现插件扩展以支持云环境和其他形式的种子主机提供程序。种子主机提供程序使用 `discovery.seed_providers` 设置进行配置，该设置默认为基于设置的主机提供程序。此设置接受不同提供程序的列表，允许你使用多种方式查找集群的种子主机。

每个种子主机提供程序都会给出种子节点的 IP 地址或主机名。如果它返回任何主机名，则这些主机名将通过 DNS 查找解析为 IP 地址。如果主机名解析为多个 IP 地址，Elasticsearch 会尝试在所有这些地址上查找种子节点。如果主机提供程序没有明确给出节点的 TCP 端口，它将隐式使用 `transport.profiles.default.port` 给出的端口范围中的第一个端口，如果未设置 `transport.profiles.default.port`，则使用 `transport.port`。并发查找的数量由 `discovery.seed_resolver.max_concurrent_resolvers` 控制（默认为 10），每次查找的超时由 `discovery.seed_resolver.timeout` 控制（默认为 5s）。请注意，DNS 查找受 JVM DNS 缓存影响。

## 基于设置的种子主机提供程序

基于设置的种子主机提供程序使用节点设置来配置种子节点地址的静态列表。这些地址可以作为主机名或 IP 地址给出；指定为主机名的主机会在每轮发现期间解析为 IP 地址。

主机列表使用 `discovery.seed_hosts` 静态设置设置。例如：

```yaml
discovery.seed_hosts:
   - 192.168.1.10:9300
   - 192.168.1.11
   - seeds.mydomain.com
```

端口将默认为 `transport.profiles.default.port`，如果未指定则回退到 `transport.port`。

如果主机名解析为多个 IP 地址，Elasticsearch 将尝试连接到每个解析出的地址。

## 基于文件的种子主机提供程序

基于文件的种子主机提供程序通过外部文件配置主机列表。Elasticsearch 在文件更改时会重新加载此文件，因此种子节点列表可以动态更改，而无需重启每个节点。例如，这为在 Docker 容器中运行的 Elasticsearch 实例提供了一种方便的机制，当这些 IP 地址在节点启动时可能未知时，可以动态提供要连接的 IP 地址列表。

要启用基于文件的发现，请在 `elasticsearch.yml` 文件中按如下方式配置文件主机提供程序：

```yaml
discovery.seed_providers: file
```

然后在 `$ES_PATH_CONF/unicast_hosts.txt` 处按以下说明的格式创建一个文件。每次对 `unicast_hosts.txt` 文件进行更改时，Elasticsearch 都会获取新的更改并使用新的主机列表。

请注意，基于文件的发现插件会扩充 `elasticsearch.yml` 中的单播主机列表：如果 `discovery.seed_hosts` 中有有效的种子地址，Elasticsearch 除了使用 `unicast_hosts.txt` 中提供的地址之外，还会使用这些地址。

`unicast_hosts.txt` 文件每行包含一个节点条目。每个节点条目由主机（主机名或 IP 地址）和可选的传输端口号组成。如果指定了端口号，它必须紧跟在主机之后（在同一行上）并用 `:` 分隔。如果未指定端口号，Elasticsearch 将隐式使用 `transport.profiles.default.port` 给出的端口范围中的第一个端口，如果未设置 `transport.profiles.default.port`，则使用 `transport.port`。

例如，以下是一个由四个参与发现的节点组成的集群的 `unicast_hosts.txt` 示例，其中一些节点不在默认端口上运行：

```txt
10.10.10.5
10.10.10.6:9305
10.10.10.5:10005
# an IPv6 address
[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:9301
```

允许使用主机名代替 IP 地址，并按上述说明通过 DNS 解析。IPv6 地址必须放在方括号中，如有需要，端口放在括号之后。

你还可以在此文件中添加注释。所有注释必须单独成行并以 `#` 开头（即注释不能从一行中间开始）。

## EC2 主机提供程序

EC2 发现插件添加了一个使用 AWS API 查找种子节点列表的主机提供程序。

## Azure 经典主机提供程序

Azure 经典发现插件添加了一个使用 Azure Classic API 查找种子节点列表的主机提供程序。

## Google Compute Engine 主机提供程序

GCE 发现插件添加了一个使用 GCE API 查找种子节点列表的主机提供程序。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/discovery-hosts-providers.html)
