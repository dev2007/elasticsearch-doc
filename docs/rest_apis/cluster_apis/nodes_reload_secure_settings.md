# 节点重新加载安全设置 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
::::

重新加载集群中节点上的密钥库。

## 请求

```bash
POST /_nodes/reload_secure_settings
```

```bash
POST /_nodes/<node_id>/reload_secure_settings
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

安全设置存储在磁盘上的密钥库中。其中某些设置是可重新加载的，也就是说，你可以在磁盘上修改它们并重新加载，而无需重启集群中的任何节点。在密钥库中更新了可重新加载的安全设置后，你可以使用此 API 在每个节点上重新加载这些设置。

当 Elasticsearch 密钥库受密码保护（而非仅做混淆处理）时，你必须在重新加载安全设置时提供密钥库的密码。为整个集群重新加载设置时，假定所有节点的密钥库都使用相同的密码保护；此方法仅在节点间通信已加密时才允许使用。或者，你可以通过本地访问 API 并传入特定节点的 Elasticsearch 密钥库密码，在每个节点上单独重新加载安全设置。

## 路径参数

- `<node_id>`

  （可选，字符串）集群中要操作的特定节点的名称。例如 `nodeId1,nodeId2`。有关节点选择选项，请参阅[节点规范](/rest_apis/cluster_apis/cluster_apis)。

Elasticsearch 要求集群各节点的安全设置保持一致，但这一一致性并未被强制执行。因此，重新加载特定节点并非标准操作，仅在重试失败的重新加载操作时才合理。

## 请求体

- `secure_settings_password`

  （可选，字符串）Elasticsearch 密钥库的密码。

## 示例

以下示例假定集群中每个节点上的 Elasticsearch 密钥库使用相同的密码：

```bash
POST _nodes/reload_secure_settings
{
  "secure_settings_password":"keystore-password"
}
# 仅重新加载指定节点的安全设置
POST _nodes/nodeId1,nodeId2/reload_secure_settings
{
  "secure_settings_password":"keystore-password"
}
```

响应包含 `nodes` 对象，它是一个以节点 ID 为键的映射。每个值包含节点名称和可选的 `reload_exception` 字段。`reload_exception` 字段是重新加载过程中抛出的异常的序列化表示（如果有）。

```json
{
  "_nodes": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "cluster_name": "my_cluster",
  "nodes": {
    "pQHNt5rXTTWNvUgOrdynKg": {
      "name": "node-0"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-reload-secure-settings.html)
