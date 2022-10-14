# 断路器设置

Elasticsearch 包含多个断路器，用于防止操作导致 OutOfMemoryError。每个断路器都指定了它可以使用多少内存的限制。此外，还有一个父级断路器，它指定可以跨所有断路器使用的内存总量。

除非另有说明，否则可以使用 [集群更新设置 API](/rest_apis/cluster_apis/cluster_update_setting) 在活动集群上动态更新这些设置。

有关断路器错误的信息，参阅[断路器错误](/troubleshooting/circuit-breaker_errors)。

## 父断路器

父级断路器可以配置以下设置：

- `indices.breaker.total.use_real_memory`

  （[静态](/set_up_elasticsearch/configuring_elasticsearch)）确定父断路器是应考虑实际内存使用（`true`）还是仅考虑子断路器保留的内存量（`false`）。默认为 `true`。

- `indices.breaker.total.limit` [![Elasticsearch 服务支持](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）整体母断路器的启动限制。如果 `indices.breaker.total.use_real_memory` 为 `false`，则默认 JVM 堆为 70%。。如果 `indices.breaker.total.use_real_memory` 为 `true`，默认 JVM 堆为 95%。

## 字段数据断路器

字段数据断路器估计将字段加载到字段数据缓存所需的堆内存。如果加载字段会导致缓存超过预定义的内存限制，断路器将停止操作并返回错误。

- `indices.breaker.fielddata.limit` [![Elasticsearch 服务支持](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）现场数据断路器的限制。默认为 JVM 堆的 40%。

- `indices.breaker.fielddata.overhead` [![Elasticsearch 服务支持](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）将所有现场数据估计值相乘以确定最终估计值的常数。默认为 `1.03`。

## 请求断路器

请求断路器允许 Elasticsearch 防止每个请求的数据结构（例如，请求期间用于计算聚合的内存）超过一定的内存量。

- `indices.breaker.request.limit` [![Elasticsearch 服务支持](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）请求断路器的限制，默认为 JVM 堆的 60%。

- `indices.breaker.request.overhead` [![Elasticsearch 服务支持](https://doc-icons.s3.us-east-2.amazonaws.com/logo_cloud.svg)](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）一个常数，所有请求估计都与之相乘以确定最终估计。默认为 `1`。

## 动态请求断路器

动态请求断路器允许 Elasticsearch 限制传输或 HTTP 级别上所有当前活动传入请求的内存使用，使其不超过节点上的特定内存量。内存使用情况基于请求本身的内容长度。这个断路器还考虑到，不仅需要内存来表示原始请求，而且还需要内存作为一个结构化对象，由默认开销反映出来。

- `network.breaker.inflight_requests.limit`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）运行中请求断路器的限制，默认为 JVM 堆的 100%。这意味着它受到为主断路器配置的限制的约束。

- `network.breaker.inflight_requests.overhead`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）一个常数，所有动态请求估值都乘以该常数以确定最终估值。默认为 `2`。

## 记账请求断路器

记帐断路器允许 Elasticsearch 限制内存中保存的、请求完成时未释放的内容的内存使用。这包括 Lucene 段内存之类的东西。

- `indices.breaker.accounting.limit`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）记帐断路器的限制，默认为 JVM 堆的 100%。这意味着它受到为主断路器配置的限制的约束。

- `indices.breaker.accounting.overhead`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）将所有记账估值相乘以确定最终估值的常数。默认为 1。

## 脚本编译断路器

与以前基于内存的断路器略有不同，脚本编译断路器限制了一段时间内内联脚本编译的数量。

- `script.max_compilations_rate`

  （[动态](/set_up_elasticsearch/configuring_elasticsearch#集群和节点设置类型)）限制在特定间隔内允许编译的唯一动态脚本的数量。默认为 `150/5m`，即每 5 分钟 150 次。

如果集群定期达到给定的 `max_compilation_rate`，则脚本缓存可能大小不足，请使用[节点统计](/rest_apis/cluster_apis/nodes_stats)检查最近缓存收回的数量、 `script.cache_evictions_history` 和编译 `script.compilations_hiology`。如果最近有大量缓存收回或编译，脚本缓存可能大小不足，请考虑通过设置 `script.cache.max_size` 将脚本缓存的大小加倍。

有关详细信息，参阅[脚本](/scripting/how_to_write_scripts/)文档的“首选参数”部分。

## 正则断路器

编写不好的正则表达式会降低集群的稳定性和性能。正则断路器限制了 [Painless 脚本中正则](/painless_language_specification/regexes)的使用和复杂性。

- `script.painless.regex.enabled`

  （[静态](/set_up_elasticsearch/configuring_elasticsearch)）在 Painless 脚本中启用正则。允许以下值：

  - `limited` (**默认**)

    启用正则，但使用 `script.painles.regex.limit-factor` 集群设置限制复杂度。

  - `true`

    启用正则并不限制复杂度。禁用正则断路器。

  - `false`

    禁用正则。任何包含正则表达式的 Painless 脚本都会返回一个错误。

- `script.painless.regex.limit-factor`

  （[静态](/set_up_elasticsearch/configuring_elasticsearch)）限制 Painless 脚本中正则表达式可以考虑的字符数。Elasticsearch 通过将设置值乘以脚本输入的字符长度来计算此限制。

  例如，输入 `foobarbaz` 的字符长度为 `9`。如果是 `script.painless.regex.limit-factor` 为 `6`，`foobarbaz` 上的正则表达式最多可以考虑 54（9 * 6）个字符。如果表达式超过此限制，则会触发正则断路器并返回错误。

  Elasticsearch 仅在 `script.painless.regex.enabled` 为 `limited` 时应用此限制。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/circuit-breaker.html)
