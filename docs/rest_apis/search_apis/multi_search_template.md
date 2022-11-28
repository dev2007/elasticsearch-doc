# 多搜索 API

使用单个请求运行多个[模板搜索](/search_your_data/search_templates#运行多模板搜索)。

```bash
GET my-index/_msearch/template
{ }
{ "id": "my-search-template", "params": { "query_string": "hello world", "from": 0, "size": 10 }}
{ }
{ "id": "my-other-search-template", "params": { "query_type": "match_all" }}
```

## 请求

`GET <target>/_msearch/template`

`GET _msearch/template`

`POST <target>/_msearch/template`

`POST _msearch/template`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。对于跨集群搜索，参阅[配置跨集群搜索权限](/set_up_elasticsearch/remote_clusters/configure_roles_and_users_for_remote_clusters#配置跨集群搜索权限)。

## 路径参数

- `<target>`
  （可选，字符串）逗号分隔的用于搜索的数据流、索引和别名列表。

  如果请求正文中的搜索未指定 `index` 目标，此列表将用作备份。

  支持通配符（*）。为了在集群中搜索所有数据流和索引，忽略此参数或者使用 `_all` 或 `*`。

## 查询参数

- `ccs_minimize_roundtrips`
  （可选，布尔值）如果为 `true`，在执行跨集群搜索（CCS）请求时，协调节点和远程集群之间的网络往返行程最小化。参阅 [跨群集搜索如何处理网络延迟](/search_your_data/search_across_clusters#跨群集搜索如何处理网络延迟)。默认为 `true`。

- `max_concurrent_searches`
  （可选，整数）多重搜索 API 可以执行的最大并发搜索数。默认为 max(1, (# of [数据节点](/set_up_elasticsearch/configuring_elasticsearch/node#数据节点) * min([搜索线程池大小](/set_up_elasticsearch/configuring_elasticsearch/thread_pools), 10)))。

- `rest_total_hits_as_int`
  (可选，布尔值)指示是否 `hits.total` 应在搜索响应中呈现为整数或对象。默认为 `false`，返回一个对象。

- `search_type`
  （可选，字符串）搜索操作类型。可用选项：
  - `query_then_fetch`
  - `dfs_query_then_fetch`

- `typed_keys`
  （可选，布尔值）如果为 `true`，响应在聚合和建议器名称前加上各自的类型。默认为 `false`。

## 请求体

请求正文必须是以下格式的换行分隔 JSON（NDJSON）：

```bash
<header>\n
<body>\n
<header>\n
<body>\n
```

每个 `<header>` 和 `<body>`，一对代表一个搜索请求。

`<header>` 支持与 [多搜索 API](/rest_apis/search_apis/multi_search) 的 `<header>` 相同的参数。`<body>` 支持与 [搜索模板 API](/rest_apis/search_apis/search_template) 的请求体相同的参数。

- `<header>`
  （必需，对象）用于限制或更改搜索的参数。

  每个搜索正文都需要此对象，但可以为空（{}）或空行。

  `<header>` 对象的属性

  - `allow_no_indices`
    （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

    此参数也适用于指向缺失索引或索引的[别名](/aliases)。

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
    （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

  - `index`
    （可选，字符串或字符串数组）用于搜索的数据流、索引和别名。支持通配符（*）。可将多个目标指定为一个数组。

    如果此参数未指定，`<target>` 请求路径参数将用于备选。

  - `preference`
    （可选，字符串）用于执行搜索的节点或分片。默认随机。

  - `request_cache`
    （可选，布尔值）如果为 `true`，请求缓存可用于此搜索。默认为索引级设置。参阅[分片请求缓存设置](/set_up_elasticsearch/configuring_elasticsearch/shard_request_cache_setttings)。

  - `routing`
    （可选，字符串）用于搜索操作路由到特定分片的自定义[路由值](/mapping/metadata_fields/_routing_field)。

  - `search_type`
    （可选，字符串）指示在对返回的文档进行评分时是否应使用全局词语和文档频率。

    选项有：

    - `query_then_fetch`
      （默认）使用切分的本地词语和文档频率对文档进行评分。这通常更快，但更不准确。
    - `dfs_query_then_fetch`
      在所有分片中使用全局词语和文档频率对文档进行评分。这通常较慢，但更准确。
  
- `<body>`
  （必需，对象）用于搜索的参数。

  - `explain`
    （可选，布尔值）如果为 `true`，作为命中的一部分返回有关分数计算的详细信息。默认为 `false`。

  - `id`
    （必需，字符串）用于搜索的模板 ID。如果没有指定 `source`，此参数必需。

  - `params`
    （可选，对象）用于替换模板中Mustache变量的键值对。关键是变量名。该值是可变值。

  - `profile`
    （可选，布尔值）如果为 `true`，查询执行的是已优化的。默认为 `false`。

  - `source`
    （必需，对象）内联搜索模板。支持与 [搜索 API](/rest_apis/search_apis/search)的请求正文相同的参数。还支持 [Mustache](https://mustache.github.io/) 变量。

    如果 `id` 未指定，此参数必需。

## 响应码

只有当请求本身失败时，API 才会返回 `400` 状态代码。如果请求中的一个或多个搜索失败，API 将为响应中的每个失败搜索返回一个 `200` 状态代码和一个错误对象。

## 响应体

- `responses`
  （对象数组）每次搜索的结果，按提交的顺序返回。每个对象使用与搜索 API 响应相同的属性。

  如果搜索失败，则响应包括包含错误消息的错误对象。

## curl 请求

如果为 curl 提供文本文件或文本输入，请使用标志 `--data-binary` 而不是 `-d` 来保留换行符。

```bash
$ cat requests
{ "index": "my-index" }
{ "id": "my-search-template", "params": { "query_string": "hello world", "from": 0, "size": 10 }}
{ "index": "my-other-index" }
{ "id": "my-other-search-template", "params": { "query_type": "match_all" }}

$ curl -H "Content-Type: application/x-ndjson" -XGET localhost:9200/_msearch/template --data-binary "@requests"; echo
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/multi-search-template.html)
