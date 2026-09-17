# 重新加载搜索分析器 API

重新加载索引的搜索分析器及其资源。对于数据流，此 API 会重新加载数据流的后备索引的搜索分析器和资源。

```txt
POST /my-index-000001/_reload_search_analyzers
POST /my-index-000001/_cache/clear?request=true
```

重新加载搜索分析器后，应清除请求缓存，以确保缓存中不包含使用分析器旧版本生成的响应。

## 请求

```txt
POST /<target>/_reload_search_analyzers

GET /<target>/_reload_search_analyzers
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对目标数据流、索引或别名具有**管理索引**[权限](../security_privileges/index_privileges)。

## 描述

可以使用重新加载搜索分析器 API 来获取搜索分析器的 `synonym_graph` 或 `synonym` token 过滤器中所用同义词文件的更改。要符合条件，token 过滤器必须具有 `true` 的 `updateable` 标志，且仅在搜索分析器中使用。

此 API 不会对索引的每个分片执行重新加载，而是对包含索引分片的每个节点执行重新加载。因此，API 返回的分片总数可能与索引分片数不同。

由于重新加载会影响每个包含索引分片的节点，因此在使用此 API 之前，务必更新集群中每个数据节点上的同义词文件，包括不包含分片副本的节点。这可以确保同义词文件在集群中的所有位置都已更新，以防将来分片重新定位。

## 路径参数

`<target>`

（必需，字符串）用于限制请求的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要针对所有数据流和索引，请使用 `*` 或 `_all`。

## 查询参数

`allow_no_indices`

（可选，布尔值）如果为 `false`，则当任何通配符表达式、索引别名或 `_all` 值仅目标为缺失或关闭的索引时，请求返回错误。即使请求目标为其他打开的索引，此行为也适用。例如，目标为 `foo*,bar*` 的请求在存在以 `foo` 开头但不存在以 `bar` 开头的索引时返回错误。

默认为 `true`。

`expand_wildcards`

（可选，字符串）通配符模式可以匹配的索引类型。如果请求可以目标为数据流，则此参数决定通配符表达式是否匹配隐藏数据流。支持逗号分隔的值，例如 `open,hidden`。有效值为：

- `all`

  匹配任何数据流或索引，包括隐藏的。

- `open`

  匹配打开的非隐藏索引。也匹配任何非隐藏数据流。

- `closed`

  匹配关闭的非隐藏索引。也匹配任何非隐藏数据流。数据流无法关闭。

- `hidden`

  匹配隐藏的数据流和隐藏的索引。必须与 `open`、`closed` 或两者组合使用。

- `none`

  不接受通配符模式。

默认为 `open`。

`ignore_unavailable`

（可选，布尔值）如果为 `false`，则当请求目标为缺失或关闭的索引时返回错误。默认为 `false`。

## 示例

使用创建索引 API 创建一个索引，其搜索分析器包含可更新的同义词过滤器。

将以下分析器用作索引分析器会导致错误。

```json
PUT /my-index-000001
{
  "settings": {
    "index": {
      "analysis": {
        "analyzer": {
          "my_synonyms": {
            "tokenizer": "whitespace",
            "filter": [ "synonym" ]
          }
        },
        "filter": {
          "synonym": {
            "type": "synonym_graph",
            "synonyms_path": "analysis/synonym.txt",
            "updateable": true
          }
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "standard",
        "search_analyzer": "my_synonyms"
      }
    }
  }
}
```

1. 包含一个同义词文件。
2. 将 token 过滤器标记为可更新。
3. 将分析器标记为搜索分析器。

更新同义词文件后，使用分析器重新加载 API 重新加载搜索分析器并获取文件更改。

```txt
POST /my-index-000001/_reload_search_analyzers
```

API 返回以下响应：

```json
{
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "reload_details": [
    {
      "index": "my-index-000001",
      "reloaded_analyzers": [
        "my_synonyms"
      ],
      "reloaded_node_ids": [
        "mfdqTXn_T7SGr2Ho2KT8uw"
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/indices-reload-analyzers.html)
