# 删除索引 API

删除已有的索引。

```bash
DELETE /my-index-000001
```

## 请求

`DELETE /<index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `delete_index` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<index>`

（必需的，字符串）待删除的索引的逗号分隔列表或通配符表达式。

在这个参数中，通配符表达式只能匹配开启、具体的索引。你不能通过[别名](/rest_apis/index_apis/bulk_index_alias)删除索引。

为了删除所有索引，使用 `_all` 或 `*`。为了禁止使用 `_all` 或通配符表达式删除索引，修改 `action.destructive_requires_name` 集群设置为 `true`。你可以在 `elasticsearch.yml` 文件中或通过[集群更新](/rest_apis/cluster_apis/cluster_update_settings) API 更新设置。

?> 你不能删除数据流的当前写入索引。为了删除索引，你必须[翻转](/data_streams/data_streams?id=翻转)数据流，这样一个新的写索引就创建了。这时你就可以使用删除索引 API 删除之前的写索引。

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

- `ignore_unavailable`
（可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-index.html)
