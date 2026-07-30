# cat 分片 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。

::::

shards 命令是节点包含哪些分片的详细视图。它会告诉你分片是主分片还是副本、文档数量、占用的磁盘字节以及所在的节点。

对于数据流，API 返回有关数据流后备索引的信息。

## 请求

```json
GET /_cat/shards/<target>
```

```json
GET /_cat/shards
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。你还必须拥有所检索的任何数据流、索引或别名的 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)才能查看完整信息。

## 路径参数

- `<target>`（可选，字符串）

  用于限制请求的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要目标所有数据流和索引，请省略此参数或使用 `*` 或 `_all`。

## 查询参数

- `bytes`（可选，[字节大小单位](/rest_apis/api_convention/common_options#字节大小单位)）

  用于显示字节值的单位。

- `format`（可选，字符串）

  HTTP accept 头的简短版本。有效值包括 JSON、YAML 等。

- `h`（可选，字符串）

  要显示的列名的逗号分隔列表。

  如果未指定要包含的列，API 将按以下列出的顺序返回默认列。如果显式指定一个或多个列，则仅返回指定的列。

  有效列包括：

  - `index`、`i`、`idx`：（默认）索引名称。
  - `shard`、`s`、`sh`：（默认）分片名称。
  - `prirep`、`p`、`pr`、`primaryOrReplica`：（默认）分片类型。返回值为 `primary` 或 `replica`。
  - `state`、`st`：（默认）分片状态。返回值为：
    - `INITIALIZING`：分片正在从对等分片或网关恢复。
    - `RELOCATING`：分片正在重定位。
    - `STARTED`：分片已启动。
    - `UNASSIGNED`：分片未分配给任何节点。
  - `docs`、`d`、`dc`：（默认）分片中的文档数量，例如 `25`。
  - `store`、`sto`：（默认）分片使用的磁盘空间，例如 `5kb`。
  - `dataset.size`：（默认）分片数据集使用的磁盘空间，可能不是磁盘上的大小，但包括分片在对象存储上使用的空间。以大小值报告，例如 `5kb`。
  - `ip`：（默认）节点的 IP 地址，例如 `127.0.1.1`。
  - `id`：（默认）节点 ID，例如 `k0zy`。
  - `node`、`n`：（默认）节点名称，例如 `I8hydUG`。
  - `completion.size`、`cs`、`completionSize`：自动补全大小，例如 `0b`。
  - `dense_vector.value_count`、`dvc`、`denseVectorCount`：已索引的密集向量数量。
  - `fielddata.memory_size`、`fm`、`fielddataMemory`：已用字段数据缓存内存，例如 `0b`。
  - `fielddata.evictions`、`fe`、`fielddataEvictions`：字段数据缓存驱逐次数，例如 `0`。
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
  - `query_cache.memory_size`、`qcm`、`queryCacheMemory`：已用查询缓存内存，例如 `0b`。
  - `query_cache.evictions`、`qce`、`queryCacheEvictions`：查询缓存驱逐次数，例如 `0`。
  - `recoverysource.type`、`rs`：恢复源类型。
  - `refresh.total`、`rto`、`refreshTotal`：刷新次数，例如 `16`。
  - `refresh.time`、`rti`、`refreshTime`：刷新耗时，例如 `91ms`。
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
  - `seq_no.global_checkpoint`、`sqg`、`globalCheckpoint`：全局检查点。
  - `seq_no.local_checkpoint`、`sql`、`localCheckpoint`：本地检查点。
  - `seq_no.max`、`sqm`、`maxSeqNo`：最大序列号。
  - `sparse_vector.value_count`、`svc`、`sparseVectorCount`：已索引的稀疏向量数量。
  - `suggest.current`、`suc`、`suggestCurrent`：当前建议操作数，例如 `0`。
  - `suggest.time`、`suti`、`suggestTime`：建议耗时，例如 `0`。
  - `suggest.total`、`suto`、`suggestTotal`：建议操作总数，例如 `0`。
  - `sync_id`：分片的同步 ID。
  - `unassigned.at`、`ua`：分片变为未分配状态的时间（协调世界时 UTC）。
  - `unassigned.details`、`ud`：有关分片变为未分配状态的详细信息。这不解释分片当前为何未分配。要了解分片为何未分配，请使用[集群分配解释 API](/rest_apis/cluster_apis/cluster_allocation_explain)。
  - `unassigned.for`、`uf`：请求将分片变为未分配状态的时间（协调世界时 UTC）。
  - `unassigned.reason`、`ur`：指示此未分配分片状态最后一次更改的原因。这不解释分片当前为何未分配。要了解分片为何未分配，请使用[集群分配解释 API](/rest_apis/cluster_apis/cluster_allocation_explain)。返回值包括：
    - `ALLOCATION_FAILED`：由于分片分配失败而未分配。
    - `CLUSTER_RECOVERED`：由于完整集群恢复而未分配。
    - `DANGLING_INDEX_IMPORTED`：由于导入悬空索引而未分配。
    - `EXISTING_INDEX_RESTORED`：由于恢复到已关闭索引而未分配。
    - `FORCED_EMPTY_PRIMARY`：分片分配最后通过[集群重路由 API](/rest_apis/cluster_apis/cluster_reroute)强制空主分片进行修改。
    - `INDEX_CLOSED`：由于索引已关闭而未分配。
    - `INDEX_CREATED`：由于 API 创建索引而未分配。
    - `INDEX_REOPENED`：由于打开已关闭索引而未分配。
    - `MANUAL_ALLOCATION`：分片分配最后通过[集群重路由 API](/rest_apis/cluster_apis/cluster_reroute)进行修改。
    - `NEW_INDEX_RESTORED`：由于恢复到新索引而未分配。
    - `NODE_LEFT`：由于托管它的节点离开集群而未分配。
    - `NODE_RESTARTING`：类似于 `NODE_LEFT`，不同之处在于节点已通过节点关闭 API 注册为正在重启。
    - `PRIMARY_FAILED`：分片正在作为副本初始化，但主分片在初始化完成之前失败。
    - `REALLOCATED_REPLICA`：识别到更好的副本位置，导致现有副本分配被取消。
    - `REINITIALIZED`：当分片从已启动状态回到初始化状态时。
    - `REPLICA_ADDED`：由于显式添加副本而未分配。
    - `REROUTE_CANCELLED`：由于显式取消重路由命令而未分配。

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

## 示例

### 单个数据流或索引示例

```json
GET _cat/shards
```

API 返回以下响应：

```text
my-index-000001 0 p STARTED 3014 31.1mb 192.168.56.10 H5dfFeA
```

### 通配符模式示例

如果你的集群有很多分片，可以在 `<target>` 路径参数中使用通配符模式来限制 API 请求。

以下请求返回以 `my-index-` 开头的任何数据流或索引的信息。

```json
GET _cat/shards/my-index-*
```

API 返回以下响应：

```text
my-index-000001 0 p STARTED 3014 31.1mb 192.168.56.10 H5dfFeA
```

### 重定位分片示例

```json
GET _cat/shards
```

API 返回以下响应：

```text
my-index-000001 0 p RELOCATING 3014 31.1mb 192.168.56.10 H5dfFeA -> -> 192.168.56.30 bGG90GE
```

`state` 列中的 `RELOCATING` 值表示索引分片正在重定位。

### 分片状态示例

在分片可用之前，它会经历 `INITIALIZING` 状态。你可以使用 cat 分片 API 查看哪些分片正在初始化。

```json
GET _cat/shards
```

API 返回以下响应：

```text
my-index-000001 0 p STARTED      3014 31.1mb 192.168.56.10 H5dfFeA
my-index-000001 0 r INITIALIZING    0 14.3mb 192.168.56.30 bGG90GE
```

### 未分配分片原因示例

以下请求返回 `unassigned.reason` 列，该列指示分片未分配的原因。

```json
GET _cat/shards?h=index,shard,prirep,state,unassigned.reason
```

API 返回以下响应：

```text
my-index-000001 0 p STARTED    3014 31.1mb 192.168.56.10 H5dfFeA
my-index-000001 0 r STARTED    3014 31.1mb 192.168.56.30 bGG90GE
my-index-000001 0 r STARTED    3014 31.1mb 192.168.56.20 I8hydUG
my-index-000001 0 r UNASSIGNED ALLOCATION_FAILED
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-shards.html)
