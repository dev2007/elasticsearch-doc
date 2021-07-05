# 获取索引设置 API

返回一个或多个索引的设置信息。对数据流，此 API 为数据流的备份索引返回设置信息。

```bash
GET /my-index-000001/_settings
```

## 请求

`GET /<target>/_settings`

`GET /<target>/_settings/<setting>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `view_index_metadata`、`monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`

（可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

- `<setting>`

（可选，字符串）用于限制请求的逗号分隔的设置名字或通配符。

## 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，如果任何通配符表达式、索引别名或 `_all` 值只针对丢失或关闭的索引，则请求返回一个错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，但没有索引以 `bar` 开头，以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式能匹配的索引类型。如果请求目标为数据流，则此参数确定通配符表达式是否匹配隐藏的数据流则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔列表的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
2. `open`
匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
3. `closed`
匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
4. `hidden`
匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
5. `none`
不接受通配符表达式。

默认为 `open`。

- `flat_settings`

（可选，布尔值）如果为 `true`，以平面格式返回设置。默认为 `false`。

- `include_defaults`
（可选，布尔值）如果为 `true`，响应包含默认的映射值。默认为 `false`。

- `ignore_unavailable`

（可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `local`

（可选，布尔值）如果为 `true`，请求只从本地节点检索信息。默认为 `false`，意味着从主节点检索信息。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 示例

### 多数据流和索引

获取索引设置 API 可以用于一次请求获取超过一个数据流或索引的设置。为了获取一个集群中所有索引的设置，你可以为 `<target>`使用 `_all` 或 `*`。也支持通配符表达式。以下是一些示例：

```bash
GET /my-index-000001,my-index-000002/_settings

GET /_all/_settings

GET /log_2099_*/_settings
```

### 按名字过滤设置

返回的设置可以通过通配符匹配过滤，如下所示：

```bash
GET /log_2099_-*/_settings/index.number_*
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-settings.html)
