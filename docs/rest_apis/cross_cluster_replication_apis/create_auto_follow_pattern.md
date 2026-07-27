# 创建自动关注模式 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[跨集群复制 API](/rest_apis/cross_cluster_replication_apis/cross_cluster_replication_apis)。

::::

创建跨集群复制自动关注模式。

## 请求

```json
PUT /_ccr/auto_follow/<auto_follow_pattern_name>
{
  "remote_cluster" : "<remote_cluster>",
  "leader_index_patterns" :
  [
    "<leader_index_pattern>"
  ],
  "leader_index_exclusion_patterns":
  [
    "<leader_index_exclusion_pattern>"
  ],
  "follow_index_pattern" : "<follow_index_pattern>"
}
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有领导者索引模式的 `read` 和 `monitor` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。你还必须拥有包含关注者索引的集群的 `manage_ccr` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 描述

此 API 针对请求体中指定的远程集群创建一个新的命名自动关注模式集合。远程集群上与指定模式匹配的新创建索引将自动配置为关注者索引。在自动关注模式创建之前在远程集群上创建的索引不会被自动关注，即使它们匹配该模式。

此 API 也可用于更新现有的自动关注模式。请注意，在更新自动关注模式之前自动配置的关注者索引将保持不变，即使它们不匹配新的模式。

## 路径参数

- `<auto_follow_pattern_name>`（必需，字符串）

  自动关注模式集合的名称。

## 查询参数

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 请求体

- `remote_cluster`（必需，字符串）

  包含要匹配的领导者索引的远程集群。

- `leader_index_patterns`（可选，数组）

  用于匹配 `remote_cluster` 字段指定的远程集群中索引的简单索引模式数组。

- `leader_index_exclusion_patterns`（可选，数组）

  可用于排除索引不被自动关注的简单索引模式数组。远程集群中名称匹配一个或多个 `leader_index_patterns` **且** 匹配一个或多个 `leader_index_exclusion_patterns` 的索引将不会被关注。

- `follow_index_pattern`（可选，字符串）

  关注者索引的名称。可以使用模板 `{{leader_index}}` 从领导者索引名称派生关注者索引名称。当关注数据流时，`follow_index_pattern` 将用于重命名领导者索引以及包含领导者索引的数据流。例如，一个名为 `logs-mysql-default` 的数据流，其后备索引为 `.ds-logs-mysql-default-2022-01-01-000001`，如果 `follow_index_pattern` 为 `{{leader_index}}_copy`，则数据流将被复制为 `logs-mysql-default_copy`，后备索引将被复制为 `.ds-logs-mysql-default_copy-2022-01-01-000001`。

- `settings`（可选，对象）

  要覆盖领导者索引的设置。请注意，某些设置无法被覆盖（例如 `index.number_of_shards`）。

- `max_read_request_operation_count`（可选，整数）

  每次从远程集群读取时拉取的最大操作数。

- `max_outstanding_read_requests`（可选，long）

  从远程集群未完成的读取请求的最大数量。

- `max_read_request_size`（可选，字节值）

  每次从远程集群拉取的一批操作的最大字节数。

- `max_write_request_operation_count`（可选，整数）

  在关注者上执行的每个批量写入请求的最大操作数。

- `max_write_request_size`（可选，字节值）

  在关注者上执行的每个批量写入请求的最大操作总字节数。

- `max_outstanding_write_requests`（可选，整数）

  关注者上未完成的写入请求的最大数量。

- `max_write_buffer_count`（可选，整数）

  可排队等待写入的最大操作数。当达到此限制时，从远程集群的读取将被推迟，直到排队操作数降至限制以下。

- `max_write_buffer_size`（可选，字节值）

  可排队等待写入的操作的最大总字节数。当达到此限制时，从远程集群的读取将被推迟，直到排队操作的总字节数降至限制以下。

- `max_retry_delay`（可选，时间值）

  重试异常失败的操作前等待的最长时间。重试时采用指数退避策略。

- `read_poll_timeout`（可选，时间值）

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

此示例创建一个名为 `my_auto_follow_pattern` 的自动关注模式：

```json
PUT /_ccr/auto_follow/my_auto_follow_pattern
{
  "remote_cluster" : "remote_cluster",
  "leader_index_patterns" :
  [
    "leader_index*"
  ],
  "follow_index_pattern" : "{{leader_index}}-follower",
  "settings": {
    "index.number_of_replicas": 0
  },
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
