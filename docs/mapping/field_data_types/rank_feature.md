# rank_feature 字段类型

`rank_feature` 字段可以索引数字，以便之后在带有 [`rank_feature` 查询](/query_dsl/specialized_queries/rank_feature)的查询中提升文档的权重。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "pagerank": {
        "type": "rank_feature"
      },
      "url_length": {
        "type": "rank_feature",
        "positive_score_impact": false
      }
    }
  }
}

# rank_feature 字段必须使用 rank_feature 字段类型
# 与分数负相关的排名特征需要显式声明
PUT my-index-000001/_doc/1
{
  "pagerank": 8,
  "url_length": 22
}

GET my-index-000001/_search
{
  "query": {
    "rank_feature": {
      "field": "pagerank"
    }
  }
}
```

`rank_feature` 字段只支持单值字段和严格为正的值。多值字段和负值将被拒绝。

`rank_feature` 字段不支持查询、排序或聚合。它们只能在 `rank_feature` 查询中使用。

`rank_feature` 字段只保留 9 个有效位作为精度，相当于大约 0.4% 的相对误差。

与分数负相关的排名特征应将 `positive_score_impact` 设置为 `false`（默认为 `true`）。`rank_feature` 查询将使用它来修改评分公式，使分数随特征值增加而降低而不是增加。例如在网页搜索中，URL 长度是一个常用的与分数负相关的特征。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rank-feature.html)
