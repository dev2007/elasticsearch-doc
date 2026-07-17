# 远程集群信息 API

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
:::

返回已配置的远程集群信息。

## 请求

```bash
GET /_remote/info
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

集群远程信息 API 允许你检索已配置的远程集群的信息。它返回按已配置的远程集群别名分组的连接和端点信息。

::::note 提示
此 API 返回的信息反映本地集群上的当前状态。`connected` 字段不一定反映远程集群是否已关闭或不可用，仅表示当前是否有到它的打开连接。Elasticsearch 不会自发尝试重新连接已断开的远程集群。要触发重新连接，请尝试跨集群搜索、ES|QL 跨集群搜索，或尝试解析集群端点。
::::

## 响应体

- `mode`（字符串）

  远程集群的连接模式。返回值为 `sniff` 和 `proxy`。

- `connected`（布尔值）

  如果至少有一个到远程集群的打开连接，则为 `true`。当为 `false` 时，表示集群不再有到远程集群的打开连接。这不一定意味着远程集群已关闭或不可用，仅表示在某个时刻连接已丢失。

- `initial_connect_timeout`（时间值）

  远程集群连接的初始连接超时时间。

- `skip_unavailable`（布尔值）

  如果远程集群的节点在搜索期间不可用，跨集群搜索是否跳过该远程集群。如果为 `true`，跨集群搜索还会忽略远程集群返回的错误。参阅[可选远程集群](/manage_elasticsearch/remote_clusters/remote_cluster_cluster_settings#可选远程集群)。

- `seeds`（数组）

  配置 sniff 模式时远程集群的初始种子传输地址。

- `num_nodes_connected`（整数）

  配置 sniff 模式时远程集群中已连接的节点数。

- `max_connections_per_cluster`（整数）

  配置 sniff 模式时为远程集群维护的最大连接数。

- `proxy_address`（字符串）

  配置 proxy 模式时远程连接的地址。

- `num_proxy_sockets_connected`（整数）

  配置 proxy 模式时到远程集群的打开套接字连接数。

- `max_proxy_socket_connections`（整数）

  配置 proxy 模式时到远程集群的最大套接字连接数。

- `cluster_credentials`（字符串）

  仅当远程集群配置为基于 API 密钥的模型时，此字段才会出现且值为 `::es_redacted::`。否则，该字段不存在。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-remote-info.html)
