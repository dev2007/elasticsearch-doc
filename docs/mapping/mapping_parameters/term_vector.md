# term_vector

词向量（term vectors）包含由分析过程产生的词元的相关信息，包括：

- 词元列表。
- 每个词元的位置（或顺序）。
- 将词元映射回原始字符串中其来源的开始和结束字符偏移量。
- 有效载荷（payload，如果可用）——与每个词元位置关联的用户定义二进制数据。

这些词向量可以被存储，以便为特定文档检索它们。

`term_vector` 设置接受：

- `no`
  不存储词向量。（默认）
- `yes`
  只存储字段中的词元。
- `with_positions`
  存储词元和位置。
- `with_offsets`
  存储词元和字符偏移量。
- `with_positions_offsets`
  存储词元、位置和字符偏移量。
- `with_positions_payloads`
  存储词元、位置和有效载荷。
- `with_positions_offsets_payloads`
  存储词元、位置、偏移量和有效载荷。

快速向量高亮器需要 `with_positions_offsets`。词向量 API 可以检索任何已存储的内容。

设置 `with_positions_offsets` 会使字段的索引大小翻倍。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "text": {
        "type":        "text",
        "term_vector": "with_positions_offsets"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "text": "Quick brown fox"
}

# 由于启用了词向量，text 字段默认将使用快速向量高亮器
GET my-index-000001/_search
{
  "query": {
    "match": {
      "text": "brown fox"
    }
  },
  "highlight": {
    "fields": {
      "text": {}
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/term-vector.html)
