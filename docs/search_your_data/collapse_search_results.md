# 折叠搜索结果（Collapse search results）

可以使用 `collapse` 参数基于字段值折叠搜索结果。

折叠通过**为每个折叠键（collapse key）仅选择排序最靠前的一个文档**来实现。

响应中的 total hits 表示未折叠时的匹配文档总数，**不同分组的总数是未知的**。

:::::warning 警告
用于折叠的字段必须是单值的 [keyword](/mapping/field_data_types/keyword) 或 [numeric](/mapping/field_data_types/numeric) 字段，且已启用 [doc_values](/mapping/mapping_parameters/doc_values)。
:::::

折叠仅作用于 top hits，不影响[聚合](/aggregations)。

:::::warning 警告
`collapse` 不能与 [scroll](/search_your_data/paginate_search_results#滚动搜索结果) 一起使用。
:::::

## collapse 参数

- `field`

  （必需，字符串）用于折叠结果的字段。

- `inner_hits`

  （可选，对象或数组）展开每个折叠命中的[内部命中](/search_your_data/retrieve_inner_hits)。参阅下文的 [inner_hits](#配合-inner-hits)。

- `max_concurrent_group_searches`

  （可选，整数）该阶段允许的最大并发搜索请求数。默认基于数据节点数和默认搜索线程池大小。

## 示例

以下搜索请求按 `user.id` 字段折叠搜索结果，并按 `http.response.bytes` 降序排序：

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "message": "GET /search"
    }
  },
  "collapse": {
    "field": "user.id"
  },
  "sort": [
    { "http.response.bytes": { "order": "desc" } }
  ],
  "from": 0
}
```

## 配合 inner_hits

也可以通过 `inner_hits` 展开每个折叠命中。例如，以下请求按 `user.id` 折叠，并为每个折叠命中返回该用户按时间倒序的 5 条最近记录：

```bash
GET /my-index-000001/_search
{
  "query": {
    "match": { "message": "GET /search" }
  },
  "collapse": {
    "field": "user.id",
    "inner_hits": {
      "name": "most_recent",
      "size": 5,
      "sort": [ { "@timestamp": "desc" } ]
    },
    "max_concurrent_group_searches": 4
  },
  "sort": [
    { "http.response.bytes": { "order": "desc" } }
  ]
}
```

同一个折叠命中也可以请求多个 inner_hits，以同一组折叠结果的不同视角展示：

```bash
GET /my-index-000001/_search
{
  "query": {
    "match": { "message": "GET /search" }
  },
  "collapse": {
    "field": "user.id",
    "inner_hits": [
      {
        "name": "largest_responses",
        "size": 3,
        "sort": [ { "http.response.bytes": { "order": "desc" } } ]
      },
      {
        "name": "most_recent",
        "size": 3,
        "sort": [ { "@timestamp": { "order": "desc" } } ]
      }
    ]
  },
  "sort": [ "http.response.bytes" ]
}
```

:::::warning 警告
分组展开是通过为每个 inner_hit 请求 × 每个返回的折叠命中发送额外查询来实现的。组数或 inner_hit 请求过多会显著拖慢搜索。`max_concurrent_group_searches` 可用于控制该阶段的并发搜索上限。
:::::

## 配合 search_after

仅当排序字段与折叠字段相同时，才支持在折叠搜索中使用 [search_after](/search_your_data/paginate_search_results#search-after)。此场景不允许二级排序：

```bash
GET /my-index-000001/_search
{
  "query": {
    "match": { "message": "GET /search" }
  },
  "collapse": {
    "field": "user.id"
  },
  "sort": [ "user.id" ],
  "search_after": ["dd5ce1ad"]
}
```

## 配合 rescore

Rescorer 会在每个分片上针对每个折叠字段的 top 文档运行。为保证结果可靠，建议在索引时将折叠字段值作为 routing key，使相同折叠值的文档分布在同一个分片上：

```bash
POST /my-index-000001/_doc?routing=xyz
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "You know for search!",
  "user.id": "xyz"
}
```

以下请求使用折叠和 query rescorer：

```bash
GET /my-index-000001/_search
{
  "query": {
    "match": { "message": "you know for search" }
  },
  "collapse": {
    "field": "user.id"
  },
  "rescore": {
    "window_size": 50,
    "query": {
      "rescore_query": {
        "match_phrase": { "message": "you know for search" }
      },
      "query_weight": 0.3,
      "rescore_query_weight": 1.4
    }
  }
}
```

注意：Rescorer 不作用于 inner hits，这可以保证每个 collapse key 全局只有一个 top 文档被重新打分。

## 二级折叠

支持第二层折叠，作用于 inner_hits 内部。二级折叠不允许使用 inner_hits：

```bash
GET /my-index-000001/_search
{
  "query": {
    "match": { "message": "GET /search" }
  },
  "collapse": {
    "field": "geo.country_name",
    "inner_hits": {
      "name": "by_location",
      "collapse": { "field": "user.id" },
      "size": 3
    }
  }
}
```

## 跟踪得分

当折叠与按字段排序一起使用时，不会计算得分。如果需要计算并跟踪得分，可将 `track_scores` 参数设为 `true`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/collapse-search-results.html)
