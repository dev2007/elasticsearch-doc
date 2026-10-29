# 索引模块

索引模块是按索引创建的模块，控制与索引相关的所有方面。

## 索引设置

索引级别的设置可以按索引设置。设置分为：

- **静态（static）**：只能在索引创建时、或在[已关闭的索引](/rest_apis/index_apis/open_index)上设置，或通过更新索引设置 API 并将 `reopen` 查询参数设为 `true` 来设置（该操作会自动关闭并重新打开受影响的索引）。
- **动态（dynamic）**：可以使用[更新索引设置 API](/rest_apis/index_apis/update_index_settings) 在运行中的索引上更改。

你可以更改已关闭索引上的任何已文档化的索引设置。但是，在已关闭索引上更改未文档化的索引设置是不受支持的，可能导致错误。

## 静态索引设置

以下是所有不与任何特定索引模块关联的静态索引设置：

### `index.number_of_shards`

索引应具有的主分片数量。默认值为 1。只能在索引创建时设置，不能在已关闭的索引上更改。

每个索引的分片数量限制为 1024。这是一个安全限制，用于防止意外创建可能因资源分配而破坏集群稳定性的索引。可以通过在每个节点上指定系统属性 `export ES_JAVA_OPTS="-Des.index.max_number_of_shards=128"` 来修改该限制。

### `index.number_of_routing_shards`

与 `index.number_of_shards` 一起使用、用于将文档路由到主分片的整数值。参见 `_routing` 字段。

Elasticsearch 在拆分（split）索引时使用此值。例如，一个 5 分片索引将 `number_of_routing_shards` 设为 30（5 × 2 × 3），可以按 2 或 3 的倍数拆分。也就是说，可以按如下方式拆分：

- `5` → `10` → `30`（先按 2 拆分，再按 3 拆分）
- `5` → `15` → `30`（先按 3 拆分，再按 2 拆分）
- `5` → `30`（按 6 拆分）

该设置的默认值取决于索引中主分片的数量。默认值设计为允许按 2 的倍数拆分，最大到 1024 个分片。

在 Elasticsearch 7.0.0 及之后版本中，此设置影响文档在分片间的分布。当使用自定义路由重新索引旧索引时，必须显式设置 `index.number_of_routing_shards` 以保持相同的文档分布。参阅相关的破坏性变更说明。

### `index.codec`

默认值使用 LZ4 压缩来压缩存储数据，但可设置为 `best_compression`，其使用 ZSTD 获得更高的压缩比，但代价是较慢的存储字段读取性能。如果更新压缩类型，新的压缩将在段合并之后应用。可以使用[强制合并](/rest_apis/index_apis/force_merge)强制进行段合并。对日志数据集的索引实验表明，`best_compression` 相比默认值可降低最多约 28% 的存储使用，索引吞吐量相近（有时稍慢或稍快，取决于其他使用的选项），同时 get by id 延迟会受到约 10% 到 33% 的影响。较高的 get by id 延迟对许多用例（如日志或指标）来说并不是问题，因为这些用例并不真正依赖 get by id 功能（Get API 或按 `_id` 搜索）。

### `index.mode`

`index.mode` 设置用于控制在特定领域（如时间序列数据或日志的摄取）应用的设置。存在多种互斥的模式，用于应用控制文档索引、排序及其他影响索引或查询性能参数的设置或默认值。

```txt
PUT my-index-000001
{
  "settings": {
    "index": {
      "mode": "standard"
    }
  }
}
```

`index.mode` 支持以下值：

- **null**：默认值（与 standard 相同）。
- **standard**：使用默认设置的标准索引。
- **lookup**：可用于 ES|QL 中 lookup join 的索引。限制为 1 个分片。
- **time_series**（仅限数据流）：针对指标存储优化的索引模式。更多信息参阅时间序列索引设置。
- **logsdb**（仅限数据流）：针对日志优化的索引模式。

### `index.routing_partition_size`

