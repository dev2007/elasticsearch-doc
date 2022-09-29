# 索引模块

索引模块是按索引创建的模块，控制有关索引的所有方面。

## 索引设置

可以为每个索引设置索引级的设置。设置如下：

- 静态设置

只能在索引创建时，或者[关闭的索引](/rest_apis/index_apis/open_index)上设置。

- 动态设置

可以通过[更新索引 API](/rest_apis/index_apis/update_index_settings) 在活动的索引上修改。

::: danger 警告
在关闭的索引上修改静态或动态索引设置，可能会导致不正确的设置。如果不删除并重建索引，是无法修正这些设置。
:::

## 静态索引设置

以下是与特定索引模块无关的静态索引设置的列表：

- `index.number_of_shards`

索引应该具有的主分片数量。默认为 `1`。此设置只能在创建索引时设置。在关闭的索引上也不能修改。

::: tip 提示
每个分片数量限定为 `1,024`。这是一个安全限定，以防止意外创建索引，而这些索引会由于资源分配而破坏集群的稳定性。这个限定可以通过指定 `export ES_JAVA_OPTS="-Des.index.max_number_of_shards=128"` 系统属性来修改，这个属性属于集群的每个节点。
:::

- `index.number_of_routing_shards`

用于[拆分](/rest_apis/index_apis/split_api)索引的路由分片数。
例如，`number_of_routing_shards` 设置为 `30`（`5 x 3 x 2`）的 5 分片索引，可以除以因子 `2` 或 `3`。换言之，可以按以下方式拆分：

- `5` → `10` → `30` (除以 2, 再除以 3)
- `5` → `15` → `30` (除以 3, 再除以 2)
- `5` → `30` (除以 6)

这个设置的默认值基于索引的主分片数。默认情况下，允许按 2 的因子拆分最多 1,024 个分片。

