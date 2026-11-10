# rank_features 字段类型

`rank_features` 字段可以索引数值特征向量，以便之后在带有 [`rank_feature`](/query_dsl/specialized_queries/rank_feature) 查询的查询中提升文档的权重。

它类似于 [`rank_feature`](/mapping/field_data_types/rank_feature) 数据类型，但更适用于特征列表稀疏、因而为每个特征在映射中添加一个字段并不合理的场景。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "topics": {
        "type": "rank_features"
      },
      "negative_reviews": {
        "type": "rank_features",
        "positive_score_impact": false
      }
    }
  }
}

# rank_features 字段必须使用 rank_features 字段类型
# 与分数负相关的排名特征需要显式声明
# rank_features 字段必须是带有字符串键和严格为正的数值的哈希
PUT my-index-000001/_doc/1
{
  "topics": {
    "politics": 20,
    "economics": 50.8
  },
  "negative_reviews": {
    "1star": 10,
    "2star": 100
  }
}

PUT my-index-000001/_doc/2
{
  "topics": {
    "politics": 5.2,
    "sports": 80.1
  },
  "negative_reviews": {
    "1star": 1,
    "2star": 10
  }
}

# 此查询按照文档与“政治”主题的相关程度对文档进行排名
GET my-index-000001/_search
{
  "query": {
    "rank_feature": {
      "field": "topics.politics"
    }
  }
}

# 此查询按照文档收到的“一星”评论数的反向顺序对文档进行排名
GET my-index-000001/_search
{
  "query": {
    "rank_feature": {
      "field": "negative_reviews.1star"
    }
  }
}

# 此查询返回在 topics 字段中存储了 economics 特征的文档
GET my-index-000001/_search
{
  "query": {
    "term": {
      "topics": "economics"
    }
  }
}
```

`rank_features` 字段只支持单值特征和严格为正的值。多值字段以及零值或负值将被拒绝。

`rank_features` 字段不支持排序或聚合，只能使用 [`rank_feature`](/query_dsl/specialized_queries/rank_feature) 或 [`term`](/query_dsl/term_level_queries/term) 查询进行查询。

对 `rank_features` 字段执行 [`term`](/query_dsl/term_level_queries/term) 查询时，得分是将匹配到的存储特征值乘以提供的 `boost`。

`rank_features` 字段只保留 9 个有效位作为精度，相当于大约 0.4% 的相对误差。

与分数负相关的排名特征应将 `positive_score_impact` 设置为 `false`（默认为 `true`）。[`rank_feature`](/query_dsl/specialized_queries/rank_feature) 查询将使用它来修改评分公式，使分数随特征值增加而降低而不是增加。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rank-features.html)
