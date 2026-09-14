# 删除关闭 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [节点生命周期 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-node-lifecycle)。

:::::

此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 的间接使用而设计。不支持直接使用。

取消关闭准备工作或清除关闭请求，使节点可以恢复正常操作。

## 请求

```bash
DELETE _nodes/<node-id>/shutdown
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
- 如果启用了操作员权限功能，只有操作员用户才能使用此 API。

## 描述

使节点在添加关闭请求后恢复正常操作。当节点重新加入集群或节点已永久离开集群时，你必须显式清除关闭请求。Elasticsearch 从不自动移除关闭请求。

## 路径参数

- `<node-id>`

  （可选，字符串）已准备关闭的节点 ID。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

准备节点重启：

```bash
PUT /_nodes/USpTGYaBSIKbgSUJR2Z9lg/shutdown
{
  "type": "restart",
  "reason": "Demonstrating how the node shutdown API works"
}
```

重启后取消关闭准备工作或清除关闭请求：

```bash
DELETE /_nodes/USpTGYaBSIKbgSUJR2Z9lg/shutdown
```

返回以下响应：

```json
{
    "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-shutdown.html)
