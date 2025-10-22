# 集群统计 API

:::info 新 API 参考
有关最新的 API 详细信息，请参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

返回集群统计信息。

## 请求

```bash
GET /_cluster/stats
```

```bash
GET /_cluster/stats/nodes/<node_filter>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

集群统计 API 允许从集群范围的角度检索统计信息。该 API 返回基本索引指标（分片数量、存储大小、内存使用情况）以及有关当前构成集群的节点的信息（数量、角色、操作系统、JVM 版本、内存使用情况、CPU 和已安装插件）。

## 路径参数

- `<node_filter>`：

（可选，字符串）用于限制返回信息的[节点过滤器](/rest_apis/cluster_apis)逗号分隔列表。默认为集群中的所有节点。

## 查询参数

- `timeout`：

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待每个节点响应的时长。如果节点在超时过期前未响应，则响应中不包含其统计信息。但是，超时的节点包含在响应的 `_nodes.failed` 属性中。默认为无超时。

- `include_remotes`：

  （可选，布尔值）如果为`true`，则在响应中包含远程集群信息。默认为 `false`，因此不返回远程集群信息。

## 响应体

- `_nodes`：

  （对象）包含有关由请求的[节点过滤器](/rest_apis/cluster_apis)选择的节点数量的统计信息。

  - `_nodes` 属性

    - `total`：

      （整数）由请求选择的节点总数。

    - `successful`：

      （整数）成功响应请求的节点数量。

    - `failed`：

      （整数）拒绝请求或未能响应的节点数量。如果此值不为 `0`，则响应中包含拒绝或失败的原因。

- `cluster_name`：

  （字符串）集群名称，基于[集群名称设置](/set_up_elasticsearch/configuring_elasticsearch/miscellaneous_cluster_settings#集群名字设置)。

- `cluster_uuid`：

  （字符串）集群的唯一标识符。

- `timestamp`：

  （整数）集群统计信息最后刷新时的 [Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)，以毫秒为单位。

- `status`：

  （字符串）集群的健康状态，基于其主分片和副本分片的状态。状态包括：

  - `green`：所有分片已分配。
  - `yellow`：所有主分片已分配，但一个或多个副本分片未分配。如果集群中的节点发生故障，部分数据可能在该节点修复前不可用。
  - `red`：一个或多个主分片未分配，因此部分数据不可用。这可能在集群启动期间主分片分配时短暂发生。

  参见[集群健康](/rest_apis/cluster_apis/cluster_health)。

- `indices`：（对象）包含有关具有分配给所选节点的分片的索引的统计信息。

  - `indices` 属性

    - `count`：（整数）具有分配给所选节点的分片的索引总数。

    - `shards`：（对象）包含有关分配给所选节点的分片的统计信息。

      - `shards` 属性

        - `total`：（整数）分配给所选节点的分片总数。
        - `primaries`：（整数）分配给所选节点的主分片数量。
        - `replication`：（浮点数）所有所选节点中副本分片与主分片的比率。
        - `index`：（对象）包含有关分配给所选节点的分片的统计信息。

          - `index` 属性

            - `shards`：（对象）包含有关分配给所选节点的分片数量的统计信息。

              - `shards` 属性

                - `min`：（整数）索引中的最小分片数，仅计算分配给所选节点的分片。
                - `max`：（整数）索引中的最大分片数，仅计算分配给所选节点的分片。
                - `avg`：（浮点数）索引中的平均分片数，仅计算分配给所选节点的分片。

            - `primaries`：（对象）包含有关分配给所选节点的主分片数量的统计信息。

              - `primaries` 属性

                - `min`：（整数）索引中的最小主分片数，仅计算分配给所选节点的分片。
                - `max`：（整数）索引中的最大主分片数，仅计算分配给所选节点的分片。
                - `avg`：（浮点数）索引中的平均主分片数，仅计算分配给所选节点的分片。

            - `replication`：（对象）包含有关分配给所选节点的复制分片数量的统计信息。

              - `replication` 属性

                - `min`：（浮点数）索引中的最小复制因子，仅计算分配给所选节点的分片。
                - `max`：（浮点数）索引中的最大复制因子，仅计算分配给所选节点的分片。
                - `avg`：（浮点数）索引中的平均复制因子，仅计算分配给所选节点的分片。

    - `docs`：（对象）包含所选节点中文档的计数。

      - `docs` 属性

        - `count`：（整数）分配给所选节点的所有主分片中的非删除文档总数。此数字基于 Lucene 段中的文档，可能包括嵌套字段的文档。
        - `deleted`：（整数）分配给所选节点的所有主分片中的删除文档总数。此数字基于 Lucene 段中的文档。Elasticsearch 在段合并时回收已删除 Lucene 文档的磁盘空间。
        - `total_size_in_bytes`：（整数）分配给所选节点的所有主分片的总大小（字节）。
        - `total_size`：（字符串）分配给所选节点的所有主分片的总大小，为人类可读字符串。

    - `store`：（对象）包含有关分配给所选节点的分片大小的统计信息。

      - `store`属性

        - `size`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的总大小。
        - `size_in_bytes`：（整数）分配给所选节点的所有分片的总大小（字节）。
        - `total_data_set_size`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单)）分配给所选节点的所有分片的总数据集大小。这包括未完全存储在节点上的分片大小，例如[部分挂载索引](searchable-snapshots.html#partially-mounted)的缓存。
        - `total_data_set_size_in_bytes`：（整数）分配给所选节点的所有分片的总数据集大小（字节）。这包括未完全存储在节点上的分片大小，例如部分挂载索引的缓存。
        - `reserved`：（[字节值](/rest_apis/api_conventions#字节大小单位)）由于正在进行的对等恢复、恢复快照和类似活动，预测分片存储最终将增长的大小。
        - `reserved_in_bytes`：（整数）由于正在进行的对等恢复、恢复快照和类似活动，预测分片存储最终将增长的大小（字节）。

    - `fielddata`：（对象）包含有关所选节点的[字段数据缓存](modules-fielddata.html)的统计信息。

      - `fielddata` 属性

        - `memory_size`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的字段数据缓存使用的内存总量。
        - `memory_size_in_bytes`：（整数）分配给所选节点的所有分片的字段数据缓存使用的内存总量（字节）。
        - `evictions`：（整数）分配给所选节点的所有分片的字段数据缓存中的驱逐总数。
        - `global_ordinals.build_time`：（[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）为所有字段构建全局序数的总时间。
        - `global_ordinals.build_time_in_millis`：（整数）为所有字段构建全局序数的总时间（毫秒）。
        - `global_ordinals.fields.[field-name].build_time`：（[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）为指定名字段构建全局序数的总时间。
        - `global_ordinals.fields.[field-name].build_time_in_millis`：（整数）为指定名字段构建全局序数的总时间（毫秒）。
        - `global_ordinals.fields.[field-name].shard_max_value_count`：（长整型）为指定名字段构建全局序数的总时间。

    - `query_cache`：（对象）包含有关所选节点查询缓存的统计信息。

      - `query_cache` 属性

        - `memory_size`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的查询缓存使用的内存总量。
        - `memory_size_in_bytes`：（整数）分配给所选节点的所有分片的查询缓存使用的内存总量（字节）。
        - `total_count`：（整数）分配给所选节点的所有分片的查询缓存中的命中和未命中总数。
        - `hit_count`：（整数）分配给所选节点的所有分片的查询缓存命中总数。
        - `miss_count`：（整数）分配给所选节点的所有分片的查询缓存未命中总数。
        - `cache_size`：（整数）分配给所选节点的所有分片的查询缓存中当前的条目总数。
        - `cache_count`：（整数）添加到分配给所选节点的所有分片的查询缓存中的条目总数。此数字包括当前和已驱逐的条目。
        - `evictions`：（整数）分配给所选节点的所有分片的查询缓存驱逐总数。

    - `completion`：（对象）包含有关所选节点中用于完成的内存使用的统计信息。

      - `completion` 属性

        - `size`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的完成功能使用的内存总量。
        - `size_in_bytes`：（整数）分配给所选节点的所有分片的完成功能使用的内存总量（字节）。

        - `segments`：（对象）包含有关所选节点中段的统计信息。

        - `count`：（整数）分配给所选节点的所有分片的段总数。
        - `memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的段使用的内存总量。
        - `memory_in_bytes`：（整数）分配给所选节点的所有分片的段使用的内存总量（字节）。
        - `terms_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的词条使用的内存总量。
        - `terms_memory_in_bytes`：（整数）分配给所选节点的所有分片的词条使用的内存总量（字节）。
        - `stored_fields_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的存储字段使用的内存总量。
        - `stored_fields_memory_in_bytes`：（整数）分配给所选节点的所有分片的存储字段使用的内存总量（字节）。
        - `term_vectors_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的词条向量使用的内存总量。
        - `term_vectors_memory_in_bytes`：（整数）分配给所选节点的所有分片的词条向量使用的内存总量（字节）。
        - `norms_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的规范化因子使用的内存总量。
        - `norms_memory_in_bytes`：（整数）分配给所选节点的所有分片的规范化因子使用的内存总量（字节）。
        - `points_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的点数据使用的内存总量。
        - `points_memory_in_bytes`：（整数）分配给所选节点的所有分片的点数据使用的内存总量（字节）。
        - `doc_values_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的文档值使用的内存总量。
        - `doc_values_memory_in_bytes`：（整数）分配给所选节点的所有分片的文档值使用的内存总量（字节）。
        - `index_writer_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的所有索引写入器使用的内存总量。
        - `index_writer_memory_in_bytes`：（整数）分配给所选节点的所有分片的所有索引写入器使用的内存总量（字节）。
        - `version_map_memory`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的所有版本映射使用的内存总量。
        - `version_map_memory_in_bytes`：（整数）分配给所选节点的所有分片的所有版本映射使用的内存总量（字节）。
        - `fixed_bit_set`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）分配给所选节点的所有分片的固定位集使用的内存总量。固定位集用于嵌套对象字段类型和[联接](/mapping/filed_data_types/join)字段的类型过滤器。
        - `fixed_bit_set_memory_in_bytes`：（整数）分配给所选节点的所有分片的固定位集使用的内存总量（字节）。
        - `max_unsafe_auto_id_timestamp`：（整数）最近重试的索引请求的[Unix 时间戳](https://en.wikipedia.org/wiki/Unix_time)，以毫秒为单位。
        - `file_sizes`：（对象）此对象未由集群统计 API 填充。要获取段文件信息，请使用[节点统计 API](/rest_apis/cluster_apis/nodes_stats)。

  - `mappings`：（对象）包含有关所选节点中[字段映射](/mapping)的统计信息。

    - `mappings` 属性

      - `total_field_count`：（整数）所有非系统索引中的字段总数。
      - `total_deduplicated_field_count`：（整数）所有非系统索引中的字段总数，考虑映射去重。
      - `total_deduplicated_mapping_size`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）去重和压缩后所有映射的总大小。
      - `total_deduplicated_mapping_size_in_bytes`：（整数）去重和压缩后所有映射的总大小（字节）。
      - `field_types`：（对象数组）包含有关所选节点中使用的[字段数据类型](/mapping/field_data_types)的统计信息。
      - `name`：（字符串）所选节点中使用的字段数据类型。
      - `count`：（整数）所选节点中映射到该字段数据类型的字段数量。
      - `index_count`：（整数）所选节点中包含该字段数据类型映射的索引数量。
      - `indexed_vector_count`：（整数）对于 dense_vector 字段类型，所选节点中索引的向量类型数量。
      - `indexed_vector_dim_min`：（整数）对于 dense_vector 字段类型，所选节点中所有索引向量类型的最小维度。
      - `indexed_vector_dim_max`：（整数）对于 dense_vector 字段类型，所选节点中所有索引向量类型的最大维度。
      - `vector_index_type_count`：（对象）对于 dense_vector 字段类型，按索引类型分类的索引向量类型数量。
      - `vector_similarity_type_count`：（对象）对于 dense_vector 字段类型，按相似性类型分类的向量类型数量。
      - `vector_element_type_count`：（对象）对于 dense_vector 字段类型，按元素类型分类的向量类型数量。
      - `script_count`：（整数）声明脚本的字段数量。
      - `lang`：（字符串数组）可选脚本使用的脚本语言。
      - `lines_max`：（整数）单个字段脚本的最大行数。
      - `lines_total`：（整数）脚本的总行数。
      - `chars_max`：（整数）单个字段脚本的最大字符数。
      - `chars_total`：（整数）脚本的总字符数。
      - `source_max`：（整数）单个字段脚本对\_source 的最大访问次数。
      - `source_total`：（整数）脚本对\_source 的总访问次数。
      - `doc_max`：（整数）单个字段脚本对 doc_values 的最大访问次数。
      - `doc_total`：（整数）脚本对 doc_values 的总访问次数。
      - `runtime_field_types`：（对象数组）包含有关所选节点中使用的[运行时字段数据类型](/mapping/runtime_fields/map_a_runtime_field)的统计信息。
      - `name`：（字符串）所选节点中使用的字段数据类型。
      - `count`：（整数）所选节点中映射到该运行时字段数据类型的运行时字段数量。
      - `index_count`：（整数）所选节点中包含该运行时字段数据类型映射的索引数量。
      - `scriptless_count`：（整数）未声明脚本的运行时字段数量。
      - `shadowed_count`：（整数）遮蔽索引字段的运行时字段数量。
      - `lang`：（字符串数组）运行时字段脚本使用的脚本语言。
      - `lines_max`：（整数）单个运行时字段脚本的最大行数。
      - `lines_total`：（整数）定义当前运行时字段数据类型的脚本的总行数。
      - `chars_max`：（整数）单个运行时字段脚本的最大字符数。
      - `chars_total`：（整数）定义当前运行时字段数据类型的脚本的总字符数。
      - `source_max`：（整数）单个运行时字段脚本对\_source 的最大访问次数。
      - `source_total`：（整数）定义当前运行时字段数据类型的脚本对\_source 的总访问次数。
      - `doc_max`：（整数）单个运行时字段脚本对 doc_values 的最大访问次数。
      - `doc_total`：（整数）定义当前运行时字段数据类型的脚本对 doc_values 的总访问次数。

  - `analysis`：（对象）包含有关所选节点中使用的[分析器和分析器组件](/text_analysis/concepts/antomy_of_an_analyzer)的统计信息。

    - `analysis` 对象属性

      - `char_filter_types`：（对象数组）包含有关所选节点中使用的[字符过滤器](/text_analysis/character_filters_reference)类型的统计信息。

        - `char_filter_types` 对象属性
          - `name`：（字符串）所选节点中使用的字符过滤器类型。
          - `count`：（整数）所选节点中使用该字符过滤器类型的分析器或规范化器数量。
          - `index_count`：（整数）所选节点中使用该字符过滤器类型的索引数量。

      - `tokenizer_types`：（对象数组）包含有关所选节点中使用的[分词器](/text_analysis/tokenizer_reference)类型的统计信息。

        - `tokenizer_types` 对象属性
          - `name`：（字符串）所选节点中使用的分词器类型。
          - `count`：（整数）所选节点中使用该分词器类型的分析器或规范化器数量。
          - `index_count`：（整数）所选节点中使用该分词器类型的索引数量。

      - `filter_types`：（对象数组）包含有关所选节点中使用的[词条过滤器](/text_analysis/token_filter_reference)类型的统计信息。

        - `filter_types` 对象属性
          - `name`：（字符串）所选节点中使用的词条过滤器类型。
          - `count`：（整数）所选节点中使用该词条过滤器类型的分析器或规范化器数量。
          - `index_count`：（整数）所选节点中使用该词条过滤器类型的索引数量。

      - `analyzer_types`：（对象数组）包含有关所选节点中使用的[分析器](/text_analysis/concepts/antomy_of_an_analyzer)类型的统计信息。

        - `analyzer_types` 对象属性
          - `name`：（字符串）所选节点中使用的分析器类型。
          - `count`：（整数）所选节点中该分析器类型的出现次数。
          - `index_count`：（整数）所选节点中使用该分析器类型的索引数量。

      - `built_in_char_filters`：（对象数组）包含有关所选节点中使用的内置[字符过滤器](/text_analysis/character_filters_reference)的统计信息。

        - `built_in_char_filters` 对象属性
          - `name`：（字符串）所选节点中使用的内置字符过滤器。
          - `count`：（整数）所选节点中使用该内置字符过滤器的分析器或规范化器数量。
          - `index_count`：（整数）所选节点中使用该内置字符过滤器的索引数量。

      - `built_in_tokenizers`：（对象数组）包含有关所选节点中使用的内置[分词器](/text_analysis/tokenizer_reference)的统计信息。

        - `built_in_tokenizers` 对象属性
          - `name`：（字符串）所选节点中使用的内置分词器。
          - `count`：（整数）所选节点中使用该内置分词器的分析器或规范化器数量。
          - `index_count`：（整数）所选节点中使用该内置分词器的索引数量。

      - `built_in_filters`：（对象数组）包含有关所选节点中使用的内置[词条过滤器](/text_analysis/token_filter_reference)的统计信息。

        - `built_in_filters` 对象属性
          - `name`：（字符串）所选节点中使用的内置词条过滤器。
          - `count`：（整数）所选节点中使用该内置词条过滤器的分析器或规范化器数量。
          - `index_count`：（整数）所选节点中使用该内置词条过滤器的索引数量。

      - `built_in_analyzers`：（对象数组）包含有关所选节点中使用的内置[分析器](/text_analysis/builtin_analyzer_reference)的统计信息。

        - `built_in_analyzers` 对象属性
          - `name`：（字符串）所选节点中使用的内置分析器。
          - `count`：（整数）所选节点中该内置分析器的出现次数。
          - `index_count`：（整数）所选节点中使用该内置分析器的索引数量。

      - `synonyms`：（对象）包含有关[同义词](/text_analysis/token_filter_reference/synonym)和[同义词图](/text_analysis/token_filter_reference/synonym_graph)词条过滤器配置中定义的同义词的统计信息。

        - `synonyms` 对象属性

          - `inline`：（对象）使用同义词或同义词图词条过滤器中的 `synonyms` 配置定义的内联同义词。

            - `inline` 对象属性
              - `count`：（整数）所选节点中内联同义词配置的出现次数。每个内联同义词配置单独计数，无论定义的同义词如何。具有相同同义词的两个同义词配置将计为单独出现。
              - `index_count`：（整数）使用内联同义词配置进行同义词词条过滤器的索引数量。

          - `paths`：（对象）包含有关在[同义词](/text_analysis/token_filter_reference/synonym)和[同义词图](/text_analysis/token_filter_reference/synonym_graph)词条过滤器配置中定义为 `synonyms_path` 的同义词文件的统计信息。

            - `paths` 对象属性
              - `count`：（整数）所选节点中唯一同义词路径的出现次数。
              - `index_count`：（整数）使用 `synonyms_path` 配置进行同义词词条过滤器的索引数量。

          - `sets`：（对象）包含有关在[同义词](/text_analysis/token_filter_reference/synonym)和[同义词图](/text_analysis/token_filter_reference/synonym_graph)词条过滤器配置中配置为`synonyms_set`的同义词集的统计信息。

            - `sets` 对象属性
              - `count`：（整数）所选节点中唯一同义词集的出现次数。
              - `index_count`：（整数）使用 `synonyms_set` 配置进行同义词词条过滤器的索引数量。

  - `search`：（对象）包含有关提交到在搜索执行期间充当协调器的所选节点的搜索请求的使用统计信息。搜索请求在成功解析时被跟踪，无论其结果如何：解析后产生错误的请求以及不访问任何数据的请求都会贡献使用统计。

    - `search` 对象属性
      - `total`：（整数）传入搜索请求的总数。未指定请求体的搜索请求不计入。
      - `queries`：（对象）所选节点中使用的查询类型。对于每个查询，报告其在`query`或`post_filter`部分中使用的名称和次数。查询每个搜索请求计数一次，意味着如果同一查询类型在同一搜索请求中使用多次，其计数器将增加 1 而不是在该单个搜索请求中的使用次数。
      - `sections`：（对象）所选节点中使用的搜索部分。对于每个部分，报告其名称和使用次数。
      - `retrievers`：（对象）所选节点中使用的检索器类型。对于每个检索器，报告其名称和使用次数。

  - `dense_vector`：（对象）包含有关所选节点中使用的索引密集向量的统计信息。

    - `dense_vector` 对象属性
      - `value_count`：（整数）所选节点中索引的密集向量总数。

  - `sparse_vector`：（对象）包含有关所选节点中使用的索引稀疏向量的统计信息。

    - `sparse_vector` 对象属性
      - `value_count`：（整数）分配给所选节点的所有主分片中索引的稀疏向量总数。

- `nodes`：（对象）包含有关由请求的[节点过滤器](/rest_apis/cluster_apis)选择的节点的统计信息。

  - `nodes` 对象属性

    - `count`：（对象）包含由请求的[节点过滤器](/rest_apis/cluster_apis)选择的节点的计数。

      - `total`：（整数）选择的节点总数。
      - `coordinating_only`：（整数）没有[角色](/set_up_elasticsearch/configuring_elasticsearch/node_settings)的所选节点数量。这些节点被视为[仅协调](/set_up_elasticsearch/configuring_elasticsearch/node_settings)节点。
      - `<role>`：（整数）具有该角色的所选节点数量。有关角色列表，请参见[节点设置](/set_up_elasticsearch/configuring_elasticsearch/node_settings)。

    - `versions`：（字符串数组）所选节点上使用的 Elasticsearch 版本数组。

    - `os`：（对象）包含有关所选节点使用的操作系统的统计信息。

      - `os` 对象属性

        - `available_processors`：（整数）所有所选节点中 JVM 可用的处理器数量。
        - `allocated_processors`：（整数）用于计算所有所选节点中线程池大小的处理器数量。此数字可以通过节点的 `processors` 设置设置，默认为操作系统报告的处理器数量。在这两种情况下，此数字永远不会大于 `32`。
        - `names`：（对象数组）包含有关所选节点使用的操作系统的统计信息。

          - `names` 对象属性
            - `name`：（字符串）一个或多个所选节点使用的操作系统名称。
            - `count`：（字符串）使用该操作系统的所选节点数量。

        - `pretty_names`：（对象数组）包含有关所选节点使用的操作系统的统计信息。

          - `pretty_names` 对象属性
            - `pretty_name`：（字符串）一个或多个所选节点使用的人类可读操作系统名称。
            - `count`：（字符串）使用该操作系统的所选节点数量。

        - `architectures`：（对象数组）包含有关所选节点使用的处理器架构（例如 x86_64 或 aarch64）的统计信息。

          - `architectures` 对象属性
            - `arch`：（字符串）一个或多个所选节点使用的架构名称。
            - `count`：（字符串）使用该架构的所选节点数量。

        - `mem`：（对象）包含有关所选节点使用的内存的统计信息。

          - `mem` 对象属性
            - `total`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点的物理内存总量。
            - `total_in_bytes`：（整数）所有所选节点的物理内存总量（字节）。
            - `adjusted_total`：（[字节值](/rest_apis/api_conventions#字节大小单位)）所有所选节点的内存总量，但对于那些设置了`es.total_memory_bytes`系统属性的节点，使用该系统属性指定的值而不是测量的总内存。
            - `adjusted_total_in_bytes`：（整数）所有所选节点的内存总量（字节），但对于那些设置了`es.total_memory_bytes`系统属性的节点，使用该系统属性指定的值而不是测量的总内存。
            - `free`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点的空闲物理内存量。
            - `free_in_bytes`：（整数）所有所选节点的空闲物理内存量（字节）。
            - `used`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点中使用的物理内存量。
            - `used_in_bytes`：（整数）所有所选节点中使用的物理内存量（字节）。
            - `free_percent`：（整数）所有所选节点的空闲物理内存百分比。
            - `used_percent`：（整数）所有所选节点中使用的物理内存百分比。

    - `process`：（对象）包含有关所选节点使用的进程的统计信息。

      - `process` 对象属性

        - `cpu`：（对象）包含有关所选节点使用的 CPU 的统计信息。
          - `cpu` 对象属性
            - `percent`：（整数）所有所选节点中使用的 CPU 百分比。如果不支持，返回 `-1`。
        - `open_file_descriptors`：（对象）包含有关所选节点中打开文件描述符的统计信息。

          - `open_file_descriptors` 对象属性
            - `min`：（整数）所有所选节点中并发打开文件描述符的最小数量。如果不支持，返回 `-1`。
            - `max`：（整数）所有所选节点中允许的并发打开文件描述符的最大数量。如果不支持，返回 `-1`。
            - `avg`：（整数）并发打开文件描述符的平均数量。如果不支持，返回 `-1`。

    - `jvm`：（对象）包含有关所选节点使用的 Java 虚拟机（JVM）的统计信息。

      - `jvm` 对象属性

        - `max_uptime`：（[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）自 JVM 上次启动以来的运行时间。
        - `max_uptime_in_millis`：（整数）自 JVM 上次启动以来的运行时间（毫秒）。
        - `versions`：（对象数组）包含有关所选节点使用的 JVM 版本的统计信息。

          - `versions` 对象属性
            - `version`：（字符串）一个或多个所选节点使用的 JVM 版本。
            - `vm_name`：（字符串）JVM 的名称。
            - `vm_version`：（字符串）JVM 的完整版本号。完整版本号包括加号（`+`）后跟构建号。
            - `vm_vendor`：（字符串）JVM 的供应商。
            - `bundled_jdk`：（布尔值）始终为`true`。所有发行版都附带捆绑的 Java 开发工具包（JDK）。
            - `using_bundled_jdk`：（布尔值）如果为`true`，则 JVM 正在使用捆绑的 JDK。
            - `count`：（整数）使用 JVM 的所选节点总数。

        - `mem`：（对象）包含有关所选节点使用的内存的统计信息。
          - `mem` 对象属性
            - `heap_used`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点中堆当前使用的内存。
            - `heap_used_in_bytes`：（整数）所有所选节点中堆当前使用的内存（字节）。
            - `heap_max`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点中堆可用的最大内存量（字节）。
            - `heap_max_in_bytes`：（整数）所有所选节点中堆可用的最大内存量（字节）。
        - `threads`：（整数）所有所选节点中 JVM 使用的活动线程数。

    - `fs`：（对象）包含有关所选节点使用的文件存储的统计信息。

      - `fs` 对象属性
        - `total`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点的文件存储总大小。
        - `total_in_bytes`：（整数）所有所选节点的文件存储总大小（字节）。
        - `free`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点的文件存储中未分配的磁盘空间量。
        - `free_in_bytes`：（整数）所有所选节点的文件存储中未分配的总字节数。
        - `available`：（[字节单位](/rest_apis/api_convention/common_options#字节大小单位)）所有所选节点的文件存储中 JVM 可用的总磁盘空间量。根据操作系统或进程级限制，此量可能小于`nodes.fs.free`。这是所选 Elasticsearch 节点可用的实际空闲磁盘空间量。
        - `available_in_bytes`：（整数）所有所选节点的文件存储中 JVM 可用的总字节数。根据操作系统或进程级限制，此数字可能小于 `nodes.fs.free_in_bytes`。这是所选 Elasticsearch 节点可用的实际空闲磁盘空间量。

    - `plugins`：（对象数组）包含有关所选节点安装的插件和模块的统计信息。如果未安装插件或模块，此数组为空。

      - `plugins` 对象属性

        - `<plugin>`：（对象）包含有关已安装插件或模块的统计信息。

          - `<plugin>` 对象属性
            - `name`：（字符串）Elasticsearch 插件的名称。
            - `version`：（字符串）插件构建所用的 Elasticsearch 版本。
            - `elasticsearch_version`：（字符串）插件构建所用的 Elasticsearch 版本。
            - `java_version`：（字符串）插件构建所用的 Java 版本。
            - `description`：（字符串）插件的简短描述。
            - `classname`：（字符串）用作插件入口点的类名。
            - `extended_plugins`：（字符串数组）此插件通过 Java 服务提供者接口（SPI）扩展的其他插件数组。如果此插件未扩展其他插件，此数组为空。
            - `has_native_controller`：（布尔值）如果为`true`，则插件具有本机控制器进程。

    - `network_types`：（对象）包含有关所选节点使用的传输和 HTTP 网络的统计信息。

      - `network_types` 对象属性

        - `transport_types`：（对象）包含有关所选节点使用的传输网络类型的统计信息。

          - `transport_types` 对象属性
            - `<transport_type>`：（整数）使用该传输类型的所选节点数量。

        - `http_types`：（对象）包含有关所选节点使用的 HTTP 网络类型的统计信息。

          - `http_types` 对象属性
            - `<http_type>`：（整数）使用该 HTTP 类型的所选节点数量。

    - `discovery_types`：（对象）包含有关所选节点使用的[发现类型](/set_up_elasticsearch/discovery_and_cluster_formation/discovery)的统计信息。

      - `discovery_types` 对象属性
        - `<discovery_type>`：（整数）使用该[发现类型](/set_up_elasticsearch/discovery_and_cluster_formation/discovery)查找其他节点的所选节点数量。

    - `packaging_types`：（对象数组）包含有关所选节点上安装的 Elasticsearch 发行版的统计信息。

      - `packaging_types` 对象属性
        - `flavor`：（字符串）Elasticsearch 发行版的类型。始终为`default`。
        - `type`：（字符串）发行版包使用的文件类型，例如`tar`或`zip`。
        - `count`：（整数）使用该发行版风味和文件类型的所选节点数量。

- `snapshots`：（对象）包含有关集群中[快照](snapshot-restore.html)活动的统计信息。

  - `snapshots` 对象属性

    - `current_counts`：（对象）包含报告集群中各种正在进行的快照活动数量的统计信息。

      - `current_counts` 对象属性
        - `snapshots`：（整数）集群当前正在创建的快照和克隆总数。
        - `shard_snapshots`：（整数）集群中未完成的分片快照总数。
        - `snapshot_deletions`：（整数）集群当前正在运行的快照删除操作总数。
        - `concurrent_operations`：（整数）集群当前并发运行的快照操作总数。这是`snapshots`和`snapshot_deletions`条目的总和，并受[`snapshot.max_concurrent_operations`设置](snapshot-settings.html#snapshot-max-concurrent-ops)限制。
        - `cleanups`：（整数）集群当前运行的存储库清理操作总数。这些操作不计入并发操作总数。

    - `repositories`：（对象）包含按存储库分组的快照活动进度统计信息。此对象包含集群注册的每个存储库的一个条目。

      - `repositories` 对象属性

        - `current_counts`：（对象）包含报告此存储库各种正在进行的快照活动数量的统计信息。

          - `current_counts` 对象属性
            - `snapshots`：（整数）此存储库中正在进行的快照总数。
            - `clones`：（整数）此存储库中正在进行的快照克隆总数。
            - `finalizations`：（整数）此存储库中正在进行的快照和克隆操作总数，这些操作大部分完成，只差最后的“完成”步骤。
            - `deletions`：（整数）此存储库中正在进行的快照删除操作总数。
            - `snapshot_deletions`：（整数）当前正从此存储库删除的快照总数。
            - `active_deletions`：（整数）此存储库中当前正在进行的快照删除操作总数。快照删除不与其他快照操作并发运行，因此如果任何待删除操作正在等待其他操作完成，此值可能为`0`。
            - `shards`：（对象）包含报告存储库正在进行的快照活动的分片级进度统计信息。请注意，这些统计信息仅与正在进行的快照相关。
              - `total`：（整数）此存储库当前跟踪的分片快照总数。此统计信息仅计及正在进行的快照中的分片，因此当快照完成时会下降，如果没有正在进行的快照，则为`0`。
              - `complete`：（整数）此存储库中已完成的分片快照总数。此统计信息仅计及正在进行的快照中的分片，因此当快照完成时会下降，如果没有正在进行的快照，则为`0`。
              - `incomplete`：（整数）此存储库中未完成的分片快照总数。这是`total`和`complete`值的差。
              - `states`：（对象）此存储库中每个命名状态的分片快照总数。这些状态是快照过程的实现细节，可能在版本之间更改。此处包含以供专家用户使用，但其他情况下应忽略。

        - `oldest_start_time`：（字符串）此存储库中最早运行的快照的开始时间。
        - `oldest_start_time_in_millis`：（整数）此存储库中最早运行的快照的开始时间，表示为自 Unix 纪元以来的毫秒数。

- `repositories`：（对象）包含有关集群中定义的[快照](/snapshot_and_restore)存储库的统计信息，按存储库类型分组。

  - `repositories` 对象属性

    - `count`：（整数）集群中此类型存储库的数量。
    - `read_only`：（整数）集群中注册为只读的此类型存储库数量。
    - `read_write`：（整数）集群中未注册为只读的此类型存储库数量。

    每种存储库类型可能还包括其他关于该类型存储库的统计信息。

- `ccs`：（对象）包含有关集群中[跨集群搜索](/search_your_data/search_across_clusters)设置和活动的信息。

  - `ccs` 对象属性

    - `clusters`：（对象）包含从远程集群收集的远程集群设置和指标。键是集群名称，值是每个集群的数据。仅当`include_remotes`选项设置为`true`时存在。

      - `clusters` 对象属性

        - `cluster_uuid`：（字符串）远程集群的 UUID。
        - `mode`：（字符串）用于与远程集群通信的[连接模式](/set_up_elasticsearch/remote_clusters)。
        - `skip_unavailable`：（布尔值）用于此远程集群的 `skip_unavailable` [设置](/search_your_data/search_across_clusters)。
        - `transport.compress`：（字符串）用于此远程集群的传输压缩设置。
        - `version`：（字符串数组）远程集群节点上使用的 Elasticsearch 版本列表。
        - `status`：（字符串）集群的健康状态，基于其主分片和副本分片的状态。状态包括：

          - `green`：所有分片已分配。
          - `yellow`：所有主分片已分配，但一个或多个副本分片未分配。如果集群中的节点发生故障，部分数据可能在该节点修复前不可用。
          - `red`：一个或多个主分片未分配，因此部分数据不可用。这可能在集群启动期间主分片分配时短暂发生。

            参见[集群健康](/rest_apis/cluster_apis/cluster-health)。

        - `nodes_count`：（整数）远程集群中的节点总数。
        - `shards_count`：（整数）远程集群中的分片总数。
        - `indices_count`：（整数）远程集群中的索引总数。
        - `indices_total_size_in_bytes`：（整数）分配给所选节点的所有分片的总数据集大小（字节）。
        - `indices_total_size`：（字符串）分配给所选节点的所有分片的总数据集大小，为人类可读字符串。
        - `max_heap_in_bytes`：（整数）远程集群节点中堆可用的最大内存量（字节）。
        - `max_heap`：（字符串）远程集群节点中堆可用的最大内存量，为人类可读字符串。
        - `mem_total_in_bytes`：（整数）远程集群节点的物理内存总量（字节）。
        - `mem_total`：（字符串）远程集群节点的物理内存总量，为人类可读字符串。

    - `_search`：（对象）包含有关[跨集群搜索](/search_your_data/search_across_clusters)使用的信息。

      - `_search` 对象属性

        - `total`：（整数）集群已执行的跨集群搜索请求总数。
        - `success`：（整数）集群已成功执行的跨集群搜索请求总数。
        - `skipped`：（整数）至少跳过一个远程集群的跨集群搜索请求（成功或失败）总数。
        - `took`：（对象）包含有关执行跨集群搜索请求所花费时间的统计信息。

          - `took` 对象属性
            - `max`：（整数）执行跨集群搜索请求的最大时间（毫秒）。
            - `avg`：（整数）执行跨集群搜索请求的平均时间（毫秒）。
            - `p90`：（整数）执行跨集群搜索请求的时间的第 90 百分位数（毫秒）。

        - `took_mrt_true`：（对象）包含有关[`ccs_minimize_roundtrips`](/rest_apis/search_apis/search)设置为 `true` 的跨集群搜索请求所花费时间的统计信息。

          - `took_mrt_true` 对象属性
            - `max`：（整数）执行跨集群搜索请求的最大时间（毫秒）。
            - `avg`：（整数）执行跨集群搜索请求的平均时间（毫秒）。
            - `p90`：（整数）执行跨集群搜索请求的时间的第 90 百分位数（毫秒）。

        - `took_mrt_false`：（对象）包含有关[`ccs_minimize_roundtrips`](/rest_apis/search_apis/search)设置为`false`的跨集群搜索请求所花费时间的统计信息。

          - `took_mrt_false` 对象属性
            - `max`：（整数）执行跨集群搜索请求的最大时间（毫秒）。
            - `avg`：（整数）执行跨集群搜索请求的平均时间（毫秒）。
            - `p90`：（整数）执行跨集群搜索请求的时间的第 90 百分位数（毫秒）。

        - `remotes_per_search_max`：（整数）单个跨集群搜索请求中查询的远程集群的最大数量。
        - `remotes_per_search_avg`：（浮点数）单个跨集群搜索请求中查询的远程集群的平均数量。
        - `failure_reasons`：（对象）包含有关跨集群搜索请求失败原因的统计信息。键是失败原因名称，值是因该原因失败的请求数量。
        - `features`：（对象）包含有关跨集群搜索请求中使用的功能的统计信息。键是搜索功能的名称，值是使用该功能的请求数量。单个请求可以使用多个功能（例如`async`和`wildcard`）。已知功能包括：

          - `features` 对象属性
            - `async` - [异步搜索](/rest_apis/search_apis/async_search)
            - `mrt` - [`ccs_minimize_roundtrips`](/rest_apis/search_apis/search)设置为 `true`。
            - `wildcard` - 搜索请求中使用了索引的[多目标语法](/rest_apis/api_conversions)通配符。

        - `clients`：（对象）包含有关执行跨集群搜索请求的客户端的统计信息。键是客户端名称，值是由该客户端执行的请求数量。仅计及已知客户端（如`kibana`或`elasticsearch`）。
        - `clusters`：（对象）包含有关在跨集群搜索请求中查询的集群的统计信息。键是集群名称，值是每个集群的遥测数据。这也包括本地集群本身，使用名称`(local)`。

          - `clusters` 对象属性

            - `total`：（整数）针对此集群执行的成功的（未跳过的）跨集群搜索请求总数。这可能包括返回部分结果的请求，但不包括完全跳过集群的请求。
            - `skipped`：（整数）跳过此集群的跨集群搜索请求总数。
            - `took`：（对象）包含有关针对此集群执行请求所花费时间的统计信息。

              - `took` 对象属性
                - `max`：（整数）执行跨集群搜索请求的最大时间（毫秒）。
                - `avg`：（整数）执行跨集群搜索请求的平均时间（毫秒）。
                - `p90`：（整数）执行跨集群搜索请求的时间的第 90 百分位数（毫秒）。

    - `_esql`：（对象）包含有关[ES|QL 跨集群搜索](/esql/using_esql/using_esql_across_clusters)使用的信息。对象结构与上面的`_search`对象相同。

## 示例

```bash
GET /_cluster/stats?human&pretty
```

API 返回以下响应：

```json
{
  "_nodes": {
    "total": 1,
    "successful": 1,
    "failed": 0
  },
  "cluster_uuid": "YjAvIhsCQ9CbjWZb2qJw3Q",
  "cluster_name": "elasticsearch",
  "timestamp": 1459427693515,
  "status": "green",
  "indices": {
    "count": 1,
    "shards": {
      "total": 5,
      "primaries": 5,
      "replication": 0,
      "index": {
        "shards": {
          "min": 5,
          "max": 5,
          "avg": 5
        },
        "primaries": {
          "min": 5,
          "max": 5,
          "avg": 5
        },
        "replication": {
          "min": 0,
          "max": 0,
          "avg": 0
        }
      }
    },
    "docs": {
      "count": 10,
      "deleted": 0,
      "total_size": "8.6kb",
      "total_size_in_bytes": 8833
    },
    "store": {
      "size": "16.2kb",
      "size_in_bytes": 16684,
      "total_data_set_size": "16.2kb",
      "total_data_set_size_in_bytes": 16684,
      "reserved": "0b",
      "reserved_in_bytes": 0
    },
    "search": { ... },
    "fielddata": {
      "memory_size": "0b",
      "memory_size_in_bytes": 0,
      "evictions": 0,
      "global_ordinals": {
        "build_time": "0s",
        "build_time_in_millis": 0
      }
    },
    "query_cache": {
      "memory_size": "0b",
      "memory_size_in_bytes": 0,
      "total_count": 0,
      "hit_count": 0,
      "miss_count": 0,
      "cache_size": 0,
      "cache_count": 0,
      "evictions": 0
    },
    "completion": {
      "size": "0b",
      "size_in_bytes": 0
    },
    "segments": {
      "count": 4,
      "memory": "8.6kb",
      "memory_in_bytes": 0,
      "terms_memory": "0b",
      "terms_memory_in_bytes": 0,
      "stored_fields_memory": "0b",
      "stored_fields_memory_in_bytes": 0,
      "term_vectors_memory": "0b",
      "term_vectors_memory_in_bytes": 0,
      "norms_memory": "0b",
      "norms_memory_in_bytes": 0,
      "points_memory": "0b",
      "points_memory_in_bytes": 0,
      "doc_values_memory": "0b",
      "doc_values_memory_in_bytes": 0,
      "index_writer_memory": "0b",
      "index_writer_memory_in_bytes": 0,
      "version_map_memory": "0b",
      "version_map_memory_in_bytes": 0,
      "fixed_bit_set": "0b",
      "fixed_bit_set_memory_in_bytes": 0,
      "max_unsafe_auto_id_timestamp": -9223372036854775808,
      "file_sizes": {}
    },
    "mappings": {
      "total_field_count": 0,
      "total_deduplicated_field_count": 0,
      "total_deduplicated_mapping_size": "0b",
      "total_deduplicated_mapping_size_in_bytes": 0,
      "field_types": [],
      "runtime_field_types": [],
      "source_modes": {
        "stored": 0
      }
    },
    "analysis": {
      "char_filter_types": [],
      "tokenizer_types": [],
      "filter_types": [],
      "analyzer_types": [],
      "built_in_char_filters": [],
      "built_in_tokenizers": [],
      "built_in_filters": [],
      "built_in_analyzers": [],
      "synonyms": {}
    },
    "versions": [
      {
        "version": "8.0.0",
        "index_count": 1,
        "primary_shard_count": 1,
        "total_primary_size": "7.4kb",
        "total_primary_bytes": 7632
      }
    ],
    "dense_vector": {
      "value_count": 0
    },
    "sparse_vector": {
      "value_count": 0
    }
  },
  "nodes": {
    "count": {
      "total": 1,
      "data": 1,
      "coordinating_only": 0,
      "master": 1,
      "ingest": 1,
      "voting_only": 0
    },
    "versions": ["8.18.8"],
    "os": {
      "available_processors": 8,
      "allocated_processors": 8,
      "names": [
        {
          "name": "Mac OS X",
          "count": 1
        }
      ],
      "pretty_names": [
        {
          "pretty_name": "Mac OS X",
          "count": 1
        }
      ],
      "architectures": [
        {
          "arch": "x86_64",
          "count": 1
        }
      ],
      "mem": {
        "total": "16gb",
        "total_in_bytes": 17179869184,
        "adjusted_total": "16gb",
        "adjusted_total_in_bytes": 17179869184,
        "free": "78.1mb",
        "free_in_bytes": 81960960,
        "used": "15.9gb",
        "used_in_bytes": 17097908224,
        "free_percent": 0,
        "used_percent": 100
      }
    },
    "process": {
      "cpu": {
        "percent": 9
      },
      "open_file_descriptors": {
        "min": 268,
        "max": 268,
        "avg": 268
      }
    },
    "jvm": {
      "max_uptime": "13.7s",
      "max_uptime_in_millis": 13737,
      "versions": [
        {
          "version": "12",
          "vm_name": "OpenJDK 64-Bit Server VM",
          "vm_version": "12+33",
          "vm_vendor": "Oracle Corporation",
          "bundled_jdk": true,
          "using_bundled_jdk": true,
          "count": 1
        }
      ],
      "mem": {
        "heap_used": "57.5mb",
        "heap_used_in_bytes": 60312664,
        "heap_max": "989.8mb",
        "heap_max_in_bytes": 1037959168
      },
      "threads": 90
    },
    "fs": {
      "total": "200.6gb",
      "total_in_bytes": 215429193728,
      "free": "32.6gb",
      "free_in_bytes": 35064553472,
      "available": "32.4gb",
      "available_in_bytes": 34802409472
    },
    "plugins": [
      {
        "name": "analysis-icu",
        "version": "8.18.8",
        "description": "The ICU Analysis plugin integrates Lucene ICU module into elasticsearch, adding ICU relates analysis components.",
        "classname": "org.elasticsearch.plugin.analysis.icu.AnalysisICUPlugin",
        "has_native_controller": false
      },
      ...
    ],
    "ingest": {
      "number_of_pipelines": 1,
      "processor_stats": { ... }
    },
    "indexing_pressure": {
      "memory": {
        "current": {
          "combined_coordinating_and_primary": "0b",
          "combined_coordinating_and_primary_in_bytes": 0,
          "coordinating": "0b",
          "coordinating_in_bytes": 0,
          "primary": "0b",
          "primary_in_bytes": 0,
          "replica": "0b",
          "replica_in_bytes": 0,
          "all": "0b",
          "all_in_bytes": 0
        },
        "total": {
          "combined_coordinating_and_primary": "0b",
          "combined_coordinating_and_primary_in_bytes": 0,
          "coordinating": "0b",
          "coordinating_in_bytes": 0,
          "primary": "0b",
          "primary_in_bytes": 0,
          "replica": "0b",
          "replica_in_bytes": 0,
          "all": "0b",
          "all_in_bytes": 0,
          "coordinating_rejections": 0,
          "primary_rejections": 0,
          "replica_rejections": 0,
          "primary_document_rejections": 0
        },
        "limit": "0b",
        "limit_in_bytes": 0
      }
    },
    "network_types": { ... },
    "discovery_types": { ... },
    "packaging_types": [ ... ]
  },
  "snapshots": { ... },
  "repositories": { ... },
  "ccs": {
    "_search": {
      "total": 7,
      "success": 7,
      "skipped": 0,
      "took": {
        "max": 36,
        "avg": 20,
        "p90": 33
      },
      "took_mrt_true": {
        "max": 33,
        "avg": 15,
        "p90": 33
      },
      "took_mrt_false": {
        "max": 36,
        "avg": 26,
        "p90": 36
      },
      "remotes_per_search_max": 3,
      "remotes_per_search_avg": 2.0,
      "failure_reasons": { ... },
      "features": { ... },
      "clients": { ... },
      "clusters": { ... }
    }
  }
}
```

此 API 可以使用[节点过滤器](/rest_apis/cluster_apis)限制为节点的子集：

```bash
GET /_cluster/stats/nodes/node1,node*,master:false
```

如果配置了任何远程集群，此 API 调用将返回有关远程集群的数据：

```bash
GET /_cluster/stats?include_remotes=true
```

生成的响应将包含带有远程集群信息的 `ccs` 对象：

```json
{
  "ccs": {
    "clusters": {
      "remote_cluster": {
        "cluster_uuid": "YjAvIhsCQ9CbjWZb2qJw3Q",
        "mode": "sniff",
        "skip_unavailable": false,
        "transport.compress": "true",
        "version": ["8.16.0"],
        "status": "green",
        "nodes_count": 10,
        "shards_count": 420,
        "indices_count": 10,
        "indices_total_size_in_bytes": 6232658362,
        "max_heap_in_bytes": 1037959168,
        "mem_total_in_bytes": 137438953472
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-stats.html)
