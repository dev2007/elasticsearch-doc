# 别名存在 API

检查一个[别名](/aliases)是否存在。

```bash
HEAD _alias/my-alias
```

## 请求

`HEAD _alias/<alias>`

`HEAD <target>/_alias/<alias>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须对索引有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。如果你指定一个目标，你必须对目标也有 `view_index_metadata` 或 `manage` 索引权限。

## 路径参数

- `<alias>`

  （可选，字符串）以逗号分隔的待检查的别名列表。支持通配符（*）。

- `<target>`

  （可选，字符串）用于限制请求的，逗号分隔的数据流或索引。

## 查询参数

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

  默认为 `all`。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `local`

  （可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

## 响应码

- `200`

  所有指定的别名都存在。

- `404`

  一个或多个指定的别名不存在。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-alias-exists.html)
