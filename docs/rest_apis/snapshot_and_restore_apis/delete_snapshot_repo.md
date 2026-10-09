# 删除快照仓库 API

注销一个或多个快照仓库。

```txt
DELETE /_snapshot/<repository>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。

## 描述

当仓库被注销时，Elasticsearch 只会移除对仓库存储快照位置的引用。快照本身保持原样，不受影响。

## 路径参数

`<repository>`

（必需，字符串）要注销的快照仓库的名称。支持通配符（`*`）模式。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

## 示例

以下示例注销仓库 `my_repository`：

```txt
DELETE /_snapshot/my_repository
```

API 返回以下响应：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-snapshot-repo-api.html)
