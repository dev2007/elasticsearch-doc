# similarity

Elasticsearch 允许你按字段配置文本评分算法或相似度。`similarity` 设置提供了一种选择默认 BM25 之外的文本相似度算法（例如 boolean）的简单方式。

只有基于文本的字段类型（如 `text` 和 `keyword`）支持此配置。

可以通过调整内置相似度的参数来配置自定义相似度。有关此专家选项的更多详细信息，参阅相似度模块。

无需任何进一步配置即可开箱即用的相似度包括：

- **BM25**
  Okapi BM25 算法。Elasticsearch 和 Lucene 默认使用的算法。
- **boolean**
  一种简单的布尔相似度，用于不需要全文排名、分数只应基于查询词是否匹配的情况。布尔相似度给词元的分数等于其查询 boost。

可以在首次创建字段时在字段级别设置相似度，如下所示：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      # default_field 使用 BM25 相似度
      "default_field": {
        "type": "text"
      },
      # boolean_sim_field 使用 boolean 相似度
      "boolean_sim_field": {
        "type": "text",
        "similarity": "boolean"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/similarity.html)
