# 节点统计 API

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
::::

返回集群节点统计信息。

## 请求

```bash
GET /_nodes/stats
```

```bash
GET /_nodes/<node_id>/stats
```

```bash
GET /_nodes/stats/<metric>
```

```bash
GET /_nodes/<node_id>/stats/<metric>
```

```bash
GET /_nodes/stats/<metric>/<index_metric>
```

```bash
GET /_nodes/<node_id>/stats/<metric>/<index_metric>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

你可以使用集群节点统计 API 检索集群中节点的统计信息。

所有节点筛选选项均在[此处](/rest_apis/cluster_apis)说明。

默认情况下，返回所有统计信息。你可以使用指标来限制返回的信息。

## 路径参数

- `<metric>`

  （可选，字符串）将返回的信息限制在特定的指标。支持逗号分隔的以下选项列表：

  - `adaptive_selection`：关于自适应副本选择的统计信息。
  - `allocations`：关于已分配分片的统计信息。
  - `breaker`：关于字段数据断路器的统计信息。
  - `discovery`：关于发现的统计信息。
  - `fs`：文件系统信息，数据路径，可用磁盘空间，读/写统计信息。
  - `http`：HTTP 连接信息。
  - `indexing_pressure`：关于节点索引负载及相关拒绝的统计信息。
  - `indices`：索引统计信息，包括大小、文档数量、索引和删除时间、搜索时间、字段缓存大小、合并和冲刷。
  - `ingest`：关于摄取预处理的统计信息。
  - `jvm`：JVM 统计信息，内存池信息，垃圾回收，缓冲池，已加载/卸载类的数量。
  - `os`：操作系统统计信息，负载平均值，内存，交换空间。
  - `process`：进程统计信息，内存消耗，CPU 使用率，打开的文件描述符。
  - `repositories`：关于快照存储库的统计信息。
  - `thread_pool`：关于每个线程池的统计信息，包括当前大小、队列和被拒绝的任务。
  - `transport`：关于集群通信中发送和接收字节数的传输统计信息。

- `<index_metric>`

  （可选，字符串）将 `indices` 指标返回的信息限制在特定的索引指标。仅当指定了 `indices`（或 `all`）指标时才能使用。支持的指标有：

  - `bulk`
  - `completion`
  - `docs`
  - `fielddata`
  - `flush`
  - `get`
  - `indexing`
  - `mappings`
  - `merge`
  - `query_cache`
  - `recovery`
  - `refresh`
  - `request_cache`
  - `search`
  - `segments`
  - `shard_stats`
  - `store`
  - `translog`
  - `warmer`
  - `dense_vector`
  - `sparse_vector`

- `<node_id>`

  （可选，字符串）用于限制返回信息的节点 ID 或名称的逗号分隔列表。

## 查询参数

- `completion_fields`

  （可选，字符串）要包含在补全和建议统计信息中的字段的逗号分隔列表或通配符表达式。

- `fielddata_fields`

  （可选，字符串）要包含在字段数据统计信息中的字段的逗号分隔列表或通配符表达式。

- `fields`

  （可选，字符串）要包含在统计信息中的字段的逗号分隔列表或通配符表达式。

  作为默认列表使用，除非在 `completion_fields` 或 `fielddata_fields` 参数中提供了特定的字段列表。

- `groups`

  （可选，字符串）要包含在搜索统计信息中的搜索组的逗号分隔列表。

- `level`

  （可选，字符串）指示统计信息是在集群、索引还是分片级别聚合。如果请求分片级别，将显示一些额外的分片特定统计信息。

  有效值为：

  - `cluster`
  - `indices`
  - `shards`

- `types`

  （可选，字符串）索引 `indexing` 指标的文档类型的逗号分隔列表。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待每个节点响应的时长。如果某个节点在其超时到期前未响应，则响应中不包含其信息。但是，超时的节点会包含在响应的 `_nodes.failed` 属性中。默认为无超时。

- `include_segment_file_sizes`

  （可选，布尔值）如果为 `true`，则调用报告每个 Lucene 索引文件的聚合磁盘使用情况（仅在请求段统计信息时适用）。默认为 `false`。

- `include_unloaded_segments`

  （可选，布尔值）如果为 `true`，则响应包含未加载到内存中的段的信息。默认为 `false`。

## 响应体

- `_nodes`

  （对象）包含有关请求选择的节点数量的统计信息。

  - `_nodes` 的属性

    - `total`

      （整数）请求选择的节点总数。

    - `successful`

      （整数）成功响应请求的节点数。

    - `failed`

      （整数）拒绝请求或未能响应的节点数。如果此值不为 0，则响应中包含拒绝或失败的原因。

- `cluster_name`

  （字符串）集群名称。基于集群名称设置。

- `nodes`

  （对象）包含请求选择的节点的统计信息。

  - `nodes` 的属性

    - `<node_id>`

      （对象）包含节点的统计信息。

      - `<node_id>` 的属性

        - `timestamp`

          （整数）为此响应收集节点统计信息的时间。以自 Unix 纪元以来的毫秒数记录。

        - `name`

          （字符串）节点的人类可读标识符。基于节点名称设置。

        - `transport_address`

          （字符串）传输层的主机和端口，用于集群中节点之间的内部通信。

        - `host`

          （字符串）节点的网络主机，基于网络主机设置。

        - `ip`

          （字符串）节点的 IP 地址和端口。

        - `roles`

          （字符串数组）分配给节点的角色。参见节点设置。

        - `attributes`

          （对象）包含节点的属性列表。

        - `indices`

          （对象）包含分配给该节点的分片所在索引的统计信息。

          - `indices` 的属性

            - `docs`

              （对象）包含分配给该节点的所有主分片中文档的统计信息。

              - `docs` 的属性

                - `count`

                  （整数）Lucene 报告的文档数量。这不包括已删除的文档，并且将嵌套文档与其父文档分开计数。它还不包括最近索引但尚未属于某个段的文档。

                - `deleted`

                  （整数）Lucene 报告的已删除文档数量，可能高于或低于你执行的删除操作数量。此数字不包括最近执行但尚未属于某个段的删除。已删除文档由自动合并过程在合理时清理。此外，Elasticsearch 会创建额外的已删除文档以在内部跟踪分片上操作的近期历史记录。

            - `store`

              （对象）包含分配给该节点的分片大小的统计信息。

              - `store` 的属性

                - `size`

                  （字节值）分配给该节点的所有分片的总大小。

                - `size_in_bytes`

                  （整数）分配给该节点的所有分片的总大小（以字节为单位）。

                - `total_data_set_size`

                  （字节值）分配给该节点的所有分片的总数据集大小。包括未完全存储在节点上的分片大小，例如部分挂载索引的缓存。

                - `total_data_set_size_in_bytes`

                  （整数）分配给该节点的所有分片的总数据集大小（以字节为单位）。包括未完全存储在节点上的分片大小，例如部分挂载索引的缓存。

                - `reserved`

                  （字节值）由于正在进行的对等恢复、恢复快照和类似活动，该节点上的分片存储最终将增长的预测值。值为 `-1b` 表示不可用。

                - `reserved_in_bytes`

                  （整数）由于正在进行的对等恢复、恢复快照和类似活动，该节点上的分片存储最终将增长的预测值（以字节为单位）。值为 `-1` 表示不可用。

            - `indexing`

              （对象）包含该节点索引操作的统计信息。

              - `indexing` 的属性

                - `index_total`

                  （整数）索引操作总数。

                - `index_time`

                  （时间值）执行索引操作花费的总时间。

                - `index_time_in_millis`

                  （整数）执行索引操作花费的总时间（以毫秒为单位）。

                - `index_current`

                  （整数）当前正在运行的索引操作数。

                - `index_failed`

                  （整数）失败的索引操作数。

                - `delete_total`

                  （整数）删除操作总数。

                - `delete_time`

                  （时间值）执行删除操作花费的时间。

                - `delete_time_in_millis`

                  （整数）执行删除操作花费的时间（以毫秒为单位）。

                - `delete_current`

                  （整数）当前正在运行的删除操作数。

                - `noop_update_total`

                  （整数）空操作总数。

                - `is_throttled`

                  （布尔值）操作被限流的次数。

                - `throttle_time`

                  （时间值）限流操作花费的总时间。

                - `throttle_time_in_millis`

                  （整数）限流操作花费的总时间（以毫秒为单位）。

                - `write_load`

                  （浮点数）索引文档时使用的写入线程平均数。

            - `get`

              （对象）包含该节点 GET 操作的统计信息。

              - `get` 的属性

                - `total`

                  （整数）GET 操作总数。

                - `getTime`

                  （时间值）执行 GET 操作花费的时间。

                - `time_in_millis`

                  （整数）执行 GET 操作花费的时间（以毫秒为单位）。

                - `exists_total`

                  （整数）成功的 GET 操作总数。

                - `exists_time`

                  （时间值）执行成功的 GET 操作花费的时间。

                - `exists_time_in_millis`

                  （整数）执行成功的 GET 操作花费的时间（以毫秒为单位）。

                - `missing_total`

                  （整数）失败的 GET 操作总数。

                - `missing_time`

                  （时间值）执行失败的 GET 操作花费的时间。

                - `missing_time_in_millis`

                  （整数）执行失败的 GET 操作花费的时间（以毫秒为单位）。

                - `current`

                  （整数）当前正在运行的 GET 操作数。

            - `search`

              （对象）包含该节点搜索操作的统计信息。

              - `search` 的属性

                - `open_contexts`

                  （整数）打开的搜索上下文数。

                - `query_total`

                  （整数）查询操作总数。

                - `query_time`

                  （时间值）执行查询操作花费的时间。

                - `query_time_in_millis`

                  （整数）执行查询操作花费的时间（以毫秒为单位）。

                - `query_current`

                  （整数）当前正在运行的查询操作数。

                - `fetch_total`

                  （整数）获取操作总数。

                - `fetch_time`

                  （时间值）执行获取操作花费的时间。

                - `fetch_time_in_millis`

                  （整数）执行获取操作花费的时间（以毫秒为单位）。

                - `fetch_current`

                  （整数）当前正在运行的获取操作数。

                - `scroll_total`

                  （整数）滚动操作总数。

                - `scroll_time`

                  （时间值）执行滚动操作花费的时间。

                - `scroll_time_in_millis`

                  （整数）执行滚动操作花费的时间（以毫秒为单位）。

                - `scroll_current`

                  （整数）当前正在运行的滚动操作数。

                - `suggest_total`

                  （整数）建议操作总数。

                - `suggest_time`

                  （时间值）执行建议操作花费的时间。

                - `suggest_time_in_millis`

                  （整数）执行建议操作花费的时间（以毫秒为单位）。

                - `suggest_current`

                  （整数）当前正在运行的建议操作数。

            - `merges`

              （对象）包含该节点合并操作的统计信息。

              - `merges` 的属性

                - `current`

                  （整数）当前正在运行的合并操作数。

                - `current_docs`

                  （整数）当前正在运行的文档合并数。

                - `current_size`

                  （字节值）执行当前文档合并使用的内存。

                - `current_size_in_bytes`

                  （整数）执行当前文档合并使用的内存（以字节为单位）。

                - `total`

                  （整数）合并操作总数。

                - `total_time`

                  （时间值）执行合并操作花费的总时间。

                - `total_time_in_millis`

                  （整数）执行合并操作花费的总时间（以毫秒为单位）。

                - `total_docs`

                  （整数）合并的文档总数。

                - `total_size`

                  （字节值）文档合并的总大小。

                - `total_size_in_bytes`

                  （整数）文档合并的总大小（以字节为单位）。

                - `total_stopped_time`

                  （时间值）停止合并操作花费的总时间。

                - `total_stopped_time_in_millis`

                  （整数）停止合并操作花费的总时间（以毫秒为单位）。

                - `total_throttled_time`

                  （时间值）限流合并操作花费的总时间。

                - `total_throttled_time_in_millis`

                  （整数）限流合并操作花费的总时间（以毫秒为单位）。

                - `total_auto_throttle`

                  （字节值）自动限流的合并操作大小。

                - `total_auto_throttle_in_bytes`

                  （整数）自动限流的合并操作大小（以字节为单位）。

            - `refresh`

              （对象）包含该节点刷新操作的统计信息。

              - `refresh` 的属性

                - `total`

                  （整数）刷新操作总数。

                - `total_time`

                  （时间值）执行刷新操作花费的总时间。

                - `total_time_in_millis`

                  （整数）执行刷新操作花费的总时间（以毫秒为单位）。

                - `external_total`

                  （整数）外部刷新操作总数。

                - `external_total_time`

                  （时间值）执行外部操作花费的总时间。

                - `external_total_time_in_millis`

                  （整数）执行外部操作花费的总时间（以毫秒为单位）。

                - `listeners`

                  （整数）刷新监听器数量。

            - `flush`

              （对象）包含该节点冲刷操作的统计信息。

              - `flush` 的属性

                - `total`

                  （整数）冲刷操作数。

                - `periodic`

                  （整数）周期性冲刷操作数。

                - `total_time`

                  （时间值）执行冲刷操作花费的总时间。

                - `total_time_in_millis`

                  （整数）执行冲刷操作花费的总时间（以毫秒为单位）。

            - `warmer`

              （对象）包含该节点索引预热操作的统计信息。

              - `warmer` 的属性

                - `current`

                  （整数）活跃的索引预热器数量。

                - `total`

                  （整数）索引预热器总数。

                - `total_time`

                  （时间值）执行索引预热操作花费的总时间。

                - `total_time_in_millis`

                  （整数）执行索引预热操作花费的总时间（以毫秒为单位）。

            - `query_cache`

              （对象）包含分配给该节点的所有分片的查询缓存统计信息。

              - `query_cache` 的属性

                - `memory_size`

                  （字节值）分配给该节点的所有分片的查询缓存使用的内存总量。

                - `memory_size_in_bytes`

                  （整数）分配给该节点的所有分片的查询缓存使用的内存总量（以字节为单位）。

                - `total_count`

                  （整数）查询缓存中的命中、未命中和缓存查询的总数。

                - `hit_count`

                  （整数）查询缓存命中数。

                - `miss_count`

                  （整数）查询缓存未命中数。

                - `cache_size`

                  （整数）当前缓存的查询数。

                - `cache_count`

                  （整数）已缓存的所有查询总数。

                - `evictions`

                  （整数）查询缓存驱逐数。

            - `fielddata`

              （对象）包含分配给该节点的所有分片的字段数据缓存统计信息。

              - `fielddata` 的属性

                - `memory_size`

                  （字节值）分配给该节点的所有分片的字段数据缓存使用的内存总量。

                - `memory_size_in_bytes`

                  （整数）分配给该节点的所有分片的字段数据缓存使用的内存总量（以字节为单位）。

                - `evictions`

                  （整数）字段数据驱逐数。

            - `completion`

              （对象）包含分配给该节点的所有分片的补全统计信息。

              - `completion` 的属性

                - `size`

                  （字节值）分配给该节点的所有分片的补全使用的内存总量。

                - `size_in_bytes`

                  （整数）分配给该节点的所有分片的补全使用的内存总量（以字节为单位）。

            - `segments`

              （对象）包含分配给该节点的所有分片的段统计信息。

              - `segments` 的属性

                - `count`

                  （整数）段数量。

                - `memory`

                  （字节值）分配给该节点的所有分片的段使用的内存总量。

                - `memory_in_bytes`

                  （整数）分配给该节点的所有分片的段使用的内存总量（以字节为单位）。

                - `terms_memory`

                  （字节值）分配给该节点的所有分片的词项使用的内存总量。

                - `terms_memory_in_bytes`

                  （整数）分配给该节点的所有分片的词项使用的内存总量（以字节为单位）。

                - `stored_fields_memory`

                  （字节值）分配给该节点的所有分片的已存储字段使用的内存总量。

                - `stored_fields_memory_in_bytes`

                  （整数）分配给该节点的所有分片的已存储字段使用的内存总量（以字节为单位）。

                - `term_vectors_memory`

                  （字节值）分配给该节点的所有分片的词向量使用的内存总量。

                - `term_vectors_memory_in_bytes`

                  （整数）分配给该节点的所有分片的词向量使用的内存总量（以字节为单位）。

                - `norms_memory`

                  （字节值）分配给该节点的所有分片的归一化因子使用的内存总量。

                - `norms_memory_in_bytes`

                  （整数）分配给该节点的所有分片的归一化因子使用的内存总量（以字节为单位）。

                - `points_memory`

                  （字节值）分配给该节点的所有分片的点使用的内存总量。

                - `points_memory_in_bytes`

                  （整数）分配给该节点的所有分片的点使用的内存总量（以字节为单位）。

                - `doc_values_memory`

                  （字节值）分配给该节点的所有分片的 doc values 使用的内存总量。

                - `doc_values_memory_in_bytes`

                  （整数）分配给该节点的所有分片的 doc values 使用的内存总量（以字节为单位）。

                - `index_writer_memory`

                  （字节值）分配给该节点的所有分片的所有索引写入器使用的内存总量。

                - `index_writer_memory_in_bytes`

                  （整数）分配给该节点的所有分片的所有索引写入器使用的内存总量（以字节为单位）。

                - `version_map_memory`

                  （字节值）分配给该节点的所有分片的所有版本映射使用的内存总量。

                - `version_map_memory_in_bytes`

                  （整数）分配给该节点的所有分片的所有版本映射使用的内存总量（以字节为单位）。

                - `fixed_bit_set`

                  （字节值）分配给该节点的所有分片的固定位集使用的内存总量。固定位集用于嵌套对象字段类型和 join 字段的类型过滤器。

                - `fixed_bit_set_memory_in_bytes`

                  （整数）分配给该节点的所有分片的固定位集使用的内存总量（以字节为单位）。固定位集用于嵌套对象字段类型和 join 字段的类型过滤器。

                - `max_unsafe_auto_id_timestamp`

                  （整数）最近重试的索引请求的时间。以自 Unix 纪元以来的毫秒数记录。

                - `file_sizes`

                  （对象）包含段文件大小的统计信息。

                  - `file_sizes` 的属性

                    - `size`

                      （字节值）段文件大小。

                    - `size_in_bytes`

                      （整数）段文件大小（以字节为单位）。

                    - `description`

                      （字符串）段文件的描述。

            - `translog`

              （对象）包含该节点事务日志操作的统计信息。

              - `translog` 的属性

                - `operations`

                  （整数）事务日志操作数。

                - `size`

                  （字节值）事务日志大小。

                - `size_in_bytes`

                  （整数）事务日志大小（以字节为单位）。

                - `uncommitted_operations`

                  （整数）未提交的事务日志操作数。

                - `uncommitted_size`

                  （字节值）未提交的事务日志操作大小。

                - `uncommitted_size_in_bytes`

                  （整数）未提交的事务日志操作大小（以字节为单位）。

                - `earliest_last_modified_age`

                  （整数）事务日志的最早最后修改年龄。

            - `request_cache`

              （对象）包含分配给该节点的所有分片的请求缓存统计信息。

              - `request_cache` 的属性

                - `memory_size`

                  （字节值）请求缓存使用的内存。

                - `memory_size_in_bytes`

                  （整数）请求缓存使用的内存（以字节为单位）。

                - `evictions`

                  （整数）请求缓存操作数。

                - `hit_count`

                  （整数）请求缓存命中数。

                - `miss_count`

                  （整数）请求缓存未命中数。

            - `recovery`

              （对象）包含该节点恢复操作的统计信息。

              - `recovery` 的属性

                - `current_as_source`

                  （整数）以索引分片作为源的恢复数。

                - `current_as_target`

                  （整数）以索引分片作为目标的恢复数。

                - `throttle_time`

                  （时间值）恢复操作因限流而延迟的时间。

                - `throttle_time_in_millis`

                  （整数）恢复操作因限流而延迟的时间（以毫秒为单位）。

            - `shard_stats`

              （对象）包含分配给该节点的所有分片的统计信息。

              - `shard_stats` 的属性

                - `total_count`

                  （整数）分配给该节点的分片总数。

            - `mappings`

              （对象）包含该节点映射的统计信息。分片级别不显示此项，因为映射可能在节点上同一索引的分片之间共享。

              - `mappings` 的属性

                - `total_count`

                  （整数）映射数量，包括运行时字段和对象字段。

                - `total_estimated_overhead`

                  （字节值）该节点上映射的估计堆开销，每个映射字段允许 1kiB 堆内存。

                - `total_estimated_overhead_in_bytes`

                  （整数）该节点上映射的估计堆开销（以字节为单位），每个映射字段允许 1kiB 堆内存。

                - `total_segments`

                  （整数）该节点上 Lucene 段的估计数量。

                - `total_segment_fields`

                  （整数）该节点上段级别的字段估计数量。

                - `average_fields_per_segment`

                  （整数）该节点上每个段的平均字段估计数量。

            - `dense_vector`

              （对象）包含分配给该节点的所有分片的 dense_vector 统计信息。

              - `dense_vector` 的属性

                - `value_count`

                  （整数）分配给该节点的所有分片中已索引的稠密向量总数。

            - `sparse_vector`

              （对象）包含分配给该节点的所有分片的 sparse_vector 统计信息。

              - `sparse_vector` 的属性

                - `value_count`

                  （整数）分配给该节点的所有分片中已索引的稀疏向量总数。

            - `shards`

              （对象）当请求分片级别时，包含每个分片（按索引，然后按分片 ID）的上述索引统计信息，以及以下分片特定统计信息（当请求级别高于分片时不显示）：

              - 分片级别的额外分片特定统计信息

                - `routing`

                  （对象）包含分片的路由信息。

                  - `routing` 的属性

                    - `state`

                      （字符串）分片状态。返回值为：

                      - `INITIALIZING`：分片正在初始化/恢复。
                      - `RELOCATING`：分片正在迁移。
                      - `STARTED`：分片已启动。
                      - `UNASSIGNED`：分片未分配给任何节点。

                    - `primary`

                      （布尔值）该分片是否为主分片。

                    - `node`

                      （字符串）分片分配到的节点 ID。

                    - `relocating_node`

                      （字符串）分片正在迁入或迁出的节点 ID，如果分片未在迁移则为 null。

                - `commit`

                  （对象）包含有关分片最后提交点的信息。

                  - `commit` 的属性

                    - `id`

                      （字符串）提交 ID 的 Base64 版本。

                    - `generation`

                      （整数）提交的 Lucene 代次。

                    - `user_data`

                      （对象）包含有关提交的额外技术信息。

                    - `num_docs`

                      （整数）提交中的文档数。

                - `seq_no`

                  （对象）包含分片的序列号和检查点信息。

                  - `seq_no` 的属性

                    - `max_seq_no`

                      （整数）迄今为止发出的最大序列号。

                    - `local_checkpoint`

                      （整数）分片的当前本地检查点。

                    - `global_checkpoint`

                      （整数）分片的当前全局检查点。

                - `retention_leases`

                  （对象）包含历史保留租约的信息。

                  - `retention_leases` 的属性

                    - `primary_term`

                      （整数）此保留租约集合的主任期。

                    - `version`

                      （整数）保留租约集合的当前版本。

                    - `leases`

                      （对象数组）此分片的当前租约列表。

                      - `leases` 的属性

                        - `id`

                          （字符串）租约 ID。

                        - `retaining_seq_no`

                          （整数）租约要保留的最小序列号。

                        - `timestamp`

                          （整数）租约创建或续订的时间戳。以自 Unix 纪元以来的毫秒数记录。

                        - `source`

                          （字符串）租约来源。

                - `shard_path`

                  （对象）

                  - `shard_path` 的属性

                    - `state_path`

                      （字符串）状态路径根，不含索引名称和分片 ID。

                    - `data_path`

                      （字符串）数据路径根，不含索引名称和分片 ID。

                    - `is_custom_data_path`

                      （布尔值）数据路径是否为自定义数据位置，因此位于节点配置的数据路径之外。

                - `search_idle`

                  （布尔值）分片是否处于搜索空闲状态。

                - `search_idle_time`

                  （整数）自上次搜索器访问以来的时间。以毫秒记录。

        - `os`

          （对象）包含该节点操作系统的统计信息。

          - `os` 的属性

            - `timestamp`

              （整数）操作系统统计信息最后一次刷新的时间。以自 Unix 纪元以来的毫秒数记录。

            - `cpu`

              （对象）包含该节点 CPU 使用情况的统计信息。

              - `cpu` 的属性

                - `percent`

                  （整数）整个系统的近期 CPU 使用率，如果不支持则为 -1。

                - `load_average`

                  （对象）包含系统负载平均值的统计信息。

                  - `load_average` 的属性

                    - `1m`

                      （浮点数）系统的一分钟负载平均值（如果不可用则不显示此字段）。

                    - `5m`

                      （浮点数）系统的五分钟负载平均值（如果不可用则不显示此字段）。

                    - `15m`

                      （浮点数）系统的十五分钟负载平均值（如果不可用则不显示此字段）。

            - `mem`

              （对象）包含该节点内存使用情况的统计信息。

              - `mem` 的属性

                - `total`

                  （字节值）物理内存总量。

                - `total_in_bytes`

                  （整数）物理内存总量（以字节为单位）。

                - `adjusted_total`

                  （字节值）如果使用 `es.total_memory_bytes` 系统属性覆盖了物理内存量，则报告覆盖值。否则报告与 `total` 相同的值。

                - `adjusted_total_in_bytes`

                  （整数）如果使用 `es.total_memory_bytes` 系统属性覆盖了物理内存量，则报告覆盖值（以字节为单位）。否则报告与 `total_in_bytes` 相同的值。

                - `free`

                  （字节值）可用物理内存量。

                - `free_in_bytes`

                  （整数）可用物理内存量（以字节为单位）。

                - `used`

                  （字节值）已用物理内存量。

                - `used_in_bytes`

                  （整数）已用物理内存量（以字节为单位）。

                - `free_percent`

                  （整数）可用内存百分比。

                - `used_percent`

                  （整数）已用内存百分比。

            - `swap`

              （对象）包含该节点交换空间的统计信息。

              - `swap` 的属性

                - `total`

                  （字节值）交换空间总量。

                - `total_in_bytes`

                  （整数）交换空间总量（以字节为单位）。

                - `free`

                  （字节值）可用交换空间量。

                - `free_in_bytes`

                  （整数）可用交换空间量（以字节为单位）。

                - `used`

                  （字节值）已用交换空间量。

                - `used_in_bytes`

                  （整数）已用交换空间量（以字节为单位）。

            - `cgroup`（仅 Linux）

              （对象）包含该节点的 cgroup 统计信息。要显示 cgroup 统计信息，内核必须编译了 cgroups，必须配置 `cpu` 和 `cpuacct` cgroup 子系统，并且必须可从 `/sys/fs/cgroup/cpu` 和 `/sys/fs/cgroup/cpuacct` 读取统计信息。

              - `cgroup` 的属性

                - `cpuacct`（仅 Linux）

                  （对象）包含该节点 cpuacct 控制组的统计信息。

                  - `cpuacct` 的属性

                    - `control_group`（仅 Linux）

                      （字符串）Elasticsearch 进程所属的 cpuacct 控制组。

                    - `usage_nanos`（仅 Linux）

                      （整数）与 Elasticsearch 进程在同一 cgroup 中的所有任务消耗的 CPU 总时间（以纳秒为单位）。

                - `cpu`（仅 Linux）

                  （对象）包含该节点 cpu 控制组的统计信息。

                  - `cpu` 的属性

                    - `control_group`（仅 Linux）

                      （字符串）Elasticsearch 进程所属的 cpu 控制组。

                    - `cfs_period_micros`（仅 Linux）

                      （整数）与 Elasticsearch 进程在同一 cgroup 中的所有任务定期重新分配 CPU 资源访问权的时间间隔（以微秒为单位）。

                    - `cfs_quota_micros`（仅 Linux）

                      （整数）与 Elasticsearch 进程在同一 cgroup 中的所有任务在一个 `cfs_period_micros` 周期内可运行的总时间（以微秒为单位）。

                    - `stat`（仅 Linux）

                      （对象）包含该节点的 CPU 统计信息。

                      - `stat` 的属性

                        - `number_of_elapsed_periods`（仅 Linux）

                          （整数）已过去的报告周期数（由 `cfs_period_micros` 指定）。

                        - `number_of_times_throttled`（仅 Linux）

                          （整数）与 Elasticsearch 进程在同一 cgroup 中的所有任务被限流的次数。

                        - `time_throttled_nanos`（仅 Linux）

                          （整数）与 Elasticsearch 进程在同一 cgroup 中的所有任务被限流的总时间（以纳秒为单位）。

                - `memory`（仅 Linux）

                  （对象）包含该节点内存控制组的统计信息。

                  - `memory` 的属性

                    - `control_group`（仅 Linux）

                      （字符串）Elasticsearch 进程所属的内存控制组。

                    - `limit_in_bytes`（仅 Linux）

                      （字符串）与 Elasticsearch 进程在同一 cgroup 中的所有任务允许使用的最大用户内存（包括文件缓存）。此值可能太大而无法存储在 long 中，因此以字符串形式返回，使返回值与底层操作系统接口返回的值完全匹配。任何太大而无法解析为 long 的值几乎肯定意味着没有为 cgroup 设置限制。

                    - `usage_in_bytes`（仅 Linux）

                      （字符串）与 Elasticsearch 进程在同一 cgroup 中的所有任务当前使用的内存总量（以字节为单位）。为与 `limit_in_bytes` 一致，此值以字符串形式存储。

        - `process`

          （对象）包含该节点的进程统计信息。

          - `process` 的属性

            - `timestamp`

              （整数）统计信息最后一次刷新的时间。以自 Unix 纪元以来的毫秒数记录。

            - `open_file_descriptors`

              （整数）与当前进程关联的已打开文件描述符数量，如果不支持则为 -1。

            - `max_file_descriptors`

              （整数）系统允许的最大文件描述符数量，如果不支持则为 -1。

            - `cpu`

              （对象）包含该节点的 CPU 统计信息。

              - `cpu` 的属性

                - `percent`

                  （整数）CPU 使用率百分比，如果在计算统计信息时未知则为 -1。

                - `total`

                  （时间值）Java 虚拟机运行的进程使用的 CPU 时间。

                - `total_in_millis`

                  （整数）Java 虚拟机运行的进程使用的 CPU 时间（以毫秒为单位），如果不支持则为 -1。

            - `mem`

              （对象）包含该节点的虚拟内存统计信息。

              - `mem` 的属性

                - `total_virtual`

                  （字节值）保证运行进程可用的虚拟内存大小。

                - `total_virtual_in_bytes`

                  （整数）保证运行进程可用的虚拟内存大小（以字节为单位）。

        - `jvm`

          （对象）包含该节点的 Java 虚拟机（JVM）统计信息。

          - `jvm` 的属性

            - `timestamp`

              （整数）JVM 统计信息最后一次刷新的时间。以自 Unix 纪元以来的毫秒数记录。

            - `uptime`

              （时间值）人类可读的 JVM 运行时间。仅在 `human` 查询参数为 `true` 时返回。

            - `uptime_in_millis`

              （整数）JVM 运行时间（以毫秒为单位）。

            - `mem`

              （对象）包含该节点的 JVM 内存使用统计信息。

              - `mem` 的属性

                - `heap_used`

                  （字节值）堆当前使用的内存。

                - `heap_used_in_bytes`

                  （整数）堆当前使用的内存（以字节为单位）。

                - `heap_used_percent`

                  （整数）堆当前使用的内存百分比。

                - `heap_committed`

                  （字节值）堆可用的内存量。

                - `heap_committed_in_bytes`

                  （整数）堆可用的内存量（以字节为单位）。

                - `heap_max`

                  （字节值）堆可用的最大内存量。

                - `heap_max_in_bytes`

                  （整数）堆可用的最大内存量（以字节为单位）。

                - `non_heap_used`

                  （字节值）已用的非堆内存。

                - `non_heap_used_in_bytes`

                  （整数）已用的非堆内存（以字节为单位）。

                - `non_heap_committed`

                  （字节值）可用的非堆内存量。

                - `non_heap_committed_in_bytes`

                  （整数）可用的非堆内存量（以字节为单位）。

                - `pools`

                  （对象）包含该节点的堆内存使用统计信息。

                  - `pools` 的属性

                    - `young`

                      （对象）包含该节点新生代堆内存使用统计信息。

                      - `young` 的属性

                        - `used`

                          （字节值）新生代堆使用的内存。

                        - `used_in_bytes`

                          （整数）新生代堆使用的内存（以字节为单位）。

                        - `max`

                          （字节值）新生代堆可用的最大内存量。

                        - `max_in_bytes`

                          （整数）新生代堆可用的最大内存量（以字节为单位）。

                        - `peak_used`

                          （字节值）新生代堆历史上使用的最大内存量。

                        - `peak_used_in_bytes`

                          （整数）新生代堆历史上使用的最大内存量（以字节为单位）。

                        - `peak_max`

                          （字节值）新生代堆历史上可用的最大内存量。

                        - `peak_max_in_bytes`

                          （整数）新生代堆历史上可用的最大内存量（以字节为单位）。

                    - `survivor`

                      （对象）包含该节点幸存者区内存使用统计信息。

                      - `survivor` 的属性

                        - `used`

                          （字节值）幸存者区使用的内存。

                        - `used_in_bytes`

                          （整数）幸存者区使用的内存（以字节为单位）。

                        - `max`

                          （字节值）幸存者区可用的最大内存量。

                        - `max_in_bytes`

                          （整数）幸存者区可用的最大内存量（以字节为单位）。

                        - `peak_used`

                          （字节值）幸存者区历史上使用的最大内存量。

                        - `peak_used_in_bytes`

                          （整数）幸存者区历史上使用的最大内存量（以字节为单位）。

                        - `peak_max`

                          （字节值）幸存者区历史上可用的最大内存量。

                        - `peak_max_in_bytes`

                          （整数）幸存者区历史上可用的最大内存量（以字节为单位）。

                    - `old`

                      （对象）包含该节点老年代堆内存使用统计信息。

                      - `old` 的属性

                        - `used`

                          （字节值）老年代堆使用的内存。

                        - `used_in_bytes`

                          （整数）老年代堆使用的内存（以字节为单位）。

                        - `max`

                          （字节值）老年代堆可用的最大内存量。

                        - `max_in_bytes`

                          （整数）老年代堆可用的最大内存量（以字节为单位）。

                        - `peak_used`

                          （字节值）老年代堆历史上使用的最大内存量。

                        - `peak_used_in_bytes`

                          （整数）老年代堆历史上使用的最大内存量（以字节为单位）。

                        - `peak_max`

                          （字节值）老年代堆历史上可用的最高内存限制。

                        - `peak_max_in_bytes`

                          （整数）老年代堆历史上可用的最高内存限制（以字节为单位）。

            - `threads`

              （对象）包含该节点的 JVM 线程使用统计信息。

              - `threads` 的属性

                - `count`

                  （整数）JVM 使用的活跃线程数。

                - `peak_count`

                  （整数）JVM 使用的最高线程数。

            - `gc`

              （对象）包含该节点的 JVM 垃圾回收器统计信息。

              - `gc` 的属性

                - `collectors`

                  （对象）包含该节点的 JVM 垃圾回收器统计信息。

                  - `collectors` 的属性

                    - `young`

                      （对象）包含该节点回收新生代对象的 JVM 垃圾回收器统计信息。

                      - `young` 的属性

                        - `collection_count`

                          （整数）回收新生代对象的 JVM 垃圾回收器数量。

                        - `collection_time`

                          （时间值）JVM 回收新生代对象花费的总时间。

                        - `collection_time_in_millis`

                          （整数）JVM 回收新生代对象花费的总时间（以毫秒为单位）。

                    - `old`

                      （对象）包含该节点回收老年代对象的 JVM 垃圾回收器统计信息。

                      - `old` 的属性

                        - `collection_count`

                          （整数）回收老年代对象的 JVM 垃圾回收器数量。

                        - `collection_time`

                          （时间值）JVM 回收老年代对象花费的总时间。

                        - `collection_time_in_millis`

                          （整数）JVM 回收老年代对象花费的总时间（以毫秒为单位）。

            - `buffer_pools`

              （对象）包含该节点的 JVM 缓冲池统计信息。

              - `buffer_pools` 的属性

                - `mapped`

                  （对象）包含该节点的映射 JVM 缓冲池统计信息。

                  - `mapped` 的属性

                    - `count`

                      （整数）映射缓冲池数量。

                    - `used`

                      （字节值）映射缓冲池大小。

                    - `used_in_bytes`

                      （整数）映射缓冲池大小（以字节为单位）。

                    - `total_capacity`

                      （字节值）映射缓冲池总容量。

                    - `total_capacity_in_bytes`

                      （整数）映射缓冲池总容量（以字节为单位）。

                - `direct`

                  （对象）包含该节点的直接 JVM 缓冲池统计信息。

                  - `direct` 的属性

                    - `count`

                      （整数）直接缓冲池数量。

                    - `used`

                      （字节值）直接缓冲池大小。

                    - `used_in_bytes`

                      （整数）直接缓冲池大小（以字节为单位）。

                    - `total_capacity`

                      （字节值）直接缓冲池总容量。

                    - `total_capacity_in_bytes`

                      （整数）直接缓冲池总容量（以字节为单位）。

            - `classes`

              （对象）包含该节点 JVM 加载的类的统计信息。

              - `classes` 的属性

                - `current_loaded_count`

                  （整数）JVM 当前加载的类数量。

                - `total_loaded_count`

                  （整数）JVM 启动以来加载的类总数。

                - `total_unloaded_count`

                  （整数）JVM 启动以来卸载的类总数。

        - `repositories`

          （对象）关于快照存储库的统计信息。

          - `repositories` 的属性

            - `<repository_name>`

              （对象）包含该节点的存储库限流统计信息。

              - `<repository_name>` 的属性

                - `total_read_throttled_time_nanos`

                  （整数）恢复期间节点等待的总纳秒数。

                - `total_write_throttled_time_nanos`

                  （整数）快照期间节点等待的总纳秒数。

        - `thread_pool`

          （对象）包含该节点的线程池统计信息。

          - `thread_pool` 的属性

            - `<thread_pool_name>`

              （对象）包含该节点线程池的统计信息。

              - `<thread_pool_name>` 的属性

                - `threads`

                  （整数）线程池中的线程数。

                - `queue`

                  （整数）线程池队列中的任务数。

                - `active`

                  （整数）线程池中的活跃线程数。

                - `rejected`

                  （整数）线程池执行器拒绝的任务数。

                - `largest`

                  （整数）线程池中活跃线程的最高数量。

                - `completed`

                  （整数）线程池执行器完成的任务数。

        - `fs`

          （对象）包含该节点的文件存储统计信息。

          - `fs` 的属性

            - `timestamp`

              （整数）文件存储统计信息最后一次刷新的时间。以自 Unix 纪元以来的毫秒数记录。

            - `total`

              （对象）包含该节点所有文件存储的统计信息。

              - `total` 的属性

                - `total`

                  （字节值）所有文件存储的总大小。

                - `total_in_bytes`

                  （整数）所有文件存储的总大小（以字节为单位）。

                - `free`

                  （字节值）所有文件存储中未分配的磁盘空间总量。

                - `free_in_bytes`

                  （整数）所有文件存储中未分配的字节总数。

                - `available`

                  （字节值）此 Java 虚拟机在所有文件存储上可用的磁盘空间总量。由于操作系统或进程级别限制（如 XFS 配额），此值可能小于 `free`。这是 Elasticsearch 节点可利用的实际可用磁盘空间。

                - `available_in_bytes`

                  （整数）此 Java 虚拟机在所有文件存储上可用的字节总数。由于操作系统或进程级别限制（如 XFS 配额），此值可能小于 `free_in_bytes`。这是 Elasticsearch 节点可利用的实际可用磁盘空间。

            - `data`

              （对象数组）所有文件存储的列表。

              - `data` 的属性

                - `path`

                  （字符串）文件存储路径。

                - `mount`

                  （字符串）文件存储的挂载点（例如：`/dev/sda2`）。

                - `type`

                  （字符串）文件存储类型（例如：`ext4`）。

                - `total`

                  （字节值）文件存储总大小。

                - `total_in_bytes`

                  （整数）文件存储总大小（以字节为单位）。

                - `free`

                  （字节值）文件存储中未分配的磁盘空间总量。

                - `free_in_bytes`

                  （整数）文件存储中未分配的字节总数。

                - `available`

                  （字节值）此 Java 虚拟机在此文件存储上可用的磁盘空间总量。

                - `available_in_bytes`

                  （整数）此 Java 虚拟机在此文件存储上可用的字节总数。

                - `low_watermark_free_space`

                  （字节值）该节点上此数据路径的有效低磁盘水位线：当节点的至少一个数据路径的可用空间少于此值时，其磁盘使用已超过低水位线。有关磁盘水位线及其对分片分配影响的更多信息，请参见基于磁盘的分片分配设置。

                - `low_watermark_free_space_in_bytes`

                  （整数）该节点上此数据路径的有效低磁盘水位线（以字节为单位）。

                - `high_watermark_free_space`

                  （字节值）该节点上此数据路径的有效高磁盘水位线。

                - `high_watermark_free_space_in_bytes`

                  （整数）该节点上此数据路径的有效高磁盘水位线（以字节为单位）。

                - `flood_stage_free_space`

                  （字节值）该节点上此数据路径的有效洪泛阶段磁盘水位线。

                - `flood_stage_free_space_in_bytes`

                  （整数）该节点上此数据路径的有效洪泛阶段磁盘水位线（以字节为单位）。

                - `frozen_flood_stage_free_space`

                  （字节值）专用冻结节点上此数据路径的有效洪泛阶段磁盘水位线。

                - `frozen_flood_stage_free_space_in_bytes`

                  （整数）专用冻结节点上此数据路径的有效洪泛阶段磁盘水位线（以字节为单位）。

            - `io_stats`（仅 Linux）

              （对象）包含该节点的 I/O 统计信息。这些统计信息来自 `/proc/diskstats` 内核接口。此接口统计系统上所有进程执行的 I/O，即使你在容器中运行 Elasticsearch。

              - `io_stats` 的属性

                - `devices`（仅 Linux）

                  （数组）支撑 Elasticsearch 数据路径的每个设备的磁盘指标数组。这些磁盘指标定期探测，并计算上次探测与当前探测之间的平均值。

                  - `devices` 的属性

                    - `device_name`（仅 Linux）

                      （字符串）Linux 设备名称。

                    - `operations`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来该设备完成的读写操作总数。

                    - `read_operations`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来该设备完成的读取操作总数。

                    - `write_operations`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来该设备完成的写入操作总数。

                    - `read_kilobytes`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来该设备读取的千字节总数。

                    - `write_kilobytes`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来该设备写入的千字节总数。

                    - `io_time_in_millis`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来该设备执行 I/O 操作花费的总时间（以毫秒为单位）。

                - `total`（仅 Linux）

                  （对象）支撑 Elasticsearch 数据路径的所有设备的磁盘指标总和。

                  - `total` 的属性

                    - `operations`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来 Elasticsearch 使用的所有设备完成的读写操作总数。

                    - `read_operations`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来所有设备完成的读取操作总数。

                    - `write_operations`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来所有设备完成的写入操作总数。

                    - `read_kilobytes`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来所有设备读取的千字节总数。

                    - `write_kilobytes`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来所有设备写入的千字节总数。

                    - `io_time_in_millis`（仅 Linux）

                      （整数）自启动 Elasticsearch 以来所有设备执行 I/O 操作花费的总时间（以毫秒为单位）。

        - `transport`

          （对象）包含该节点的传输统计信息。

          - `transport` 的属性

            - `server_open`

              （整数）用于节点间内部通信的当前入站 TCP 连接数。

            - `total_outbound_connections`

              （整数）此节点自启动以来已打开的出站传输连接累计数。每个传输连接可能包含多个 TCP 连接，但在此统计中仅计数一次。传输连接通常是长期存在的，因此此统计在稳定集群中应保持不变。

            - `rx_count`

              （整数）内部集群通信期间节点接收的 RX（接收）数据包总数。

            - `rx_size`

              （字节值）内部集群通信期间节点接收的 RX 数据包大小。

            - `rx_size_in_bytes`

              （整数）内部集群通信期间节点接收的 RX 数据包大小（以字节为单位）。

            - `tx_count`

              （整数）内部集群通信期间节点发送的 TX（传输）数据包总数。

            - `tx_size`

              （字节值）内部集群通信期间节点发送的 TX 数据包大小。

            - `tx_size_in_bytes`

              （整数）内部集群通信期间节点发送的 TX 数据包大小（以字节为单位）。

            - `inbound_handling_time_histogram`

              （数组）在传输线程上处理每条入站消息所花费时间的分布，以直方图表示。

              - `inbound_handling_time_histogram` 的属性

                - `ge`

                  （字符串）桶的包含下界，为人类可读字符串。如果第一个桶没有下界，则可能省略。

                - `ge_millis`

                  （整数）桶的包含下界（以毫秒为单位）。如果第一个桶没有下界，则可能省略。

                - `lt`

                  （字符串）桶的不包含上界，为人类可读字符串。如果最后一个桶没有上界，则可能省略。

                - `lt_millis`

                  （整数）桶的不包含上界（以毫秒为单位）。如果最后一个桶没有上界，则可能省略。

                - `count`

                  （整数）传输线程在此桶范围内处理入站消息的次数。

            - `outbound_handling_time_histogram`

              （数组）在传输线程上发送每条出站传输消息所花费时间的分布，以直方图表示。

              - `outbound_handling_time_histogram` 的属性

                - `ge`

                  （字符串）桶的包含下界，为人类可读字符串。

                - `ge_millis`

                  （整数）桶的包含下界（以毫秒为单位）。

                - `lt`

                  （字符串）桶的不包含上界，为人类可读字符串。

                - `lt_millis`

                  （整数）桶的不包含上界（以毫秒为单位）。

                - `count`

                  （整数）传输线程在此桶范围内发送传输消息的次数。

            - `actions`

              （对象）此节点处理的传输流量的逐操作明细，显示传入请求和传出响应的总流量和消息大小直方图。

              - `actions.*.requests` 和 `actions.*.responses` 的属性

                - `count`

                  （整数）当前操作接收的请求总数或发送的响应总数。

                - `total_size`

                  （字节值）当前操作接收的所有请求或发送的所有响应的总大小（人类可读字符串）。

                - `total_size_in_bytes`

                  （整数）当前操作接收的所有请求或发送的所有响应的总大小（以字节为单位）。

                - `histogram`

                  （数组）当前操作接收的请求或发送的响应的大小分布明细。

                  - `histogram` 的属性

                    - `ge`

                      （字节值）桶的包含下界，为人类可读字符串。

                    - `ge_bytes`

                      （整数）桶的包含下界（以字节为单位）。

                    - `lt`

                      （字节值）桶的不包含上界，为人类可读字符串。

                    - `lt_bytes`

                      （整数）桶的不包含上界（以字节为单位）。

                    - `count`

                      （整数）大小在此桶范围内接收请求或发送响应的次数。

        - `http`

          （对象）包含该节点的 HTTP 统计信息。

          - `http` 的属性

            - `current_open`

              （整数）该节点当前打开的 HTTP 连接数。

            - `total_opened`

              （整数）该节点已打开的 HTTP 连接总数。

            - `clients`

              （对象数组）有关当前和最近关闭的 HTTP 客户端连接的信息。关闭时间超过 `http.client_stats.closed_channels.max_age` 设置的客户端不会在此显示。

              - `clients` 的属性

                - `id`

                  （整数）HTTP 客户端的唯一 ID。

                - `agent`

                  （字符串）HTTP 客户端报告的代理。如果不可用，则响应中不包含此属性。

                - `local_address`

                  （字符串）HTTP 连接的本地地址。

                - `remote_address`

                  （字符串）HTTP 连接的远程地址。

                - `last_uri`

                  （字符串）客户端最近请求的 URI。

                - `x_forwarded_for`

                  （字符串）客户端 `x-forwarded-for` HTTP 头的值。如果不可用，则响应中不包含此属性。

                - `x_opaque_id`

                  （字符串）客户端 `x-opaque-id` HTTP 头的值。如果不可用，则响应中不包含此属性。

                - `opened_time_millis`

                  （整数）客户端打开连接的时间。

                - `closed_time_millis`

                  （整数）如果连接已关闭，客户端关闭连接的时间。

                - `last_request_time_millis`

                  （整数）此客户端最近请求的时间。

                - `request_count`

                  （整数）来自此客户端的请求数。

                - `request_size_bytes`

                  （整数）来自此客户端的所有请求的累计大小（以字节为单位）。

        - `breakers`

          （对象）包含该节点的断路器统计信息。

          - `breakers` 的属性

            - `<circuit_breaker_name>`

              （对象）包含断路器的统计信息。

              - `<circuit_breaker_name>` 的属性

                - `limit_size_in_bytes`

                  （整数）断路器的内存限制（以字节为单位）。

                - `limit_size`

                  （字节值）断路器的内存限制。

                - `estimated_size_in_bytes`

                  （整数）操作的估计已用内存（以字节为单位）。

                - `estimated_size`

                  （字节值）操作的估计已用内存。

                - `overhead`

                  （浮点数）断路器所有估计值乘以的常数，用于计算最终估计值。

                - `tripped`

                  （整数）断路器被触发并防止内存溢出错误的总次数。

        - `script`

          （对象）包含该节点的脚本统计信息。

          - `script` 的属性

            - `compilations`

              （整数）该节点执行的内联脚本编译总数。

            - `compilations_history`

              （对象）包含最近的脚本编译历史。

              - `compilations_history` 的属性

                - `5m`

                  （长整数）最近五分钟内的脚本编译数。

                - `15m`

                  （长整数）最近十五分钟内的脚本编译数。

                - `24h`

                  （长整数）最近二十四小时内的脚本编译数。

            - `cache_evictions`

              （整数）脚本缓存驱逐旧数据的总次数。

            - `cache_evictions_history`

              （对象）包含最近的脚本缓存驱逐历史。

              - `cache_evictions_history` 的属性

                - `5m`

                  （长整数）最近五分钟内的脚本缓存驱逐数。

                - `15m`

                  （长整数）最近十五分钟内的脚本缓存驱逐数。

                - `24h`

                  （长整数）最近二十四小时内的脚本缓存驱逐数。

            - `compilation_limit_triggered`

              （整数）脚本编译断路器限制内联脚本编译的总次数。

        - `discovery`

          （对象）包含该节点的节点发现统计信息。

          - `discovery` 的属性

            - `cluster_state_queue`

              （对象）包含该节点集群状态队列的统计信息。

              - `cluster_state_queue` 的属性

                - `total`

                  （整数）队列中的集群状态总数。

                - `pending`

                  （整数）队列中待处理的集群状态数。

                - `committed`

                  （整数）队列中已提交的集群状态数。

            - `published_cluster_states`

              （对象）包含该节点已发布集群状态的统计信息。

              - `published_cluster_states` 的属性

                - `full_states`

                  （整数）已发布的集群状态数。

                - `incompatible_diffs`

                  （整数）已发布集群状态之间不兼容的差异的数量。

                - `compatible_diffs`

                  （整数）已发布集群状态之间兼容的差异的数量。

            - `cluster_state_update`

              （对象）包含该节点作为当选主节点时集群状态更新期间各项活动耗时的低级统计信息。如果节点不符合主节点资格则省略。此对象中每个以 `_time` 结尾的字段也以原始毫秒数表示在以 `_time_millis` 结尾的字段中。以 `_time` 为后缀的人类可读字段仅在通过 `?human=true` 查询参数请求时返回。

              - `cluster_state_update` 的属性

                - `unchanged`

                  （对象）包含未更改集群状态的集群状态更新尝试的统计信息。

                  - `unchanged` 的属性

                    - `count`

                      （长整数）自节点启动以来未更改集群状态的集群状态更新尝试次数。

                    - `computation_time`

                      （时间值）自节点启动以来计算空操作集群状态更新花费的累计时间。

                    - `notification_time`

                      （时间值）自节点启动以来通知空操作集群状态更新监听器花费的累计时间。

                - `success`

                  （对象）包含成功更改集群状态的集群状态更新尝试的统计信息。

                  - `success` 的属性

                    - `count`

                      （长整数）自节点启动以来成功更改集群状态的集群状态更新尝试次数。

                    - `computation_time`

                      （时间值）自节点启动以来计算最终成功的集群状态更新花费的累计时间。

                    - `publication_time`

                      （时间值）自节点启动以来发布最终成功的集群状态更新花费的累计时间，从发布开始（即计算新集群状态之后）直到发布完成且主节点准备好处理下一次状态更新。包括 `context_construction_time`、`commit_time`、`completion_time` 和 `master_apply_time` 测量的时间。

                    - `context_construction_time`

                      （时间值）自节点启动以来为最终成功的发布构建发布上下文花费的累计时间。包括计算当前和新集群状态之间的差异及准备此差异的序列化表示所花费的时间。

                    - `commit_time`

                      （时间值）等待成功集群状态更新提交花费的累计时间，从每次发布开始到多数符合主节点资格的节点将状态写入磁盘并向当选主节点确认写入。

                    - `completion_time`

                      （时间值）等待成功集群状态更新完成花费的累计时间，从每次发布开始到所有其他节点通知当选主节点它们已应用集群状态。

                    - `master_apply_time`

                      （时间值）自节点启动以来在当选主节点上成功应用集群状态更新花费的累计时间。

                    - `notification_time`

                      （时间值）自节点启动以来通知成功集群状态更新监听器花费的累计时间。

                - `failure`

                  （对象）包含未能成功更改集群状态的集群状态更新尝试的统计信息，通常因为在完成之前选举了新的主节点。

                  - `failure` 的属性

                    - `count`

                      （长整数）自节点启动以来未能更改集群状态的集群状态更新尝试次数。

                    - `computation_time`

                      （时间值）自节点启动以来计算最终未成功的集群状态更新花费的累计时间。

                    - `publication_time`

                      （时间值）自节点启动以来发布最终未成功的集群状态更新花费的累计时间。

                    - `context_construction_time`

                      （时间值）自节点启动以来为最终未成功的发布构建发布上下文花费的累计时间。

                    - `commit_time`

                      （时间值）等待未成功的集群状态更新提交花费的累计时间。

                    - `completion_time`

                      （时间值）等待未成功的集群状态更新完成花费的累计时间。

                    - `master_apply_time`

                      （时间值）自节点启动以来在当选主节点上未成功应用集群状态更新花费的累计时间。

                    - `notification_time`

                      （时间值）自节点启动以来通知失败集群状态更新监听器花费的累计时间。

        - `ingest`

          （对象）包含该节点的摄取统计信息。

          - `ingest` 的属性

            - `total`

              （对象）包含该节点摄取操作的统计信息。

              - `total` 的属性

                - `count`

                  （整数）该节点生命周期内摄取的文档总数。

                - `time`

                  （时间值）该节点生命周期内预处理摄取文档花费的总时间。

                - `time_in_millis`

                  （整数）该节点生命周期内预处理摄取文档花费的总时间（以毫秒为单位）。

                - `current`

                  （整数）当前正在摄取的文档总数。

                - `failed`

                  （整数）该节点生命周期内失败的摄取操作总数。

            - `pipelines`

              （对象）包含该节点摄取管道的统计信息。

              - `pipelines` 的属性

                - `<pipeline_id>`

                  （对象）包含摄取管道的统计信息。

                  - `<pipeline_id>` 的属性

                    - `count`

                      （整数）摄取管道预处理的文档数。

                    - `time`

                      （时间值）在摄取管道中预处理文档花费的总时间。

                    - `time_in_millis`

                      （整数）在摄取管道中预处理文档花费的总时间（以毫秒为单位）。

                    - `failed`

                      （整数）摄取管道失败的操作总数。

                    - `ingested_as_first_pipeline`

                      （字节值）由此管道首次处理的所有文档的总摄取大小。如果文档是默认管道之后的最终管道、 reroute 处理器之后运行的管道或管道处理器内的管道，则不会将文档大小添加到此管道的统计值中，而是添加到最初摄取文档的管道的统计值中。

                    - `ingested_as_first_pipeline_in_bytes`

                      （整数）由此管道首次处理的所有文档的总摄取大小（以字节为单位）。

                    - `produced_as_first_pipeline`

                      （字节值）由此管道首次处理的所有文档的总产出大小。

                    - `produced_as_first_pipeline_in_bytes`

                      （整数）由此管道首次处理的所有文档的总产出大小（以字节为单位）。

                    - `processors`

                      （对象数组）包含摄取管道的摄取处理器统计信息。

                      - `processors` 的属性

                        - `<processor>`

                          （对象）包含摄取处理器的统计信息。

                          - `<processor>` 的属性

                            - `count`

                              （整数）处理器转换的文档数。

                            - `time`

                              （时间值）处理器转换文档花费的时间。

                            - `time_in_millis`

                              （整数）处理器转换文档花费的时间（以毫秒为单位）。

                            - `current`

                              （整数）处理器当前正在转换的文档数。

                            - `failed`

                              （整数）处理器失败的操作数。

        - `indexing_pressure`

          （对象）包含该节点的索引压力统计信息。

          - `indexing_pressure` 的属性

            - `memory`

              （对象）包含索引负载的内存消耗统计信息。

              - `memory` 的属性

                - `current`

                  （对象）包含当前索引负载的统计信息。

                  - `current` 的属性

                    - `combined_coordinating_and_primary`

                      （字节值）协调或主分片阶段索引请求消耗的内存。此值不是协调和主分片的总和，因为如果主分片阶段在本地执行，节点可以重用协调内存。

                    - `combined_coordinating_and_primary_in_bytes`

                      （整数）协调或主分片阶段索引请求消耗的内存（以字节为单位）。

                    - `coordinating`

                      （字节值）协调阶段索引请求消耗的内存。

                    - `coordinating_in_bytes`

                      （整数）协调阶段索引请求消耗的内存（以字节为单位）。

                    - `primary`

                      （字节值）主分片阶段索引请求消耗的内存。

                    - `primary_in_bytes`

                      （整数）主分片阶段索引请求消耗的内存（以字节为单位）。

                    - `replica`

                      （字节值）副本阶段索引请求消耗的内存。

                    - `replica_in_bytes`

                      （整数）副本阶段索引请求消耗的内存（以字节为单位）。

                    - `all`

                      （字节值）协调、主分片或副本阶段索引请求消耗的内存。

                    - `all_in_bytes`

                      （整数）协调、主分片或副本阶段索引请求消耗的内存（以字节为单位）。

                - `total`

                  （对象）包含自节点启动以来累计索引负载的统计信息。

                  - `total` 的属性

                    - `combined_coordinating_and_primary`

                      （字节值）协调或主分片阶段索引请求消耗的内存。

                    - `combined_coordinating_and_primary_in_bytes`

                      （整数）协调或主分片阶段索引请求消耗的内存（以字节为单位）。

                    - `coordinating`

                      （字节值）协调阶段索引请求消耗的内存。

                    - `coordinating_in_bytes`

                      （整数）协调阶段索引请求消耗的内存（以字节为单位）。

                    - `primary`

                      （字节值）主分片阶段索引请求消耗的内存。

                    - `primary_in_bytes`

                      （整数）主分片阶段索引请求消耗的内存（以字节为单位）。

                    - `replica`

                      （字节值）副本阶段索引请求消耗的内存。

                    - `replica_in_bytes`

                      （整数）副本阶段索引请求消耗的内存（以字节为单位）。

                    - `all`

                      （字节值）协调、主分片或副本阶段索引请求消耗的内存。

                    - `all_in_bytes`

                      （整数）协调、主分片或副本阶段索引请求消耗的内存（以字节为单位）。

                    - `coordinating_rejections`

                      （整数）协调阶段被拒绝的索引请求数。

                    - `primary_rejections`

                      （整数）主分片阶段被拒绝的索引请求数。

                    - `replica_rejections`

                      （整数）副本阶段被拒绝的索引请求数。

                - `limit`

                  （字节值）索引请求的配置内存限制。副本请求的自动限制为该值的 1.5 倍。

                - `limit_in_bytes`

                  （整数）索引请求的配置内存限制（以字节为单位）。副本请求的自动限制为该值的 1.5 倍。

        - `adaptive_selection`

          （对象）包含该节点的自适应选择统计信息。

          - `adaptive_selection` 的属性

            - `outgoing_searches`

              （整数）从统计信息所属节点发往键节点的未完成搜索请求数。

            - `avg_queue_size`

              （整数）键节点上搜索请求的指数加权移动平均队列大小。

            - `avg_service_time`

              （时间值）键节点上搜索请求的指数加权移动平均服务时间。

            - `avg_service_time_ns`

              （整数）键节点上搜索请求的指数加权移动平均服务时间（以纳秒为单位）。

            - `avg_response_time`

              （时间值）键节点上搜索请求的指数加权移动平均响应时间。

            - `avg_response_time_ns`

              （整数）键节点上搜索请求的指数加权移动平均响应时间（以纳秒为单位）。

            - `rank`

              （字符串）此节点的排名；用于路由搜索请求时的分片选择。

        - `allocations`

          （对象）包含该节点的分配统计信息。

          - `allocations` 的属性

            - `shards`

              （整数）当前分配给此节点的分片数。

            - `undesired_shards`

              （整数）如果使用期望均衡分配器，则计划移至集群中其他位置的分片数，如果使用其他分配器则为 -1。

            - `forecasted_ingest_load`

              （浮点数）分配给此节点的所有分片的预测摄取负载总量。

            - `forecasted_disk_usage`

              （字节值）分配给此节点的所有分片的预测大小。

            - `forecasted_disk_usage_bytes`

              （整数）分配给此节点的所有分片的预测大小（以字节为单位）。

            - `current_disk_usage`

              （字节值）分配给此节点的所有分片的当前大小。

            - `current_disk_usage_bytes`

              （整数）分配给此节点的所有分片的当前大小（以字节为单位）。

## 示例

```bash
# 仅返回索引统计信息
GET /_nodes/stats/indices
# 仅返回操作系统和进程统计信息
GET /_nodes/stats/os,process
# 仅返回 IP 地址为 10.0.0.1 的节点的进程统计信息
GET /_nodes/10.0.0.1/stats/process
```

所有统计信息可以通过 `/_nodes/stats/_all` 或 `/_nodes/stats?metric=_all` 显式请求。

你可以在节点、索引或分片级别获取索引统计信息。

```bash
# 按节点汇总的字段数据
GET /_nodes/stats/indices/fielddata?fields=field1,field2
# 按节点和索引汇总的字段数据
GET /_nodes/stats/indices/fielddata?level=indices&fields=field1,field2
# 按节点、索引和分片汇总的字段数据
GET /_nodes/stats/indices/fielddata?level=shards&fields=field1,field2
# 可以使用通配符指定字段名
GET /_nodes/stats/indices/fielddata?fields=field*
```

你可以获取在此节点上执行的搜索的搜索组统计信息。

```bash
# 所有组的所有统计信息
GET /_nodes/stats?groups=_all
# 仅索引统计信息中的部分组
GET /_nodes/stats/indices?groups=foo,bar
```

### 仅检索摄取统计信息

要仅返回与摄取相关的节点统计信息，将 `<metric>` 路径参数设置为 `ingest` 并使用 `filter_path` 查询参数。

```bash
GET /_nodes/stats/ingest?filter_path=nodes.*.ingest
```

你也可以使用 `metric` 和 `filter_path` 查询参数获得相同的响应。

```bash
GET /_nodes/stats?metric=ingest&filter_path=nodes.*.ingest
```

要进一步细化响应，更改 `filter_path` 值。例如，以下请求仅返回摄取管道统计信息。

```bash
GET /_nodes/stats?metric=ingest&filter_path=nodes.*.ingest.pipelines
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-stats.html)
