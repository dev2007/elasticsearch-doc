# 解释 API

返回有关特定文档与查询匹配（或不匹配）的原因的信息。

```bash
GET /my-index-000001/_explain/0
{
  "query" : {
    "match" : { "message" : "elasticsearch" }
  }
}
```

## 请求

`GET /<index>/_explain/<id>`

`POST /<index>/_explain/<id>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

解释 API 计算查询和特定文档的分数解释。无论文档是否匹配特定查询，这都可以提供有用的反馈。

## 路径参数

- `<id>`
  （必需，整数）定义文档 ID。

- `<index>`
  （必需，字符串）用于限制请求的索引名字。

  此参数只能提供一个索引名字。

## 查询参数

- `analyzer`
  （可选，字符串）用于查询字符串的分析器。

  仅当指定了 `q` 查询字符串参数时，才能使用此参数。

- `analyze_wildcard`
  （可选，布尔值）如果为 `true`，通配符和前缀查询将被分析。默认为 `false`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `default_operator`
  （可选，字符串）查询字符串查询的默认运算符：`AND` 或 `OR`。默认为 `OR`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `df`
  （可选，字符串）在查询字符串中未给出字段前缀的情况下，要用作默认值的字段。

  仅当 `q` 查询参数被指定时，此参数可用。

- `lenient`
  （可选，布尔值）如果为 `true`，将忽略查询字符串中基于格式的查询失败（例如向数字字段提供文本）。默认为 `false`。

  仅当 `q` 查询参数被指定时，此参数可用。

- `preference`
  （可选，字符串）用于执行搜索的节点或分片。默认随机。

- `q`
  （可选，字符串）使用 Lucene 查询字符串语法进行查询。

- `stored_fields`
  （可选，字符串）响应返回的，以逗号分隔的存储字段列表。

- `routing`
  （可选，字符串）用于将索引和搜索操作路由到特定分片的值。

- `_source`
  （可选，字符串）是否返回 `_source` 字段或字段列表。

- `_source_excludes`
  （可选，字符串）逗号分隔的从响应中排除的[源字段](/mapping/metadata_fields/_source-field)。

  你还可以使用此参数从 `_source_includes` 查询参数中指定的子集中排除字段。

  如果 `_source` 参数为 `false`，此参数会被忽略。

- `_source_includes`
  （可选，字符串）逗号分隔的响应中要包含的[源字段](/mapping/metadata_fields/_source-field)。

  如果此参数指定，只有这些源字段会返回。你可以使用 `_source_excludes` 查询参数从该子集中排除字段。

  如果 `_source` 参数为 `false`，此参数会被忽略。

## 请求体

- `query`
  （可选，[查询对象](/query_dsl/query_dsl)）使用 [Query DSL](/query_dsl/query_dsl) 定义搜索定义。

### 示例

```bash
GET /my-index-000001/_explain/0
{
  "query" : {
    "match" : { "message" : "elasticsearch" }
  }
}
```

API 返回以下响应：

```bash
{
   "_index":"my-index-000001",
   "_id":"0",
   "matched":true,
   "explanation":{
      "value":1.6943598,
      "description":"weight(message:elasticsearch in 0) [PerFieldSimilarity], result of:",
      "details":[
         {
            "value":1.6943598,
            "description":"score(freq=1.0), computed as boost * idf * tf from:",
            "details":[
               {
                  "value":2.2,
                  "description":"boost",
                  "details":[]
               },
               {
                  "value":1.3862944,
                  "description":"idf, computed as log(1 + (N - n + 0.5) / (n + 0.5)) from:",
                  "details":[
                     {
                        "value":1,
                        "description":"n, number of documents containing term",
                        "details":[]
                     },
                     {
                        "value":5,
                        "description":"N, total number of documents with field",
                        "details":[]
                     }
                  ]
               },
               {
                  "value":0.5555556,
                  "description":"tf, computed as freq / (freq + k1 * (1 - b + b * dl / avgdl)) from:",
                  "details":[
                     {
                        "value":1.0,
                        "description":"freq, occurrences of term within document",
                        "details":[]
                     },
                     {
                        "value":1.2,
                        "description":"k1, term saturation parameter",
                        "details":[]
                     },
                     {
                        "value":0.75,
                        "description":"b, length normalization parameter",
                        "details":[]
                     },
                     {
                        "value":3.0,
                        "description":"dl, length of field",
                        "details":[]
                     },
                     {
                        "value":5.4,
                        "description":"avgdl, average length of field",
                        "details":[]
                     }
                  ]
               }
            ]
         }
      ]
   }
}
```

还有一种更简单的方法可以通过 `q` 参数指定查询。然后对指定的 `q` 参数值进行解析，就像使用了查询字符串查询一样。解释 API 中 `q` 参数的用法示例：

```bash
GET /my-index-000001/_explain/0?q=message:search
```

API 返回与之前请求一致的结果。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-explain.html)