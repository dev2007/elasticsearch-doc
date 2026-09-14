# 添加关闭 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [节点生命周期 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-node-lifecycle)。

:::::

此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 的间接使用而设计。不支持直接使用。

准备节点的关闭。

## 请求

```bash
PUT _nodes/<node-id>/shutdown
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
- 如果启用了操作员权限功能，只有操作员用户才能使用此 API。

## 描述

根据需要迁移正在进行的任务和索引分片到其他节点，以准备节点重启或关闭并从集群中移除。这确保 Elasticsearch 可以安全停止，对集群的干扰最小。

你必须指定关闭类型：`restart`（重启）、`remove`（移除）或 `replace`（替换）。如果节点已经在准备关闭，你可以使用此 API 更改关闭类型。

此 API 不会终止 Elasticsearch 进程。监控节点关闭状态以确定何时可以安全停止 Elasticsearch。

## 路径参数

- `<node-id>`

  （必需，字符串）要准备关闭的节点 ID。如果你指定了离线的节点，它将在重新加入集群时被准备关闭。

  此参数不会针对集群的活动节点进行验证。这使你可以在节点离线时注册关闭。如果你指定了无效的节点 ID，不会抛出错误。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 请求体

- `type`

  （必需，字符串）有效值为 `restart`、`remove` 或 `replace`。

  - `restart`：当你需要临时关闭节点以执行升级、更改配置或执行其他维护时使用。由于节点预期会重新加入集群，数据不会从节点迁移出去。
  - `remove`：当你需要从集群中永久移除节点时使用。在数据从节点迁移出去之前，节点不会被标记为准备好关闭。
  - `replace`：用于用另一个节点 1:1 替换节点。为了实现源节点到目标节点的真正替换，某些分配决策将被忽略（如磁盘水位线）。在替换类型关闭期间，滚动和索引创建可能导致未分配的分片，收缩可能在替换完成前失败。

- `reason`

  （必需，字符串）节点关闭的人类可读原因。此字段为其他集群操作员提供信息；它不影响关闭过程。

- `allocation_delay`

  （可选，字符串）仅在 `type` 为 `restart` 时有效。控制在将节点分片重新分配到其他节点之前，Elasticsearch 等待节点重启并加入集群的时间。这与使用 `index.unassigned.node_left.delayed_timeout` 设置延迟分配的工作方式相同。如果你同时指定了重启分配延迟和索引级别分配延迟，使用两者中较长的一个。

- `target_node_name`

  （可选，字符串）仅在 `type` 为 `replace` 时有效。指定替换正在关闭的节点的节点名称。来自关闭节点的分片只允许分配到目标节点，并且不会有其他数据分配到目标节点。在数据重定位期间，某些分配规则会被忽略，如磁盘水位线或用户属性过滤规则。

## 示例

以下示例注册节点以进行关闭：

```json
PUT /_nodes/USpTGYaBSIKbgSUJR2Z9lg/shutdown
{
  "type": "restart",
  "reason": "Demonstrating how the node shutdown API works",
  "allocation_delay": "20m"
}
```

准备节点重启。对于将永久从集群中移除的节点，使用 `remove`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-shutdown.html)
