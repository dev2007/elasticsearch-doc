# 获取跨集群复制统计信息 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

获取跨集群复制统计信息。

## 请求

```json
GET /_ccr/stats
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有包含关注者索引的集群的 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 获取跨集群复制统计信息。此 API 将返回与跨集群复制相关的所有统计信息。特别是，此 API 返回有关自动关注的统计信息，并返回与获取关注者统计信息 API 中相同的分片级统计信息。

## 查询参数

- `timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  控制等待结果的时间。默认为无限制。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 响应体

- `auto_follow_stats`（对象）

  表示自动关注协调器统计信息的对象。

  `auto_follow_stats` 的属性：

  - `number_of_failed_follow_indices`（long）

    自动关注协调器未能自动关注的索引数量。最近失败的原因记录在选举出的主节点的日志和 `auto_follow_stats.recent_auto_follow_errors` 字段中。

  - `number_of_failed_remote_cluster_state_requests`（long）

    自动关注协调器未能从自动关注模式集合中注册的远程集群检索集群状态的次数。

  - `number_of_successful_follow_indices`（long）

    自动关注协调器成功关注的索引数量。

  - `recent_auto_follow_errors`（数组）

    表示自动关注协调器失败的对象数组。

- `follow_stats`（对象）

  表示关注者索引的分片级统计信息的对象；有关响应的详细信息，请参阅获取关注者统计信息 API。

## 示例

此示例检索跨集群复制统计信息：

```json
GET /_ccr/stats
```

API 返回以下结果：

```json
{
  "auto_follow_stats" : {
    "number_of_failed_follow_indices" : 0,
    "number_of_failed_remote_cluster_state_requests" : 0,
    "number_of_successful_follow_indices" : 1,
    "recent_auto_follow_errors" : [],
    "auto_followed_clusters" : []
  },
  "follow_stats" : {
    "indices" : [
      {
        "index" : "follower_index",
        "total_global_checkpoint_lag" : 256,
        "shards" : [
          {
            "remote_cluster" : "remote_cluster",
            "leader_index" : "leader_index",
            "follower_index" : "follower_index",
            "shard_id" : 0,
            "leader_global_checkpoint" : 1024,
            "leader_max_seq_no" : 1536,
            "follower_global_checkpoint" : 768,
            "follower_max_seq_no" : 896,
            "last_requested_seq_no" : 897,
            "outstanding_read_requests" : 8,
            "outstanding_write_requests" : 2,
            "write_buffer_operation_count" : 64,
            "follower_mapping_version" : 4,
            "follower_settings_version" : 2,
            "follower_aliases_version" : 8,
            "total_read_time_millis" : 32768,
            "total_read_remote_exec_time_millis" : 16384,
            "successful_read_requests" : 32,
            "failed_read_requests" : 0,
            "operations_read" : 896,
            "bytes_read" : 32768,
            "total_write_time_millis" : 16384,
            "write_buffer_size_in_bytes" : 1536,
            "successful_write_requests" : 16,
            "failed_write_requests" : 0,
            "operations_written" : 832,
            "read_exceptions" : [ ],
            "time_since_last_read_millis" : 8
          }
        ]
      }
    ]
  }
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-stats.html)
