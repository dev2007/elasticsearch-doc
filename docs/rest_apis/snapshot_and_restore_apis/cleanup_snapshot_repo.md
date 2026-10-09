# 清理快照仓库 API

触发对快照仓库内容的审查，并删除现有快照未引用的任何过时数据。

```txt
POST /_snapshot/<repository>/_cleanup
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。

## 路径参数

`<repository>`

（必需，字符串）要审查并清理的快照仓库的名称。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。也可以设置为 `-1`，表示请求永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。在更新集群元数据后，等待集群中所有相关节点响应的期限。如果在超时期限到期之前未收到响应，集群元数据的更新仍然生效，但响应将指示未被完全确认。也可以设置为 `-1`，表示请求永不超时。

## 响应体

`results`

（对象）包含清理操作的统计信息，包含：

- `deleted_bytes`：清理操作释放的字节数。
- `deleted_blobs`：清理操作期间从快照仓库中移除的二进制大对象（blob）数量。任何非零值都意味着发现了未引用的 blob 并随后进行了清理。

## 示例

以下示例清理仓库 `my_repository`：

```txt
POST /_snapshot/my_repository/_cleanup
```

API 返回以下响应：

```json
{
  "results": {
    "deleted_bytes": 20,
    "deleted_blobs": 5
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/clean-up-snapshot-repo-api.html)
