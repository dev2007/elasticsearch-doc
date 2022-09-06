# 异步搜索

异步搜索 API 允许异步执行搜索请求，监视其进度，并在部分结果可用时检索它们。

## 提交异步搜索 API

异步执行搜索请求。它接受与[搜索 API](/rest_apis/search_apis/search) 相同的参数和请求体。

```bash
POST /sales*/_async_search?size=0
{
  "sort": [
    { "date": { "order": "asc" } }
  ],
  "aggs": {
    "sale_date": {
      "date_histogram": {
        "field": "date",
        "calendar_interval": "1d"
      }
    }
  }
}
```

响应包含正在执行的搜索的标识符。你可以使用此 ID 稍后检索搜索的最终结果。当前可用的搜索结果将作为[响应](/rest_apis/search_apis/search?id=响应体)对象的一部分返回。

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=", 
  "is_partial" : true, 
  "is_running" : true, 
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986,
  "response" : {
    "took" : 1122,
    "timed_out" : false,
    "num_reduce_phases" : 0,
    "_shards" : {
      "total" : 562, 
      "successful" : 3, 
      "skipped" : 0,
      "failed" : 0
    },
    "hits" : {
      "total" : {
        "value" : 157483, 
        "relation" : "gte"
      },
      "max_score" : null,
      "hits" : [ ]
    }
  }
}
```

1. `"id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc="`：异步搜索的标识符，可用于监视其进度、检索其结果和/或删除它
2. `"is_partial" : true`： 当查询不再运行时，指示在所有分片上搜索是失败还是成功完成。执行查询时，`is_partial` 始终设置为 `true`
3. `"is_running" : true`：搜索是否仍在执行或已完成
4. `"total" : 562`：总共有多少个分片将被执行搜索
5. `"successful" : 3`：有多少分片成功完成了搜索
6. `"value" : 157483`：当前有多少文档与查询匹配，这些文档属于已完成搜索的分片

?> **注意** 虽然查询不再运行，因此 `is_running` 设置为 `false`，但结果可能是部分的。如果某些分片返回结果后搜索失败，或者协调异步搜索的节点死亡，就会发生这种情况。

通过提供 `wait_for_completion_timeout` 参数（默认为 `1` 秒），可以阻止并等待搜索完成，直到达到某个超时。当异步搜索在这样的超时内完成时，响应将不包括ID，因为结果不存储在集群中。`keep_on_completion` 参数（默认为 `false`）可以设置为 `true`，以请求存储结果，以便在 `wait_for_completion_timeout` 内搜索完成时，也可以进行后续检索。

你还可以通过 `keep_alive` 参数指定异步搜索需要多长时间可用，该参数默认为 `5d`（五天）。在此期间之后，将删除正在进行的异步搜索和任何保存的搜索结果。

?> **注意** 当结果的主要排序是索引字段时，分片将根据其为该字段保留的最小值和最大值进行排序，因此部分结果将根据请求的排序标准可用。

提交异步搜索 API 支持与搜索 API 相同的[参数]((/rest_apis/search_apis/search?id=查询参数)，尽管有些参数具有不同的默认值：

- `batched_reduce_size` 默认为 `5`：这会影响部分结果可用的频率，这会在碎片结果减少时发生。每次协调节点收到一定数量的新碎片响应（默认情况下为 `5`）时，都会执行部分减少。

- `request_cache` 默认为 `true`

- `pre_filter_shard_size` 默认为 `1` 且不能被修改：这是为了强制执行预筛选往返，以从每个切分中检索统计信息，从而跳过那些肯定不包含任何与查询匹配的文档的切分。

- `ccs_minimize_roundtrips` 默认为 `false`，且是唯一支持的值。

!> **警告** 异步搜索不支持仅包含[建议部分](/rest_apis/search_apis/suggesters)的[滚动](/search_your_data/paginate_search_results?id=滚动搜索结果)或搜索请求。仅当 `ccs_minimize_roundtrips` 设置为 `false` 时，才支持跨群集搜索。

?> **注意** 默认情况下，7.x 版本 Elasticsearch 不会限制存储的异步搜索响应的大小。存储大量异步响应可能会破坏集群的稳定性。如果要设置最大允许大小的限制，请更改搜 `search.max_async_search_response_size` 集群级设置。之后，尝试存储大于此设置的异步响应将导致错误。

## 获取异步搜索

获取异步搜索 API 根据之前提交的异步搜索请求的 id 检索其结果。如果启用了 Elasticsearch 安全功能，则对特定异步搜索结果的访问仅限于[提交该请求的用户或 API 密钥](/secure_the_elastic_stack/limitations?id=用户和-API-密钥的资源共享检查)。

```bash
GET /_async_search/FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=
```

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=",
  "is_partial" : true, 
  "is_running" : true, 
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986,
  "response" : {
    "took" : 12144,
    "timed_out" : false,
    "num_reduce_phases" : 46,
    "_shards" : {
      "total" : 562,
      "successful" : 188,
      "skipped" : 0,
      "failed" : 0
    },
    "hits" : {
      "total" : {
        "value" : 456433,
        "relation" : "eq"
      },
      "max_score" : null,
      "hits" : [ ]
    },
    "aggregations" : {
      "sale_date" :  {
        "buckets" : []
      }
    }
  }
}
```

