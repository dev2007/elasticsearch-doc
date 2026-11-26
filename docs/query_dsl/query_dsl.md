# 查询 DSL（Query DSL）

Elasticsearch 提供基于 JSON 的完整 Query DSL（Domain Specific Language，领域特定语言）用于定义查询。

可以把 Query DSL 理解为查询的 AST（Abstract Syntax Tree，抽象语法树），由两类子句组成：

- **叶子查询子句（Leaf query clauses）**：在特定字段中查找特定值，例如 `match`、`term`、`range` 查询。这类查询可以单独使用。
- **复合查询子句（Compound query clauses）**：包装其他叶子查询或复合查询，以逻辑方式组合多个查询（例如 `bool` 或 `dis_max`），或改变查询行为（例如 `constant_score`）。

查询子句在 **query context（查询上下文）** 或 **filter context（过滤上下文）** 中使用时，行为会有所不同。

## 子页面

- [查询上下文与过滤上下文](./query_and_filter_context)
- 复合查询
  - [Boolean 查询](./compound_queries/boolean)
  - [Boosting 查询](./compound_queries/boosting)

## 允许执行高开销查询

某些类型的查询由于实现方式通常会执行较慢，可能影响集群稳定性。这些查询可分为以下几类：

- 需要线性扫描以识别匹配的查询：
  - `script` 查询
  - 对未索引但启用了 doc values 的以下字段类型的查询：numeric、date、boolean、ip、geo_point、keyword
- 前期成本较高的查询：
  - `fuzzy` 查询（`wildcard` 字段除外）
  - `regexp` 查询（`wildcard` 字段除外）
  - `prefix` 查询（`wildcard` 字段除外；没有 `index_prefixes` 的查询除外）
  - `wildcard` 查询（`wildcard` 字段除外）
  - 对 `text` 和 `keyword` 字段的 `range` 查询
- Joining queries（连接类查询）
- 每文档成本可能较高的查询：
  - `script_score` 查询
  - `percolate` 查询

可以通过设置阻止此类查询执行：

```yaml
search.allow_expensive_queries: false
```

该设置默认值为 `true`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl.html)
