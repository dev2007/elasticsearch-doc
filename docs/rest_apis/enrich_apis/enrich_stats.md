# 富化统计信息 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[富化 API](/rest_apis/enrich_apis/enrich_apis)。

::::

返回富化协调器统计信息和当前正在执行的富化策略的信息。

## 请求

```json
GET /_enrich/_stats
```

## 响应体

- `executing_policies`（对象数组）

  包含每个当前正在执行的富化策略信息的对象。

  返回参数包括：

  - `name`（字符串）：富化策略的名称。
  - `task`（任务对象）：包含策略执行任务详细信息的对象。

- `coordinator_stats`（对象数组）

  包含每个已配置富化处理器的协调接入节点信息的对象。

  返回参数包括：

  - `node_id`（字符串）：为已配置富化处理器协调搜索请求的接入节点的 ID。
  - `queue_size`（整数）：队列中的搜索请求数。
  - `remote_requests_current`（整数）：当前未完成的远程请求数。
  - `remote_requests_total`（整数）：自节点启动以来执行的未完成远程请求数。在大多数情况下，一个远程请求包含多个搜索请求。这取决于执行远程请求时队列中的搜索请求数。
  - `executed_searches_total`（整数）：自节点启动以来富化处理器已执行的搜索请求数。

- `cache_stats`（对象数组）

  包含每个接入节点上富化缓存统计信息的对象。

  返回参数包括：

  - `node_id`（字符串）：具有富化缓存的接入节点的 ID。
  - `count`（整数）：缓存条目数。
  - `hits`（整数）：从缓存提供服务的富化查找次数。
  - `misses`（整数）：无法从缓存提供服务的富化查找次数。
  - `evictions`（整数）：从缓存中驱逐的缓存条目数。
  - `hits_time_in_millis`（long）：仅成功缓存命中时从缓存获取数据所花费的毫秒数。
  - `misses_time_in_millis`（long）：仅缓存未命中时从富化索引获取数据并更新缓存所花费的毫秒数。
  - `size_in_bytes`（long）：富化缓存在堆上占用字节数的近似值。

## 示例

```json
GET /_enrich/_stats
```

API 返回以下结果：

```json
{
  "executing_policies": [
    {
      "name": "my-policy",
      "task": {
        "id": 124,
        "type": "direct",
        "action": "cluster:admin/xpack/enrich/execute",
        "start_time_in_millis": 1458585884904,
        "running_time_in_nanos": 47402,
        "cancellable": false,
        "parent_task_id": "oTUltX4IQMOUUVeiohTt8A:123",
        "headers": {
          "X-Opaque-Id": "123456"
        }
      }
    }
  ],
  "coordinator_stats": [
    {
      "node_id": "1sFM8cmSROZYhPxVsiWew",
      "queue_size": 0,
      "remote_requests_current": 0,
      "remote_requests_total": 0,
      "executed_searches_total": 0
    }
  ],
  "cache_stats": [
    {
      "node_id": "1sFM8cmSROZYhPxVsiWew",
      "count": 0,
      "hits": 0,
      "misses": 0,
      "evictions": 0,
      "hits_time_in_millis": 0,
      "misses_time_in_millis": 0,
      "size_in_bytes": 0
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-stats-api.html)
