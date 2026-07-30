# 遗忘关注者 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

从领导者索引中移除跨集群复制关注者保留租约。

## 请求

```json
POST /<leader_index>/_ccr/forget_follower
{
  "follower_cluster" : "<follower_cluster>",
  "follower_index" : "<follower_index>",
  "follower_index_uuid" : "<follower_index_uuid>",
  "leader_remote_cluster" : "<leader_remote_cluster>"
}
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有领导者索引的 `manage_leader_index` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

关注者索引在其领导者索引上获取保留租约。这些保留租约用于增加领导者索引的分片保留关注者索引分片执行复制所需操作历史记录的可能性。当关注者索引通过取消关注 API 转换为常规索引时（通过显式执行此 API，或通过索引生命周期管理隐式执行），这些保留租约会被告移除。但是，移除这些保留租约可能会失败（例如，如果包含领导者索引的远程集群不可用）。虽然这些保留租约最终会自行过期，但它们的长期存在可能导致领导者索引保留不必要的历史记录，并阻止索引生命周期管理对领导者索引执行某些操作。此 API 的存在是为了在取消关注 API 无法移除关注者保留租约时，支持手动移除这些保留租约。

:::note 注意
此 API 不会停止关注者索引的复制。如果你使用此 API 针对仍在积极跟随的关注者索引，关注者索引将在领导者上重新添加保留租约。此 API 的唯一目的是处理在调用取消关注 API 后未能移除关注者保留租约的情况。
:::

## 路径参数

- `<leader_index>`（必需，字符串）

  领导者索引的名称。

## 查询参数

- `timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  控制等待结果的时间。默认为无限制。

## 请求体

- `follower_cluster`（必需，字符串）

  包含关注者索引的集群名称。

- `follower_index`（必需，字符串）

  关注者索引的名称。

- `follower_index_uuid`（必需，字符串）

  关注者索引的 UUID。

- `leader_remote_cluster`（必需，字符串）

  包含领导者索引的远程集群的别名（从包含关注者索引的集群的角度来看）。

## 示例

此示例从 `leader_index` 中移除 `follower_index` 的关注者保留租约。

```json
POST /leader_index/_ccr/forget_follower
{
  "follower_cluster" : "follower_cluster",
  "follower_index" : "follower_index",
  "follower_index_uuid" : "vYpnaWPRQB6mNspmoCeYyA",
  "leader_remote_cluster" : "leader_cluster"
}
```

API 返回以下结果：

```json
{
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0,
    "failures" : [ ]
  }
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-post-forget-follower.html)
