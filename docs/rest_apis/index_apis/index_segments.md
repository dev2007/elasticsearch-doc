# 索引段 API

返回索引分片中的 [Lucene](https://lucene.apache.org/core/) 段的底层信息。对于数据流，API 返回流的备份索引的信息。

```bash
GET /my-index-000001/_segments
```

## 请求

`GET /<target>/_segments`

`GET /_segments`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `monitor` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<target>`
  
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

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

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `verbose`

  【实验特性】（可选，布尔值）如果为 `true`，响应包含 Lucene 内存使用的详细信息。默认为 `false`。

## 响应体

- `<segment>`

  （字符串）段的名字，比如 `_0`。段名称源自段生成，并在内部用于在分片目录中创建文件名。

- `generation`

  （整数值）年代值，通常为 `0`。Elasticsearch 为写入的每个段增加此生成编号。Elasticsearch 再使用此数字派生段名称。

- `num_docs`

  （整数值）Lucene 报告的文档数。这将排除已删除的文档，并将所有[嵌套文档](/mapping/fiedl_data_types/nested)与其父文档分开计数。它还排除了最近编制索引但不属于某个段的文档。

- `deleted_docs`

  （整数值）Lucene 报告的已删除文档数，可能高于或低于你执行的删除操作数。此数字不包括最近执行的但不属于某个段的删除。如果有必要，删除的文档将通过[自动合并过程](/index_modules/merge)进行清理。此外，Elasticsearch 还创建额外的已删除文档，以便在内部跟踪分片上最近的操作历史。

- `size_in_bytes`

  （整数值）用于段的磁盘空间，如 `50kb`。

- `memory_in_bytes`

  （整数值）存储在内存中用于高效搜索的段数据字节，如 `1264`。
  值 -1 表示 Elasticsearch 无法计算此数字。

- `committed`

  （布尔值）如果为 `true`，这些段将同步到磁盘。同步的段可以在硬重新启动后存活。
  如果为 `false`，则来自未提交段的数据也存储在事务日志中，以便 Elasticsearch 能够在下一次启动时重播更改。

- `search`

  （布尔值）如果为 `true`，段是可搜索的。
  如果为 `false`，段很大可能已写入磁盘，但需要[刷新](/rest_apis/index_apis/refresh)才可搜索。

- `version`

  （字符串）用于写段的 Lucene 版本。

- `compound`

  （布尔值）如果为 `true`，Lucene 将段中的所有文件合并为一个文件以保存文件描述符。

- `attributes`

  （对象）包含有关是否启用了高压缩的信息。

## 示例

### 获取指定数据流或索引的段信息

```bash
GET /test/_segments
```

### 获取多个数据流和索引的段信息

```bash
GET /test1,test2/_segments
```

### 获取集群中所有数据流和索引的段信息

```bash
GET /_segments
```

API 返回以下响应：

```bash
{
  "_shards": ...
  "indices": {
    "test": {
      "shards": {
        "0": [
          {
            "routing": {
              "state": "STARTED",
              "primary": true,
              "node": "zDC_RorJQCao9xf9pg3Fvw"
            },
            "num_committed_segments": 0,
            "num_search_segments": 1,
            "segments": {
              "_0": {
                "generation": 0,
                "num_docs": 1,
                "deleted_docs": 0,
                "size_in_bytes": 3800,
                "memory_in_bytes": 1410,
                "committed": false,
                "search": true,
                "version": "7.0.0",
                "compound": true,
                "attributes": {
                }
              }
            }
          }
        ]
      }
    }
  }
}
```

### 详细模式

要添加可用于调试的其他信息，请使用 `verbose` 标志。

!> 此功能是实验性的，在将来的版本中可能会完全更改或删除。Elastic 将尽最大努力解决任何问题，但实验性功能不受官方 GA 功能支持 SLA 的约束。

```bash
GET /test/_segments?verbose=true
```

API 返回以下响应：

```bash
{
  ...
    "_0": {
      ...
      "ram_tree": [
        {
          "description": "postings [PerFieldPostings(format=1)]",
          "size_in_bytes": 2696,
          "children": [
            {
              "description": "format 'Lucene50_0' ...",
              "size_in_bytes": 2608,
              "children" :[ ... ]
            },
            ...
          ]
        },
        ...
      ]

    }
  ...
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-segments.html)