自定义路由值可以路由到的分片数量。默认值为 1，只能在索引创建时设置。此值必须小于 `index.number_of_routing_shards`，除非 `index.number_of_routing_shards` 的值也是 1。更多关于此设置的用法参阅[路由到索引分区](/mapping/metadata/_routing#路由到索引分区)。

### `index.soft_deletes.enabled`

在 7.6.0 中已弃用。创建禁用软删除（soft-deletes）的索引已弃用，将在未来的 Elasticsearch 版本中移除。指示索引上是否启用软删除。软删除只能在索引创建时配置，且只适用于 Elasticsearch 6.5.0 及之后创建的索引。默认值为 `true`。

### `index.soft_deletes.retention_lease.period`

在分片历史保留租约（shard history retention lease）被视为过期之前保留它的最长时间。分片历史保留租约确保软删除在 Lucene 索引合并期间被保留。如果软删除在能够复制到追随者之前被合并掉，后续过程将因领导者上的历史不完整而失败。默认值为 `12h`。

### `index.load_fixed_bitset_filters_eagerly`

指示是否为嵌套查询预加载[缓存过滤器](/query_dsl/query)。可能的值为 `true`（默认）和 `false`。

### `index.shard.check_on_startup`

**仅限专家用户。** 此设置会在分片启动时启用一些非常昂贵的处理，仅在诊断集群问题时有用。如果确实要使用它，应仅临时使用，并在不再需要时移除。

Elasticsearch 在分片生命周期的各个时间点自动对分片内容执行完整性检查。例如，在恢复副本或拍摄快照时验证每个传输文件的校验和。它还会在打开分片时（即在启动节点时、完成分片恢复或重定位时）验证许多重要文件的完整性。因此，你可以通过将分片快照到全新仓库或将其恢复到全新节点，来手动验证运行中整个分片的完整性。

此设置决定 Elasticsearch 在打开分片时是否执行额外的完整性检查。如果这些检查检测到损坏，将阻止分片被打开。它接受以下值：

- **false**：打开分片时不执行额外的损坏检查。这是默认且推荐的行为。
- **checksum**：验证分片中每个文件的校验和与其内容是否匹配。这将检测从磁盘读取的数据与 Elasticsearch 最初写入的数据不同的情况，例如由于未检测到的磁盘损坏或其他硬件故障。这些检查需要从磁盘读取整个分片，会耗费大量时间和 IO 带宽，并可能通过将重要数据从文件系统缓存中逐出而影响集群性能。
- **true**：执行与 checksum 相同的检查，还会检查分片中的逻辑不一致性，例如可能由于写入数据时发生损坏（由故障 RAM 或其他硬件故障引起）。这些检查需要从磁盘读取整个分片（耗费大量时间和 IO 带宽），然后对分片内容执行各种检查（耗费大量时间、CPU 和内存）。

## 动态索引设置

以下是所有不与任何特定索引模块关联的动态索引设置：

### `index.number_of_replicas`

每个主分片拥有的副本数量。默认值为 1。

:::warning 警告

将其配置为 0 可能导致节点重启期间的临时可用性丢失，或在数据损坏的情况下导致永久性数据丢失。

:::

### `index.auto_expand_replicas`

基于集群中数据节点数量自动扩展副本数量。设置为以短划线分隔的下限和上限（例如 `0-5`），或使用 `all` 作为上限（例如 `0-all`）。默认值为 `false`（即禁用）。注意，自动扩展的副本数量只考虑[分配过滤规则](/index_modules/index_shard_allocation/shard_allocation_filtering)，但会忽略其他分配规则（例如[每个节点分片总数](/index_modules/index_shard_allocation/total_shards_per_node)），这可能导致集群健康状态变为黄色（如果适用的规则阻止所有副本被分配）。

如果上限为 `all`，则对该索引会忽略[分片分配感知](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings#分片分配感知)和 `cluster.routing.allocation.same_shard.host`。

### `index.search.idle.after`

分片在多长时间内未收到搜索或获取请求后被视为搜索空闲。（默认为 `30s`）

### `index.refresh_interval`

执行刷新操作（使对索引的最近更改对搜索可见）的频率。默认值为 `1s`。可设置为 `-1` 以禁用刷新。如果未显式设置此设置，至少 `index.search.idle.after` 秒内未见搜索流量的分片将不会接收后台刷新，直到它们收到搜索请求。命中空闲分片且有待处理刷新的搜索，将作为该分片搜索操作的一部分触发刷新。此行为旨在在默认情况下（未执行搜索时）自动优化批量索引。如需退出此行为，应将刷新间隔显式设置为 `1s`。

### `index.max_result_window`

对此索引的搜索中 `from + size` 的最大值。默认值为 10000。搜索请求占用的堆内存和时间与 `from + size` 成正比，此设置限制该内存。参阅[Scroll](/search/paginate#滚动搜索结果)或[Search After](/search/paginate#search_after)作为提高此值的更高效替代方案。

### `index.max_inner_result_window`

对此索引的内部命中定义和 top hits 聚合中 `from + size` 的最大值。默认值为 100。内部命中和 top hits 聚合占用的堆内存和时间与 `from + size` 成正比，此设置限制该内存。

### `index.max_rescore_window`

对此索引的搜索中 rescore 请求的 `window_size` 最大值。默认值为 `index.max_result_window`（默认 10000）。搜索请求占用的堆内存和时间与 `max(window_size, from + size)` 成正比，此设置限制该内存。

### `index.max_docvalue_fields_search`

查询中允许的 `docvalue_fields` 最大数量。默认值为 100。文档值字段代价较高，因为可能产生每个字段每个文档的查找。

### `index.max_script_fields`

查询中允许的 `script_fields` 最大数量。默认值为 32。

### `index.max_ngram_diff`

NGramTokenizer 和 NGramTokenFilter 的 `min_gram` 与 `max_gram` 之间允许的最大差值。默认值为 1。

### `index.max_shingle_diff`

[`shingle` 标记过滤器](/text_analysis/tokenizers/shingle)的 `max_shingle_size` 与 `min_shingle_size` 之间允许的最大差值。默认值为 3。

### `index.max_refresh_listeners`

索引每个分片上可用的最大刷新监听器数量。这些监听器用于实现 [`refresh=wait_for`](/rest_apis/document_apis/refresh)。

### `index.analyze.max_token_count`

使用 `_analyze` API 可产生的最大标记数量。默认值为 10000。

### `index.highlight.max_analyzed_offset`

高亮请求将被分析的最大字符数。此设置仅适用于对未带偏移量或词条向量索引的文本请求高亮时。默认值为 1000000。

### `index.max_terms_count`

词条查询中可使用的最大词条数量。默认值为 65536。

### `index.max_regex_length`

正则或前缀查询中可使用的值的最大长度。默认值为 1000。

### `index.query.default_field`

（字符串或字符串数组）匹配一个或多个字段的通配符（`*`）模式。以下查询类型默认搜索这些匹配的字段：

- [更像这样](/query_dsl/specialized_queries/more_like_this)
- [多重匹配](/query_dsl/full_text_queries/multi_match)
- [查询字符串](/query_dsl/full_text_queries/query_string)
- [简单查询字符串](/query_dsl/full_text_queries/simple_query_string)

默认值为 `*`，匹配所有符合[词条级查询](/query_dsl/term_level_queries/term_level_queries)条件的字段（不包括元数据字段）。

### `index.routing.allocation.enable`

控制此索引的分片分配。可设置为：

- **all**（默认）— 允许所有分片的分配。
- **primaries** — 仅允许主分片的分配。
- **new_primaries** — 仅允许新创建的主分片的分配。
- **none** — 不允许任何分片分配。

### `index.routing.rebalance.enable`

为此索引启用分片再平衡。可设置为：

- **all**（默认）— 允许所有分片的再平衡。
- **primaries** — 仅允许主分片的再平衡。
- **replicas** — 仅允许副本分片的再平衡。
- **none** — 不允许任何分片再平衡。

### `index.gc_deletes`

[已删除文档的版本号](/rest_apis/document_apis/delete#版本控制)保持可用于[进一步版本化操作](/rest_apis/document_apis/index#版本控制)的时间长度。默认值为 `60s`。

### `index.default_pipeline`

索引的默认[摄取管道](/manage_data/ingest/transform_text)。如果设置了默认管道且该管道不存在，索引请求将失败。可以使用 `pipeline` 参数覆盖默认值。特殊管道名称 `_none` 表示不会运行任何默认摄取管道。

### `index.final_pipeline`

索引的最终摄取管道。如果设置了最终管道且该管道不存在，索引请求将失败。最终管道总是在请求管道（如果指定）和默认管道（如果存在）之后运行。特殊管道名称 `_none` 表示不会运行任何最终摄取管道。

不能使用最终管道更改 `_index` 字段。如果管道尝试更改 `_index` 字段，索引请求将失败。

### `index.hidden`

指示索引是否应默认隐藏。使用通配符表达式时，默认不返回隐藏索引。此行为可通过 `expand_wildcards` 参数按请求控制。可能的值为 `true` 和 `false`（默认）。

## 其他索引模块中的设置

其他索引设置可在以下索引模块中找到：

- [分析](/index_modules/analysis)：定义分析器、分词器、标记过滤器和字符过滤器的设置。
- [索引分片分配](/index_modules/index_shard_allocation/index_shard_allocation)：控制分片在何处、何时以及如何分配到节点。
- [映射](/index_modules/mapper)：为索引启用或禁用动态映射。
- [合并](/index_modules/merge)：控制后台合并进程如何合并分片。
- [相似性](/index_modules/similarity)：配置自定义相似度设置，以自定义搜索结果的评分方式。
- [慢日志](/index_modules/slow_log)：控制慢查询和获取请求的日志记录。
- [存储](/index_modules/store)：配置用于访问分片数据的文件系统类型。
- [事务日志](/index_modules/translog)：控制事务日志和后台 flush 操作。
- [历史保留](/index_modules/history_retention)：控制索引中操作历史的保留。
- [索引压力](/index_modules/indexing_pressure)：配置索引背压限制。

## X-Pack 索引设置

- [索引生命周期管理](/set_up_elasticsearch/configuring_elasticsearch/index_lifecycle_management_settings)：为索引指定生命周期策略和滚动别名。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules.html)
