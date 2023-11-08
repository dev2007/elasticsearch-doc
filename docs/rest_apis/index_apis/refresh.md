# 刷新 API

刷新使最近对一个或多个索引执行的操作可用于搜索。对于数据流，API 在流的备份索引上执行刷新操作。有关刷新操作的更多信息，参阅[接近实时的搜索](/search_your_data/near_real-time_search)。

```bash
POST /my-index-000001/_refresh
```

## 请求

`POST <target>/_refresh`

`GET <target>/_refresh`

`POST /_refresh`

`GET /_refresh`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `maintenance` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

使用刷新 API 显式地使自上次刷新以来对一个或多个索引执行的所有操作可用于搜索。如果请求目标是数据流，它将刷新数据流的备份索引。

默认情况下，Elasticsearch 每秒定期刷新索引，但仅针对在过去 30 秒内收到一个或多个搜索请求的索引。你可以使用设置 [index.refresh_interval](/index_modules) 修改默认间隔。

刷新请求是异步的，不会返回响应直到刷新操作完成。

:::caution 警告
刷新是资源密集型的。为了确保良好的集群性能，我们建议尽可能等待 Elasticsearch 的定期刷新，而不是执行显式刷新。
如果应用程序工作流为文档编制索引，然后运行搜索以检索索引文档，则建议使用[索引 API](/rest_apis) 的 `refresh=wait_for` 参数选项。此选项确保索引操作在运行搜索之前等待定期刷新。
:::

## 路径参数

- `<target>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `expand_wildcards`

  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax#隐藏数据流和索引)（隐藏的）。
  2. `open`
  匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
  3. `closed`
  匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
  4. `hidden`
  匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
  5. `none`
  不接受通配符表达式。

  默认为 `open`。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失或关闭的索引不包含在响应中。

  默认为 `false`。

## 示例

### 刷新多个数据流和索引

```bash
POST /my-index-000001,my-index-000002/_refresh
```

### 刷新集群中所有数据流和索引

```bash
POST /_refresh
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-refresh.html)
