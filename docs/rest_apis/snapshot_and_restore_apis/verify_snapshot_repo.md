# 验证快照仓库 API

检查快照仓库中的常见配置错误。

```txt
POST /_snapshot/<repository>/_verify
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。

## 描述

此 API 用于检查快照仓库中的常见配置错误。参见[验证仓库](/operational_management/snapshot_and_restore)。

## 路径参数

`<repository>`

（必需，字符串）要验证的快照仓库的名称。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

## 响应体

`nodes`

连接到快照仓库的节点信息对象：

- `<node_id>`（对象）有关连接到快照仓库的某个节点的信息，键为该节点的 ID，包含：
  - `name`（字符串）节点的人类可读名称。你可以在 `elasticsearch.yml` 中使用 `node.name` 属性设置此名称。默认为机器的主机名。

## 示例

以下示例验证仓库 `my_repository`：

```txt
POST /_snapshot/my_repository/_verify
```

API 返回以下响应：

```json
{
  "nodes": {
    "Lyx-olbJbE_wTquE6ucVxQ": {
      "name": "node-1"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/verify-snapshot-repo-api.html)
