# Disjunction max 查询（Disjunction max query）

`dis_max` 查询返回匹配一个或多个包装查询的文档。这些包装查询称为 **query clauses** 或 **clauses**。

如果一个返回的文档匹配多个查询子句，`dis_max` 查询会为该文档分配：

- 任一匹配子句中的最高相关性分数；
- 加上来自其他额外匹配子查询的 tie-breaking 增量。

## 示例

```bash
GET /_search
{
  "query": {
    "dis_max": {
      "queries": [
        {
          "term": {
            "title": "Quick pets"
          }
        },
        {
          "term": {
            "body": "Quick pets"
          }
        }
      ],
      "tie_breaker": 0.7
    }
  }
}
```

## 顶层参数

- `queries`

  （必需，查询对象数组）包含一个或多个查询子句。返回的文档必须匹配其中一个或多个查询。

  如果一个文档匹配多个查询，Elasticsearch 会使用其中的最高相关性分数。

- `tie_breaker`

  （可选，float）用于提高匹配多个查询子句的文档的相关性分数。取值范围为 `0` 到 `1.0`，默认值为 `0.0`。

  可以使用 `tie_breaker`，让同一词项出现在多个字段中的文档，比只在这些字段中最佳字段出现的文档获得更高相关性分数，同时不会把它与“多个字段中匹配两个不同词项”这种更好的情况混淆。

  如果 `tie_breaker` 大于 `0.0`，所有匹配的子句都会计入评分，但分数最高的子句权重最大。

## 评分机制

如果文档匹配多个查询子句，`dis_max` 按以下方式计算相关性分数：

1. 从所有匹配的子句中取相关性分数最高的一个。
2. 将其他所有匹配子句的分数乘以 `tie_breaker`。
3. 将最高分与这些相乘后的分数相加。

可概括为：

```text
score = 最高匹配子句分数 + 其他匹配子句分数 × tie_breaker 的总和
```

- 当 `tie_breaker = 0.0` 时，只使用最高子句分数。
- 当 `tie_breaker > 0.0` 时，其他匹配子句也会贡献分数，但最高分子句仍占主要影响。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-dis-max-query.html)
