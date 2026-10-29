# ES|QL 用于搜索

了解如何将 ES|QL 用于搜索用例，包括全文搜索、语义搜索和混合搜索。

:::note 注意

此功能处于技术预览阶段，可能会在未来的版本中更改或删除。Elastic 会努力修复任何问题，但技术预览中的功能不受官方 GA 功能的支持 SLA 约束。

:::

## 功能概览

| 功能 | 自以下版本可用 | 描述 |
|------|----------------|------|
| 全文搜索函数 | 8.17 | 使用 `match` 函数和 `match` 运算符（`:`）执行基本文本搜索 |
| 查询字符串函数 | 8.17 | 使用 Query String 语法执行带有 `qstr` 的复杂查询 |
| 相关性评分 | 8.18/9.0 | 使用 `METADATA _score` 计算并按相关性排序 |
| 增强的 match 选项 | 8.18/9.0 | 为 `match` 函数配置附加参数 |
| Kibana 查询语言 | 8.18/9.0 | 通过 `kql` 函数使用 Kibana 查询语言 |
| 语义搜索 | 8.18/9.0 | 对 `semantic_text` 字段类型执行语义搜索 |
| 混合搜索 | 8.18/9.0 | 使用自定义权重组合词法搜索和语义搜索 |

## 过滤与搜索

- **过滤**移除不匹配的文档，但不计算相关性评分。
- **搜索**既过滤文档，又根据文档与查询的匹配程度进行排序。

请注意，过滤比搜索更快，因为它不需要评分计算。

## 相关性评分

要优先获得最相关的结果，你需要使用 `METADATA _score` 并按评分排序：

```txt
FROM books METADATA _score
| WHERE match(title, "Shakespeare") OR match(plot, "Shakespeare")
| SORT _score DESC
```

### _score 的工作原理

- 如果查询中不包含 `METADATA _score`，则只执行过滤操作，不进行相关性计算。
- 包含 `METADATA _score` 时，`WHERE` 条件中包含的任何搜索函数都会对相关性评分产生影响。这意味着每次出现的 `MATCH`、`QSTR` 和 `KQL` 都会影响评分。
- 非搜索函数的过滤操作（如范围条件和精确匹配）不影响评分。
- 包含 `METADATA _score` 不会自动按相关性对结果排序。你必须显式使用 `SORT _score DESC` 或 `SORT _score ASC` 来按相关性排序结果。

## 全文搜索

### MATCH 函数和运算符

ES|QL 为 `match` 提供两种语法选项，它们复制了 Query DSL 中 `match` 查询的功能。

**紧凑运算符语法（`:`）** — 使用默认参数进行简单的文本匹配：

```txt
FROM logs | WHERE match(message, "connection error")
```

**`match()` 函数语法** — 需要传递附加参数时使用：

```txt
FROM products | WHERE match(name, "laptop", { "boost": 2.0 })
```

这些全文函数解决了 ES|QL 中文本过滤存在的几个关键限制：

- 它们可以直接处理多值字段，当多值字段中的任何值匹配查询时即返回结果。
- 它们利用分析器，确保查询以与被索引数据相同的流程进行分析（实现不区分大小写的匹配、ASCII 折叠、停用词移除和同义词支持）。
- 它们性能极高，使用 Lucene 索引结构而不是模式匹配或正则表达式来定位数据中的词条。

这些查询匹配文档但不会自动按相关性排序。要优先获得最相关的结果，你需要使用 `METADATA _score` 并按评分排序。

### 查询字符串函数（QSTR）

`qstr` 函数提供与 Query DSL 的 `query_string` 查询相同的功能。这适用于高级用例，例如通配符搜索、跨多个字段的搜索等：

```txt
FROM articles METADATA _score
| WHERE QSTR("(new york city) OR (big apple)")
| SORT _score DESC
| LIMIT 10
```

### Kibana 查询语言函数（KQL）

使用 `kql` 函数在 ES|QL 查询中使用 Kibana 查询语言：

```txt
FROM logs*
| WHERE KQL("http.request.method:GET AND agent.type:filebeat")
```

当你需要从 Kibana 的 Discover、Dashboard 或其他使用 KQL 的界面迁移查询时，`kql` 函数非常有用。它允许你逐步将查询迁移到 ES|QL，而无需一次性重写所有查询。

## 语义搜索

你可以使用与全文搜索相同的 `match` 语法对 `semantic_text` 字段类型执行语义搜索。

使用 `match` 运算符（`:`）：

```txt
FROM articles METADATA _score
| WHERE semantic_content:"What are the impacts of climate change on agriculture?"
| SORT _score DESC
```

使用 `match` 函数：

```txt
FROM articles METADATA _score
| WHERE match(semantic_content, "What are the impacts of climate change on agriculture?")
| SORT _score DESC
```

## 混合搜索

使用自定义权重组合传统搜索和语义搜索：

```txt
FROM books METADATA _score
| WHERE match(semantic_title, "fantasy adventure", { "boost": 0.75 })
    OR match(title, "fantasy adventure", { "boost": 0.25 })
| SORT _score DESC
```

## 限制

参阅 ES|QL 限制了解已知限制的列表。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/esql-for-search.html)
