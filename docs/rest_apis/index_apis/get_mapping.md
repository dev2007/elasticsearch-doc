# 获取映射 API

获取一个或多个索引的[映射定义](/mapping/mapping)。对数据流而言，此 API 获取数据流的备份索引的映射。

```bash
GET /my-index-000001/_mapping
```

::: tip 提示
在版本 7.0.0 之前，映射的定义用于包含类型名字。即使在请求中指定类型不被推荐，但如果设置了请求参数 `include_type_name`，仍然可以提供类型。更多细节，参阅 [移除映射类型](/mapping/removal_of_mapping_types)。
:::

## 请求

`GET /_mapping`

`GET /<target>/_mapping`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或索引别名必须有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 路径参数

`<target>`

（可选，字符串）用于限制请求的，逗号分隔的数据流、索引和别名列表。支持通配符（*）。为了标明所有数据流和索引，省略这个参数或者使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，如果任何通配符表达式、索引别名或 `_all` 值只针对丢失或关闭的索引，则请求返回一个错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，但没有索引以 `bar` 开头，以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式能匹配的索引类型。如果请求目标为数据流，则此参数确定通配符表达式是否匹配隐藏的数据流则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔列表的值，如 `open,hidden`。有效的值有：

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

- `include_type_name`
[~~7.0.0~~开始不推荐] （可选，布尔值）如果为 `true`，映射体中需要映射类型。

- `ignore_unavailable`
（可选，布尔值）如果为 `true`，请求不存在的索引将返回错误。默认为 `false`。

- `local`
（可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 示例

### 多个数据流和索引

获取映射 API 可以一次请求获取多个数据流或索引。此 API 通常按以下语法使用：`host:port/<target>/_mapping`，`<target>` 可接受逗号分隔的名字列表。为了获取集群中所有数据流和索引，`<target>` 使用 `_all` 或 `*`，或者忽略参数 `<target>`。以下为一些示例：

```bash
GET /my-index-000001,my-index-000002/_mapping
```

如果你想获取集群中所有索引的映射，以下示例都是等价的：

```bash
GET /*/_mapping

GET /_all/_mapping

GET /_mapping
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-mapping.html)
