# 获取关注者信息 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

检索有关所有跨集群复制关注者索引的信息。

## 请求

```json
GET /<index>/_ccr/info
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 列出每个关注者索引的参数和状态。例如，结果包括关注者索引名称、领导者索引名称、复制选项，以及关注者索引是处于活动状态还是已暂停。

## 路径参数

- `<index>`（必需，字符串）

  关注者索引模式的逗号分隔列表。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 响应体

- `follower_indices`（数组）

  关注者索引统计信息的数组。

  `follower_indices` 对象的属性：

  - `follower_index`（字符串）

    关注者索引的名称。

  - `leader_index`（字符串）

    领导者集群中被跟随的索引名称。

  - `parameters`（对象）

    封装跨集群复制参数的对象。如果关注者索引的状态为 `paused`，则省略此对象。

    `parameters` 对象的属性：

    - `max_outstanding_read_requests`（long）

      从远程集群的最大未完成读取请求数。

    - `max_outstanding_write_requests`（整数）

      关注者上的最大未完成写入请求数。

    - `max_read_request_operation_count`（整数）

      每次从远程集群读取时拉取的最大操作数。

    - `max_read_request_size`（字节值）

      每次从远程集群读取一批操作的最大字节大小。

    - `max_retry_delay`（时间值）

      重试异常失败的操作前等待的最长时间。重试时采用指数退避策略。

    - `max_write_buffer_count`（整数）

      可排队等待写入的最大操作数。当达到此限制时，从远程集群的读取将被推迟，直到排队操作数降至限制以下。

    - `max_write_buffer_size`（字节值）

      可排队等待写入的操作的最大总字节数。当达到此限制时，从远程集群的读取将被推迟，直到排队操作的总字节数降至限制以下。

    - `max_write_request_operation_count`（整数）

      在关注者上执行的每个批量写入请求的最大操作数。

    - `max_write_request_size`（字节值）

      在关注者上执行的每个批量写入请求的最大总字节数。

    - `read_poll_timeout`（时间值）

      当关注者索引与领导者索引同步时，等待远程集群上新操作的最长时间。超时后，操作轮询返回给关注者以便更新一些统计信息，然后关注者立即再次尝试从领导者读取。

  - `remote_cluster`（字符串）

    包含领导者索引的远程集群。

  - `status`（字符串）

    索引跟随是 `active` 还是 `paused`。

## 示例

此示例检索关注者信息：

```json
GET /follower_index/_ccr/info
```

如果关注者索引处于活动状态，API 返回以下结果：

```json
{
  "follower_indices": [
    {
      "follower_index": "follower_index",
      "remote_cluster": "remote_cluster",
      "leader_index": "leader_index",
      "status": "active",
      "parameters": {
        "max_read_request_operation_count": 5120,
        "max_read_request_size": "32mb",
        "max_outstanding_read_requests": 12,
        "max_write_request_operation_count": 5120,
        "max_write_request_size": "9223372036854775807b",
        "max_outstanding_write_requests": 9,
        "max_write_buffer_count": 2147483647,
        "max_write_buffer_size": "512mb",
        "max_retry_delay": "500ms",
        "read_poll_timeout": "1m"
      }
    }
  ]
}
```

如果关注者索引已暂停，API 返回以下结果：

```json
{
  "follower_indices": [
    {
      "follower_index": "follower_index",
      "remote_cluster": "remote_cluster",
      "leader_index": "leader_index",
      "status": "paused"
    }
  ]
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ccr-get-follow-info.html)
