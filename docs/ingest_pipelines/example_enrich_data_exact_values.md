# 示例：基于精确值丰富你的数据

`match` 富化策略基于精确值（例如电子邮件地址或 ID）、使用 term 查询将富化数据匹配到传入文档。

以下示例创建一个 `match` 富化策略，根据电子邮件地址为传入文档添加用户姓名和联系信息。然后将该 `match` 富化策略添加到摄取管道的一个处理器中。

## 步骤 1：创建源索引

使用[创建索引 API](/rest_apis/index_apis/create_index) 或[索引 API](/rest_apis/document_apis/docs_index) 创建一个源索引。

以下[索引 API](/rest_apis/document_apis/docs_index) 请求创建一个源索引并向该索引索引一个新文档。

```bash
PUT /users/_doc/1?refresh=wait_for
{
  "email": "mardy.brown@asciidocsmith.com",
  "first_name": "Mardy",
  "last_name": "Brown",
  "city": "New Orleans",
  "county": "Orleans",
  "state": "LA",
  "zip": 70116,
  "web": "mardy.asciidocsmith.com"
}
```

## 步骤 2：创建富化策略

使用[创建富化策略 API](/rest_apis/enrich_apis/put_enrich_policy) 创建一个 `match` 类型的富化策略。此策略必须包含：

- 一个或多个**源索引**
- **`match_field`**，源索引中用于匹配传入文档的字段
- 你希望追加到传入文档的源索引中的**富化字段**

```bash
PUT /_enrich/policy/users-policy
{
  "match": {
    "indices": "users",
    "match_field": "email",
    "enrich_fields": ["first_name", "last_name", "city", "zip", "state"]
  }
}
```

## 步骤 3：执行富化策略

使用[执行富化策略 API](/rest_apis/enrich_apis/execute_enrich_policy) 为该策略创建一个富化索引。

```bash
POST /_enrich/policy/users-policy/_execute?wait_for_completion=false
```

## 步骤 4：创建包含富化处理器的摄取管道

使用[创建或更新管道 API](/rest_apis/ingest_apis/put_pipeline) 创建一个摄取管道。在管道中，添加一个[富化处理器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich-processor.html)，其中包含：

- 你的富化策略
- 传入文档中用于匹配富化索引文档的 **`field`** 字段
- 用于存储传入文档追加的富化数据的 **`target_field`** 目标字段。该字段包含富化策略中指定的 `match_field` 和 `enrich_fields`

```bash
PUT /_ingest/pipeline/user_lookup
{
  "processors" : [
    {
      "enrich" : {
        "description": "Add 'user' data based on 'email'",
        "policy_name": "users-policy",
        "field" : "email",
        "target_field": "user",
        "max_matches": "1"
      }
    }
  ]
}
```

## 步骤 5：使用摄取管道索引文档

使用摄取管道[索引一个文档](/rest_apis/document_apis/docs_index)。传入文档应包含富化处理器中指定的 `field` 字段。

```bash
PUT /my-index-000001/_doc/my_id?pipeline=user_lookup
{
  "email": "mardy.brown@asciidocsmith.com"
}
```

## 步骤 6：验证结果

要验证富化处理器是否匹配并追加了相应的字段数据，使用[获取文档 API](/rest_apis/document_apis/get) 查看已索引的文档。

```bash
GET /my-index-000001/_doc/my_id
```

API 返回以下响应：

```json
{
  "found": true,
  "_index": "my-index-000001",
  "_id": "my_id",
  "_version": 1,
  "_seq_no": 55,
  "_primary_term": 1,
  "_source": {
    "user": {
      "email": "mardy.brown@asciidocsmith.com",
      "first_name": "Mardy",
      "last_name": "Brown",
      "zip": 70116,
      "city": "New Orleans",
      "state": "LA"
    },
    "email": "mardy.brown@asciidocsmith.com"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/match-enrich-policy-type.html)
