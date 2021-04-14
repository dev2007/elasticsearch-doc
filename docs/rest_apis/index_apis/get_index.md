# 获取索引 API

返回一个或多个索引的信息。对于数据流，API 返回有关流的支持索引的信息。

```bash
GET /my-index-000001
```

?> 在 7.0.0 之前，**mappings**（映射） 定义用于包含类型名称。虽然响应中的映射不再默认包含类型名称，你仍然可以通过参数 include_type_name 请求旧的格式。更多细节，参阅[删除映射类型](/mapping/removal_of_mapping_types)。

## 请求

`GET /<target>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`

（必需的，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。

若要以集群中的所有数据流和索引为目标，省略此参数或使用 `_all` 或 `*`。

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

- `flat_settings`

（可选，布尔值）如果为 `true`，以平面格式返回设置。默认为 `false`。

- `include_defaults`

（可选，字符串）如果为 `true`，在响应中返回所有默认设置。默认为 `false`。

- `include_type_name`

[~~7.0.0~~开始不推荐]（可选，布尔值）如果为 `true`，映射体中期望有映射类型。默认为 `false`。

- `ignore_unavailable`

（可选，布尔值）如果为 `false`，请求不存在的索引将返回错误。默认为 `false`。

- `local`

（可选，布尔值）如果为 `true`，请求只从本地节点检索信息。默认为 `false`，意味着从主节点检索信息。

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-index.html)
