# ES|QL 异步查询删除 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [ES|QL 异步查询删除 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-esql-async-query-delete)。

:::::

ES|QL 异步查询删除 API 用于通过 ID 手动删除异步查询。如果查询仍在运行，则取消该查询。否则，删除存储的结果。

## 请求

```bash
DELETE /_query/async/<query_id>
```

## 前置条件

如果启用了 Elasticsearch 安全功能，只有以下用户可以使用此 API 删除查询：

- 提交原始查询请求的已认证用户
- 拥有 `cancel_task` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)的用户

## 路径参数

- `<query_id>`

  （必需，字符串）要删除的查询的标识符。

  对于未在等待时间内完成的查询，ES|QL 异步查询 API 的响应中会提供查询 ID。如果请求的 `keep_on_completion` 参数为 `true`，也会提供查询 ID。

## 示例

```bash
DELETE /_query/async/FkpMRkJGS1gzVDRlM3g4ZzMyRGlLbkEaTXlJZHdNT09TU2VTZVBoNDM3cFZMUToxMDM=
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-async-query-delete-api.html)
