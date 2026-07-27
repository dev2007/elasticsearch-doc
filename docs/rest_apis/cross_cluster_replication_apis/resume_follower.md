# 恢复关注者 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

恢复跨集群复制关注者索引。

## 请求

```json
POST /<follower_index>/_ccr/resume_follow
{
}
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有关注者索引的 `write` 和 `monitor` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。你必须拥有领导者索引的 `read` 和 `monitor` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。你还必须拥有包含关注者索引的集群的 `manage_ccr` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 恢复已被暂停的关注者索引。暂停可能是通过暂停关注者 API 显式执行的，也可能是由于在跟随过程中无法重试的失败而隐式导致的。当此 API 返回时，关注者索引将恢复从领导者索引获取操作。

## 路径参数

- `<follower_index>`（必需，字符串）

  关注者索引的名称。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 请求体

- `max_read_request_operation_count`（整数）

  每次从远程集群读取时拉取的最大操作数。

- `max_outstanding_read_requests`（long）

  从远程集群未完成的读取请求的最大数量。

- `max_read_request_size`（字节值）

  每次从远程集群拉取的一批操作的最大字节数。

- `max_write_request_operation_count`（整数）

  在关注者上执行的每个批量写入请求的最大操作数。

- `max_write_request_size`（字节值）

  在关注者上执行的每个批量写入请求的最大操作总字节数。

- `max_outstanding_write_requests`（整数）

  关注者上未完成的写入请求的最大数量。

- `max_write_buffer_count`（整数）

  可排队等待写入的最大操作数。当达到此限制时，从远程集群的读取将被推迟，直到排队操作数降至限制以下。

- `max_write_buffer_size`（字节值）

  可排队等待写入的操作的最大总字节数。当达到此限制时，从远程集群的读取将被推迟，直到排队操作的总字节数降至限制以下。

- `max_retry_delay`（时间值）

  重试异常失败的操作前等待的最长时间。重试时采用指数退避策略。

- `read_poll_timeout`（时间值）

  当关注者索引与领导者索引同步时，等待远程集群上新操作的最长时间。当超时过后，操作轮询将返回到关注者，以便它可以更新一些统计信息。然后关注者将立即再次尝试从领导者读取。

## 默认值

以下来自关注信息 API 的输出描述了上述索引关注请求参数的所有默认值：

```json
{
  "follower_indices" : [
    {
      "parameters" : {
        "max_read_request_operation_count" : 5120,
        "max_read_request_size" : "32mb",
        "max_outstanding_read_requests" : 12,
        "max_write_request_operation_count" : 5120,
        "max_write_request_size" : "9223372036854775807b",
        "max_outstanding_write_requests" : 9,
        "max_write_buffer_count" : 2147483647,
        "max_write_buffer_size" : "512mb",
        "max_retry_delay" : "500ms",
        "read_poll_timeout" : "1m"
      }
    }
  ]
}
```

## 示例

此示例恢复名为 `follower_index` 的关注者索引，并指定所有参数：

```json
POST /follower_index/_ccr/resume_follow
{
  "max_read_request_operation_count" : 1024,
  "max_outstanding_read_requests" : 16,
  "max_read_request_size" : "1024k",
  "max_write_request_operation_count" : 32768,
  "max_write_request_size" : "16k",
  "max_outstanding_write_requests" : 8,
  "max_write_buffer_count" : 512,
  "max_write_buffer_size" : "512k",
  "max_retry_delay" : "10s",
  "read_poll_timeout" : "30s"
}
```

API 返回以下结果：

```json
{
  "acknowledged" : true
}
```
