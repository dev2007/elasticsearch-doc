# 搜索模板 API

使用一个[搜索模板](/search_your_data/search_templates)执行搜索。

```bash
GET my-index/_search/template
{
  "id": "my-search-template",
  "params": {
    "query_string": "hello world",
    "from": 0,
    "size": 10
  }
}
```

## 请求

`GET <target>/_search/template`

`GET _search/template`

`POST <target>/_search/template`

`POST _search/template`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。对于跨集群搜索，参阅[配置跨集群搜索权限](/set_up_elasticsearch/remote_clusters/configure_roles_and_users_for_remote_clusters#配置跨集群搜索权限)。

## 路径参数

- `<target>`
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。为了搜索所有数据流和索引，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `ccs_minimize_roundtrips`
  （可选，布尔值）如果为 `true`，在执行跨集群搜索（CCS）请求时，协调节点和远程集群之间的网络往返行程最小化。参阅 [跨群集搜索如何处理网络延迟](/search_your_data/search_across_clusters#跨群集搜索如何处理网络延迟)。默认为 `true`。

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

- `explain`
  （可选，布尔值）如果为 `true`，作为命中的一部分返回有关分数计算的详细信息。默认为 `false`

-`ignore_throttled`
  （可选，布尔值）如果为 `true`，具体、展开或别名索引在冻结时将忽略。默认值为 `true`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `preference`
  （可选，字符串）用于执行搜索的节点或分片。默认随机。

- `rest_total_hits_as_int`
  (可选，布尔值)指示是否 `hits.total` 应在搜索响应中呈现为整数或对象。默认为 `false`，返回一个对象。

- `routing`
  （可选，字符串）用于路由操作到指定分片的自定义值。

- `scroll`
  （可选，[时间值](/rest_apis/api_convention/common_options#时间单位)）指定滚动搜索时索引的一致视图应保持多长时间。

- `search_type`
  （可选，字符串）搜索操作的类型。可选项：

  - `query_then_fetch`
  - `dfs_query_then_fetch`

- `typed_keys`
  （可选，布尔值）如果为 `true`，则响应会在聚合和建议器名称前加上它们各自的类型。默认为 `false`。

## 请求体

- `explain`
  （可选，布尔值）如果为 `true`，作为命中的一部分返回有关分数计算的详细信息。默认为 `false`。

  如果你同时指定了此参数和查询参数中的 `explain`，API 仅使用查询参数。

- `id`
  （必需，字符串）要使用的搜索模板的ID。如果未指定 `source`，则需要此参数。

- `params`
  （可选，对象）用于替换模板中的 Mustache 变量的键值对。键是变量名，值是变量值。

- `profile`
  （可选，布尔值）如果为 `true`，查询执行是已优化的。默认为 `false`。

- `source`
  （必需，对象）内联搜索模板。支持与 [搜索 API](/rest_apis/search_apis/search)的请求正文相同的参数。还支持 [Mustache](https://mustache.github.io/) 变量。

  如果 `id` 未指定，此参数必需。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-template-api.html)
