# 搜索设置

以下专家设置可用于管理全局搜索和聚合限制。

## `indices.query.bool.max_clause_count`

> 在 8.0.0 中已弃用。（静态，整数）此已弃用的设置无效。

Elasticsearch 现在会动态设置查询中允许的最大子句数，使用基于搜索线程池大小和分配给 JVM 的堆大小的启发式方法。此限制的最小值为 1024，并且在大多数情况下会更大（例如，具有 30Gb RAM 和 48 个 CPU 的节点的最大子句数约为 27,000）。更大的堆会带来更高的值，更大的线程池会导致更低的值。

应尽可能避免使用包含大量子句的查询。如果你之前为了适应繁重的查询而调高了此设置，可能需要增加 Elasticsearch 可用的内存量，或减小搜索线程池的大小，以便为每个并发搜索提供更多可用内存。

在 Lucene 的早期版本中，你可以通过将布尔查询相互嵌套来绕过此限制，但现在该限制基于查询整体中叶子查询的总数，这种变通方法不再有效。

## `search.max_buckets`

（动态，整数）单个响应中允许的最大聚合桶数。默认为 65,536。

尝试返回超过此限制的请求将返回错误。

## `search.aggs.only_allowed_metric_scripts`

（动态，布尔值）配置在脚本化指标聚合中是否只能使用显式允许的脚本。默认为 `false`。

使用未包含在 `search.aggs.allowed_inline_metric_scripts` 或 `search.aggs.allowed_stored_metric_scripts` 中的脚本的请求将返回错误。

## `search.aggs.allowed_inline_metric_scripts`

（动态，字符串列表）当 `search.aggs.only_allowed_metric_scripts` 设置为 `true` 时，可以在脚本化指标聚合中使用的内联脚本列表。默认为空列表。

使用其他内联脚本的请求将返回错误。

## `search.aggs.allowed_stored_metric_scripts`

（动态，字符串列表）当 `search.aggs.only_allowed_metric_scripts` 设置为 `true` 时，可以在脚本化指标聚合中使用的存储脚本 ID 列表。默认为空列表。

使用其他存储脚本的请求将返回错误。

## `indices.query.bool.max_nested_depth`

（静态，整数）查询的最大嵌套深度。默认为 `30`。

此设置限制查询的嵌套深度。查询的深度嵌套可能导致堆栈溢出错误。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-settings.html)
