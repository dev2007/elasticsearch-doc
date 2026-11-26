# 搜索 API

搜索（search）由一个或多个组合在一起并发送给 Elasticsearch 的查询组成。匹配搜索查询的文档将在响应的命中（hits，即搜索结果）中返回。

搜索还可以包含用于更好地处理其查询的附加信息。例如，搜索可以限定在特定索引上，或者只返回特定数量的结果。

你可以使用搜索 API 搜索并聚合存储在 Elasticsearch 数据流或索引中的数据。该 API 的查询请求体参数接受用 Query DSL 编写的查询。

## 运行搜索

以下请求使用 match 查询搜索 `my-index-000001`。该查询匹配 `user.id` 值为 `kimchy` 的文档。

```bash
GET /my-index-000001/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

API 响应在 `hits.hits` 属性中返回匹配查询的前 10 个文档。

```json
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.3862942,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "kxWFcnMByiguvud1Z8vC",
        "_score": 1.3862942,
        "_source": {
          "@timestamp": "2099-11-15T14:12:12",
          "http": {
            "request": {
              "method": "get"
            },
            "response": {
              "bytes": 1070000,
              "status_code": 200
            },
            "version": "1.1"
          },
          "message": "GET /search HTTP/1.1 200 1070000",
          "source": {
            "ip": "127.0.0.1"
          },
          "user": {
            "id": "kimchy"
          }
        }
      }
    ]
  }
}
```

## 常用搜索选项

你可以使用以下选项自定义搜索。

**Query DSL**

Query DSL 支持多种查询类型，你可以混合搭配以获得想要的结果。查询类型包括：

- 布尔查询和其他复合查询，让你可以组合查询并基于多个条件匹配结果
- 用于过滤和查找精确匹配的词项级查询（term-level queries）
- 全文查询，常用于搜索引擎
- 地理和空间查询

**聚合**

你可以使用搜索聚合获取搜索结果的统计信息和其他分析。聚合可以帮助你回答如下问题：

- 我的服务器的平均响应时间是多少？
- 我网络上的用户最常访问哪些 IP 地址？
- 每个客户的交易总收入是多少？

**搜索多个数据流和索引**

你可以使用逗号分隔的值和类 grep 的索引模式，在同一请求中搜索多个数据流和索引。你甚至可以提升来自特定索引的搜索结果的权重。参阅[使用查询搜索多个数据流和索引](/search_your_data/search_multiple_data_streams_and_indices)。

**分页搜索结果**

默认情况下，搜索只返回前 10 个匹配的命中。要检索更多或更少的文档，参阅[分页搜索结果](/search_your_data/paginate_search_results)。

**检索选定字段**

搜索响应的 `hits.hits` 属性包含每个命中的完整文档 `_source`。要只检索 `_source` 的子集或其他字段，参阅[检索选定字段](/search_your_data/retrieve_selected_fields)。

**排序搜索结果**

默认情况下，搜索命中按 `_score` 排序，`_score` 是衡量每个文档与查询匹配程度的相关性评分。要自定义这些评分的计算，请使用 `script_score` 查询。要按其他字段值对搜索命中排序，参阅[排序搜索结果](/search_your_data/sort_search_results)。

**运行异步搜索**

Elasticsearch 搜索旨在快速处理大量数据，通常在毫秒内返回结果。因此，搜索默认是同步的。搜索请求会等待完整结果后再返回响应。

不过，对于跨大型数据集或多个集群的搜索，返回完整结果可能需要更长时间。

为避免长时间等待，你可以改为运行异步（async）搜索。异步搜索让你可以立即获取长时间运行的搜索的部分结果，并在稍后获取完整结果。

## 定义仅存在于查询中的字段

你可以不必先索引数据再搜索，而是定义仅作为搜索查询一部分存在的[运行时字段](/mapping/runtime)。在搜索请求中指定一个 `runtime_mappings` 部分来定义运行时字段，它可以选择性地包含一个 Painless 脚本。

例如，以下查询定义了一个名为 `day_of_week` 的运行时字段。包含的脚本基于 `@timestamp` 字段的值计算星期几，并使用 `emit` 返回计算出的值。

该查询还包含一个作用于 `day_of_week` 的 terms 聚合。

```bash
GET /my-index-000001/_search
{
  "runtime_mappings": {
    "day_of_week": {
      "type": "keyword",
      "script": {
        "source":
        """emit(doc['@timestamp'].value.dayOfWeekEnum
        .getDisplayName(TextStyle.FULL, Locale.ENGLISH))"""
      }
    }
  },
  "aggs": {
    "day_of_week": {
      "terms": {
        "field": "day_of_week"
      }
    }
  }
}
```

响应包含一个基于 `day_of_week` 运行时字段的聚合。在 `buckets` 下面是一个值为 `Sunday` 的键。查询基于 `day_of_week` 运行时字段中定义的脚本动态计算出了该值，而无需索引该字段。

```json
{
  "...": "...",
  "aggregations" : {
    "day_of_week" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "Sunday",
          "doc_count" : 5
        }
      ]
    }
  }
}
```

## 搜索超时

默认情况下，搜索请求不会超时。请求会等待每个分片返回完整结果后才给出响应。

虽然异步搜索是为长时间运行的搜索而设计的，但你也可以使用 `timeout` 参数指定你愿意等待每个分片完成的时长。每个分片会在指定时间段内收集命中。如果时间段结束时收集尚未完成，Elasticsearch 只使用截至该点已累积的命中。搜索请求的整体延迟取决于搜索所需的分片数量和并发分片请求数量。

```bash
GET /my-index-000001/_search
{
  "timeout": "2s",
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

要为所有搜索请求设置集群级默认超时，请使用集群设置 API 配置 `search.default_search_timeout`。如果请求中未传入 `timeout` 参数，将使用此全局超时时长。如果全局搜索超时在搜索请求完成之前到期，请求将通过任务取消机制被取消。`search.default_search_timeout` 设置默认为 `-1`（无超时）。

## 搜索取消

你可以使用任务管理 API 取消搜索请求。当客户端的 HTTP 连接关闭时，Elasticsearch 也会自动取消搜索请求。我们建议你配置客户端，在搜索请求中止或超时时关闭 HTTP 连接。

## 跟踪总命中数

一般来说，不访问所有匹配项就无法准确计算总命中数，这对于匹配大量文档的查询来说代价很高。`track_total_hits` 参数允许你控制如何跟踪总命中数。鉴于有一个命中数的下限通常就足够了（例如“至少有 10000 个命中”），默认值设为 10000。这意味着请求会精确计算最多 10000 个命中的总命中数。如果你不需要超过某个阈值后的精确命中数，这是一个加速搜索的良好折中。

当设置为 `true` 时，搜索响应将始终准确跟踪与查询匹配的命中数（例如，当 `track_total_hits` 设置为 true 时，`total.relation` 将始终等于 `"eq"`）。否则，搜索响应中 `"total"` 对象返回的 `"total.relation"` 决定了 `"total.value"` 应如何解释。值 `"gte"` 表示 `"total.value"` 是与查询匹配的总命中的下界，值 `"eq"` 表示 `"total.value"` 是准确的计数。

```bash
GET my-index-000001/_search
{
  "track_total_hits": true,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  }
}
```

返回：

```json
{
  "_shards": "...",
  "timed_out": false,
  "took": 100,
  "hits": {
    "max_score": 1.0,
    "total" : {
      "value": 2048,
      "relation": "eq"
    },
    "hits": "..."
  }
}
```

1. 与查询匹配的总命中数。
2. 计数是准确的（例如 `"eq"` 表示等于）。

也可以将 `track_total_hits` 设置为整数。例如，以下查询将精确跟踪最多 100 个文档的匹配查询总命中数：

```bash
GET my-index-000001/_search
{
  "track_total_hits": 100,
  "query": {
    "match": {
      "user.id": "elkbee"
    }
  }
}
```

响应中的 `hits.total.relation` 将指示 `hits.total.value` 中返回的值是准确的（`"eq"`）还是总数的下界（`"gte"`）。

例如以下响应：

```json
{
  "_shards": "...",
  "timed_out": false,
  "took": 30,
  "hits": {
    "max_score": 1.0,
    "total": {
      "value": 42,
      "relation": "eq"
    },
    "hits": "..."
  }
}
```

表示总数中返回的命中数是准确的。

如果与查询匹配的总命中数大于 `track_total_hits` 中设置的值，响应中的总命中数将表明返回的值是一个下界：

```json
{
  "_shards": "...",
  "hits": {
    "max_score": 1.0,
    "total": {
      "value": 100,
      "relation": "gte"
    },
    "hits": "..."
  }
}
```

1. 至少有 100 个文档与查询匹配。
2. 这是一个下界（`"gte"`）。

如果你完全不需要跟踪总命中数，可以通过将此选项设置为 `false` 来提升查询速度：

```bash
GET my-index-000001/_search
{
  "track_total_hits": false,
  "query": {
    "match": {
      "user.id": "elkbee"
    }
  }
}
```

返回：

```json
{
  "_shards": "...",
  "timed_out": false,
  "took": 10,
  "hits": {
    "max_score": 1.0,
    "hits": "..."
  }
}
```

1. 总命中数未知。

最后，你可以通过在请求中将 `"track_total_hits"` 设置为 `true` 来强制获取准确计数。

`track_total_hits` 参数允许你在命中计数准确性和性能之间进行权衡。一般来说，`track_total_hits` 的值越小，查询越快，`false` 则返回最快的结果。将 `track_total_hits` 设置为 `true` 会使 Elasticsearch 返回精确的命中计数，这可能损害查询性能，因为它会禁用 Max WAND 优化。

## 快速检查是否有匹配文档

如果你只想知道是否存在与特定查询匹配的文档，可以将 `size` 设置为 0，表示你对搜索结果不感兴趣。你还可以将 `terminate_after` 设置为 1，表示查询执行可以在找到第一个匹配文档时即终止（每个分片）。

```bash
GET /_search?q=user.id:elkbee&size=0&terminate_after=1
```

`terminate_after` 始终在 `post_filter` 之后应用，并在分片上收集到足够命中时停止查询以及聚合的执行。不过聚合上的文档计数可能不会反映响应中的 `hits.total`，因为聚合是在后置过滤之前应用的。

由于 size 被设置为 0，响应将不包含任何命中。`hits.total` 要么等于 0（表示没有匹配的文档），要么大于 0（表示查询被提前终止时至少有那么多文档匹配该查询）。此外，如果查询被提前终止，响应中的 `terminated_early` 标志将被设置为 `true`。有些查询能够直接从索引统计信息中获取命中计数，这要快得多，因为它不需要执行查询。在这种情况下，不会收集任何文档，返回的 `total.hits` 将高于 `terminate_after`，且 `terminated_early` 将被设置为 `false`。

```json
{
  "took": 3,
  "timed_out": false,
  "terminated_early": true,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped" : 0,
    "failed": 0
  },
  "hits": {
    "total" : {
        "value": 1,
        "relation": "eq"
    },
    "max_score": null,
    "hits": []
  }
}
```

响应中的 `took` 时间包含此请求从节点收到查询后开始处理、直到所有搜索相关工作完成、在上面的 JSON 返回给客户端之前所耗费的毫秒数。这意味着它包括在线程池中等待的时间、在整个集群上执行分布式搜索的时间以及收集所有结果的时间。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-your-data.html)
