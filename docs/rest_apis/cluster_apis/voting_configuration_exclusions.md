# 投票配置排除 API

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
:::

添加或移除投票配置排除列表中具备主节点资格的节点。

## 请求

```bash
POST /_cluster/voting_config_exclusions?node_names=<node_names>
```

```bash
POST /_cluster/voting_config_exclusions?node_ids=<node_ids>
```

```bash
DELETE /_cluster/voting_config_exclusions
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
- 如果启用了操作员权限功能，只有操作员用户才能使用此 API。

## 描述

默认情况下，如果集群中有超过三个具备主节点资格的节点，并且你一次移除少于一半的具备主节点资格的节点，投票配置会自动收缩。

如果你想将投票配置收缩到少于三个节点，或者一次移除一半或更多的具备主节点资格的节点，请使用此 API 手动将离开的节点从投票配置中移除。该 API 为每个指定的节点在集群的投票配置排除列表中添加一条记录，然后等待集群重新配置其投票配置以排除指定的节点。

集群在正常运行时不应有任何投票配置排除。一旦被排除的节点已停止，请使用 `DELETE /_cluster/voting_config_exclusions` 清除投票配置排除。此 API 会等待节点完全从集群中移除后才返回。如果你的集群中有你不再打算移除的节点的投票配置排除，请使用 `DELETE /_cluster/voting_config_exclusions?wait_for_removal=false` 在不等待节点离开集群的情况下清除投票配置排除。

对 `POST /_cluster/voting_config_exclusions` 的响应返回 HTTP 状态码 200 OK，保证该节点已从投票配置中移除，并且在通过调用 `DELETE /_cluster/voting_config_exclusions` 清除投票配置排除之前不会被恢复。如果对 `POST /_cluster/voting_config_exclusions` 的调用失败或返回 HTTP 状态码不是 200 OK 的响应，则该节点可能尚未从投票配置中移除。在这种情况下，你可以安全地重试该调用。

::::note 提示
投票排除仅在短时间内从集群中移除至少一半的具备主节点资格的节点时才需要。在移除不具备主节点资格的节点或移除少于一半的具备主节点资格的节点时不需要。
::::

有关更多信息，请参阅[移除具备主节点资格的节点](/set_up_elasticsearch/add_and_remove_nodes_in_yours_cluster/removing_master_nodes)。

## 查询参数

- `node_names`

  要从投票配置中排除的节点名称的逗号分隔列表。如果指定，则不能同时指定 `?node_ids`。仅适用于此 API 的 POST 形式。

- `node_ids`

  要从投票配置中排除的节点的持久 ID 的逗号分隔列表。如果指定，则不能同时指定 `?node_names`。仅适用于此 API 的 POST 形式。

- `timeout`（[时间值](/rest_apis/api_convention/common_options#时间单位)）

  （可选）添加投票配置排除时，API 在返回之前等待指定节点从投票配置中排除。等待的时间由 `?timeout` 查询参数指定。如果在满足适当条件之前超时到期，请求将失败并返回错误。默认为 `30s`。仅适用于此 API 的 POST 形式。

- `master_timeout`（[时间值](/rest_apis/api_convention/common_options#时间单位)）

  （可选）定义尝试将请求路由到集群中当前主节点时的等待时间。默认为 `30s`。适用于此 API 的 POST 和 DELETE 形式。

- `wait_for_removal`

  （可选，布尔值）指定在清除投票配置排除列表之前是否等待所有被排除的节点从集群中移除。默认为 `true`，表示所有被排除的节点必须从集群中移除后此 API 才会执行任何操作。如果设置为 `false`，则即使某些被排除的节点仍在集群中，投票配置排除列表也会被清除。仅适用于此 API 的 DELETE 形式。

## 示例

将名为 `nodeName1` 和 `nodeName2` 的节点添加到投票配置排除列表：

```bash
POST /_cluster/voting_config_exclusions?node_names=nodeName1,nodeName2
```

从列表中移除所有排除：

```bash
DELETE /_cluster/voting_config_exclusions
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/voting-config-exclusions.html)
