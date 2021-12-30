# 索引统计 API

返回一个或多个索引的统计。对于数据流，API 返回数据流的备份索引的的统计。

```bash
GET /my-index-000001/_stats
```

## 请求

`GET /<target>/_stats/<index-metric>`

`GET /<target>/_stats`

`GET /_stats`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 描述

使用索引统计 API 获取一个或多个数据流和索引的高级聚合和统计信息。

默认情况下，返回的统计信息是索引级别的，包含 `primaries` 和 `total` 聚合。`primaries` 是仅主分片的值。`total` 是主分片和副本分片的累积值。

要获取分片级别统计信息，请将 `level` 参数设置为 `shards`。

> 移动到另一个节点时，将清除分片的碎片级别统计信息。尽管分片不再是节点的一部分，但该节点保留分片所贡献的任何节点级统计信息。

## 路径参数

- `<target>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

- `<index-metric>`

  （可选，字符串）用于限制请求的，逗号分隔的指标。支持的指标有：

  - `_all`
    返回所有统计
  
  - `completion`
    [完成建议](/search_apis/suggesters?id=完成建议器)统计。

  - `docs`
    尚未合并的文档数和已删除的文档数。[索引刷新](rest_apis/index_apis/refresh)会影响统计。

  - `fielddata`
    [字段数据](https://www.elastic.co/guide/en/elasticsearch/reference/current/fielddata.html)统计。

  - `flush`
    [Flush](/rest_apis/index_apis/flush) 统计

  - `get`
    获取统计，包括丢失的统计。

  - `indexing`
    [索引](/rest_apis/document_apis/index)统计。

  - `merge`
    [合并](/index_modules/merge)统计。

  - `query_cache`
    [查询缓存](/setup/config/node_query_cache_settings)统计。

  - `refresh`
    [刷新](/rest_apis/index_apis/refresh)统计。

  - `request_cache`
    [分片请求缓存](/setup/config/shard_request_cache_setttings)统计。

  - `search`
    搜索统计信息，包括建议统计信息。您可以通过添加额外的 `groups` 参数（搜索操作可以与一个或多个组关联）来包括自定义组的统计信息。`groups` 参数接受以逗号分隔的组名列表。使用 `_all` 返回所有组的统计信息。

  - `segments`
    所有开放段的内存使用。

    如果 `include_segment_file_size` 参数为 `true`，则此度量包括每个 Lucene 索引文件的聚合磁盘使用率。

  - `store`
    [字节单位](/rest_apis/api_convention/common_options?id=字节大小单位)的索引大小。

  - `suggest`
    [建议器](/rest_apis/search_apis/suggesters)统计。

  - `translog`
    [事务日志](/index_modules/translog)统计。

  - `warmer`
    [warmer](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-warmers.html) 统计。

## 查询参数

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

- `fields`

  （可选，字符串）逗号分隔的包含在统计中的字段列表或通配符表达式。

  除非在 `completion_fields` 或 `fielddata_fields` 参数中提供了特定字段列表，否则用作默认列表。

- `completion_fields`

  （可选，字符串）逗号分隔的包含在 `fielddata` 和 `suggest` 统计中的字段列表或通配符表达式。

- `fielddata_fields`

  （可选，字符串）逗号分隔的包含在 `fielddata` 统计中的字段列表或通配符表达式。

- `forbid_closed_indices`

  （可选，布尔值）如果为 `true`，不会从关闭索引统计。默认为 `true`。

- `groups`

  （可选，字符串）逗号分隔的包含在 `search` 统计中的字段列表或通配符表达式。

- `level`

  （可选，字符串）表明是在群集、索引还是分片级别聚合统计信息。

  有效值有：

  - `cluster`

  - `indices`

  - `shards`

- `include_segment_file_sizes`

  （可选，布尔值）如果为 `true`，该调用报告每个 Lucene 索引文件的聚合磁盘使用情况（仅在请求段统计信息时适用）。默认为 `false`。

- `include_unloaded_segments`

  （可选，布尔值）如果为 `true`，响应包括来自未加载到内存中的段的信息。默认为 `false`。

## 示例

### 获取多个数据流的统计信息并指示

```bash
GET /index1,index2/_stats
```

### 获取群集中所有数据流和索引的统计信息

```bash
GET /_stats
```

### 获取指定的统计

以下请求仅返回所有索引的 `merge` 和 `refresh` 统计信息。

```bash
GET /_stats/merge,refresh
```

### 获取特定搜索组的统计信息

以下请求仅返回 `group1` 和 `group2` 搜索组的搜索统计信息。

```bash
GET /_stats/search?groups=group1,group2
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-stats.html)
