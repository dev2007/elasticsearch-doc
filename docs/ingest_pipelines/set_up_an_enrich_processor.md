# 设置富化处理器

要设置富化处理器，请按以下步骤操作：

1. 查看[前置条件](#前置条件)。
2. [添加富化数据](#添加富化数据)。
3. [创建富化策略](#创建富化策略)。
4. [执行富化策略](#执行富化策略)。
5. [将富化处理器添加到摄取管道](#将富化处理器添加到摄取管道)。
6. [摄取并丰富文档](#摄取并丰富文档)。

设置好富化处理器之后，你可以[更新富化数据](#更新富化索引)和[更新富化策略](#更新富化策略)。

::::danger 重要
富化处理器会执行多个操作，可能会影响摄取管道的速度。

我们强烈建议在生产环境中部署富化处理器之前对其进行测试和基准测试。

我们不建议使用富化处理器来追加实时数据。富化处理器最适用于不经常变化的参考数据。
::::

## 前置条件

要使用富化策略，你必须拥有：

- 任何使用的索引的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
- `enrich_user` [内置角色](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/built-in-roles.html)

## 添加富化数据

首先，将文档添加到一个或多个源索引。这些文档应包含你最终希望添加到传入数据中的富化数据。

你可以像管理常规 Elasticsearch 索引一样，使用[文档 API](/rest_apis/document_apis/docs_index) 和[索引 API](/rest_apis/index_apis/create_index) 来管理源索引。

你还可以设置 [Beats](https://www.elastic.co/guide/en/beats/libbeat/8.18/getting-started.html)（例如 [Filebeat](https://www.elastic.co/guide/en/beats/filebeat/8.18/filebeat-installation-configuration.html)），自动将文档发送并索引到你的源索引。参阅 [Beats 入门](https://www.elastic.co/guide/en/beats/libbeat/8.18/getting-started.html)。

## 创建富化策略

将富化数据添加到源索引后，使用[创建富化策略 API](/rest_apis/enrich_apis/put_enrich_policy) 或 [Kibana 中的索引管理](https://www.elastic.co/guide/en/kibana/current/index-management.html)来创建富化策略。

::::note 提示
富化策略创建后，你无法更新或更改它。参阅[更新富化策略](#更新富化策略)。
::::

## 执行富化策略

创建富化策略后，你需要使用[执行富化策略 API](/rest_apis/enrich_apis/execute_enrich_policy) 或 [Kibana 中的索引管理](https://www.elastic.co/guide/en/kibana/current/index-management.html)来执行它，以创建一个[富化索引](/ingest_pipelines/enrich_your_data)。

富化索引包含来自策略源索引的文档。富化索引始终以 `.enrich-*` 开头，是只读的，并且经过了 [force merge](/rest_apis/index_apis/forcemerge)。

::::danger 重要
富化索引应仅由[富化处理器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-processor.html)或 ES|QL 的 `ENRICH` 命令使用。避免将富化索引用于其他目的。
::::

## 将富化处理器添加到摄取管道

准备好源索引、富化策略和相关的富化索引后，你就可以设置一个包含你的策略的富化处理器的摄取管道。

定义一个[富化处理器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-processor.html)，并使用[创建或更新管道 API](/rest_apis/ingest_apis/put_pipeline) 将其添加到摄取管道。

定义富化处理器时，你必须至少包含以下内容：

- 要使用的富化策略。
- 用于将传入文档与富化索引中的文档进行匹配的字段。
- 要添加到传入文档的目标字段。此目标字段包含富化策略中指定的匹配字段和富化字段。

你还可以使用 `max_matches` 选项设置传入文档可以匹配的富化文档数量。如果设置为默认值 `1`，数据将以 JSON 对象的形式添加到传入文档的目标字段。否则，数据将以数组形式添加。

完整的配置选项列表参阅[富化](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-processor.html)。

你还可以向摄取管道添加其他[处理器](/ingest_pipelines/ingest_pipelines)。

## 摄取并丰富文档

现在，你可以使用摄取管道来丰富和索引文档。

::::tip 注意
在生产环境中实施管道之前，我们建议先索引几个测试文档，并使用[获取文档 API](/rest_apis/document_apis/get) 验证富化数据是否已正确添加。
::::

## 更新富化索引

富化索引一旦创建，你就无法更新它或向其索引文档。相反，你应该更新源索引并再次[执行](/rest_apis/enrich_apis/execute_enrich_policy)富化策略。这会根据更新后的源索引创建一个新的富化索引。之前的富化索引将由一个延迟维护任务删除，默认每 15 分钟执行一次。

如果需要，你可以使用你的摄取管道对任何已摄取的文档进行[重索引](/rest_apis/document_apis/reindex)或[更新](/rest_apis/document_apis/update_by_query)。

## 更新富化策略

富化策略一旦创建，你就无法更新或更改它。不过，你可以：

1. 创建并[执行](/rest_apis/enrich_apis/execute_enrich_policy)一个新的富化策略。
2. 在任何使用中的富化处理器或 ES|QL 查询中，用新的富化策略替换之前的富化策略。
3. 使用[删除富化策略](/rest_apis/enrich_apis/delete_enrich_policy) API 或 [Kibana 中的索引管理](https://www.elastic.co/guide/en/kibana/current/index-management.html)删除之前的富化策略。

## 富化组件

富化协调器（enrich coordinator）是在每个摄取节点上管理和执行富化文档所需搜索的组件。它将所有管道中所有富化处理器的搜索合并为批量[多搜索](/rest_apis/search_apis/multi_search)。

富化策略执行器（enrich policy executor）是管理所有富化策略执行的组件。当富化策略被执行时，此组件会创建一个新的富化索引并删除之前的富化索引。富化策略的执行由当选的主节点管理。这些策略的执行发生在另一个节点上。

## 节点设置

`enrich` 处理器具有用于富化协调器和富化策略执行器的节点设置。

富化协调器支持以下节点设置：

- `enrich.cache_size`

  用于缓存富化文档的搜索的缓存的最大大小。该大小可以用三种单位指定：缓存的原始搜索数（例如 `1000`）、以字节为单位的绝对大小（例如 `100Mb`），或节点最大堆空间的百分比（例如 `1%`）。对于绝对字节大小和堆空间百分比，Elasticsearch 不保证富化缓存大小严格遵守该最大值，因为 Elasticsearch 使用的是序列化搜索响应的字节大小，它能很好地表示堆上的已用空间，但并非精确匹配。默认为 `1%`。集群中的所有富化处理器共享一个缓存。

- `enrich.coordinator_proxy.max_concurrent_requests`

  丰富文档时允许运行的最大并发[多搜索请求数](/rest_apis/search_apis/multi_search)。默认为 `8`。

- `enrich.coordinator_proxy.max_lookups_per_request`

  丰富文档时包含在一个[多搜索请求](/rest_apis/search_apis/multi_search)中的最大搜索数。默认为 `128`。

富化策略执行器支持以下节点设置：

- `enrich.fetch_size`

  将源索引重索引到富化索引时的最大批处理大小。默认为 `10000`。

- `enrich.max_force_merge_attempts`

  允许对富化索引执行的 [force merge](/rest_apis/index_apis/forcemerge) 尝试的最大次数。默认为 `3`。

- `enrich.cleanup_period`

  Elasticsearch 检查是否可以删除未使用的富化索引的频率。默认为 `15m`。

- `enrich.max_concurrent_policy_executions`

  并发执行的富化策略的最大数量。默认为 `50`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-setup.html)
