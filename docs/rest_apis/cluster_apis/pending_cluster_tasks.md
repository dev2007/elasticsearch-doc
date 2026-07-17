# 待处理集群任务 API

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
:::

返回尚未执行的集群级别变更。

## 请求

```bash
GET /_cluster/pending_tasks
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

待处理集群任务 API 返回尚未执行的任何集群级别变更（例如创建索引、更新映射、分配或失败分片）的列表。

::::note 提示
此 API 返回集群状态的任何待处理更新的列表。这些与任务管理 API 报告的任务不同，后者包括周期性任务和用户发起的任务，例如节点统计、搜索查询或创建索引请求。但是，如果用户发起的任务（如创建索引命令）导致集群状态更新，则该任务的活动可能会同时被任务 API 和待处理集群任务 API 报告。
::::

## 路径参数

- `local`（可选，布尔值）

  如果为 `true`，请求仅从本地节点检索信息。默认为 `false`，表示从主节点检索信息。

- `master_timeout`（可选，时间值）

  等待主节点的时间。如果在超时到期前主节点不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

## 响应体

- `tasks`（对象）

  待处理任务的列表。

  - `insert_order`（整数）

    表示任务插入到任务队列中的顺序号。

  - `priority`（字符串）

    待处理任务的优先级。有效优先级按降序排列为：`IMMEDIATE` > `URGENT` > `HIGH` > `NORMAL` > `LOW` > `LANGUID`。

  - `source`（字符串）

    集群任务的通用描述，可能包含原因和来源。

  - `executing`（布尔值）

    `true` 或 `false`，表示待处理任务当前是否正在执行。

  - `time_in_queue_millis`（整数）

    任务等待执行的时间，以毫秒为单位。

  - `time_in_queue`（字符串）

    任务等待执行的时间。

## 示例

通常请求会返回一个空列表，因为集群级别变更执行速度很快。但是，如果有任务排队等待，响应将类似于以下内容：

```json
{
   "tasks": [
      {
         "insert_order": 101,
         "priority": "URGENT",
         "source": "create-index [foo_9], cause [api]",
         "executing" : true,
         "time_in_queue_millis": 86,
         "time_in_queue": "86ms"
      },
      {
         "insert_order": 46,
         "priority": "HIGH",
         "source": "shard-started ([foo_2][1], node[tMTocMvQQgGCkj7QDHl3OA], [P], s[INITIALIZING]), reason [after recovery from shard_store]",
         "executing" : false,
         "time_in_queue_millis": 842,
         "time_in_queue": "842ms"
      },
      {
         "insert_order": 45,
         "priority": "HIGH",
         "source": "shard-started ([foo_2][0], node[tMTocMvQQgGCkj7QDHl3OA], [P], s[INITIALIZING]), reason [after recovery from shard_store]",
         "executing" : false,
         "time_in_queue_millis": 858,
         "time_in_queue": "858ms"
      }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-pending.html)
