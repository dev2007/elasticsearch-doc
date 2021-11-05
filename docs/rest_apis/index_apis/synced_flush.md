# 同步冲刷

!> **在 7.6 废弃** 同步冲刷已废弃，会在 8.0 中移除。使用[冲刷](/rest_apis/index_apis/flush)替代。在 Elasticsearch 7.6 及之后版本，冲刷与同步冲刷效果一致。

在一个或多个索引上执行同步冲刷。

```bash
POST /my-index-000001/_flush/synced
```

## 请求

`POST /<index>/_flush/synced`

`GET /<index>/_flush/synced`

`POST /_flush/synced`

`GET /_flush/synced`

## 描述

### 使用同步冲刷 API

使用同步冲刷 API 手动启动同步冲刷。这对于计划中的群集重启非常有用：你可以停止索引，而不想等待 5 分钟，直到所有索引都标记为非活动并自动同步冲刷。

即使有正在进行的索引活动，你也可以请求同步冲刷，Elasticsearch 将在“尽力而为”的基础上执行同步冲刷：没有任何正在进行的索引活动的分片将成功同步冲刷，而其他分片将无法同步冲刷。只要 `sync_id` 标记没有被后续冲刷删除，成功同步冲刷的分片将有更快的恢复时间。

### 同步冲刷概览

Elasticsearch 跟踪哪些分片最近收到了索引活动，并认为 5 分钟内未收到任何索引操作的分片处于非活动状态。

当分片变为非活动状态时，Elasticsearch 将执行一种称为**同步冲刷（synced flush）**的特殊冲刷。同步冲刷对分片的每个副本执行正常[冲刷](/rest_apis/index_apis/flush)，然后向每个副本添加称为 `sync_id` 的标记，以指示这些副本具有相同的 Lucene 索引。比较两个副本的 `sync_id` 标记是检查其内容是否相同的一种非常有效的方法。

分配分片副本时，Elasticsearch 必须确保每个副本包含与主副本相同的数据。如果分片副本已同步冲刷，并且副本与主副本共享一个 `sync_id`，则 Elasticsearch 知道这两个副本具有相同的内容。这意味着不需要将任何段文件从主文件复制到副本，这在恢复和重新启动期间节省了大量时间。

这对于具有大量很少更新的索引的集群特别有用，例如使用基于时间的索引。如果没有同步冲刷标记，这种集群的恢复速度会慢得多。

### 检查 `sync_id` 标记

要检查分片是否具有 `sync_id` 标记，请查找[索引统计 API](/rest_apis/index_apis/index_stats) 返回的分片统计的 `commit` 部分：

```bash
GET /my-index-000001/_stats?filter_path=**.commit&level=shards
```

1. `filter_path` 用于减少响应的冗长，但完全是可选的

API 返回以下响应：

```json
{
   "indices": {
      "my-index-000001": {
         "shards": {
            "0": [
               {
                 "commit" : {
                   "id" : "3M3zkw2GHMo2Y4h4/KFKCg==",
                   "generation" : 3,
                   "user_data" : {
                     "translog_uuid" : "hnOG3xFcTDeoI_kvvvOdNA",
                     "history_uuid" : "XP7KDJGiS1a2fHYiFL5TXQ",
                     "local_checkpoint" : "-1",
                     "translog_generation" : "2",
                     "max_seq_no" : "-1",
                     "sync_id" : "AVvFY-071siAOuFGEO9P",
                     "max_unsafe_auto_id_timestamp" : "-1",
                     "min_retained_seq_no" : "0"
                   },
                   "num_docs" : 0
                 }
               }
            ]
         }
      }
   }
}
```

1. `"sync_id" : "AVvFY-071siAOuFGEO9P",`：`sync id` 标记

?> 一旦分片再次冲刷，`sync_id` 标记就会被删除，如果分片的事务中存在未冲刷的操作，Elasticsearch 可能随时触发分片的自动冲刷。在实践中，这意味着人们应该考虑索引上的任何索引操作，因为已经删除了它的同步标记。

## 请求参数

- `<index>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。
  
  要同步冲刷所有索引，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `expand_wildcards`

  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
  2. `open`
  匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
  3. `closed`
  匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
  4. `hidden`
  匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
  5. `none`
  不接受通配符表达式。

  默认为 `open`。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失或关闭的索引不包含在响应中。

  默认为 `false`。

## 响应码

- `200`

  所有分片成功同步冲刷。

- `409`

  一个副本分片同步冲刷失败。

## 示例

### 同步冲刷一个指定索引

```bash
POST /kimchy/_flush/synced
```

### 同步冲刷几个索引

```bash
POST /kimchy,elasticsearch/_flush/synced
```

### 同步冲刷所有索引

```bash
POST /_flush/synced
```

响应包含有关成功同步冲刷的分片数量的详细信息以及有关任何失败的信息。

以下响应表示两个分片和一个副本分片已成功同步冲刷：

```json
{
   "_shards": {
      "total": 2,
      "successful": 2,
      "failed": 0
   },
   "my-index-000001": {
      "total": 2,
      "successful": 2,
      "failed": 0
   }
}
```

以下响应表示一个分片组由于挂起的操作而失败：

```json
{
   "_shards": {
      "total": 4,
      "successful": 2,
      "failed": 2
   },
   "my-index-000001": {
      "total": 4,
      "successful": 2,
      "failed": 2,
      "failures": [
         {
            "shard": 1,
            "reason": "[2] ongoing operations on primary"
         }
      ]
   }
}
```

有时故障特定于分片复制副本。失败的拷贝将不符合快速恢复的条件，但成功的拷贝仍将符合快速恢复的条件。该示例展示如下：

```json
{
   "_shards": {
      "total": 4,
      "successful": 1,
      "failed": 1
   },
   "my-index-000001": {
      "total": 4,
      "successful": 3,
      "failed": 1,
      "failures": [
         {
            "shard": 1,
            "reason": "unexpected error",
            "routing": {
               "state": "STARTED",
               "primary": false,
               "node": "SZNr2J_ORxKTLUCydGX4zA",
               "relocating_node": null,
               "shard": 1,
               "index": "my-index-000001"
            }
         }
      ]
   }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-synced-flush-api.html)