1. `"is_partial" : true`：当查询不再运行时，指示在所有分片上搜索是失败还是成功完成。执行查询时，`is_partial` 始终设置为 `true`
2. `"is_running" : true`：搜索是否仍在执行或已完成
3. `"expiration_time_in_millis" : 1584377890986`：异步搜索将在何时过期
4. `"num_reduce_phases" : 46`：表示已执行了多少次结果缩减。如果与上次检索的结果相比，这个数字增加了，那么你可以期望搜索响应中包含更多的结果
5. `"successful" : 188`：指示已执行查询的分片数。请注意，为了将碎片结果包含在搜索响应中，需要首先减少分片结果。
6. `"aggregations"` ：部分聚合结果，来自已完成查询执行的分片。

调用获取异步搜索 API 时，还可以提供 `wait_for_completion_timeout` 参数，以便在提供的超时之前等待搜索完成。如果在超时过期之前可用，将返回最终结果，否则在超时过期后将返回当前可用的结果。默认情况下，未设置超时，这意味着将返回当前可用的结果，而无需任何额外等待。

`keep_alive` 参数指定异步搜索在集群中的可用时间。未指定时，将使用带有相应提交异步请求的 `keep_alive` 集。否则，可以覆盖该值并扩展请求的有效性。此期限到期后，如果搜索仍在运行，将取消搜索。如果搜索完成，其保存的结果将被删除。

## 获取异步搜索状态

获取异步搜索状态 API 不检索搜索结果，只显示之前提交的异步搜索请求的状态（给定其 `id`）。如果启用了 Elasticsearch 安全功能，则对获取异步搜索状态 API 的访问仅限于[监视用户（monitoring_user）角色](/secure_the_elastic_stack/user_authorization/built-in_roles)。

```bash
GET /_async_search/status/FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=
```

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=",
  "is_running" : true,
  "is_partial" : true,
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986,
  "_shards" : {
      "total" : 562,
      "successful" : 188,
      "skipped" : 0,
      "failed" : 0
  }
}
```

1. `"successful" : 188`：指示到目前为止已执行查询的分片数。

对于已完成的异步搜索，状态响应有一个额外的 `completion_status` 字段，显示已完成异步搜索的状态代码。

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=",
  "is_running" : false,
  "is_partial" : false,
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986,
  "_shards" : {
      "total" : 562,
      "successful" : 562,
      "skipped" : 0,
      "failed" : 0
  },
 "completion_status" : 200
}
```

1. `"completion_status" : 200`：指示异步搜索已成功完成。

```bash
{
  "id" : "FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=",
  "is_running" : false,
  "is_partial" : true,
  "start_time_in_millis" : 1583945890986,
  "expiration_time_in_millis" : 1584377890986,
  "_shards" : {
      "total" : 562,
      "successful" : 450,
      "skipped" : 0,
      "failed" : 112
  },
 "completion_status" : 503
}
```

1. `"completion_status" : 503`：指示异步搜索已完成，但出现错误。

## 删除异步搜索

你可以使用删除异步搜索 API 按 ID 手动删除异步搜索。如果搜索仍在运行，搜索请求将被取消。否则，保存的搜索结果将被删除。

```bash
DELETE /_async_search/FmRldE8zREVEUzA2ZVpUeGs2ejJFUFEaMkZ5QTVrSTZSaVN3WlNFVmtlWHJsdzoxMDc=
```

如果启用了 Elasticsearch 安全功能，则特定异步搜索的删除仅限于：`*`， 提交原始搜索请求的经过身份验证的用户。`*` 具有 `cancel_task` 集群权限的用户。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/async-search.html)
