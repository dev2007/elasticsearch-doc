# 向 Elasticsearch 添加数据

有多种方式可以将数据摄取到 Elasticsearch 中。你选择的选项取决于你处理的是时间戳数据还是非时间戳数据、数据来自哪里、数据的复杂程度等因素。

你可以使用 Kibana 将示例数据加载到 Elasticsearch 集群中，以便快速上手。

## 通用内容

通用内容是没有时间戳的数据。例如向量嵌入、网站内容、产品目录等。对于通用内容，你有以下选项可将数据添加到 Elasticsearch 索引中：

- **API**：使用 Elasticsearch 文档 API 直接索引文档，可以使用 Dev Tools Console 或 cURL。
  如果你正在构建网站或应用，可以使用你选择的编程语言的 Elasticsearch 客户端来调用 Elasticsearch API。如果你使用 Python 客户端，可以查看 elasticsearch-labs 仓库中的各种示例笔记本。
- **文件上传**：使用 Kibana 文件上传器为一次性测试和探索索引单个文件。该图形界面会引导你完成索引和字段映射的设置。
- **网络爬虫**：提取网页内容并将其索引为 Elasticsearch 文档。
- **连接器**：同步来自各种第三方数据源的数据，在 Elasticsearch 中创建可搜索的只读副本。

## 时间戳数据

Elasticsearch 中的时间戳数据指包含时间戳字段的数据集。如果你使用 Elastic Common Schema（ECS），该字段名为 `@timestamp`。例如日志、指标和追踪等数据。

对于时间戳数据，你有以下选项可将数据添加到 Elasticsearch 数据流中：

- **Elastic Agent 和 Fleet**：索引时间戳数据的首选方式。每个基于 Elastic Agent 的集成都包含默认的摄取规则、仪表板和可视化，让你可以立即开始分析数据。你可以使用 Kibana 中的 Fleet UI 集中管理 Elastic Agent 及其策略。
- **Beats**：如果你的数据源不受 Elastic Agent 支持，可以使用 Beats 来收集数据并发送到 Elasticsearch。你需要为每种要收集的数据类型安装单独的 Beat。
- **Logstash**：Logstash 是一个开源的数据收集引擎，具有实时管道功能，支持各种数据源。当 Elastic Agent 和 Beats 都不支持你的数据源时，你可能会选择此选项。你还可以使用 Logstash 来持久化传入的数据，或者当你需要将数据发送到多个目的地时使用它。
- **语言客户端**：链接的教程演示了如何使用 Elasticsearch 编程语言客户端从应用程序中摄取数据。在这些示例中，Elasticsearch 运行在 Elastic Cloud 上，但相同的原则适用于任何 Elasticsearch 部署。

如果你对时间戳数据的数据摄取管道感兴趣，可以使用 Elastic Cloud 文档中的决策树来了解你的选项。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-ingestion-overview.html)
