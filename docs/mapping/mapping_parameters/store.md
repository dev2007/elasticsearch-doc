# store

默认情况下，字段值会被索引使其可搜索，但不会被存储。这意味着该字段可以查询，但无法检索原始字段值。

通常这没有关系。字段值已经是默认存储的 `_source` 字段的一部分。如果你只想检索单个字段或少数几个字段的值，而不是整个 `_source`，可以通过源过滤实现。

在某些情况下存储字段是有意义的。例如，如果你有一个包含 `title`、`date` 和一个非常大的 `content` 字段的文档，你可能希望只检索 `title` 和 `date`，而不必从很大的 `_source` 字段中提取这些字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      # title 和 date 字段被存储
      "title": {
        "type": "text",
        "store": true
      },
      "date": {
        "type": "date",
        "store": true
      },
      "content": {
        "type": "text"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "title":   "Some short title",
  "date":    "2015-01-01",
  "content": "A very long content field..."
}

# 此请求将检索 title 和 date 字段的值
GET my-index-000001/_search
{
  "stored_fields": [ "title", "date" ]
}
```

## 存储字段以数组形式返回

为了保持一致性，存储字段总是以数组形式返回，因为无法得知原始字段值是单个值、多个值还是空数组。

如果你需要原始值，应该改为从 `_source` 字段检索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-store.html)
