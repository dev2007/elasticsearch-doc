# 快速入门

使用这些快速入门来获得 Elasticsearch API 的动手经验。除非另有说明，这些示例将使用 Query DSL 语法编写的查询。

## 要求

你需要一个正在运行的 Elasticsearch 集群，以及用于 Dev Tools API Console 的 Kibana。在终端中运行以下命令，在 Docker 中设置一个单节点本地集群：

```sh
curl -fsSL https://elastic.co/start-local | sh
```

或者，参阅我们的[其他部署选项](/intro/deploy)。

## 动手快速入门

- **[基础：使用 Elasticsearch API 索引和搜索数据](./getting_started)**：了解索引、文档和映射，并使用 Query DSL 执行基本搜索。
- **[基础：全文搜索和过滤](./full_text_filter_tutorial)**：了解使用 Query DSL 查询数据的不同选项，包括全文搜索和过滤。
- **[ES|QL 基础](./esql_getting_started)**：了解如何使用 ES|QL 查询和聚合数据。
- **[ES|QL 用于搜索](./esql_for_search)**：了解如何将 ES|QL 用于搜索用例，包括全文搜索、语义搜索和混合搜索。
- **[基础：使用聚合分析电商数据](./aggregations_tutorial)**：了解如何使用不同类型的聚合分析数据，包括指标、桶和管道。
- **[语义搜索](./semantic_search)**：了解如何使用 `semantic_text` 为数据创建嵌入，并使用 `semantic` 查询进行查询。
  - **[使用 semantic_text 的混合搜索](./semantic_text_hybrid_search)**：了解如何将语义搜索与全文搜索相结合。
- **[自带稠密向量嵌入](./bring_your_own_vectors)**：了解如何将稠密向量嵌入摄取到 Elasticsearch 中。

## 使用 Python

如果你有兴趣将 Elasticsearch 与 Python 结合使用，请查看 Elastic Search Labs：

- **elasticsearch-labs 仓库**：包含一系列 Python 笔记本和示例应用。
- **教程**：逐步引导你使用 Flask 从零开始构建一个完整的 Elasticsearch 搜索解决方案。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/quickstart.html)
