# 多重搜索 API

在一个 API 请求中执行多个搜索。

```bash
GET my-index-000001/_msearch
{ }
{"query" : {"match" : { "message": "this is a test"}}}
{"index": "my-index-000002"}
{"query" : {"match_all" : {}}}
```

## 请求

`GET /<target>/_msearch`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。对于跨集群搜索，参阅[配置跨集群搜索权限](/set_up_elasticsearch/remote_clusters/configure_roles_and_users_for_remote_clusters#配置跨集群搜索权限)。

## 描述

多重搜索 API 通过单个 API 请求执行多个搜索。请求的格式类似于批量 API 格式，并使用换行符分隔的JSON（NDJSON）格式。

结构如下：

```bash
header\n
body\n
header\n
body\n
```

此结构经过专门优化，以在特定搜索最终重定向到另一个节点时减少解析。

::: danger 警告
数据的最后一行必须以换行符 `\n` 结尾。每个换行符前面可以有一个回车符 `\r`。向该终端发送请求时，`Content-Type` 头应设置为 `application/x-ndjson`。
:::

## 路径参数

- `<target>`
  （可选，字符串）逗号分隔的用于搜索的数据流、索引和别名列表。

  如果请求正文中的搜索未指定 `index` 目标，此列表将用作备份。

  支持通配符（*）。为了在集群中搜索所有数据流和索引，忽略此参数或者使用 `_all` 或 `*`。

## 查询参数

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

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

- `ignore_throttled`
  （可选，布尔值）如果为 `true`，当冻结时，将忽略具体索引、扩展的或别名索引。默认为 `true`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，缺少或关闭的索引不包括在响应中。默认为 `false`。

- `max_concurrent_searches`
  （可选，整数）多重搜索 API 可以执行的最大并发搜索数。默认为 max(1, (# of [数据节点](/set_up_elasticsearch/configuring_elasticsearch/node.html#数据节点) * min([搜索线程池大小](/set_up_elasticsearch/configuring_elasticsearch/thread_pools.html), 10)))。

- `max_concurrent_shard_requests`
  （可选，整数）定义此搜索并发执行的每个节点的并发分片请求数。此值应用于限制搜索对集群的影响，以限制并发分片请求的数量。默认为 `5`。

  你可以使用此参数防止请求过载群集。例如，默认请求会命中集群中的所有数据流和索引。如果每个节点的分片数很高，这可能会导致分片请求被拒绝。

  在某些场景中，并行性不是通过并发请求实现的。在这些情况下，此参数中的低值可能会导致性能不佳。例如，在预期并发搜索请求数量非常少的环境中，此参数中的较高值可能会提高性能。

- `pre_filter_shard_size`
  （可选，整数）定义一个阈值，如果搜索请求扩展到的碎片数超过阈值，则该阈值将基于查询重写强制预筛选搜索碎片的预筛选往返。例如，如果一个分片无法根据其重写方法匹配任何文档，即如果日期筛选器必须匹配，但分片边界和查询不相交，则此筛选器往返可以显著限制分片的数量。未指定时，如果满足以下任何条件，则执行预过滤阶段：

  - 该请求针对 `128` 个以上的分片。
  - 该请求以一个或多个只读索引为目标。
  - 查询的主要排序以索引字段为目标。

- `rest_total_hits_as_int`
  (可选，布尔值)指示是否 `hits.total` 应在搜索响应中呈现为整数或对象。默认为 `false`，返回一个对象。

- `routing`
  （可选，字符串）用于将搜索操作路由到特定分片的自定义[路由值](/mapping/metadata_fields/_routing-field)。

- `search_type`
  （可选，字符串）如何为[相关性评分](/query_dsl/query_and_filter_context#相关性评分)计算[分布式词语频率](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)。

  - `search_type` 有效值
    - `query_then_fetch`
      （默认）对于运行搜索的每个分片，本地计算分布式词语频率。我们建议使用此选项进行更快的搜索，但评分可能不太准确。
    - `dfs_query_then_fetch`
      使用从运行搜索的所有分片收集的信息，全局计算分布式术语频率。虽然此选项提高了评分的准确性，但它为每个分片添加了一个往返，这可能会导致搜索速度变慢。

- `typed_keys`
  （可选，布尔值）如果为 `true`，聚合名和建议名在响应中以各自的类型作为前缀。默认为 `false`。

## 请求体

请求正文包含以换行符分隔的搜索 `<header>` 和搜索 `<body>` 对象列表。

- `<header>`
  （必需，对象）用于限制或更改搜索的参数。

  每个搜索正文都需要此对象，但可以为空（`{}`）或空行。

  - `<header>` 对象的属性

    - `allow_no_indices`
      （可选，布尔值）如果为 `true`，则如果通配符表达式或 `_all` 值仅检索缺少的或闭合的索引，则请求不会返回错误。

      此参数也适用于指向缺失索引或闭合索引的[别名](/aliases)。

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
      （可选，字符串或字符串数组）用于搜索的数据流、索引和别名。支持通配符（*）。指定多个目标作为数组。

      如果此参数未指定，`<target>` 请求路径参数用作备份。

    - `preference`
      （可选，字符串）用于执行搜索的节点或分片。默认随机。

    - `request_cache`
      （可选，布尔值）如果为 `true`，请求缓存可用于此搜索。默认为索引级设置。参阅[分片请求缓存设置](/set_up_elasticsearch/configuring_elasticsearch/shard_request_cache_setttings.html)。

    - `routing`
      （可选，字符串）用于将搜索操作路由到特定分片的自定义[路由值](/mapping/metadata_fields/_routing-field.html)。

    - `search_type`
      （可选，字符串）指示在对返回的文档进行评分时是否应使用全局术语和文档频率。

      可选项为：
      - `query_then_fetch`
        （默认）使用切分的本地词语语和文档频率对文档进行评分。这通常更快，但精确度较低。
      - `dfs_query_then_fetch`
        在所有分片中使用全局术语和文档频率对文档进行评分。这通常较慢，但更准确。

- `<body>`
  （可选，对象）包含用于搜索请求的参数。

  - `<body>` 的属性

    - `aggregations`
      （可选，[聚合对象](/aggregations/aggregations)）你希望在搜索过程中运行的聚合。参见[聚合](/aggregations/aggregations)。

    - `query`
      （可选，[查询 DSL 对象](/query_dsl/query_dsl)）你希望在搜索过程中运行的查询。与此查询匹配的命中将在响应中返回。

    - `from`
      （可选，整数）返回命中的起始偏移量。默认为 `0`。

    - `size`
      （可选，整数）返回的命中数量。默认为 `10`。

## 响应体

- `responses`
  （数组）包括与原始多搜索请求中的顺序相匹配的每个搜索请求的搜索响应和状态代码。如果特定搜索请求完全失败，将返回带有 `error` 消息和相应状态代码的对象来代替实际的搜索响应。

## 示例

头包括待搜索的数据流、索引和别名。头还指示 `search_type`、`preference` 和 `routing`。正文包括典型的搜索正文请求（包括 `query`、`aggregations`、`from`、`size` 等）。

```bash
$ cat requests
{"index" : "test"}
{"query" : {"match_all" : {}}, "from" : 0, "size" : 10}
{"index" : "test", "search_type" : "dfs_query_then_fetch"}
{"query" : {"match_all" : {}}}
{}
{"query" : {"match_all" : {}}}

{"query" : {"match_all" : {}}}
{"search_type" : "dfs_query_then_fetch"}
{"query" : {"match_all" : {}}}
```

```bash
$ curl -H "Content-Type: application/x-ndjson" -XGET localhost:9200/_msearch --data-binary "@requests"; echo
```

注意，上面包括一个空头的示例（也可以没有任何内容），它也受支持。

端点还允许你搜索请求路径中的数据流、索引和别名。在这种情况下，除非在头的 `index` 参数中明确指定，否则它将用作默认目标。例如：

```bash
GET my-index-000001/_msearch
{}
{"query" : {"match_all" : {}}, "from" : 0, "size" : 10}
{}
{"query" : {"match_all" : {}}}
{"index" : "my-index-000002"}
{"query" : {"match_all" : {}}}
```

上面将针对 `my-index-000001` 索引执行搜索，搜索未在请求正文中定义索引目标的所有请求。最后一次搜索将针对 `my-index-000002` 索引执行。

`search_type` 可以以类似的方式设置，以全局应用于所有搜索请求。

## 安全

参阅[基于 URL 的访问控制](/rest_apis/api_convention/url_based_access_control)。

## 部分响应

为了确保快速响应，如果一个或多个分片失败，多搜索 API 将响应部分结果。有关更多信息，参阅[分片故障](/rest_apis/document_apis/reading_and_writing_documents#分片故障)。

## 取消搜索

可以使用标准的[任务取消](/rest_apis/cluster_apis/task_management)机制取消多重搜索，并且当客户端关闭用于执行请求的 http 连接时，也会自动取消多次搜索。当请求超时或中止时，发送请求的 http 客户端必须关闭连接。取消多重搜索请求也将取消所有相应的子搜索请求。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html)