::: tip 提示
在 Elasticsearch 7.0.0 以及更新的版本，这个设置影响文档在分片中的分布方式。使用自定义路由重新索引旧索引时，你必须显式设置 `index.number_of_routing_shards` 以维持相同的文档分布。参阅[相关的碎裂变化](https://www.elastic.co/guide/en/elasticsearch/reference/7.0/breaking-changes-7.0.html#_document_distribution_changes)。
:::

- `index.shard.check_on_startup`

在打开之前是否应该检查分片是否损坏。当检测到损坏时，它将阻止打开分片，允许的值：

    - `false`
    （默认值）当打开分片时不检测损坏。
    - `checksum`
    检测物理损坏。
    - `true`
    检测物理和逻辑损坏。这会消耗更高的 CPU 和内存。

::: danger 警告
仅限专家。在大型索引上检查分片可能花费更多的时间。
:::

- `index.codec`
`default` 值使用 LZ4 压缩来压缩存储的数据，但可以设置为 `best_compression`,即使用 [DEFLATE](https://en.wikipedia.org/wiki/DEFLATE) 来获得更高的压缩比，但会降低存储字段的性能。如果要更新压缩类型，合并段后将应用新的压缩类型。段合并可以使用[强制合并](/rest_apis/index_apis/force_merge)来强制合并。

- `index.routing_partition_size`

自定义路由值可以转到的分片数。默认为 1，只能在索引创建时设置。此值必须小于 `index.number_of_shards`，除非 `index.number_of_shards` 值也是 1。参阅[路由到索引分区](/mapping/metadata/_routing#路由到索引分区)，获取如何使用此设置的更多信息。

- `index.soft_deletes.enabled`

标示索引是否允许软删除。软删除只能在索引创建时设置，也只能配置在 Elasticsearch 6.5.0 及后续版本创建的索引上。默认为 `true`。（7.6.0版本就不推荐，不推荐禁用软删除创建索引，并在未来版本移除此设置）

- `index.soft_deletes.retention_lease.period`

分片历史保持租约在它被认为过期前的最大周期。分片历史保留租约，确保在 Lucene 索引上进行合并时保留软删除。如果软删除在可以复制到跟随者之前被合并，由于领导者的历史记录不完整，后续过程将失败。默认为 `12h`。

- `index.load_fixed_bitset_filters_eagerly`

标示是否为嵌套查询预加载[缓存过滤器](/query_dsl/query)。可能值为 `true`（默认值）和 `false`。

- `index.hidden`

标示默认情况下，索引是否应该隐藏。当使用通配符表达式时，隐藏索引默认不会返回。通过 `expand_wildcards` 参数，每个请求都可以控制此行为。可能的值为 `true` 和 `false`（默认值）。

## 动态索引设置

以下是与任何特定索引模块无关的所有动态设置列表：

- `index.number_of_replicas`

每个主分片的副本数。默认为 1。

- `index.auto_expand_replicas`

根据集群中数据节点的数量，自动扩展副本的数量。设置为以连接符分隔的下限和上限（如，`0-5`）或者使用 `all` 作为上限（如，`0-all`）。默认为 `false`（即禁用）。请注意自动扩展的副本数量只考虑[分配筛选](/index_modules/index_shard/shard_allocation)规则，而忽略其他分配规则，如[分片分配感知](/set_up_elasticsearch/configuring_elasticsearchcluster_level#分片分配感知)和[每个节点分片总数](/index_modules/index_shard/total_shards)，如果适用规则阻止分配所有副本，则这可能导致集群健康变为 `YELLOW`（黄色）。

- `index.search.idle.after`

在被认为是搜索空闲之前，分片不能接收搜索或获取请求的时间。（默认值为 `30s`）

- `index.refresh_interval`

执行刷新操作的频率，它可以使最近对索引的修改对搜索可见。默认为 `1s`。可以设置为 `-1` 为禁止刷新。如果这个设置未显示设置，则至少在 `index.search.idle.after` 秒后，未看到搜索流量的分片在收到搜索请求前不会接收后台刷新。此行为旨在在默认情况下，当不执行搜索时自动优化批量索引。为了选择退出此行为，应将显式值 `1s` 设置为刷新间隔。

- `index.max_result_window`

搜索到此索引的 `from + size` 的最大值。默认为 `10,000`。搜索请求占用的堆内存和时间，与 `from + size` 成比例，这也限制了内存。参阅[Scroll](/search/paginate#滚动搜索结果)或[Search After](/search/paginate#search_after)，以获得更有效的替换提高这一点。

- `index.max_inner_result_window`

此索引的内部命中定义和顶级命中聚合的 `from + size` 的最大值。默认为 `100`。内部命中和顶级命中聚合占用的堆内存和时间，与 `from + size` 成比例，这也限制了内存。

- `index.max_rescore_window`

此索引的搜索中 `rescore` 请求的 `window_size` 最大值。默认为 `index.max_result_window`的值（默认为 `10,000`）。搜索请求占用的堆内存和时间与 `max(window_size, from + size)` 成比例，这也限制了内存。

- `index.max_docvalue_fields_search`

查询中允许的 `docvalue_fields` 最大值。默认为 `100`。文档值字段代价高昂，因为它们可能会导致每个文档查找每个字段。

- `index.max_script_fields`

查询中允许的 `script_fields` 最大值。 默认为 `32`。

- `index.max_ngram_diff`

NGramTokenizer 和 NGramTokenFilter的 min_gram 和 max_gram 允许差值。默认为 `1`。

- `index.max_shingle_diff`

[`shingle` 标记过滤器](/text_analysis/token/shingle)在 max_shingle_size 和 min_shingle_size 间允许的最大差异。默认为 `3`。

- `index.max_refresh_listeners`

索引的每个分片上可用的刷新监听器的最大值。监听器常实现 [`refresh=wait_for`](/rest_apis/document_apis/refresh)

- `index.analyze.max_token_count`

使用 _analyze API 的可以生成的最大标记数。默认为 `10,000`。

- `index.highlight.max_analyzed_offset`

用于高亮请求的分析的最大字符数。此设置仅用于对文本的高亮请求——此文本被不带偏移量或词语向量索引。默认为 `1,000,000`。

- `index.max_terms_count`

用于词语查询（Terms Query）的词语最大值。默认为 `65,536`。

- `index.max_regex_length`

用于正则查询（Regexp Query）的正则最大长度。默认为 `1,000`。

- `index.query.default_field`

（字符串或字符串数组）匹配一个或多个字段的通配符（*）模式。默认情况下，以下查询类型搜索这些匹配字段：

- [更像这样](/query_dsl/specialized_queries/more_like_this)
- [多重匹配](/query_dsl/full_text_queries/multi_match)
- [查询字符串](/query_dsl/full_text_queries/query_string)
- [简单查询字符串](/query_dsl/full_text_queries/simple_query_string)

默认为 * ，它匹配所有符合[词语级查询](/query_dsl/term_level_queries/term_level_queries)的字段，不包括元数据字段。

- `index.routing.allocation.enable`

控制索引的分片分配。可设置为：

- `all` (默认) - 允许所有分片分片分配。
- `primaries` - 允许主分片分片分配。
- `new_primaries` - 允许新创建的主分片分片分配。
- `none` - 不允许分片分配。

- `index.routing.rebalance.enable`

允许索引分片重平衡。可设置为：

- `all`（默认） - 允许所有分片分片重平衡。
- `primaries` - 允许主分片分片重平衡。
- `replicas` - 允许副本分片分片重平衡。
- `none` - 不允许分片重平衡。

- `index.gc_deletes`

[已删除文档版本号](/rest_apis/document_apis/delete#版本控制)仍可用于[进一步版本化操作](/rest_apis/index_apis#版本控制)的时长。默认为 `60s`。

- `index.default_pipeline`

默认的索引[输入节点](/ingest/ingest)管道。如果设置了默认管道，管道又不存在，索引请求将失败。可以使用 `pipeline` 参数覆盖默认值。特定的管道名称 `_none` 表明不运行输入管道。

- `index.final_pipeline`

最终的索引[输入节点](/ingest/ingest)管道。如果设置了默认管道，管道又不存在，索引请求将失败。最终管道始终在请求管道（如果指定）和默认管道（如果存在）之后运行。特定的管道名称 `_none` 表明不运行输入管道。

## 其他索引模块中的设置

索引模块中的其他设置：

- [分析](/text_analysis)

设置默认的分析器、分词器、标记过滤器和字符过滤器。

- [索引分片分配](/index_modules/index_shard/index_shard)

控制分片分配给节点的位置、时间和方式。

- [映射](/index_modules/mapper)

允许或禁用索引的动态映射。

- [合并](/index_modules/merge)

控制如何通过后台合并进程合并分片。

- [相似性](/index_modules/similarity)

配置自定义相似性设置以自定义搜索结果的评分方式。

- [慢日志](/index_modules/slow_log)

控制如何记录慢查询和取出请求（fetch query）日志。

- [存储](/index_modules/store/store)

配置用于访问分片数据的文件系统类型。

- [事务日志](/index_modules/translog)

控制事务日志和后台刷新操作。

- [历史保留](/index_modules/history_retention)

控制索引操作历史的保留。

- [索引压力](/index_modules/indexing_pressure)

配置索引背压限制。

## X-Pack 索引设置 [`X-Pack`]

- [索引生命周期管理](/set_up_elasticsearch/configuring_elasticsearchindex_lifecycle)

指定的索引的生命周期策略和翻转别名。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html)
