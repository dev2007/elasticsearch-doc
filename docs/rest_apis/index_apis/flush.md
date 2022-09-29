# 冲刷 API

冲刷一个或多个数据流或索引。

```bash
POST /my-index-000001/_flush
```

## 请求

`POST /<target>/_flush`

`GET /<target>/_flush`

`POST /_flush`

`GET /_flush`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `maintenance` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

冲刷数据流或索引是确保当前仅存储在事务日志中的任何数据也永久存储在 Lucene 索引中的过程。重新启动时，Elasticsearch 将重放从[事务日志](/index_modules/translog)到 Lucene 索引的所有未冲刷操作，以使其恢复到重新启动前的状态。Elasticsearch 会根据需要自动触发冲刷，使用试探法权衡未冲刷事务日志的大小和执行每次冲刷的成本。

一旦每个操作被冲刷，它将永久存储在 Lucene 索引中。这可能意味着不需要在事务日志中维护它的附加副本，除非[出于其他原因保留它](/index_modules/translog#事务日志保留)。事务日志由多个文件组成，称为年代，一旦不再需要，Elasticsearch 将删除任何年代文件，从而释放磁盘空间。

也可以使用冲刷 API 触发对一个或多个索引的冲刷，尽管用户很少需要直接调用此 API。如果在索引某些文档后调用冲刷 API，则成功的响应表明 Elasticsearch 已冲刷在调用冲刷 API 之前索引的所有文档。

## 路径参数

- `<target>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

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

- `force`

  （可选，布尔值）如果为 `true`，即使没有变更要提交给索引，请求也强制冲刷。默认为 `true`。

  可使用此参数来参加事务日志的年代值。

  此参数视为内部参数。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失或关闭的索引不包含在响应中。

  默认为 `false`。

- `wait_if_ongoing`

  （可选，布尔值）如果为 `true`，当另一个冲刷操作运行时，冲刷操作会阻塞到执行为止。

  如果为 `false`，当另一个冲刷操作运行时，请求冲刷操作时，Elasticsearch 会直接返回错误。

  默认为 `true`。

## 示例

### 冲刷指定的数据流或索引

```bash
POST /my-index-000001/_flush
```

### 冲刷多个数据流和索引

```bash
POST /my-index-000001,my-index-000002/_flush
```

### 冲刷集群中所有数据流和索引

```bash
POST /_flush
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-flush.html)