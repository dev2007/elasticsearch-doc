# ES|QL 异步查询 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [ES|QL 异步查询 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-esql-async-query)。

:::::

运行异步 ES|QL 查询。

异步查询 API 允许你异步执行查询请求、监控其进度，并在结果可用时检索结果。

该 API 接受与同步[查询 API](./esql_query) 相同的参数和请求体，以及以下所述的额外异步相关属性。

## 请求

```bash
POST /_query/async
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对所查询的数据流、索引或别名拥有**读取索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 示例

```json
POST /_query/async
{
  "query": """
    FROM library
    | EVAL year = DATE_TRUNC(1 YEARS, release_date)
    | STATS MAX(page_count) BY year
    | SORT year
    | LIMIT 5
  """,
  "wait_for_completion_timeout": "2s"
}
```

### 响应（仍在运行）

如果结果在给定的超时时间内（本例中为 2 秒）不可用，则不会返回结果，而是返回一个包含以下内容的响应：

- 一个查询 ID
- `is_running` 值为 `true`，表示查询正在进行中

查询将在后台继续运行，不会阻塞其他请求。

```json
{
  "id": "FmNJRUZ1YWZCU3dHY1BIOUhaenVSRkEaaXFlZ3h4c1RTWFNocDdnY2FSaERnUTozNDE=",
  "is_running": true
}
```

### 响应（已完成）

否则，如果响应的 `is_running` 值为 `false`，则异步查询已完成并返回结果。

```json
{
  "is_running": false,
  "columns": ...
}
```

## 路径参数

该 API 接受与同步查询 API 相同的参数。

## 请求体

该 API 接受与同步查询 API 相同的请求体，以及以下参数：

- `wait_for_completion_timeout`

  （可选，时间值）等待请求完成的超时时间。默认为 1 秒，即请求等待 1 秒以获取查询结果。如果查询在此期间完成，则返回结果。否则，返回一个查询 ID，可用于稍后检索结果。

- `keep_on_completion`

  （可选，布尔值）如果为 `true`，查询及其结果将存储在集群中。如果为 `false`，仅当请求未在 `wait_for_completion_timeout` 参数设置的时间内完成时，查询及其结果才会存储在集群中。默认为 `false`。

- `keep_alive`

  （可选，时间值）查询及其结果存储在集群中的时间。默认为 5d（五天）。当此时间到期时，查询及其结果将被删除，即使查询仍在进行中。如果 `keep_on_completion` 参数为 `false`，则 Elasticsearch 仅存储未在 `wait_for_completion_timeout` 参数设置的时间内完成的异步查询，无论此值如何设置。

## 响应体

该 API 返回与同步查询 API 相同的响应体，以及以下属性：

- `id`

  （字符串）查询的标识符。仅当满足以下条件之一时才提供此查询 ID：
  - 查询请求未在 `wait_for_completion_timeout` 参数的超时时间内返回完整结果。
  - 查询请求的 `keep_on_completion` 参数为 `true`。

  你可以使用此 ID 通过 [ES|QL 异步查询获取 API](./esql_async_query_get) 获取查询的当前状态和可用结果。

- `is_running`

  （布尔值）如果为 `true`，查询请求仍在执行中。

- `is_partial`

  （布尔值）如果为 `true`，查询具有部分结果——例如，使用[异步查询停止 API](./esql_async_query_stop) 的结果。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-async-query-api.html)
