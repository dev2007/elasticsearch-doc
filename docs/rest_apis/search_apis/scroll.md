# 滚动 API

:::caution 警告
我们不再建议使用滚动 API 进行深度分页。如果在分页超过 10,000 次点击时需要保留索引状态，请在时间点（PIT）使用 [`search_after`](/search_your_data/paginate_search_results#搜寻) 参数。
:::

检索[滚动搜索](/search_your_data/paginate_search_results#滚动搜索结果)的下一批结果。

```bash
GET /_search/scroll
{
  "scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ=="
}
```

## 请求

`GET /_search/scroll/<scroll_id>` [~~7.0.0~~]

`GET /_search/scroll`

`POST /_search/scroll/<scroll_id>` [~~7.0.0~~]

`POST /_search/scroll`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须对目标数据流、索引或别名有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

你可以使用滚动 API 从单个滚动搜索请求中检索大量结果。

滚动 API 需要滚动 ID。要获取滚动 ID，请提交包含[滚动查询参数](/rest_apis/search_apis/search)的[搜索 API](/rest_apis/search_apis/search)请求。`scroll` 参数指示 Elasticsearch 应为请求保留[搜索上下文](/search_your_data/paginate_search_results#保持搜索上下文存活)的时间。

搜索响应在响应体参数 `_scroll_id` 中返回一个滚动 ID。然后，你可以使用滚动 ID 和滚动 API 来检索请求的下一批结果。如果 Elasticsearch 安全功能已启用，则对特定滚动 ID 的结果的访问仅限于[提交搜索的用户或 API 密钥](/secure_the_elastic_stack/limitations#用户和-API-密钥的资源共享检查)。

你还可以使用scroll API指定新的滚动参数，以延长或缩短搜索上下文的保留期。

参阅[滚动搜索结果](/search_your_data/paginate_search_results#滚动搜索结果)。

:::caution 警告
滚动搜索的结果反映了初始搜索请求时索引的状态。后续的索引或文档更改只会影响以后的搜索和滚动请求。
:::

## 路径参数

- `<scroll_id>`
  [~~7.0.0~~]（可选，字符串）搜索的滚动 ID。

  :::caution 警告
  滚动 ID 可能很长。我们建议仅使用 [`scroll_id` 请求体参数](/rest_apis/search_apis/scroll)指定滚动 ID。
  :::

## 查询参数

- `scroll`
  
  （可选，[时间值](/rest_apis/api_convention/common_options#时间单位)）保留用于滚动的[搜索上下文](/search_your_data/paginate_search_results#保持搜索上下文存活)的期间。参阅[滚动搜索结果](/search_your_data/paginate_search_results#滚动搜索结果)。

  该值覆盖原始搜索 API 请求的 `scroll` 参数设置的持续时间。

  默认情况下，此值不能超过 `1d`（24小时）。你可以通过 `search.max_keep_alive` 集群设置修改些限制。

  :::caution 警告
  你还可以通过请求体参数 `scroll` 指定该值。如果同时指定了这两个参数，则只使用查询参数。
  :::

- `scroll_id`
  
  [~~7.0.0~~]（可选，字符串）搜索的滚动 ID。

  :::caution 警告
  滚动 ID 可能很长。我们建议仅使用 [`scroll_id` 请求体参数](/rest_apis/search_apis/scroll)指定滚动 ID。
  :::

- `rest_total_hits_as_int`

  (可选，布尔值)如果为 `true`，API 响应的 `hits.total` 属性以整数返回。如果为 `false`，API 响应的 `hits.total` 属性以对象返回。默认为 `false`。

## 请求体

- `scroll`

  （可选，[时间值](/rest_apis/api_convention/common_options#时间单位)）保留用于滚动的[搜索上下文](/search_your_data/paginate_search_results#保持搜索上下文存活)的期间。参阅[滚动搜索结果](/search_your_data/paginate_search_results#滚动搜索结果)。

  该值覆盖原始搜索 API 请求的 `scroll` 参数设置的持续时间。

  默认情况下，此值不能超过 `1d`（24小时）。你可以通过 `search.max_keep_alive` 集群设置修改些限制。

  :::caution 警告
  你还可以通过查询参数 `scroll` 指定该值。如果同时指定了这两个参数，则只使用查询参数。
  :::
  
- `scroll_id`

  （必需，字符串）搜索的滚动 ID。

## 响应体

滚动 API 返回与搜索 API 相同的响应体。参阅搜索 API 的[响应体参数](/rest_apis/search_apis/search#响应体)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/scroll-api.html)
