# ES|QL 异步查询停止 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [ES|QL 异步查询停止 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-esql-async-query-stop)。

:::::

ES|QL 异步查询停止 API 用于手动停止异步查询。发出停止命令后，查询将停止处理新数据，并返回已处理的结果。请注意，由于 ES|QL 查询的管道特性，停止操作不是立即生效的，可能需要一些时间才能返回结果。

结果以与 [ES|QL 异步查询获取 API](./esql_async_query_get) 相同的格式返回。如果在发出停止命令时查询已经完成，则立即返回结果。

如果在发出停止命令时查询处理尚未完成，响应的 `is_partial` 字段将设置为 `true`。

## 请求

```bash
POST /_query/async/<query_id>/stop
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，只有提交原始查询请求的已认证用户才能停止该查询。

## 路径参数

- `<query_id>`

  （必需，字符串）要停止的查询的标识符。

  对于未在等待时间内完成的查询，ES|QL 异步查询 API 的响应中会提供查询 ID。

## 示例

```bash
POST /_query/async/FkpMRkJGS1gzVDRlM3g4ZzMyRGlLbkEaTXlJZHdNT09TU2VTZVBoNDM3cFZMUToxMDM=/stop
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-async-query-stop-api.html)
