# 获取异步 EQL 搜索 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[EQL API](/rest_apis/eql_qpis/eql_qpis)。

::::

返回异步 EQL 搜索或已存储的同步 EQL 搜索的当前状态和可用结果。

## 请求

```json
GET /_eql/search/<search_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，只有首次提交 EQL 搜索的用户可以使用此 API 检索搜索。
- 参见[必填字段](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql.html#eql-required-fields)。

## 限制

参见 [EQL 限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql-syntax.html#eql-syntax-limitations)。

## 路径参数

- `<search_id>`（必需，字符串）

  搜索的标识符。

  异步搜索的搜索 ID 在 EQL 搜索 API 的响应中提供。如果请求的 `keep_on_completion` 参数为 `true`，也会提供搜索 ID。

## 查询参数

- `keep_alive`（可选，时间值）

  搜索及其结果存储在集群上的时间。默认为搜索的 EQL 搜索 API 请求中设置的 `keep_alive` 值。

  如果指定，此参数为搜索设置新的 `keep_alive` 时间，从获取异步 EQL 搜索 API 请求执行时开始。此新时间覆盖 EQL 搜索 API 请求中指定的时间。

  当此时间到期时，搜索及其结果将被删除，即使搜索仍在进行中。

- `wait_for_completion_timeout`（可选，时间值）

  等待请求完成的超时时间。默认为无超时，表示请求等待完整的搜索结果。

  如果指定此参数且请求在此期间完成，则返回完整的搜索结果。

  如果请求未在此期间完成，响应返回 `is_partial` 值为 `true`，且不返回搜索结果。

## 响应体

异步 EQL 搜索 API 返回与 EQL 搜索 API 相同的响应体。参见 [EQL 搜索 API 的响应体参数](./eql_search#响应体)。

## 示例

```json
GET /_eql/search/FkpMRkJGS1gzVDRlM3g4ZzMyRGlLbkEaTXlJZHdNT09TU2VTZVBoNDM3cFZMUToxMDM=
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-async-eql-search-api.html)
