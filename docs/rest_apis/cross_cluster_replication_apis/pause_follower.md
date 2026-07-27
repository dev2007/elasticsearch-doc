# 暂停关注者 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

暂停跨集群复制关注者索引。

## 请求

```json
POST /<follower_index>/_ccr/pause_follow
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有包含关注者索引的集群的 `manage_ccr` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 暂停关注者索引。当此 API 返回时，关注者索引将不会从领导者索引获取任何额外的操作。你可以使用恢复关注者 API 恢复跟随。暂停和恢复关注者索引可用于更改跟随任务的配置。

## 路径参数

- `<follower_index>`（必需，字符串）

  关注者索引的名称。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 示例

此示例暂停名为 `follower_index` 的关注者索引：

```json
POST /follower_index/_ccr/pause_follow
```

API 返回以下结果：

```json
{
  "acknowledged" : true
}
```
