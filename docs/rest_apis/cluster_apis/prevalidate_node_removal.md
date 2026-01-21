# 节点移除预验证 API

:::note 注意
此功能设计用于 [Elasticsearch Service](https://cloud.elastic.co/registration?page=docs&placement=docs-body)、[Elastic Cloud Enterprise](https://www.elastic.co/guide/en/cloud-enterprise/current) 和 [Elastic Cloud on Kubernetes](https://www.elastic.co/guide/en/cloud-on-k8s/current) 间接使用。不支持直接使用。
:::

:::info **新 API 参考**
有关最新的 API 详细信息，请参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

对节点移除进行预验证。

## 请求

```bash
POST /_internal/prevalidate_node_removal
```

## 前提条件

- 如果启用了 Elasticsearch 安全功能，您必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

此 API 用于检查尝试从集群中移除指定节点是否可能成功。对于一个没有未分配分片的集群，移除任何节点都被认为是安全的，这意味着节点的移除很可能成功。

如果集群处于 `red` (红色)[集群健康状态](/rest_apis/cluster_apis/cluster_health)，该 API 会验证移除节点不会危及移除未分配分片的最后剩余副本。如果集群中存在红色索引，API 会检查这些红色索引是否为 [可搜索快照](/set_up_a_cluster_for_high_availability/snapshot_and_restor/searchable_snapshots) 索引，如果不是，则会向 API 调用中指定的每个节点发送请求，以验证这些节点是否可能包含非可搜索快照的红色索引的本地分片副本。每个接收节点通过检查其是否拥有任何红色索引分片的分片目录来处理此请求。

响应内容包括移除指定节点的整体安全性，以及对每个节点的详细响应。响应中针对节点的部分还会包含关于移除该节点可能不会成功的更多详细信息。

注意，必须且仅能使用查询参数（`names`、`ids` 或 `external_ids`）中的一个来指定节点集合。

注意，如果对一组节点的预验证结果返回 `true`（即可能成功），这并不意味着所有这些节点可以同时被成功移除，而是意味着移除每个单独的节点都可能是成功的。实际的节点移除可以通过 [节点生命周期 API](/rest_apis/node_lifecycle_apis) 来处理。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的时间。如果在超时到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1` 以表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）在更新集群元数据后，等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍会应用，但响应将表明其未被完全确认。默认为 `30s`。也可以设置为 `-1` 以表示请求永不超时。

- `names`

  （可选，字符串）节点名称的逗号分隔列表。

- `ids`

  （可选，字符串）节点 ID 的逗号分隔列表。

- `external_ids`

  （可选，字符串）节点外部 ID 的逗号分隔列表。

## 响应体

- `is_safe`

（布尔值）移除所有提供的节点是否安全。

- `message`

（字符串）提供关于操作为何被认为是安全或不安全的更多细节的信息。

- `nodes`

  （对象）移除每个提供的节点的预验证结果。

  - `nodes` 的属性

    - `<node>`

      （对象）包含关于特定节点移除预验证的信息。

      - `<node>` 的属性

        - `id`

          （字符串）节点 ID

        - `name`

          （字符串）节点名称

        - `external_id`

          （字符串）节点外部 ID

        - `result`

          （对象）包含节点的移除预验证结果。

          - `result` 的属性

            - `is_safe`

              （布尔值）移除该节点是否被认为是安全的。

            - `reason`

              （字符串）指定预验证结果被认为是安全或不安全的原因的字符串。可以是以下值之一：

              - `no_problems`：预验证未发现任何可能阻止节点被安全移除的问题。
              - `no_red_shards_except_searchable_snapshots`：节点可以被安全移除，因为所有红色索引都是可搜索快照索引，因此移除节点不会危及从集群中移除该索引的最后副本。
              - `no_red_shards_on_node`：节点不包含任何非可搜索快照红色索引分片的副本。
              - `red_shards_on_node`：节点可能包含一些非可搜索快照红色索引的分片副本。可能在该节点上的分片列表在 `message` 字段中指定。
              - `unable_to_verify_red_shards`：联系节点失败或超时。更多细节在 `message` 字段中提供。
              - `message`

                （可选，字符串）关于移除预验证结果的详细信息。

## 示例

此示例验证移除节点 `node1` 和 `node2` 是否安全。响应表明移除 `node1` 是安全的，但移除 `node2` 可能不安全，因为它可能包含指定的红色分片副本。因此，移除这两个节点的整体预验证返回 `false`。

```bash
POST /_internal/prevalidate_node_removal?names=node1,node2
```

API 返回以下响应：

```bash
{
  "is_safe": false,
  "message": "removal of the following nodes might not be safe: [node2-id]",
  "nodes": [
    {
      "id": "node1-id",
      "name" : "node1",
      "external_id" : "node1-externalId",
      "result" : {
        "is_safe": true,
        "reason": "no_red_shards_on_node",
        "message": ""
      }
    },
    {
      "id": "node2-id",
      "name" : "node2",
      "external_id" : "node2-externalId",
      "result" : {
        "is_safe": false,
        "reason": "red_shards_on_node",
        "message": "node contains copies of the following red shards: [[indexName][0]]"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/prevalidate-node-removal-api.html)
