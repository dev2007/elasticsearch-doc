# cat 节点 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[节点信息 API](/rest_apis/cluster_apis/nodes_info)。

::::

返回集群节点的信息。

## 请求

```json
GET /_cat/nodes
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 查询参数

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `full_id`（可选，布尔值）

  如果为 `true`，返回完整的节点 ID。如果为 `false`，返回缩短的节点 ID。默认为 `false`。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将按以下列出的顺序返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `ip`、`i`：（默认）IP 地址，例如 `127.0.1.1`。
  - `heap.percent`、`hp`、`heapPercent`：（默认）已分配的 Elasticsearch JVM 堆的使用百分比，例如 `7`。这仅反映在操作系统中运行的 Elasticsearch 进程，是其 JVM/堆/内存资源性能的最直接指标。
  - `heap.max`、`hm`、`heapMax`：总堆大小，例如 `4gb`。
  - `ram.percent`、`rp`、`ramPercent`：（默认）操作系统总内存的使用百分比，例如 `47`。这反映操作系统上运行的所有进程而非仅 Elasticsearch，不保证与其性能相关。
  - `file_desc.percent`、`fdp`、`fileDescriptorPercent`：已用文件描述符百分比，例如 `1`。
  - `node.role`、`r`、`role`、`nodeRole`：（默认）节点的角色。返回值包括 `c`（冷节点）、`d`（数据节点）、`f`（冻结节点）、`h`（热节点）、`i`（接入节点）、`l`（机器学习节点）、`m`（符合主节点资格的节点）、`r`（远程集群客户端节点）、`s`（内容节点）、`t`（转换节点）、`v`（仅投票节点）、`w`（温节点）和 `-`（仅协调节点）。

    例如，`dim` 表示一个符合主节点资格的数据和接入节点。参见[节点设置](/set_up_elasticsearch/configuring_elasticsearch/node)。

  - `master`、`m`：（默认）指示该节点是否为选举出的主节点。返回值包括 `*`（选举出的主节点）和 `-`（非选举出的主节点）。
  - `name`、`n`：（默认）节点名称，例如 `I8hydUG`。
  - `id`、`nodeId`：节点 ID，例如 `k0zy`。
  - `pid`、`p`：进程 ID，例如 `13061`。
  - `port`、`po`：绑定的传输端口，例如 `9300`。
  - `http_address`、`http`：绑定的 HTTP 地址，例如 `127.0.0.1:9200`。
  - `version`、`v`：Elasticsearch 版本，例如 `8.18.8`。
  - `build`、`b`：Elasticsearch 构建哈希值，例如 `5c03844`。
  - `jdk`、`j`：Java 版本，例如 `1.8.0`。
  - `disk.total`、`dt`、`diskTotal`：总磁盘空间，例如 `458.3gb`。
  - `disk.used`、`du`、`diskUsed`：已用磁盘空间，例如 `259.8gb`。
  - `disk.avail`、`d`、`disk`、`diskAvail`：可用磁盘空间，例如 `198.4gb`。
  - `disk.used_percent`、`dup`、`diskUsedPercent`：已用磁盘空间百分比，例如 `47`。
  - `heap.current`、`hc`、`heapCurrent`：已用堆大小，例如 `311.2mb`。
  - `ram.current`、`rc`、`ramCurrent`：已用总内存，例如 `513.4mb`。
  - `ram.max`、`rm`、`ramMax`：总内存，例如 `2.9gb`。
  - `file_desc.current`、`fdc`、`fileDescriptorCurrent`：已用文件描述符，例如 `123`。
  - `file_desc.max`、`fdm`、`fileDescriptorMax`：最大文件描述符数，例如 `1024`。
  - `cpu`：（默认）最近的系统 CPU 使用百分比，例如 `12`。
  - `load_1m`、`l`：（默认）最近的负载平均值，例如 `0.22`。
  - `load_5m`、`l`：（默认）最近五分钟的负载平均值，例如 `0.78`。
  - `load_15m`、`l`：（默认）最近十五分钟的负载平均值，例如 `1.24`。
  - `uptime`、`u`：节点运行时间，例如 `17.3m`。
  - `completion.size`、`cs`、`completionSize`：自动补全大小，例如 `0b`。
  - `fielddata.memory_size`、`fm`、`fielddataMemory`：已用字段数据缓存内存，例如 `0b`。
  - `fielddata.evictions`、`fe`、`fielddataEvictions`：字段数据缓存驱逐次数，例如 `0`。
  - `query_cache.memory_size`、`qcm`、`queryCacheMemory`：已用查询缓存内存，例如 `0b`。
  - `query_cache.evictions`、`qce`、`queryCacheEvictions`：查询缓存驱逐次数，例如 `0`。
  - `query_cache.hit_count`、`qchc`、`queryCacheHitCount`：查询缓存命中次数，例如 `0`。
  - `query_cache.miss_count`、`qcmc`、`queryCacheMissCount`：查询缓存未命中次数，例如 `0`。
  - `request_cache.memory_size`、`rcm`、`requestCacheMemory`：已用请求缓存内存，例如 `0b`。
  - `request_cache.evictions`、`rce`、`requestCacheEvictions`：请求缓存驱逐次数，例如 `0`。
  - `request_cache.hit_count`、`rchc`、`requestCacheHitCount`：请求缓存命中次数，例如 `0`。
  - `request_cache.miss_count`、`rcmc`、`requestCacheMissCount`：请求缓存未命中次数，例如 `0`。
  - `flush.total`、`ft`、`flushTotal`：刷新次数，例如 `1`。
  - `flush.total_time`、`ftt`、`flushTotalTime`：刷新耗时，例如 `1`。
  - `get.current`、`gc`、`getCurrent`：当前 GET 操作数，例如 `0`。
  - `get.time`、`gti`、`getTime`：GET 耗时，例如 `14ms`。
  - `get.total`、`gto`、`getTotal`：GET 操作总数，例如 `2`。
  - `get.exists_time`、`geti`、`getExistsTime`：成功 GET 耗时，例如 `14ms`。
  - `get.exists_total`、`geto`、`getExistsTotal`：成功 GET 操作数，例如 `2`。
  - `get.missing_time`、`gmti`、`getMissingTime`：失败 GET 耗时，例如 `0s`。
  - `get.missing_total`、`gmto`、`getMissingTotal`：失败 GET 操作数，例如 `1`。
  - `indexing.delete_current`、`idc`、`indexingDeleteCurrent`：当前删除操作数，例如 `0`。
  - `indexing.delete_time`、`idti`、`indexingDeleteTime`：删除耗时，例如 `2ms`。
  - `indexing.delete_total`、`idto`、`indexingDeleteTotal`：删除操作总数，例如 `2`。
  - `indexing.index_current`、`iic`、`indexingIndexCurrent`：当前索引操作数，例如 `0`。
  - `indexing.index_time`、`iiti`、`indexingIndexTime`：索引耗时，例如 `134ms`。
  - `indexing.index_total`、`iito`、`indexingIndexTotal`：索引操作总数，例如 `1`。
  - `indexing.index_failed`、`iif`、`indexingIndexFailed`：失败的索引操作数，例如 `0`。
  - `indexing.index_failed_due_to_version_conflict`、`iifvc`、`indexingIndexFailedDueToVersionConflict`：因版本冲突失败的索引操作数，例如 `0`。
  - `merges.current`、`mc`、`mergesCurrent`：当前合并操作数，例如 `0`。
  - `merges.current_docs`、`mcd`、`mergesCurrentDocs`：当前合并文档数，例如 `0`。
  - `merges.current_size`、`mcs`、`mergesCurrentSize`：当前合并大小，例如 `0b`。
  - `merges.total`、`mt`、`mergesTotal`：已完成的合并操作数，例如 `0`。
  - `merges.total_docs`、`mtd`、`mergesTotalDocs`：已合并文档数，例如 `0`。
  - `merges.total_size`、`mts`、`mergesTotalSize`：当前合并大小，例如 `0b`。
  - `merges.total_time`、`mtt`、`mergesTotalTime`：合并文档耗时，例如 `0s`。
  - `refresh.total`、`rto`、`refreshTotal`：刷新次数，例如 `16`。
  - `refresh.time`、`rti`、`refreshTime`：刷新耗时，例如 `91ms`。
  - `script.compilations`、`scrcc`、`scriptCompilations`：脚本编译总数，例如 `17`。
  - `script.cache_evictions`、`scrce`、`scriptCacheEvictions`：从缓存中驱逐的已编译脚本总数，例如 `6`。
  - `search.fetch_current`、`sfc`、`searchFetchCurrent`：当前 fetch 阶段操作数，例如 `0`。
  - `search.fetch_time`、`sfti`、`searchFetchTime`：fetch 阶段耗时，例如 `37ms`。
  - `search.fetch_total`、`sfto`、`searchFetchTotal`：fetch 操作总数，例如 `7`。
  - `search.open_contexts`、`so`、`searchOpenContexts`：打开的搜索上下文数，例如 `0`。
  - `search.query_current`、`sqc`、`searchQueryCurrent`：当前 query 阶段操作数，例如 `0`。
  - `search.query_time`、`sqti`、`searchQueryTime`：query 阶段耗时，例如 `43ms`。
  - `search.query_total`、`sqto`、`searchQueryTotal`：query 操作总数，例如 `9`。
  - `search.scroll_current`、`scc`、`searchScrollCurrent`：打开的 scroll 上下文数，例如 `2`。
  - `search.scroll_time`、`scti`、`searchScrollTime`：scroll 上下文保持打开的时间，例如 `2m`。
  - `search.scroll_total`、`scto`、`searchScrollTotal`：已完成的 scroll 上下文数，例如 `1`。
  - `segments.count`、`sc`、`segmentsCount`：段数量，例如 `4`。
  - `segments.memory`、`sm`、`segmentsMemory`：段使用的内存，例如 `1.4kb`。
  - `segments.index_writer_memory`、`siwm`、`segmentsIndexWriterMemory`：索引写入器使用的内存，例如 `18mb`。
  - `segments.version_map_memory`、`svmm`、`segmentsVersionMapMemory`：版本映射使用的内存，例如 `1.0kb`。
  - `segments.fixed_bitset_memory`、`sfbm`、`fixedBitsetMemory`：用于嵌套对象字段类型和 join 字段中引用的类型过滤器的固定位集使用的内存，例如 `1.0kb`。
  - `suggest.current`、`suc`、`suggestCurrent`：当前建议操作数，例如 `0`。
  - `suggest.time`、`suti`、`suggestTime`：建议耗时，例如 `0`。
  - `suggest.total`、`suto`、`suggestTotal`：建议操作总数，例如 `0`。
  - `shard_stats.total_count`、`sstc`、`shards`、`shardStatsTotalCount`：已分配的分片数量。
  - `mappings.total_count`、`mtc`、`mappingsTotalCount`：映射数量，包括运行时字段和对象字段。
  - `mappings.total_estimated_overhead_in_bytes`、`mteo`、`mappingsTotalEstimatedOverheadInBytes`：此节点上映射的估计堆开销（字节），每个映射字段按 1KiB 堆计算。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

- `include_unloaded_segments`（可选，布尔值）

  如果为 `true`，响应将包含未加载到内存中的段的信息。默认为 `false`。

## 示例

### 默认列示例

```json
GET /_cat/nodes?v=true
```

API 返回以下响应：

```text
ip        heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
127.0.0.1           65          99  42    3.07                  dim       *      mJw06l1
```

`ip`、`heap.percent`、`ram.percent`、`cpu` 和 `load_*` 列提供每个节点的 IP 地址和性能信息。

`node.role`、`master` 和 `name` 列提供用于监控整个集群（特别是大型集群）的有用信息。

### 显式列示例

以下 API 请求返回 `id`、`ip`、`port`、`v`（version）和 `m`（master）列。

```json
GET /_cat/nodes?v=true&h=id,ip,port,v,m
```

API 返回以下响应：

```text
id   ip        port  v         m
veJR 127.0.0.1 59938 8.18.8 *
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-nodes.html)
