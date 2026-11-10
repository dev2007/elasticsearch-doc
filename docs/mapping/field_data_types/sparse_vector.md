# sparse_vector 字段类型

`sparse_vector` 字段可以索引特征和权重，以便之后在带有 [`sparse_vector`](/query_dsl/specialized_queries/sparse_vector) 的查询中使用它们来查询文档。此字段还可以与旧版的 `text_expansion` 查询一起使用。

`sparse_vector` 是应与 ELSER 映射一起使用的字段类型。

```bash
PUT my-index
{
  "mappings": {
    "properties": {
      "text.tokens": {
        "type": "sparse_vector"
      }
    }
  }
}
```

有关使用 ELSER 将文档添加到 `sparse_vector` 映射字段的完整示例，参阅[使用 ELSER 进行语义搜索](/solutions/search/semantic_search)。

## sparse_vector 字段的参数

`sparse_vector` 字段接受以下参数：

- `store`
  （可选，Boolean）指示是否应该独立于 `_source` 字段存储并检索字段值。接受 `true` 或 `false`（默认）。字段数据使用词向量存储，与原始 JSON 输入相比这是一种节省磁盘空间的结构。输入映射可以在搜索请求中通过 `fields` 参数检索。要享受减少的磁盘占用，你必须：

  - 将该字段从 `_source` 中排除。
  - 或使用合成 `_source`。

## 多值稀疏向量

当为稀疏向量传入数组值时，会选择同名的多个特征中的最大值。

论文《[Adapting Learned Sparse Retrieval for Long Documents](https://arxiv.org/pdf/2305.18494.pdf)》对此有更详细的讨论。简而言之，研究结果支持表示聚合（representation aggregation）通常优于分数聚合（score aggregation）。

对于需要重叠特征名称的情况，你应该将它们分开存储，或使用 `nested` 字段。

下面是一个传入具有重叠特征名称的文档的示例。设想在此示例中，正面情感和负面情感各存在两个类别。但是，出于检索的目的，我们还想要总体影响而不是特定情感。在示例中，`impact` 存储为多值稀疏向量，只存储重叠名称的最大值。更具体地说，最后的 `GET` 查询返回约 1.2 的 `_score`（即 `max(impact.delicious[0], impact.delicious[1])`，是近似值，因为相对误差为 0.4%，如下所述）。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "standard"
      },
      "impact": {
        "type": "sparse_vector"
      },
      "positive": {
        "type": "sparse_vector"
      },
      "negative": {
        "type": "sparse_vector"
      }
    }
  }
}

POST my-index-000001/_doc
{
    "text": "I had some terribly delicious carrots.",
    "impact": [{"I": 0.55, "had": 0.4, "some": 0.28, "terribly": 0.01, "delicious": 1.2, "carrots": 0.8},
               {"I": 0.54, "had": 0.4, "some": 0.28, "terribly": 2.01, "delicious": 0.02, "carrots": 0.4}],
    "positive": {"I": 0.55, "had": 0.4, "some": 0.28, "terribly": 0.01, "delicious": 1.2, "carrots": 0.8},
    "negative": {"I": 0.54, "had": 0.4, "some": 0.28, "terribly": 2.01, "delicious": 0.02, "carrots": 0.4}
}

GET my-index-000001/_search
{
  "query": {
    "term": {
      "impact": {
         "value": "delicious"
      }
    }
  }
}
```

:::danger[重要]
`sparse_vector` 字段不能包含在基于 8.0 到 8.10 之间版本的 Elasticsearch 创建的索引中。
:::

:::note[提示]
- `sparse_vector` 字段只支持严格为正的值。负值将被拒绝。
- `sparse_vector` 字段不支持分析器、查询、排序或聚合。它们只能在专门的查询中使用。建议在这些字段上使用的查询是 `sparse_vector` 查询。它们也可以在旧版的 `text_expansion` 查询中使用。
- `sparse_vector` 字段只保留 9 个有效位作为精度，相当于大约 0.4% 的相对误差。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/sparse-vector.html)
