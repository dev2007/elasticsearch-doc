# 获取异步 EQL 搜索状态 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[EQL API](/rest_apis/eql_qpis/eql_qpis)。

::::

返回异步 EQL 搜索或已存储的同步 EQL 搜索的当前状态，**不返回结果**。此 API 比获取异步 EQL 搜索 API 更轻量，因为它不返回搜索结果，仅报告状态。

## 请求

```json
GET /_eql/search/status/<search_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，访问获取异步 EQL 搜索状态 API 仅限 `monitoring_user` 角色的用户。

## 路径参数

- `<search_id>`（必需，字符串）

  搜索的标识符。

  异步搜索的搜索 ID 在 EQL 搜索 API 的响应中提供。如果请求的 `keep_on_completion` 参数为 `true`，也会提供搜索 ID。

## 查询参数

- `keep_alive`（可选，时间值）

  指定搜索应保持存活的时间。例如：`5d`（5 天）。

## 响应体

- `id`（字符串）

  搜索的标识符。

- `is_running`（布尔值）

  如果为 `true`，搜索请求仍在执行。如果为 `false`，搜索已完成。

- `is_partial`（布尔值）

  如果为 `true`，响应不包含完整的搜索结果。这可能是因为搜索仍在运行（`is_running` 为 `true`），或者搜索已完成（`is_running` 为 `false`）但由于失败或超时结果为部分结果。

- `start_time_in_millis`（long）

  对于正在运行的搜索，显示 EQL 搜索开始时的时间戳，以自 Unix 纪元以来的毫秒数表示。

- `expiration_time_in_millis`（long）

  显示 EQL 搜索过期时的时间戳，以自 Unix 纪元以来的毫秒数表示。当达到此时间时，搜索及其结果将被删除，即使搜索仍在进行中。

- `completion_status`（整数）

  对于已完成的搜索，显示已完成搜索的 HTTP 状态码。

## 示例

```json
GET /_eql/search/status/FmNJRUZ1YWZCU3dHY1BIOUhaenVSRkEaaXFlZ3h4c1RTWFNocDdnY2FSaERnUTozNDE=?keep_alive=5d
```

### 搜索仍在运行时的响应

如果搜索仍在运行，状态响应具有以下形式：

```json
{
  "id" : "FmNJRUZ1YWZCU3dHY1BIOUhaenVSRkEaaXFlZ3h4c1RTWFNocDdnY2FSaERnUTozNDE=",
  "is_running" : true,
  "is_partial" : true,
  "start_time_in_millis" : 1611690235000,
  "expiration_time_in_millis" : 1611690295000
}
```

### 搜索完成时的响应

如果搜索已完成，状态响应**不包含** `start_time_in_millis`，但有一个额外的 `completion_status` 字段，显示已完成的 EQL 搜索的状态码：

```json
{
  "id" : "FmNJRUZ1YWZCU3dHY1BIOUhaenVSRkEaaXFlZ3h4c1RTWFNocDdnY2FSaERnUTozNDE=",
  "is_running" : false,
  "is_partial" : false,
  "expiration_time_in_millis" : 1611690295000,
  "completion_status" : 200
}
```

`completion_status: 200` 表示 EQL 搜索已成功完成。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-async-eql-status-api.html)
