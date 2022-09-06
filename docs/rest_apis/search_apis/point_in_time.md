# 时间点 API

默认情况下，搜索请求针对目标索引的最新可见数据执行，该数据称为时间点。Elasticsearch pit（时间点）是一个轻量级视图，可以查看启动时数据的状态。在某些情况下，最好使用同一时间点执行多个搜索请求。例如，如果在请求之后的搜索之间进行刷新，则这些请求的结果可能不一致，因为搜索之间发生的更改只在最近的时间点可见。

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

  要在[时间点（PIT）](/rest_apis/search_apis/point_in_time)中搜索别名，必须对别名数据流或索引有 `read` 索引权限。

## 示例

在用于搜索请求之前，必须明确打开时间点。`keep_alive` 参数告诉 Elasticsearch 一个时间点应该保持活动多长时间，例如，`?keep_alive=5m`。

```bash
POST /my-index-000001/_pit?keep_alive=1m
```

上述请求的结果包括一个 `id`，该 `id` 应传递给搜索请求的 `pit` 参数的 `id`。

```bash
POST /_search 
{
    "size": 100,
    "query": {
        "match" : {
            "title" : "elasticsearch"
        }
    },
    "pit": {
      "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==",
      "keep_alive": "1m"  
    }
}
```

1. `POST /_search`：带有 `pit` 参数的搜索请求不能指定 `index`、`routing` 和 [`preference`](https://www.elastic.co/guide/en/elasticsearch/reference/8.0/search-request-body.html#request-body-search-preference)，因为这些参数是从时间点复制的。

2. `"id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA=="`：`id` 参数告诉 Elasticsearch 使用该时间点的上下文执行请求。

3. `"keep_alive": "1m"`：`keep_alive` 参数告诉 Elasticsearch 它应该延长时间点的生存时间。

!> 开放时间点请求和每个后续搜索请求可以返回不同的 `id`；因此，在下一个搜索请求中始终使用最近收到的 `id`。

## 保持时间点活动

`keep_alive` 参数传递给打开的时间点请求和搜索请求，它延长了相应时间点的生存时间。该值（例如，`1m`，参见[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）不需要足够长的时间来处理所有数据 — 它只需要足够长的时间来满足下一个请求。

通常情况下，后台合并过程通过合并较小的段来创建新的较大段，从而优化索引。一旦不再需要较小的片段，它们就会被删除。但是，开放时间点防止删除旧段，因为它们仍在使用中。

?> 使较旧的段保持活动状态意味着需要更多的磁盘空间和文件句柄。确保已将节点配置为具有足够的空闲文件句柄。参阅[文件描述符](/set_up_elasticsearch/important_system_configuration/file_descriptors)。

此外，如果某个段包含已删除或更新的文档，则时间点必须跟踪该段中的每个文档在初始搜索请求时是否处于活动状态。如果索引上有很多打开点，并且需要进行删除或更新，请确保节点有足够的堆空间。请注意，时间点不会阻止删除其关联的索引。

你可以使用节点统计 API 检查打开了多少时间点（即搜索上下文）：

```bash
GET /_nodes/stats/indices/search
```

## 关闭时间点 API

时间点在其 `keep_alive` 已过时自动关闭。然而，如[前一节](/rest_apis/search_apis/point_in_time?id=保持时间点活动)所讨论的，保持时间点是有代价的。一旦搜索请求中不再使用时间点，时间点应立即关闭。

```bash
DELETE /_pit
{
    "id" : "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA=="
}
```

API 返回以下响应：

```bash
{
   "succeeded": true,
   "num_freed": 3
}
```

1. `"succeeded": true`：如果为 `true`，则与时间点 id 关联的所有搜索上下文都将成功关闭
2. `"num_freed": 3`：已成功关闭的搜索上下文数

## 搜索切片

```bash
GET /_search
{
  "slice": {
    "id": 0,
    "max": 2
  },
  "query": {
    "match": {
      "message": "foo"
    }
  },
  "pit": {
    "id": "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA=="
  }
}

GET /_search
{
  "slice": {
    "id": 1,
    "max": 2
  },
  "pit": {
    "id": "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA=="
  },
  "query": {
    "match": {
      "message": "foo"
    }
  }
}
```

1. `"id": 0`：切片 id
2. `"max": 2`：切片最大数量

在对大量文档进行分页时，将搜索拆分为多个片段以独立使用它们可能会有所帮助：

第一个请求的结果返回属于第一个切片（id:0）的文档，第二个请求的结果返回第二个切片中的文档。由于最大切片数设置为2，因此两个请求结果的并集相当于不进行切片的时间点搜索的结果。默认情况下，首先在碎片上进行拆分，然后在每个碎片上进行本地拆分。本地拆分基于Lucene文档ID将碎片划分为连续范围。
例如，如果分片的数量等于2，并且用户请求了4个碎片，那么将碎片0和2分配给第一个碎片，将碎片1和3分配给第二个碎片。

!> 所有切片都应使用相同的时间点 ID。如果使用不同的时间点 ID，则切片可能会重叠并丢失文档。这是因为拆分标准基于 Lucene 文档 ID，这些 ID 在索引更改期间不稳定。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/point-in-time-api.html)