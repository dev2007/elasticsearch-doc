# 节点功能使用情况 API

返回功能使用情况的信息。

:::info 新 API 参考
有关最新的 API 详细信息，请参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

## 请求

```bash
GET /_nodes/usage
```

```bash
GET /_nodes/<node_id>/usage
```

```bash
GET /_nodes/usage/<metric>
```

```bash
GET /_nodes/<node_id>/usage/<metric>
```

## 先决条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

集群节点使用情况 API 允许你检索每个节点功能使用情况的信息。所有节点选择选项的说明请参见[此处](/rest_apis/cluster_apis)。

## 路径参数

- `<metric>`
  （可选，字符串）限制返回的信息为特定指标。逗号分隔的以下选项列表：

  - `_all`
    返回所有统计信息。
  - `rest_actions`
    返回 REST 动作类名及该动作在节点上被调用的次数。

- `<node_id>`
  （可选，字符串）用于限制返回信息的节点 ID 或名称的逗号分隔列表。

## 查询参数

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待每个节点响应的时长。如果节点在超时到期前未响应，则响应中不包含其信息。但超时的节点会包含在响应的 `_nodes.failed` 属性中。默认为无超时。

## 示例

REST 动作示例：

```bash
GET _nodes/usage
```

API 返回以下响应：

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
      "timestamp": 1492553961812,
      "since": 1492553906606,
      "rest_actions": {
        "nodes_usage_action": 1,
        "create_index_action": 1,
        "document_get_action": 1,
        "search_action": 19,
        "nodes_info_action": 36
      },
      "aggregations": { ... }
    }
  }
}
```

- 1. `"timestamp": 1492553961812`：执行此节点使用情况请求的时间戳。
- 2. `"since": 1492553906606`：开始记录使用情况信息的时间戳。这相当于节点启动的时间。
- 3. `"since": 1492553906606`：此节点的搜索动作已被调用 19 次。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-usage.html)
