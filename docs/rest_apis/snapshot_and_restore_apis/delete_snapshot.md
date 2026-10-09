# 删除快照 API

删除一个快照。

```txt
DELETE /_snapshot/<repository>/<snapshot>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。

## 路径参数

`<repository>`

（必需，字符串）要从中删除快照的仓库的名称。

`<snapshot>`

（必需，字符串）要删除的快照名称的逗号分隔列表。也接受通配符（`*`）。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。也可以设置为 `-1`，表示请求永不超时。

`wait_for_completion`

（可选，布尔值）默认为 `true`。如果为 `true`，则请求在所有匹配的快照都被删除时返回响应。如果为 `false`，则请求在删除操作被调度后立即返回响应。

## 响应体

成功的调用返回以下响应：

```json
{
  "acknowledged" : true
}
```

## 示例

以下示例从名为 `my_repository` 的仓库中删除 `snapshot_2` 和 `snapshot_3`：

```txt
DELETE /_snapshot/my_repository/snapshot_2,snapshot_3
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-snapshot-api.html)
