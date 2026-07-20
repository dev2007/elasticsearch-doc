# cat 索引 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[获取索引 API](/rest_apis/index_apis/get_index)。

::::

返回集群中索引的高层信息，包括数据流的后备索引。

## 请求

```json
GET /_cat/indices/<target>
```

```json
GET /_cat/indices
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。你还必须拥有所检索的任何数据流、索引或别名的 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

使用 cat 索引 API 获取集群中每个索引的以下信息：

- 分片数量
- 文档数量
- 已删除文档数量
- 主分片存储大小
- 所有分片（包括分片副本）的总存储大小

这些指标直接从 Lucene 检索，Elasticsearch 在内部使用 Lucene 来支持索引和搜索。因此，所有文档计数都包含隐藏的嵌套文档。

要获取 Elasticsearch 文档的准确计数，请使用 [cat 计数 API](/rest_apis/compact_and_aligned_text_apis/cat_count)或 [count API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-count.html)。

请注意，对于从仅源快照恢复的索引，不会显示文档计数、已删除文档计数和存储大小等信息，因为这些索引不包含用于检索此信息的相关数据结构。

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

- `health`（可选，字符串）

  用于限制返回索引的健康状态。有效值为：

  - `green`
  - `yellow`
  - `red`

  默认情况下，响应包含任何健康状态的索引。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `include_unloaded_segments`（可选，布尔值）

  如果为 `true`，响应将包含未加载到内存中的段的信息。默认为 `false`。

- `master_timeout`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 `30s`。也可以设置为 `-1` 表示请求永不超时。

- `pri`（primary shards）（可选，布尔值）

  如果为 `true`，响应仅包含主分片的信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `time`（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）

  用于显示时间值的单位。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

- `expand_wildcards`（可选，字符串）

  通配符模式可以匹配的索引类型。如果请求可以目标数据流，此参数决定通配符表达式是否匹配隐藏数据流。支持逗号分隔值，如 `open,hidden`。有效值为：

  - `all`：匹配任何数据流或索引，包括隐藏的。
  - `open`：匹配打开的非隐藏索引。也匹配任何非隐藏数据流。
  - `closed`：匹配关闭的非隐藏索引。也匹配任何非隐藏数据流。数据流不能被关闭。
  - `hidden`：匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或两者组合使用。
  - `none`：不接受通配符模式。

## 示例

```json
GET /_cat/indices/my-index-*?v=true&s=index
```

API 返回以下响应：

```text
health status index            uuid                   pri rep docs.count docs.deleted store.size pri.store.size dataset.size
yellow open   my-index-000001  u8FNjxh8Rfy_awN11oDKYQ   1   1       1200            0     88.1kb         88.1kb       88.1kb
green  open   my-index-000002  nYFWZEO7TUiOjLQXBaYJpA   1   0          0            0       260b           260b         260b
```
