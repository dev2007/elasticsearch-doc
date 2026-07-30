# cat 段 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[紧凑和对齐文本（CAT）API](/rest_apis/compact_and_aligned_text_apis/compact_and_aligned_text_apis)。

::::

::::caution 警告

cat API 仅用于通过命令行或 Kibana 控制台供人工查看，不适用于应用程序。如需供应用程序使用，请使用[索引段 API](/rest_apis/index_apis/index_segments)。

::::

返回索引分片中 Lucene 段的低级信息，类似于索引段 API。

对于数据流，API 返回有关数据流后备索引的信息。

## 请求

```json
GET /_cat/segments/<target>
```

```json
GET /_cat/segments
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。你还必须拥有所检索的任何数据流、索引或别名的 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

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
  - `ip`：（默认）段所在分片的 IP 地址，例如 `127.0.1.1`。
  - `segment`：（默认）段名称，例如 `_0`。段名称派生自段代数，在内部用于在分片目录中创建文件名。
  - `generation`：（默认）代数，例如 `0`。Elasticsearch 为每个写入的段递增此代数。然后 Elasticsearch 使用此数字来派生段名称。
  - `docs.count`：（默认）Lucene 报告的文档数量。这不包括已删除的文档，并将任何嵌套文档与其父文档分开计数。它还不包括最近索引但尚未属于某个段的文档。
  - `docs.deleted`：（默认）Lucene 报告的已删除文档数量，可能高于或低于你执行的删除操作数。此数字不包括最近执行但尚未属于某个段的删除。已删除文档由自动合并过程在合适的情况下清理。此外，Elasticsearch 会创建额外的已删除文档来内部跟踪分片上操作的最近历史。
  - `size`：（默认）段使用的磁盘空间，例如 `50kb`。
  - `size.memory`：（默认）为高效搜索而存储在内存中的段数据字节数，例如 `1264`。

    值为 `-1` 表示 Elasticsearch 无法计算此数字。

  - `committed`：（默认）如果为 `true`，段已同步到磁盘。已同步的段可以在硬重启中存活。

    如果为 `false`，未提交段的数据也存储在事务日志中，以便 Elasticsearch 能够在下次启动时回放更改。

  - `searchable`：（默认）如果为 `true`，段是可搜索的。

    如果为 `false`，段很可能已写入磁盘但需要刷新才能搜索。

  - `version`：（默认）用于写入段的 Lucene 版本。
  - `compound`：（默认）如果为 `true`，段存储在复合文件中。这意味着 Lucene 将段中的所有文件合并为一个文件以节省文件描述符。
  - `id`：节点 ID，例如 `k0zy`。

- `help`（可选，布尔值）

  如果为 `true`，响应将包含帮助信息。默认为 `false`。

- `s`（可选，字符串）

  用于对响应进行排序的列名或列别名的逗号分隔列表。

- `v`（可选，布尔值）

  如果为 `true`，响应将包含列标题。默认为 `false`。

## 示例

```json
GET /_cat/segments?v=true
```

API 返回以下响应：

```text
index shard prirep ip        segment generation docs.count docs.deleted size size.memory committed searchable version compound
test  0     p      127.0.0.1 _0               0          1            0  3kb           0 false     true       9.12.1   true
test1 0     p      127.0.0.1 _0               0          1            0  3kb           0 false     true       9.12.1   true
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cat-segments.html)
