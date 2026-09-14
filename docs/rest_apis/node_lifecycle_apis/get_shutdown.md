# 获取关闭 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [节点生命周期 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-node-lifecycle)。

:::::

此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 的间接使用而设计。不支持直接使用。

检索正在准备关闭的节点的状态。

## 请求

```bash
GET _nodes/shutdown
```

```bash
GET _nodes/<node-id>/shutdown
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
- 如果启用了操作员权限功能，只有操作员用户才能使用此 API。

## 描述

指示节点是否准备好关闭，或者关闭准备工作是否仍在进行中或已停滞。返回关闭过程每个部分的状态信息。用于在调用添加关闭 API 后监控关闭过程。

## 路径参数

- `<node-id>`

  （可选，字符串）正在准备关闭的节点 ID。如果不指定 ID，返回所有正在准备关闭的节点的状态。

## 响应体

- `nodes`

  （数组）正在准备关闭的节点信息数组。

  节点对象的属性：

  - `node_id`（字符串）节点的唯一标识符。
  - `node_ephemeral_id`（字符串）节点的临时 ID。如果节点重新启动并使用不同的临时 ID 重新加入集群，则为 null。
  - `type`（字符串）关闭的类型。值为 `RESTART`、`REMOVE` 或 `REPLACE`。
  - `reason`（字符串）节点关闭的人类可读原因。
  - `shutdown_startedmillis`（整数）关闭过程开始的时间，以自纪元以来的毫秒数表示。
  - `allocation_delay`（字符串）在重新分配节点分片之前等待的时间。仅在 `type` 为 `RESTART` 时存在。
  - `target_node_name`（字符串）替换正在关闭的节点的节点名称。仅在 `type` 为 `REPLACE` 时存在。
  - `status`（字符串）关闭过程的总体状态。值为 `COMPLETE`（完成）、`IN_PROGRESS`（进行中）或 `STALLED`（已停滞）。
  - `shard_migration`

    （对象）分片迁移状态。

    `shard_migration` 的属性：

    - `status`（字符串）分片迁移的状态。值为 `COMPLETE`、`IN_PROGRESS` 或 `STALLED`。
    - `shard_migrations_remaining`（整数）待迁移的分片数量。
    - `explanation`（字符串）描述分片迁移状态或停滞原因的字符串。

  - `persistent_tasks`

    （对象）持久任务状态。

    `persistent_tasks` 的属性：

    - `status`（字符串）持久任务迁移的状态。值为 `COMPLETE`、`IN_PROGRESS` 或 `STALLED`。

  - `plugins`

    （对象）插件清理状态。

    `plugins` 的属性：

    - `status`（字符串）插件清理的状态。值为 `COMPLETE`、`IN_PROGRESS` 或 `STALLED`。

## 示例

准备节点重启：

```json
PUT /_nodes/USpTGYaBSIKbgSUJR2Z9lg/shutdown
{
  "type": "restart",
  "reason": "Demonstrating how the node shutdown API works",
  "allocation_delay": "10m"
}
```

获取关闭准备的状态：

```bash
GET /_nodes/USpTGYaBSIKbgSUJR2Z9lg/shutdown
```

响应显示有关关闭准备的信息，包括分片迁移、任务迁移和插件清理的状态：

```json
{
    "nodes": [
        {
            "node_id": "USpTGYaBSIKbgSUJR2Z9lg",
            "node_ephemeral_id": null,
            "type": "RESTART",
            "reason": "Demonstrating how the node shutdown API works",
            "shutdown_startedmillis": 1624406108685,
            "allocation_delay": "10m",
            "status": "COMPLETE",
            "shard_migration": {
                "status": "COMPLETE",
                "shard_migrations_remaining": 0,
                "explanation": "no shard relocation is necessary for a node restart"
            },
            "persistent_tasks": {
                "status": "COMPLETE"
            },
            "plugins": {
                "status": "COMPLETE"
            }
        }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-shutdown.html)
