# 多词向量 API

只需一次请求即可检索多个词（term）向量。

```bash
POST /_mtermvectors
{
   "docs": [
      {
         "_index": "my-index-000001",
         "_id": "2",
         "term_statistics": true
      },
      {
         "_index": "my-index-000001",
         "_id": "1",
         "fields": [
            "message"
         ]
      }
   ]
}
```

## 请求

`POST /_mtermvectors`

`POST /<index>/_mtermvectors`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有目标索引或索引别名的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

你可以通过索引和 ID 指定现有文档，也可以在请求正文中提供人工文档。你可以在请求体或请求 URI 中指定索引。

响应包含一个 `docs` 数组，其中包含所有获取的词向量。每个元素都有[词向量](/rest_apis/document_apis/termvectors) API 提供的结构。

有关可包含在响应中的信息的更多信息，参阅[词向量](/rest_apis/document_apis/termvectors) API。

## 路径参数

- `<index>`

   (可选，字符串）包含文件的索引名称。

## 查询参数

- `fields`

  (可选，字符串） 用逗号分隔的字段列表或通配符表达式，这些字段将包含在统计信息中。

  除非在 `completion_fields` 或 `fielddata_fields` 参数中提供了特定字段列表，否则将作为默认列表使用。

- `field_statistics`

  (可选，布尔值） 如果为 `true`，响应将包括文档计数、文档频率总和以及词总频率总和。默认为 `true`。

- `<offsets>`

  (可选，布尔值） 如果为 `true`，则响应包括词偏移。默认为 `true`。

- `payloads`

  (可选，布尔值） 如果为 `true`，则响应包括词有效载荷。默认为 `true`。

- `positions`

  (可选，布尔值） 如果为 `true`，则响应包括词位置。默认为 `true`。

- `preference`

  (可选，字符串） 指定应在哪个节点或分片上执行操作。默认为随机。

- `routing`

  (可选，字符串） 用于将操作路由到特定分区的自定义值。

- `realtime`

  (可选，布尔值） 如果为 `true`，则表示请求是实时的，而不是近实时的。默认为 `true`。参阅[实时](/docs/rest_apis/document_apis/get#实时)。

- `term_statistics`

  (可选，布尔值）如果为 `true`，则响应包括词频和文档频率。默认为 `false`。

- `version`

  (可选，布尔值） 如果为 `true`，则返回作为命中一部分的文档版本。

- `version_type`

  (可选，枚举值） 特定版本类型：`external`、`external_gte`。

### 示例

如果在请求 URI 中指定索引，则无需为请求体中的每个文档指定索引：

```bash
POST /my-index-000001/_mtermvectors
{
   "docs": [
      {
         "_id": "2",
         "fields": [
            "message"
         ],
         "term_statistics": true
      },
      {
         "_id": "1"
      }
   ]
}
```

如果请求的所有文件都在同一索引中，且参数相同，则可使用以下简化语法：

```bash
POST /my-index-000001/_mtermvectors
{
  "ids": [ "1", "2" ],
  "parameters": {
    "fields": [
      "message"
    ],
    "term_statistics": true
  }
}
```

### 人工文档

你还可以使用 `mtermvectors` 为请求体中提供的人工文档生成词向量。使用的映射由指定的 `_index` 决定。

```bash
POST /_mtermvectors
{
   "docs": [
      {
         "_index": "my-index-000001",
         "doc" : {
            "message" : "test test test"
         }
      },
      {
         "_index": "my-index-000001",
         "doc" : {
           "message" : "Another test ..."
         }
      }
   ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-multi-termvectors.html)
