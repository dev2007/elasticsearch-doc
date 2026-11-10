# _id 字段

每个文档都有一个唯一标识它的 `_id`，该 ID 会被索引，以便可以通过 GET API 或 [ids 查询](/query_dsl/specialized_queries/ids)查找文档。`_id` 可以在索引时指定，也可以由 Elasticsearch 生成唯一的 `_id`。此字段不能在映射中配置。

`_id` 字段的值可以在 `term`、`terms`、`match` 和 `query_string` 等查询中访问。

```bash
# 示例文档
PUT my-index-000001/_doc/1
{
  "text": "Document with ID 1"
}

PUT my-index-000001/_doc/2?refresh=true
{
  "text": "Document with ID 2"
}

# 在 _id 字段上查询（另参阅 ids 查询）
GET my-index-000001/_search
{
  "query": {
    "terms": {
      "_id": [ "1", "2" ]
    }
  }
}
```

`_id` 字段被限制用于聚合、排序和脚本。如果需要对 `_id` 字段进行排序或聚合，建议将 `_id` 字段的内容复制到另一个启用了 `doc_values` 的字段中。

`_id` 的大小限制为 512 字节，更大的值将被拒绝。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-id-field.html)
