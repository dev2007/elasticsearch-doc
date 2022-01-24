# 搜索 API

返回与请求中定义的查询匹配的搜索命中。

```bash
GET /my-index-000001/_search
```

## 请求

`GET /<target>/_search`

`GET /_search`

`POST /<target>/_search`

`POST /_search`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)来向目标数据流、索引或别名使用此 API。对于跨集群搜索，参阅[配置跨集群搜索权限](/setup/remote_clusters/configure_roles_and_users_for_remote_clusters?id=配置跨集群搜索权限)。

  要在[时间点（PIT）](/rest_apis/search_apis/point_in_time)中搜索别名，必须对别名数据流或索引有 `read` 索引权限。

## 描述

允许你执行搜索查询并返回与查询匹配的搜索命中。你可以使用 [`q` 查询字符串参数](/rest_apis/search_apis/search?id=查询参数)或[请求体](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-body.html#search-request-body)提供搜索查询。

## 路径参数

- `<target>`
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。为了搜索所有数据流和索引，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

!> 可以使用查询参数或请求体参数指定此 API 的多个选项。如果同时使用了这两种参数，则仅使用查询参数。

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

- `allow_partial_search_results`
  （可选，布尔值）如果为 `true`，则在存在分片请求超时或[分片失败](/document_apis/reading_and_writing_documents?id=分片失败)时返回部分结果。如果为 `false`，则返回没有部分结果的错误。默认为 `true`。

  为了覆盖此字段的默认值，将集群设置 `search.default_allow_partial_results` 设为 `false`。

- `analyzer`
  （可选，字符串）用于查询字符串的分析器。

  仅当 `q` 查询参数被指定时，此参数可用。

- `analyze_wildcard`
  （可选，布尔值）如果为 `true`，通配符和前缀查询将被分析。默认为 `false`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `batched_reduce_size`
  （可选，整数）协调节点上应立即减少的分片数。如果请求中可能存在大量分片，则应将此值用作保护机制，以减少每个搜索请求的内存开销。默认为 `512`。

- `ccs_minimize_roundtrips`
  （可选，布尔值）如果为 `true`，在执行跨集群搜索（CCS）请求时，协调节点和远程集群之间的网络往返行程最小化。参阅 [跨群集搜索如何处理网络延迟](/search_your_data/search_across_clusters?id=跨群集搜索如何处理网络延迟)。默认为 `true`。

- `default_operator`
  （可选，字符串）查询字符串查询的默认运算符：`AND` 或 `OR`。默认为 `OR`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `df`
  （可选，字符串）在查询字符串中未给出字段前缀的情况下，要用作默认值的字段。

  仅当 `q` 查询参数被指定时，此参数可用。

- `docvalue_fields`
  （可选，字符串）以逗号分隔的字段列表，用于返回每个命中字段的 docvalue 表示形式。

- `expand_wildcards`
  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
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
  （可选，布尔值）如果为 `true`，作为命中的一部分返回有关分数计算的详细信息。默认为 `false`。

- `from`
  （可选，整数）文档偏移的开始值。默认为 `0`。

  默认情况下，使用 `from` 和 `size` 参数不能翻阅超过 10,000 次命中。要翻阅更多命中，请使用 [`search_after`](/search_your_data/paginate_search_results?id=搜寻) 参数。

- `ignore_throttled`
  （可选，布尔值）如果为 `true`，当冻结时，将忽略具体索引、扩展的或别名索引。默认为 `true`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，缺少或关闭的索引不包括在响应中。默认为 `false`。

- `lenient`
  （可选，布尔值）如果为 `true`，将忽略查询字符串中基于格式的查询失败（例如向数字字段提供文本）。默认为 `false`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `max_concurrent_shard_requests`
  （可选，整数）定义此搜索并发执行的每个节点的并发分片请求数。此值应用于限制搜索对集群的影响，以限制并发分片请求的数量。默认为 `5`。

- `pre_filter_shard_size`
  （可选，整数）定义一个阈值，如果搜索请求扩展到的碎片数超过阈值，则该阈值将基于查询重写强制预筛选搜索碎片的预筛选往返。例如，如果一个分片无法根据其重写方法匹配任何文档，即如果日期筛选器必须匹配，但分片边界和查询不相交，则此筛选器往返可以显著限制分片的数量。未指定时，如果满足以下任何条件，则执行预过滤阶段：

  - 该请求针对 `128` 个以上的分片。
  - 该请求以一个或多个只读索引为目标。
  - 查询的主要排序以索引字段为目标。

- `preference`
  （可选，字符串）用于搜索的节点和分片。默认情况下，Elasticsearch 使用[自适应副本选择](/search_your_data/search_shard_routing?id=自适应副本选择)从符合条件的节点和分片中进行选择，以考虑[分配感知](/setup/config/cluster_level_shard_allocation_and_routing_settings?id=分片分配感知)。

  - `preference` 合法值
    - `_only_local`
      仅在本地节点上的分片上运行搜索。
    - `_local`
      如果可能，在本地节点上的分片上运行搜索。如果没有，请使用默认方法选择分片。
    - `_only_nodes:<node-id>,<node-id>`
      仅在指定的节点 ID 上运行搜索。如果在多个选定节点上存在合适的分片，请使用默认方法在这些节点上使用分片。如果指定的节点都不可用，请使用默认方法从任何可用节点中选择分片。
    - `_prefer_nodes:<node-id>,<node-id>`
      如果可能，请在指定的节点 ID 上运行搜索。如果没有，请使用默认方法选择分片。
    - `_shards:<shard>,<shard>`
      仅在指定的分片上运行搜索。你可以将此值与其他 `preference` 值组合，不包括 `<custom-string>`。但是 `_shards` 值必须放在第一位。例如：`_shards:2,3|_local`。
    - `<custom-string>`
      如果可能，请在指定的节点 ID 上运行搜索。如果没有，请使用默认方法选择分片。
- `q`
  （可选，字符串）Lucene 查询字符串语法中的查询。

  你可以使用 `q` 参数来运行查询参数搜索。查询参数搜索不支持完整的 Elasticsearch [查询 DSL](/query_dsl)，但便于测试。

  !> `q` 参数覆盖请求正文中的查询参数。如果同时指定了这两个参数，则不会返回与查询请求正文参数匹配的文档。

- `request_cache`
  （可选，布尔值）如果为 `true`，对 `size` 为 `0` 的请求启用搜索结果缓存。参阅[分片请求缓存设置](/setup/config/shard_request_cache_setttings)。默认为索引级设置。

- `rest_total_hits_as_int`
  (可选，布尔值)指示是否 `hits.total` 应在搜索响应中呈现为整数或对象。默认为 `false`。

- `routing`
  （可选，字符串）用于将操作路由到特定分片的自定义值。

- `scroll`
  （可选，[时间值](/rest_apis/api_convention/common_options?id=时间单位)）保留用于滚动的[搜索上下文](/search_your_data/paginate_search_results?id=保持搜索上下文存活)的期间。参阅[滚动搜索结果](/search_your_data/paginate_search_results?id=滚动搜索结果)。

  默认情况下，此值不能超过 `1d`（24小时）。你可以通过 `search.max_keep_alive` 集群设置修改些限制。

- `search_type`
  （可选，字符串）如何为[相关性评分](/query_dsl/query_and_filter_context?id=相关性评分)计算[分布式词语频率](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)。

  - `search_type` 有效值
    - `query_then_fetch`
      （默认）对于运行搜索的每个分片，本地计算分布式词语频率。我们建议使用此选项进行更快的搜索，但评分可能不太准确。
    - `dfs_query_then_fetch`
      使用从运行搜索的所有分片收集的信息，全局计算分布式术语频率。虽然此选项提高了评分的准确性，但它为每个分片添加了一个往返，这可能会导致搜索速度变慢。

- `seq_no_primary_term`
  （可选，布尔值）如果为 `true`，返回每个命中的最后一次修改的序列号和主项。参阅[乐观并发控制](/rest_apis/document_apis/optimistic_concurrency_control)。

- `size`
  （可选，整数）定义返回的命中数。默认为 `10`。

  默认情况下，使用 `from` 和 `size` 参数不能翻页浏览超过 10,000 次点击。要浏览更多点击，请使用 [`search_after`](/search_your_data/paginate_search_results?id=搜寻)参数。

- `sort`
  （可选，字符串）逗号分隔的 `<field>:<direction>` 列表。

- `_source`
  （可选）指示为匹配文档返回的[源字段](/mapping/metadata_fields/_source-field)。这些字段将在搜索响应的属性 `hits._source` 中返回。默认为 `true`。

  - `_source` 有效值

    - `true`
      （布尔值）全部文档源返回。

    - `false`
      （布尔值）文档源不返回。

    - `<string>`
      （字符串）逗号分隔的待返回的源字段列表。支持通配符（*）。

- `_source_excludes`
  （可选，字符串）逗号分隔的从响应中排除的[源字段](/mapping/metadata_fields/_source-field)。

  你还可以使用此参数从 `_source_includes` 查询参数中指定的子集中排除字段。

  如果 `_source` 参数为 `false`，此参数会被忽略。

- `_source_includes`
  （可选，字符串）逗号分隔的响应中要包含的[源字段](/mapping/metadata_fields/_source-field)。

  如果此参数指定，只有这些源字段会返回。你可以使用 `_source_excludes` 查询参数从该子集中排除字段。

  如果 `_source` 参数为 `false`，此参数会被忽略。

- `stats`
  （可选，字符串）用于日志记录和统计目的的请求的指定 `tag`。

- `stored_fields`
  （可选，字符串）以逗号分隔的存储字段列表，作为命中的一部分返回。如果未指定字段，则响应中不包括存储的字段。

  如果指定了此字段，则 `_source` 参数默认为 `false`。你可以传递 `_source:true` 以返回搜索响应中的源字段和存储字段。

- `suggest_field`
  （可选，字符串）指定哪个字段用于建议。

- `suggest_mode`
  （可远，字符串）指定[建议模式](/rest_apis/search_apis/suggesters)。默认为 `missing`。可用选项为：

  - `always`
  - `missing`
  - `popular`

  仅当指定了 `suggest_field` 和 `suggest_text` 查询字符串参数时，此参数才可用。

- `suggest_size`
  （可选，整数）待返回的[建议](/rest_apis/search_apis/suggesters)数量。

  仅当指定了 `suggest_field` 和 `suggest_text` 查询字符串参数时，此参数才可用。

- `terminate_after`
  （可选，整数）为每个分片收集的最大文档数。如果查询达到此限制，Elasticsearch 会提前终止查询。Elasticsearch 在排序之前收集文档。

  !> 使用要小心。Elasticsearch 将此参数应用于处理请求的每个分片。如果可能，让 Elasticsearch 自动执行提前终止。避免为针对跨多个数据层具有备份索引的数据流的请求指定此参数。

  默认值为 `0`，这不会提前终止查询执行。

- `timeout`
  （可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）指定等待每个分片响应的时间段。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为无超时。

- `track_scores`
  （可选，布尔值）如果为 `true`，计算并返回文档分数，即使分数不用于排序。默认为 `false`。

- `track_total_hits`
  （可选，整数或布尔值）匹配查询以准确计数的命中数。默认为 `10,000`。

  如果为 `true`，返回准确的点击数是以牺牲一些性能为代价的。如果为 `false`，响应不包括与查询匹配的命中总数。

- `typed_keys`
  （可选，布尔值）如果为 `true`，聚合名和建议名在响应中以各自的类型作为前缀。默认为 `false`。

- `version`
  （可选，布尔值）如果为 `true`，作为命中的一部分返回文档版本。默认为 `false`。

## 请求体

- `docvalue_fields`
  （可选，字符串和对象数组）通配符（*）模式数组。该请求返回响应的 `hits.fields` 属性中与这些模式匹配的字段名的文档值。

  你可以在数组中指定字符串或对象。参阅[文档值字段](/search_your_data/retrieve_selected_fields?id=文档值字段)。

  - `docvalue_fields` 对象属性

    - `field`
      （必需，字符串）通配符模式。请求返回与此模式匹配的字段名的文档值。
    - `format`
      （可选，字符串）返回文档值的格式。

      对于[日期字段](/mapping/field_data_types/date)，你可以指定日期的[日期格式](/mapping/mapping_parameters/format)。对于[数字字段](/mapping/field_data_types/numeric)，你可以指定[十进制模式](https://docs.oracle.com/javase/8/docs/api/java/text/DecimalFormat.html)。

      对于其他字段数据类型，此参数不支持。

- `fields`
  （可选，字符串和对象数组）通配符（*）模式数组。该请求返回响应的 `hits.fields` 属性中与这些模式匹配的字段名的文档值。

  你可以在数组中指定字符串或对象。

  - `fields` 对象属性

    - `field`
      （必需，字符串）返回的字段。支持通配符（*）。

    - `format`
      （可选，字符串）日期和地理空间字段的格式。其他字段数据类型不支持此参数。

      [`date`](/mapping/field_data_types/date) 和 [`date_nanos`](/mapping/field_data_types/date_nanoseconds) 字段接受[日期格式](/mapping/mapping_parameters/format)。[`geo_point`](/mapping/field_data_types/geopoint) 和 [`geo_shape`](/mapping/field_data_types/geoshape) 字段接受：

      - `geojson`（默认）
        [GeoJSON](http://www.geojson.org/)
      - `wkt`
        [Well Known Text/知名文本](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)
      - `mvt(<zoom>/<x>/<y>@<extent>) or mvt(<zoom>/<x>/<y>)`
        地图盒矢量块。此 API 返回的块是 base64 编码的字符串。

        - `mvt` 参数
          - `<zoom>`
            （必需，整数）块的缩放级别。支持 `0`-`29`。
          - `<x>`
            （必需，整数）块的 X 坐标。
          - `<y>`
            （必需，整数）块的 Y 坐标。
          - `<extent>`
            （可选，整数）平铺一侧的大小（以像素为单位）。矢量平铺是等边的正方形。默认为 `4,096`。
- `explain`
    （可选，布尔值）如果为 `true`，作为命中的一部分返回有关分数计算的详细信息。默认为 `false`。

- `from`
  （可选，整数）开始文档的偏移量。默认为 `0`。

   默认情况下，使用 `from`和 `size` 参数不能翻页浏览超过 `10,000` 次点击。要浏览更多点击，请使用 [`search_after`](/search_your_data/paginate_search_results?id=搜寻) 参数。

- `indices_boost`
    （可选，对象数组）提高指定索引中文档的 [`_score`](/query_dsl/query_and_filter_context?id=相关性得分)。

  - `indices_boost` 对象属性

    - `<index>: <boost-value>`
      （必需，浮点数）`<index>` 是索引的名字或索引别名。支持通配符（*）。

      `<boost-value>` 是分数乘以的系数。

      提升值大于 `1.0` 会增加分数。介于 `0` 和 `1.0` 之间的提升值会降低分数。

  - `min_score`
    （可选，浮点数）匹配文档的最低 [`_score`](/query_dsl/query_and_filter_context?id=相关性得分)。搜索结果中不包括 `_score` 较低的文档。

  - `pit`
    （可选，对象）限制搜索[时间点（PIT）](/rest_apis/search_apis/point_in_time)，如果你提供了一个 `pit`，你在请求路径中不能指定 `<target>` 。

    - `pit` 属性

      - `id`
        （必需*，字符串）搜索的 PIT 的 ID。如果你提供了 `pit` 对象，此参数就是必需的。
      - `keep_alive`
        （可选，[时间值](/rest_apis/api_convention/common_options?id=时间单位)）用于延长 PIT 生存周期。

  - `query`
    （可选，[查询对象](/query_dsl/query_dsl)）使用 [Query DSL](/query_dsl/query_dsl) 定义搜索定义。

- `runtime_mappings`
  （可选，对象）在搜索请求中定义一个或多个[运行时字段](/mapping/runtime_fields/define_runtime_fields_in_a_search_request)。这些字段优先于具有相同名称的映射字段。

  - `runtime_mappings` 对象属性

    - `<field-name>`
      （必需，对象）配置运行时字段。键（key）是字段名字。

      - `<field-name>` 属性
        - `type`
          （必需，字符串）[字段类型](/mapping/field_data_types)，可以是以下任一种：
          - `boolean`
            - `composite`
            - `date`
            - `double`
            - `geo_point`
            - `ip`
            - `keyword`
            - `long`
          - `script`
            （可选，字符串）查询时执行的 [Plainless Script](/scripting/how_to_write_script/how_to_write_script)。脚本可以访问文档的整个上下文，包括原始 `_source` 和任何映射字段及其值。

            此脚本必须包含 `emit` 以返回计算值。例如：

            ```bash
            "script": "emit(doc['@timestamp'].value.dayOfWeekEnum.toString())"
            ```

- `seq_no_primary_term`
  （可选，布尔值）如果为 `true`，返回每个命中的最后一次修改的序列号和主项。参阅[乐观并发控制](/rest_apis/document_apis/optimistic_concurrency_control)。
  
- `size`
  （可选，整数）定义返回的命中数。默认为 `10`。

  默认情况下，使用 `from` 和 `size` 参数不能翻页浏览超过 10,000 次点击。要浏览更多点击，请使用 [`search_after`](/search_your_data/paginate_search_results?id=搜寻)参数。

- `_source`
  （可选）指示为匹配文档返回的[源字段](/mapping/metadata_fields/_source-field)。这些字段将在搜索响应的属性 `hits._source` 中返回。默认为 `true`。

  - `_source` 有效值

    - `true`
      （布尔值）全部文档源返回。

    - `false`
      （布尔值）文档源不返回。

    - `<string>`
      （字符串）逗号分隔的待返回的源字段列表。支持通配符（*）。

- `stats`
  （可选，字符串数组）要与搜索关联的统计组。每个组为其关联的搜索维护一个统计聚合。你可以使用[索引统计 API](/rest_apis/index_apis/index_stats) 检索这些统计信息。

- `terminate_after`
  （可选，整数）为每个分片收集的最大文档数。如果查询达到此限制，Elasticsearch 会提前终止查询。Elasticsearch 在排序之前收集文档。

  !> 使用要小心。Elasticsearch 将此参数应用于处理请求的每个分片。如果可能，让 Elasticsearch 自动执行提前终止。避免为针对跨多个数据层具有备份索引的数据流的请求指定此参数。

  默认值为 `0`，这不会提前终止查询执行。

- `timeout`
  （可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）指定等待每个分片响应的时间段。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为无超时。

- `version`
  （可选，布尔值）如果为 `true`，作为命中的一部分返回文档版本。默认为 `false`。

## 响应体

- `_scroll_id`
  （字符串）搜索及其[搜索上下文](/search_your_data/paginate_search_results?id=保持搜索上下文存活)的标识符。

  你可以将此滚动 ID 与[滚动 API](/rest_apis/search_apis/scroll) 一起使用，以检索请求的下一批搜索结果。参阅[滚动搜索结果](/search_your_data/paginate_search_results?id=滚动搜索结果)。

  只有在请求中指定了查询参数 `scroll` 时，才会返回此参数。

- `took`
  (整数)Elasticsearch 执行请求花费的毫秒数。

  该值是通过测量协调节点上收到请求与协调节点准备发送响应之间经过的时间来计算的。

  花费时间包括：

  - 协调节点和数据节点之间的通信时间
  - 请求在搜索[线程池](/setup/config/thread_pools)中排队等待执行的时间
  - 实际执行时间

  花费时间不包括：

  - 将请求发送到 Elasticsearch 所需的时间
  - 序列化 JSON 响应所需的时间
  - 将响应发送到客户端所需的时间

- `timed_out`
  （布尔值）如果为 `true`，请求在完成之前超时；返回的结果可能是部分或空的。

- `_shards`
  （对象）包含用于请求的分片数。

  - `_shards` 属性

    - `total`
      （整数）需要查询的分片总数，包括未分配的分片。

    - `successful`
      （整数）成功执行请求的分片数。

    - `skipped`
      （整数）跳过请求的分片数，因为轻量级检查帮助意识到没有文档可能与此分片匹配。这种情况通常发生在搜索请求包含范围筛选器，并且分片只有超出该范围的值时。

    - `failed`
      （整数）无法执行请求的分片数。请注意，未分配的分片将被视为既不成功也不失败。因此，`failed+successful` 少于 `total` 表示未分配部分碎片。

- `hits`
  （对象）包含返回的文档和元数据。

  - `hits` 属性

    - `total`
      （对象）有关返回文档数量的元数据。

      - `total` 属性

        - `value`
          （整数）返回文档的总数。

        - `relation`
          （字符串）指示 `value` 参数中返回的文档数是准确的还是下限。

          - `relation` 值：
            - `eq`
              精确。
            - `gte`
              下限，包括返回的文档

    - `max_score`
      （浮点数）返回的文档的最高 `_score`。

      对于不按 `_score` 排序的请求，此值为 `null`。

    - `hits`
      （对象数组）返回的文档对象数组。

      - `hits` 对象属性

        - `_index`
          （字符串）包含返回文档的索引的名称。
        - `_type`
          （字符串）返回文档的映射类型。
        - `_id`
          （字符串）返回文档的唯一标识符。此ID仅在返回的索引中是唯一的。
        - `_score`
          （浮点数）用于确定返回文档相关性的 32 位正浮点数。
        - `_source`
          （对象）索引时为文档传递的原始 JSON 正文。

          你可以使用 `_source` 参数从响应中排除此属性，或指定要返回的源字段。
        - `fields`
          （对象）包含文档的字段值。必须使用以下一个或多个请求参数在请求中指定这些字段：

          - `docvalue_fields`
          - `script_fields`
          - `stored_fields`

          仅当设置了其中一个或多个参数时，才会返回此属性。

          - `fields` 属性

            - `<field>`
              （数组）键是字段名。值是字段的值。

## 示例

```bash
GET /my-index-000001/_search?from=40&size=20
{
  "query": {
    "term": {
      "user.id": "kimchy"
    }
  }
}
```

此 API 返回以下响应：

```bash
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 20,
      "relation": "eq"
    },
    "max_score": 1.3862942,
    "hits": [
      {
        "_index": "my-index-000001",
        "_type" : "_doc",
        "_id": "0",
        "_score": 1.3862942,
        "_source": {
          "@timestamp": "2099-11-15T14:12:12",
          "http": {
            "request": {
              "method": "get"
            },
            "response": {
              "status_code": 200,
              "bytes": 1070000
            },
            "version": "1.1"
          },
          "source": {
            "ip": "127.0.0.1"
          },
          "message": "GET /search HTTP/1.1 200 1070000",
          "user": {
            "id": "kimchy"
          }
        }
      },
      ...
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)
