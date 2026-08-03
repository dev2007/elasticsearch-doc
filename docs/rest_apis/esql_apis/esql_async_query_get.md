# ES|QL 异步查询获取 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [ES|QL 异步查询获取 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-esql-async-query-get)。

:::::

返回 ES|QL 异步查询或存储结果的**当前状态和可用结果**。

## 请求

```bash
GET /_query/async/<query_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，**只有最初提交 ES|QL 查询的用户**才能使用此 API 检索结果。

## 路径参数

- `<query_id>`

  （必需，字符串）查询的标识符。

  对于未在等待时间内完成的查询，ES|QL 异步查询 API 的响应中会提供查询 ID。如果请求的 `keep_on_completion` 参数为 `true`，也会提供查询 ID。

## 查询参数

该 API 接受与同步[查询 API](./esql_query) 相同的参数，以及以下额外参数：

- `wait_for_completion_timeout`

  （可选，时间值）等待请求完成的超时时间。默认无超时，即请求等待完整的查询结果。

  如果指定了此参数且请求在此期间完成，则返回完整的查询结果。如果请求未在此期间完成，则响应返回 `is_running` 值为 `true` 且不返回结果。

## 响应体

该 API 返回与 [ES|QL 查询 API](./esql_query#响应体) 相同的响应体。详情请参阅 ES|QL 查询 API 的响应体参数。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-async-query-get-api.html)
