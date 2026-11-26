# 搜索结果分页（Paginate search results）

Elasticsearch 使用分页将大型结果集划分为可管理的页面，以便高效检索和处理。

Elasticsearch 支持三种分页技术：

- **from and size 分页**：适合创建用户可导航的页码列表。
- **search_after**：支持无限滚动，或允许通过“下一页 / 加载更多”按钮加载更多结果。
- **scroll**：历史上用于检索所有匹配文档。现在推荐使用 `search_after` 配合 point in time API，以获得更好的效率和可靠性。

## 1. from and size 分页

默认情况下，搜索返回前 10 条匹配命中。要翻看更大的结果集，可以使用 search API 的 `from` 和 `size` 参数。

- `from`：定义要跳过的命中数量，默认为 `0`。
- `size`：定义返回的最大命中数量。

二者共同定义一页结果。

```bash
GET /_search
{
  "from": 5,
  "size": 20,
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

### 限制与注意事项

避免使用 `from` 和 `size` 进行过深分页，或一次请求过多结果。

搜索请求通常跨多个分片执行，每个分片都必须将请求的命中以及之前页面的命中加载到内存中。对于深分页或大型结果集，这些操作会显著增加内存和 CPU 使用率；如果管理不当，可能导致性能下降或节点故障。

默认情况下，不能使用 `from` 和 `size` 翻看超过 **10000** 条命中。该限制由 `index.max_result_window` 索引设置控制。如果需要翻看超过 10000 条命中，应使用 `search_after` 参数。

分页是无状态的，因此在页面之间导航时搜索结果顺序可能发生变化。为保持一致顺序，应使用 point in time API 进行有状态分页。

Elasticsearch 使用 Lucene 的内部文档 ID 作为 tie-breaker。这些内部文档 ID 在同一数据的不同副本之间可能完全不同。因此，在对搜索命中分页时，可能偶尔会看到具有相同排序值的文档排序不一致。

## 2. search_after 分页

可以使用 `search_after` 参数，通过上一页结果中的一组排序值来检索下一页命中。该方法适用于用户点击“下一页”或“加载更多”按钮的场景，而不适合跳转到任意指定页。

使用 `search_after` 需要多个具有相同查询和排序值的搜索请求。

### 初始请求

以下示例按两个字段排序：`date` 和 `tie_breaker_id`。其中 `tie_breaker_id` 是 `_id` 字段的副本，并启用了 doc_values：

```bash
GET twitter/_search
{
    "query": {
        "match": {
            "title": "elasticsearch"
        }
    },
    "sort": [
        {"date": "asc"},
        {"tie_breaker_id": "asc"}
    ]
}
```

搜索响应包含每个命中的 `sort` 值数组：

```json
{
  "took" : 17,
  "timed_out" : false,
  "_shards" : ...,
  "hits" : {
    "total" : ...,
    "max_score" : null,
    "hits" : [
      ...
      {
        "_index" : "twitter",
        "_id" : "654322",
        "_score" : null,
        "_source" : ...,
        "sort" : [
          1463538855,
          "654322"
        ]
      },
      {
        "_index" : "twitter",
        "_id" : "654323",
        "_score" : null,
        "_source" : ...,
        "sort" : [
          1463538857,
          "654323"
        ]
      }
    ]
  }
}
```

最后返回命中的排序值是：

```json
[1463538857, "654323"]
```

### 下一页请求

要检索下一页结果，重复该请求，并将最后一个命中的 `sort` 值放入 `search_after` 数组：

```bash
GET twitter/_search
{
    "query": {
        "match": {
            "title": "elasticsearch"
        }
    },
    "search_after": [1463538857, "654323"],
    "sort": [
        {"date": "asc"},
        {"tie_breaker_id": "asc"}
    ]
}
```

每次获取新页面后，都要更新 `search_after` 数组，并重复此过程。

如果请求之间发生刷新，结果顺序可能发生变化，导致跨页结果不一致。为避免这种情况，可以创建 point in time（PIT）来在多个搜索之间保留当前索引状态。

## 3. Point in time（PIT）

### 打开 PIT

```bash
POST /my-index-000001/_pit?keep_alive=1m
```

API 返回 PIT ID：

```json
{
  "id": "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==",
  "_shards": ...
}
```

### 使用 PIT 获取第一页

要获取第一页结果，提交带有 `sort` 参数的搜索请求。如果使用 PIT，需要在 `pit.id` 参数中指定 PIT ID，并从请求路径中省略目标数据流或索引。

所有 PIT 搜索请求都会添加一个隐式排序 tie-breaker 字段 `_shard_doc`，也可以显式提供该字段。如果无法使用 PIT，建议在排序中包含一个 tiebreaker 字段，该字段应对每个文档包含唯一值。如果不包含 tiebreaker 字段，分页结果可能会遗漏或重复命中。

如果排序顺序为 `_shard_doc` 且不跟踪总命中数，`search_after` 请求会有性能优化。如果要遍历所有文档而不关心顺序，这是最高效的选项。

如果某些目标数据流或索引中的排序字段是 `date`，而其他目标中是 `date_nanos`，应使用 `numeric_type` 将值转换为统一分辨率，并使用 `format` 指定排序字段的日期格式。否则 Elasticsearch 无法在每次请求中正确解释 `search_after` 参数。

### PIT + search_after 初始搜索请求

```bash
GET /_search
{
  "size": 10000,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==", 
    "keep_alive": "1m"
  },
  "sort": [ 
    {"@timestamp": {"order": "asc", "format": "strict_date_optional_time_nanos", "numeric_type" : "date_nanos" }}
  ]
}
```

- `pit.id` 是本次搜索使用的 PIT ID。
- 该请求使用隐式 `_shard_doc` 升序 tiebreaker 对命中排序。

### 显式指定 `_shard_doc` tiebreaker

也可以显式添加 tiebreaker，以自定义排序顺序：

```bash
GET /_search
{
  "size": 10000,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==", 
    "keep_alive": "1m"
  },
  "sort": [ 
    {"@timestamp": {"order": "asc", "format": "strict_date_optional_time_nanos"}},
    {"_shard_doc": "desc"}
  ]
}
```

- 该请求使用显式 `_shard_doc` 降序 tiebreaker 对命中排序。

### PIT 搜索响应示例

搜索响应包含每个命中的 `sort` 值数组。如果使用 PIT，tiebreaker 会作为最后一个排序值包含在每个命中中。

`_shard_doc` 是 PIT 中分片索引和 Lucene 内部文档 ID 的组合。它在每个文档中是唯一的，并且在同一个 PIT 内保持不变：

```json
{
  "pit_id" : "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==", 
  "took" : 17,
  "timed_out" : false,
  "_shards" : ...,
  "hits" : {
    "total" : ...,
    "max_score" : null,
    "hits" : [
      ...
      {
        "_index" : "my-index-000001",
        "_id" : "FaslK3QBySSL_rrj9zM5",
        "_score" : null,
        "_source" : ...,
        "sort" : [                                
          "2021-05-20T05:30:04.832Z",
          4294967298                              
        ]
      }
    ]
  }
}
```

- `pit_id` 是更新后的 point in time ID。
- `sort` 是最后返回命中的排序值。
- `4294967298` 是 tiebreaker 值，在同一 `pit_id` 内对每个文档唯一。

### 使用 search_after 获取下一页

要获取下一页，重新运行上一次搜索，并将最后一条命中的排序值（包括 tiebreaker）作为 `search_after` 参数。如果使用 PIT，应在 `pit.id` 参数中使用最新的 PIT ID。搜索的 `query` 和 `sort` 参数必须保持不变。如果提供了 `from` 参数，它必须是 `0`（默认值）或 `-1`：

```bash
GET /_search
{
  "size": 10000,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==",
    "keep_alive": "1m"
  },
  "sort": [
    {"@timestamp": {"order": "asc", "format": "strict_date_optional_time_nanos"}}
  ],
  "search_after": [                                
    "2021-05-20T05:30:04.832Z",
    4294967298
  ],
  "track_total_hits": false                        
}
```

- `pit.id` 使用上一次搜索返回的 PIT ID。
- `search_after` 使用上一次搜索最后一条命中的排序值。
- `track_total_hits: false` 可禁用总命中数跟踪，从而加快分页速度。

可以重复此过程获取更多页面。如果使用 PIT，可以在每次搜索请求中通过 `keep_alive` 参数延长 PIT 的保留时间。完成后应删除 PIT：

```bash
DELETE /_pit
{
    "id" : "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA=="
}
```

## 4. Scroll 搜索结果

现在不再推荐使用 scroll API 进行深分页。如果需要保留索引状态并翻看超过 10000 条命中，应使用 `search_after` 配合 point in time（PIT）。

虽然一次搜索请求只返回单页结果，但 scroll API 可用于从一次搜索请求中检索大量结果，甚至全部结果，类似传统数据库中的游标。

Scrolling 不适用于实时用户请求，而适用于处理大量数据，例如将某个数据流或索引的内容重建索引到具有不同配置的新数据流或索引中。

Scroll 请求返回的结果反映初始搜索请求时数据流或索引的状态，类似快照。后续对文档的更改（索引、更新或删除）只会影响之后的搜索请求。

使用 scrolling 时，初始搜索请求应在查询字符串中指定 `scroll` 参数，告诉 Elasticsearch 应将搜索上下文保持活动多长时间，例如 `?scroll=1m`。

### 初始 scroll 搜索请求

```bash
POST /my-index-000001/_search?scroll=1m
{
  "size": 100,
  "query": {
    "match": {
      "message": "foo"
    }
  }
}
```

上述请求的结果包含一个 `_scroll_id`，应将其传递给 scroll API 以获取下一批结果。

### 使用 scroll API 获取下一批结果

```bash
POST /_search/scroll 
{
  "scroll" : "1m", 
  "scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ==" 
}
```

- 可以使用 GET 或 POST。
- URL 中不应包含索引名；索引名在原始搜索请求中已指定。
- `scroll` 参数告诉 Elasticsearch 将搜索上下文再保持活动 `1m`。
- `scroll_id` 参数指定滚动上下文 ID。

`size` 参数允许配置每批结果返回的最大命中数。每次调用 scroll API 都会返回下一批结果，直到没有更多结果为止，即 `hits` 数组为空。

初始搜索请求和每次后续 scroll 请求都会返回一个 `_scroll_id`。`_scroll_id` 可能在请求之间变化，也可能不变；无论如何，只应使用最近收到的 `_scroll_id`。

如果请求指定了聚合，只有初始搜索响应会包含聚合结果。

Scroll 请求在排序顺序为 `_doc` 时有性能优化。如果要遍历所有文档而不关心顺序，这是最高效的选项：

```bash
GET /_search?scroll=1m
{
  "sort": [
    "_doc"
  ]
}
```

## 5. 保持搜索上下文活动

Scroll 返回初始搜索请求时匹配的所有文档，并忽略这些文档的后续更改。

`scroll_id` 标识一个搜索上下文，该上下文记录 Elasticsearch 返回正确文档所需的一切。搜索上下文由初始请求创建，并由后续请求保持活动。

`scroll` 参数在搜索请求和每个 scroll 请求中传递，告诉 Elasticsearch 搜索上下文应保持活动多长时间。其值例如 `1m`。该值不需要足够长以处理所有数据，只需足够长以处理上一批结果即可。每个带有 `scroll` 参数的 scroll 请求都会设置新的过期时间。如果 scroll 请求未传递 `scroll` 参数，则搜索上下文会在该请求的一部分被释放。

通常，后台合并过程会通过合并较小段为较大段来优化索引。一旦较小段不再需要，它们会被删除。此过程在 scrolling 期间会继续，但打开的搜索上下文会阻止旧段被删除，因为它们仍在使用中。

保持旧段活动意味着需要更多磁盘空间和文件句柄。确保节点配置了足够的空闲文件句柄。

如果某个段包含已删除或已更新的文档，搜索上下文必须跟踪该文档在初始搜索请求时是否仍然存活。如果对正在进行删除或更新的索引打开许多 scroll，应确保节点有足够的堆空间。

为防止打开的 scroll 过多，用户不允许超过一定限制打开 scroll。默认情况下，最大打开 scroll 数为 **500**。该限制可通过 `search.max_open_scroll_context` 集群设置更新。

可以使用 nodes stats API 检查打开的搜索上下文数量：

```bash
GET /_nodes/stats/indices/search
```

## 6. 清除 Scroll

搜索上下文会在 scroll 超时后自动移除。但是，保持 scroll 打开会产生成本，因此应在不再使用 scroll 时立即通过 clear-scroll API 显式清除。

### 清除单个 scroll

```bash
DELETE /_search/scroll
{
  "scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ=="
}
```

### 清除多个 scroll

```bash
DELETE /_search/scroll
{
  "scroll_id" : [
    "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ==",
    "DnF1ZXJ5VGhlbkZldGNoBQAAAAAAAAABFmtSWWRRWUJrU2o2ZExpSGJCVmQxYUEAAAAAAAAAAxZrUllkUVlCa1NqNmRMaUhiQlZkMWFBAAAAAAAAAAIWa1JZZFFZQmtTajZkTGlIYkJWZDFhQQAAAAAAAAAFFmtSWWRRWUJrU2o2ZExpSGJCVmQxYUEAAAAAAAAABBZrUllkUVlCa1NqNmRMaUhiQlZkMWFB"
  ]
}
```

### 清除全部 scroll

```bash
DELETE /_search/scroll/_all
```

`scroll_id` 也可以作为查询字符串参数或请求体传递。多个 scroll ID 可以作为逗号分隔值传递：

```bash
DELETE /_search/scroll/DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ==,DnF1ZXJ5VGhlbkZldGNoBQAAAAAAAAABFmtSWWRRWUJrU2o2ZExpSGJCVmQxYUEAAAAAAAAAAxZrUllkUVlCa1NqNmRMaUhiQlZkMWFBAAAAAAAAAAIWa1JZZFFZQmtTajZkTGlIYkJWZDFhQQAAAAAAAAAFFmtSWWRRWUJrU2o2ZExpSGJCVmQxYUEAAAAAAAAABBZrUllkUVlCa1NqNmRMaUhiQlZkMWFB
```

## 7. Sliced Scroll

当分页遍历大量文档时，将搜索拆分为多个 slice 并独立消费会很有帮助。

以下两个请求将搜索拆分为 2 个 slice：

```bash
GET /my-index-000001/_search?scroll=1m
{
  "slice": {
    "id": 0,                      
    "max": 2                      
  },
  "query": {
    "match": {
      "message": "foo"
    }
  }
}
```

```bash
GET /my-index-000001/_search?scroll=1m
{
  "slice": {
    "id": 1,
    "max": 2
  },
  "query": {
    "match": {
      "message": "foo"
    }
  }
}
```

- `id` 是 slice 的 ID。
- `max` 是最大 slice 数。

第一个请求返回属于第一个 slice（`id: 0`）的文档，第二个请求返回属于第二个 slice（`id: 1`）的文档。由于最大 slice 数设置为 `2`，两个请求结果的并集等价于不带 slicing 的 scroll 查询结果。

默认情况下，先按分片拆分，然后在每个分片本地使用 `_id` 字段拆分。本地拆分遵循公式：

```text
slice(doc) = floorMod(hashCode(doc._id), max)
```

每个 scroll 都是独立的，可以像任何 scroll 请求一样并行处理。

如果 slice 数大于分片数，slice 过滤器在最初几次调用中会非常慢，复杂度为 `O(N)`，内存成本为每个 slice `N` 位，其中 `N` 是分片中的文档总数。几次调用后过滤器会被缓存，后续调用应更快，但应限制并行执行的 sliced query 数量，以避免内存爆炸。

point-in-time API 支持更高效的分区策略，不会遇到此问题。只要可能，建议将 point-in-time search 与 slicing 结合使用，而不是使用 scroll。

避免这种高成本的另一种方法是使用另一个字段的 doc_values 进行 slicing。该字段必须满足：

- 字段是数值类型。
- 字段启用了 doc_values。
- 每个文档都应包含单个值。如果文档对该字段有多个值，则使用第一个值。
- 每个文档的值应在文档创建时设置一次，且永不更新，以确保每个 slice 获得确定性结果。
- 字段基数应较高，以确保每个 slice 获得大致相同数量的文档。

示例：

```bash
GET /my-index-000001/_search?scroll=1m
{
  "slice": {
    "field": "@timestamp",
    "id": 0,
    "max": 10
  },
  "query": {
    "match": {
      "message": "foo"
    }
  }
}
```

对于仅追加的时间序列索引，可以安全地使用 timestamp 字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/paginate-search-results.html)
