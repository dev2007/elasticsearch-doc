# 获取关注者统计信息 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

获取跨集群复制关注者统计信息。

## 请求

```json
GET /<index>/_ccr/stats
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有包含关注者索引的集群的 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 获取关注者统计信息。此 API 将返回有关指定索引每个分片关联的跟随任务的分片级统计信息。

## 路径参数

- `<index>`（必需，字符串）

  索引模式的逗号分隔列表。

## 查询参数

- `timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  控制等待结果的时间。默认为无限制。

## 响应体

- `indices`（数组）

  关注者索引统计信息的数组。

  `indices` 的属性：

  - `fatal_exception`（对象）

    表示取消跟随任务的致命异常的对象。在这种情况下，必须使用[恢复关注者 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-post-resume-follow.html)手动恢复跟随任务。

  - `index`（字符串）

    关注者索引的名称。

  - `total_global_checkpoint_lag`（long）

    指示关注者落后领导者多少。这是所有分片的 `leader_global_checkpoint` 和 `follower_global_checkpoint` 之差的总和。

  - `shards`（数组）

    分片级跟随任务统计信息的数组。

    `shards` 中对象的属性：

    - `bytes_read`（long）

      从领导者读取的传输字节总数。这只是一个估计值，如果启用了压缩则不考虑压缩。

    - `failed_read_requests`（long）

      失败的读取次数。

    - `failed_write_requests`（long）

      在关注者上执行的失败批量写入请求次数。

    - `follower_aliases_version`（long）

      关注者已同步到的索引别名版本。

    - `follower_global_checkpoint`（long）

      关注者上的当前全局检查点。`leader_global_checkpoint` 和 `follower_global_checkpoint` 之间的差值指示关注者落后领导者多少。

    - `follower_index`（字符串）

      关注者索引的名称。

    - `follower_mapping_version`（long）

      关注者已同步到的映射版本。

    - `follower_max_seq_no`（long）

      关注者上的当前最大序列号。

    - `follower_settings_version`（long）

      关注者已同步到的索引设置版本。

    - `last_requested_seq_no`（long）

      从领导者请求的最后一批操作的起始序列号。

    - `leader_global_checkpoint`（long）

      跟随任务已知的领导者上的当前全局检查点。

    - `leader_index`（字符串）

      领导者集群中被跟随的索引名称。

    - `leader_max_seq_no`（long）

      跟随任务已知的领导者上的当前最大序列号。

    - `operations_read`（long）

      从领导者读取的操作总数。

    - `operations_written`（long）

      在关注者上写入的操作数。

    - `outstanding_read_requests`（整数）

      关注者发出的活动读取请求数。

    - `outstanding_write_requests`（整数）

      关注者上活动的批量写入请求数。

    - `read_exceptions`（数组）

      表示失败读取的对象数组。

      `read_exceptions` 中对象的属性：

      - `exception`（对象）

        导致读取失败的异常。

      - `from_seq_no`（long）

        从领导者请求的批次的起始序列号。

      - `retries`（整数）

        该批次已重试的次数。

    - `remote_cluster`（字符串）

      包含领导者索引的远程集群。

    - `shard_id`（整数）

      数值分片 ID，值从 0 到副本数减一。

    - `successful_read_requests`（long）

      成功获取的次数。

    - `successful_write_requests`（long）

      在关注者上执行的批量写入请求次数。

    - `time_since_last_read_millis`（long）

      自上次向领导者发送读取请求以来的毫秒数。当关注者追上领导者时，此数字将增加到配置的 `read_poll_timeout`，届时将向领导者发送另一个读取请求。

    - `total_read_remote_exec_time_millis`（long）

      读取在远程集群上执行花费的总时间。

    - `total_read_time_millis`（long）

      读取未完成的总时间，从向领导者发送读取到回复返回给关注者计算。

    - `total_write_time_millis`（long）

      在关注者上写入花费的总时间。

    - `write_buffer_operation_count`（整数）

      关注者上排队的写入操作数。

    - `write_buffer_size_in_bytes`（long）

      当前排队等待写入的操作的总字节数。

## 示例

此示例检索关注者统计信息：

```json
GET /follower_index/_ccr/stats
```

API 返回以下结果：

```json
{
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
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-follow-stats.html)
