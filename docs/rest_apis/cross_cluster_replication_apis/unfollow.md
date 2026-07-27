# 取消关注 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

将跨集群复制关注者索引转换为常规索引。

## 请求

```json
POST /<follower_index>/_ccr/unfollow
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有关注者索引的 `manage_follow_index` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 停止与关注者索引关联的跟随任务，并移除与跨集群复制关联的索引元数据和设置。这使得该索引可以被当作常规索引处理。在调用取消关注 API 之前，关注者索引必须被暂停和关闭。

目前跨集群复制不支持将现有常规索引转换为关注者索引。将关注者索引转换为常规索引是不可逆操作。

## 路径参数

- `<follower_index>`（必需，字符串）

  关注者索引的名称。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 示例

此示例将 `follower_index` 从关注者索引转换为常规索引：

```json
POST /follower_index/_ccr/unfollow
```

API 返回以下结果：

```json
{
  "acknowledged": true
}
```
