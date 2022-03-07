# 清除滚动 API

清除[滚动搜索](/rest_apis/search_apis/scroll)的搜索上下文和结果。

```bash
DELETE /_search/scroll
{
  "scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAD4WYm9laVYtZndUQlNsdDcwakFMNjU1QQ=="
}
```

## 请求

`DELETE /_search/scroll/<scroll_id>` [~~7.0.0~~]

`DELETE /_search/scroll`

## 路径参数

- `<scroll_id>`
  [~~7.0.0~~]（可选，字符串）搜索的滚动 ID。

  !> 滚动 ID 可能很长。我们建议仅使用 [`scroll_id` 请求体参数](/rest_apis/search_apis/scroll)指定滚动 ID。

## 查询参数

- `scroll_id`
  [~~7.0.0~~]（可选，字符串）搜索的滚动 ID。

  !> 滚动 ID 可能很长。我们建议仅使用 [`scroll_id` 请求体参数](/rest_apis/search_apis/scroll)指定滚动 ID。

## 请求体

- `scroll_id`
  （必需，字符串）搜索的滚动 ID。

## 响应体

- `succeeded`
  （布尔值）如果为 `true`，请求成功。这并不表示是否清除了任何滚动搜索请求。

- `num_freed`
  （整数）已清除的滚动搜索请求数。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/clear-scroll-api.html)
