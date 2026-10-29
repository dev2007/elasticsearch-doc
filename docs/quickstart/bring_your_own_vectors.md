# 自带稠密向量嵌入

本教程演示如何将已包含稠密向量嵌入的文档索引到 Elasticsearch 中。你还将学习使用 `knn` 查询搜索这些文档的语法。

本教程结尾提供了关于在 Elasticsearch 中部署文本嵌入模型的更多信息链接，以便你可以即时为查询生成嵌入。

:::note 提示

这是一个高级用例。参阅语义搜索了解使用 Elasticsearch 进行语义搜索的选项概览。

:::

## 步骤 1：创建带 dense_vector 映射的索引

简单数据集中的每个文档将包含：

- 一条**评论**：存储在 `review_text` 字段中。
- 该**评论的嵌入**：存储在 `review_vector` 字段中。
  - `review_vector` 字段被定义为 `dense_vector` 数据类型。

`dense_vector` 类型默认自动使用 `int8_hnsw` 量化，以减少搜索浮点向量时所需的内存占用。了解如何在稠密向量量化中平衡性能和准确性：

```txt
PUT /amazon-reviews
{
  "mappings": {
    "properties": {
      "review_vector": {
        "type": "dense_vector",
        "dims": 8,
        "index": true,
        "similarity": "cosine"
      },
      "review_text": {
        "type": "text"
      }
    }
  }
}
```

说明：

- `dims` 参数必须与嵌入向量的长度匹配。此处使用 8 维嵌入以便于阅读。如果未指定，`dims` 将根据第一个被索引的文档动态计算。
- `index` 参数设置为 `true` 以启用 `knn` 查询。
- `similarity` 参数定义用于比较查询向量与文档向量的相似性函数。`cosine` 是 Elasticsearch 中 `dense_vector` 字段的默认相似性函数。

## 步骤 2：索引带嵌入的文档

### 索引单个文档

首先索引一个文档以了解文档结构：

```txt
PUT /amazon-reviews/_doc/1
{
  "review_text": "This product is lifechanging! I'm telling all my friends about it.",
  "review_vector": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
}
```

`review_vector` 数组的大小为 8，与映射中指定的 `dims` 数量一致。

### 批量索引多个文档

在生产场景中，你会希望使用 `_bulk` 端点一次索引多个文档。以下是在单个 `_bulk` 请求中索引多个文档的示例：

```txt
POST /_bulk
{ "index": { "_index": "amazon-reviews", "_id": "2" } }
{ "review_text": "This product is amazing! I love it.", "review_vector": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8] }
{ "index": { "_index": "amazon-reviews", "_id": "3" } }
{ "review_text": "This product is terrible. I hate it.", "review_vector": [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1] }
{ "index": { "_index": "amazon-reviews", "_id": "4" } }
{ "review_text": "This product is great. I can do anything with it.", "review_vector": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8] }
{ "index": { "_index": "amazon-reviews", "_id": "5" } }
{ "review_text": "This product has ruined my life and the lives of my family and friends.", "review_vector": [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1] }
```

## 步骤 3：搜索带嵌入的文档

现在你可以使用 `knn` 检索器查询这些文档向量。`knn` 是一种向量搜索，用于查找与查询向量最相似的 k 个文档。出于演示目的，这里使用原始向量作为查询文本：

```txt
POST /amazon-reviews/_search
{
  "retriever": {
    "knn": {
      "field": "review_vector",
      "query_vector": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      "k": 2,
      "num_candidates": 5
    }
  }
}
```

说明：

- 在这个简单示例中，发送原始向量作为查询文本。在实际场景中，你需要使用嵌入模型为查询生成向量。
- `k` 参数指定要返回的结果数量。
- `num_candidates` 参数是可选的。它限制搜索节点返回的候选数量。这可以提高性能并降低成本。

## 了解更多

在这个简单示例中，为查询文本发送了原始向量。在实际场景中，你不会预先知道查询文本。你需要使用与生成文档向量相同的嵌入模型即时生成查询向量。

- 为此，你需要在 Elasticsearch 中部署一个文本嵌入模型，并使用 `query_vector_builder` 参数。或者，你可以在客户端生成向量并直接随搜索请求发送。
- 了解如何使用已部署的文本嵌入模型进行语义搜索。
- 如果你刚开始使用 Elasticsearch 中的向量搜索，请参阅语义搜索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bring-your-own-vectors.html)
