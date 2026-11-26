# Constant score 查询（Constant score query）

`constant_score` 查询会包装一个 filter query，并让所有匹配该 filter 的文档返回一个固定的相关性评分，该评分等于 `boost` 参数的值。

也就是说：

- 只有匹配 `filter` 的文档会被返回。
- 返回文档的相关性评分 `_score` 都相同。
- 评分值由 `boost` 指定。
- `filter` 本身不计算相关性评分。
- 为提升性能，Elasticsearch 会自动缓存频繁使用的 filter query。

## 示例

```bash
GET /_search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "user.id": "kimchy"
        }
      },
      "boost": 1.2
    }
  }
}
```

该示例使用 `term` 查询筛选 `user.id` 为 `kimchy` 的文档，所有匹配文档的相关性评分都为 `1.2`。

## 顶层参数

- `filter`

  （必需，query object）需要执行的 filter query。任何返回的文档都必须匹配该查询。

  filter query 不计算相关性评分；Elasticsearch 会自动缓存频繁使用的 filter query。

- `boost`

  （可选，float）用作所有匹配 `filter` 文档的固定相关性评分。默认值为 `1.0`。

## 与 bool filter 的评分对比

| 对比项 | `constant_score` | `bool` 中的 `filter` |
|---|---|---|
| 匹配逻辑 | 文档必须匹配 `filter` | 文档必须匹配 `filter` 子句 |
| 是否计算相关性评分 | `filter` 本身不计算评分 | `filter` 本身不计算评分 |
| 最终评分 | 所有匹配文档 `_score` = `boost`（默认 `1.0`） | filter 子句不计分；评分通常来自 `must`、`should` 等计分子句 |
| 是否可设置固定分 | 可以，通过 `boost` 设置 | filter 子句本身不提供固定评分语义 |
| 缓存行为 | 频繁使用的 filter 会被自动缓存 | 过滤上下文中的查询也会被缓存优化 |
| 典型用途 | 希望所有匹配文档都获得统一、可控的分数 | 只想筛选文档，让其他查询子句负责评分 |

核心区别：`bool filter` 主要用于**过滤文档**；`constant_score` 同样基于 filter 过滤，但会在外层给所有命中文档赋一个**固定分数**。如果只关心“是否匹配”且希望所有匹配文档分数一致，使用 `constant_score` 更直接。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-constant-score-query.html)
