# 删除异步 EQL 搜索 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[EQL API](/rest_apis/eql_qpis/eql_qpis)。

::::

删除异步 EQL 搜索或已存储的同步 EQL 搜索。此 API 还会删除搜索的结果。

## 请求

```json
DELETE /_eql/search/<search_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，只有以下用户可以使用此 API 删除搜索：
  - 拥有 `cancel_task` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)的用户
  - 首次提交搜索的用户

## 限制

参见 [EQL 限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql-syntax.html#eql-limitations)。

## 路径参数

- `<search_id>`（必需，字符串）

  要删除的搜索的标识符。

  异步搜索的搜索 ID 在 EQL 搜索 API 的响应中提供。如果请求的 `keep_on_completion` 参数为 `true`，也会提供搜索 ID。

## 示例

```json
DELETE /_eql/search/FkpMRkJGS1gzVDRlM3g4ZzMyRGlLbkEaTXlJZHdNT09TU2VTZVBoNDM3cFZMUToxMDM=
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-async-eql-search-api.html)
