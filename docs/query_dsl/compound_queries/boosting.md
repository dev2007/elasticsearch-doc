# Boosting 查询（Boosting query）

`boosting` query 返回匹配 `positive` 查询的文档，同时会降低那些也匹配 `negative` 查询的文档的相关性评分。

可以使用 `boosting` query 降低某些文档的排名，而不是将它们从搜索结果中排除。

## 示例

```bash
GET /_search
{
  "query": {
    "boosting": {
      "positive": {
        "term": {
          "text": "apple"
        }
      },
      "negative": {
        "term": {
          "text": "pie tart fruit crumble tree"
        }
      },
      "negative_boost": 0.5
    }
  }
}
```

## 顶层参数

- `positive`

  （必需，query object）要执行的查询。返回的任何文档都必须匹配该查询。

- `negative`

  （必需，query object）用于降低匹配文档相关性评分的查询。如果某个返回文档同时匹配 `positive` 和 `negative` 查询，`boosting` query 会这样计算最终评分：

  1. 获取 `positive` 查询产生的原始相关性评分。
  2. 将该评分乘以 `negative_boost` 的值。

- `negative_boost`

  （必需，float）用于降低匹配 `negative` 查询的文档的相关性评分。取值范围为 `0` 到 `1.0`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-boosting-query.html)
