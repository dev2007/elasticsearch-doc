# 远程集群设置

以下设置同时适用于嗅探模式和代理模式。特定于嗅探模式和代理模式的设置单独描述。

## 常规设置（两种模式）

**`cluster.remote.<cluster_alias>.mode`**

用于远程集群连接的模式。唯一支持的模式是 `sniff` 和 `proxy`。默认为 `sniff`。有关这些模式的更多信息参阅连接模式，有关其设置的更多信息参阅嗅探模式远程集群设置和代理模式远程集群设置。

**`cluster.remote.initial_connect_timeout`**

节点启动时等待建立远程连接的时间。默认为 `30s`。

**`remote_cluster_client` 角色**

默认情况下，集群中的任何节点都可以充当跨集群客户端并连接到远程集群。要防止节点连接到远程集群，请在 `elasticsearch.yml` 中指定 `node.roles` 设置并从列出的角色中排除 `remote_cluster_client`。针对远程集群的搜索请求必须发送到允许充当跨集群客户端的节点。其他特性（如机器学习数据馈送、转换和跨集群复制）需要 `remote_cluster_client` 角色。

**`cluster.remote.<cluster_alias>.skip_unavailable`**

每个集群的布尔值设置，允许在属于特定集群的节点都不可用且它们是远程集群请求的目标时跳过该集群。

在 Elasticsearch 8.15 中，`skip_unavailable` 的默认值从 `false` 更改为 `true`。在 Elasticsearch 8.15 之前，如果你希望某个集群在跨集群搜索中被视为可选，则需要设置该配置。从 Elasticsearch 8.15 起，你需要设置该配置才能使某个集群成为跨集群搜索的必需集群。一旦你将本地（"查询"）集群的搜索协调节点（你向其发送 CCS 请求的节点）升级到 8.15 或更高版本，任何没有显式设置 `skip_unavailable` 的远程集群都会立即切换为使用新的默认值 true。无论你是否已将远程集群升级到 8.15，这都是成立的，因为 `skip_unavailable` 搜索行为完全由你配置远程的本地集群上的设置决定。

**`cluster.remote.<cluster_alias>.transport.ping_schedule`**

设置定期发送的应用级 ping 消息之间的时间间隔，用于保持远程集群连接存活。如果设置为 `-1`，则不向该远程集群发送应用级 ping 消息。如果未设置，则根据全局 `transport.ping_schedule` 设置发送应用级 ping 消息，该设置默认为 `-1`，即不发送 ping。比起配置 `ping_schedule`，更推荐正确配置 TCP keep-alive，因为 TCP keep-alive 由操作系统处理而不是由 Elasticsearch 处理。默认情况下，Elasticsearch 在远程集群连接上启用 TCP keep-alive。远程集群连接是传输连接，因此 `transport.tcp.*` 关于 TCP keep-alive 的高级设置也适用于它们。

**`cluster.remote.<cluster_alias>.transport.compress`**

每个集群的设置，用于配置对特定远程集群的请求的压缩。处理集群会自动压缩对已压缩请求的响应。设置选项为 `true`、`indexing_data` 和 `false`。如果未设置，默认为节点范围的 `transport.compress` 设置指定的行为。更多信息参阅 `transport.compress` 设置的文档。

**`cluster.remote.<cluster_alias>.transport.compression_scheme`**

每个集群的设置，用于配置对特定集群的请求的压缩方案（如果这些请求被 `cluster.remote.<cluster_alias>.transport.compress` 设置选择进行压缩）。处理集群会自动对响应使用与对应请求相同的压缩方案。设置选项为 `deflate` 和 `lz4`。如果未设置，默认为节点范围的 `transport.compression_scheme` 设置指定的行为。

**`cluster.remote.<cluster_alias>.credentials`**

（安全，可重载）用于配置采用 API 密钥模型的远程集群的每个集群设置。此设置接受跨集群 API 密钥的编码值，必须在集群中每个节点的 Elasticsearch 密钥库中设置。此设置的存在与否决定了远程集群使用哪种模型。如果存在，远程集群使用基于 API 密钥的模型；否则使用基于证书的模型。如果在 Elasticsearch 密钥库中添加、移除或更新此设置并通过节点重载安全设置 API 重载，集群将自动重建其与远程的连接。

## 嗅探模式远程集群设置

要使用嗅探模式连接到远程集群，设置 `cluster.remote.<cluster_alias>.mode: sniff`，然后配置以下设置。你也可以将 `cluster.remote.<cluster_alias>.mode` 留空，因为 `sniff` 是默认模式。

**`cluster.remote.<cluster_alias>.seeds`**

用于嗅探远程集群状态的种子节点列表。

**`cluster.remote.<cluster_alias>.node_connections`**

为此远程集群连接的网关节点数量。默认为 `3`。

**`cluster.remote.node.attr`**

用于筛选远程集群中有资格作为网关节点的节点的节点属性。例如，节点可以具有节点属性 `node.attr.gateway: true`，这样当 `cluster.remote.node.attr` 设置为 `gateway` 时，只有具有此属性的节点才会被连接。

## 代理模式远程集群设置

要使用代理模式连接到远程集群，设置 `cluster.remote.<cluster_alias>.mode: proxy`，然后配置以下设置。

**`cluster.remote.<cluster_alias>.proxy_address`**

用于所有远程连接的地址。

**`cluster.remote.<cluster_alias>.proxy_socket_connections`**

每个远程集群要打开的套接字连接数量。默认为 `18`。

**`cluster.remote.<cluster_alias>.server_name`**

一个可选的主机名字符串，如果启用了 TLS，将在 TLS 服务器名称指示（SNI）扩展的 `server_name` 字段中发送。如果此字段不是 TLS SNI 规范定义的有效主机名，TLS 传输将无法打开远程连接。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remote-clusters-settings.html)
