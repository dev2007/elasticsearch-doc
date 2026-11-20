# 示例：基于地理位置丰富你的数据

`geo_match` 富化策略基于地理位置、使用 geo_shape 查询将富化数据匹配到传入文档。

以下示例创建一个 `geo_match` 富化策略，根据一组坐标为传入文档添加邮政编码。然后将该 `geo_match` 富化策略添加到摄取管道的一个处理器中。

## 步骤 1：创建包含 geo_shape 字段的源索引

使用[创建索引 API](/rest_apis/index_apis/create_index) 创建一个包含至少一个 `geo_shape` 字段的源索引。

```bash
PUT /postal_codes
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_shape"
      },
      "postal_code": {
        "type": "keyword"
      }
    }
  }
}
```

## 步骤 2：将富化数据索引到源索引

使用[索引 API](/rest_apis/document_apis/docs_index) 将富化数据索引到该源索引。

```bash
PUT /postal_codes/_doc/1?refresh=wait_for
{
  "location": {
    "type": "envelope",
    "coordinates": [ [ 13.0, 53.0 ], [ 14.0, 52.0 ] ]
  },
  "postal_code": "96598"
}
```

## 步骤 3：创建 geo_match 类型的富化策略

使用[创建富化策略 API](/rest_apis/enrich_apis/put_enrich_policy) 创建一个 `geo_match` 类型的富化策略。此策略必须包含：

- 一个或多个**源索引**
- **`match_field`**，源索引中用于匹配传入文档的 geo_shape 字段
- 你希望追加到传入文档的源索引中的**富化字段**

```bash
PUT /_enrich/policy/postal_policy
{
  "geo_match": {
    "indices": "postal_codes",
    "match_field": "location",
    "enrich_fields": [ "location", "postal_code" ]
  }
}
```

## 步骤 4：执行富化策略

使用[执行富化策略 API](/rest_apis/enrich_apis/execute_enrich_policy) 为该策略创建富化索引。

```bash
POST /_enrich/policy/postal_policy/_execute?wait_for_completion=false
```

## 步骤 5：创建包含富化处理器的摄取管道

使用[创建或更新管道 API](/rest_apis/ingest_apis/put_pipeline) 创建一个摄取管道。在管道中，添加一个富化处理器，其中包含：

- 你的**富化策略**
- 传入文档中用于匹配富化索引文档的 geoshape 的 **`field`** 字段
- 用于存储传入文档追加的富化数据的 **`target_field`** 目标字段。该字段包含富化策略中指定的 match_field 和 enrich_fields
- **`shape_relation`**，指示处理器如何将传入文档中的 geoshape 与富化索引文档中的 geoshape 进行匹配。有效选项及更多信息参阅[空间关系](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geo-shape.html)。

```bash
PUT /_ingest/pipeline/postal_lookup
{
  "processors": [
    {
      "enrich": {
        "description": "Add 'geo_data' based on 'geo_location'",
        "policy_name": "postal_policy",
        "field": "geo_location",
        "target_field": "geo_data",
        "shape_relation": "INTERSECTS"
      }
    }
  ]
}
```

## 步骤 6：使用摄取管道索引一个文档

传入文档应包含富化处理器中指定的字段。

```bash
PUT /users/_doc/0?pipeline=postal_lookup
{
  "first_name": "Mardy",
  "last_name": "Brown",
  "geo_location": "POINT (13.5 52.5)"
}
```

## 步骤 7：验证结果

要验证富化处理器是否匹配并追加了相应的字段数据，使用[获取文档 API](/rest_apis/document_apis/get) 查看已索引的文档。

```bash
GET /users/_doc/0
```

API 返回以下响应：

```json
{
  "found": true,
  "_index": "users",
  "_id": "0",
  "_version": 1,
  "_seq_no": 55,
  "_primary_term": 1,
  "_source": {
    "geo_data": {
      "location": {
        "type": "envelope",
        "coordinates": [[13.0, 53.0], [14.0, 52.0]]
      },
      "postal_code": "96598"
    },
    "first_name": "Mardy",
    "last_name": "Brown",
    "geo_location": "POINT (13.5 52.5)"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geo-match-enrich-policy-type.html)
