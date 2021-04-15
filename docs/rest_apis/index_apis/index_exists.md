# 索引存在

检查索引是否存在。

```bash
HEAD /my-index-000001
```

## 请求

`HEAD /<target>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`

（可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。

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

- `ignore_unavailable`

（可选，布尔值）如果为 `false`，请求不存在的索引将返回错误。默认为 `false`。

- `local`

（可选，布尔值）如果为 `true`，请求只从本地节点检索信息。默认为 `false`，意味着从主节点检索信息。

## 响应码

- `200`

表明所有指定的索引或索引别名存在。

- `404`

表明一个至多个索引或索引别名**不**存在。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-exists.html)
