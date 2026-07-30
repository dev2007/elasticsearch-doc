# 暂停自动关注模式 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

暂停跨集群复制自动关注模式。

## 请求

```json
POST /_ccr/auto_follow/<auto_follow_pattern_name>/pause
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有包含关注者索引的集群的 `manage_ccr` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 暂停自动关注模式。当此 API 返回时，自动关注模式处于非活动状态，将忽略远程集群上创建的与任何自动关注模式匹配的新索引。暂停的自动关注模式在获取自动关注模式 API 中显示为 `active` 字段设置为 `false`。

你可以使用恢复自动关注模式 API 恢复自动关注。恢复后，自动关注模式再次变为活动状态，并自动为远程集群上新创建的匹配其模式的索引配置关注者索引。在模式暂停期间创建的远程索引也将被关注，除非它们在此期间已被删除或关闭。

## 路径参数

- `<auto_follow_pattern_name>`（必需，字符串）

  要暂停的自动关注模式的名称。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 示例

此示例暂停名为 `my_auto_follow_pattern` 的自动关注模式：

```json
POST /_ccr/auto_follow/my_auto_follow_pattern/pause
```

API 返回以下结果：

```json
{
  "acknowledged" : true
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-pause-auto-follow-pattern.html)
