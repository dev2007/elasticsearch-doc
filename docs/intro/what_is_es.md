# 什么是 Elasticsearch？

Elasticsearch 是一个基于 Apache Lucene 构建的分布式搜索和分析引擎、可伸缩数据存储和向量数据库。它针对生产规模工作负载的速度和相关性进行了优化。使用 Elasticsearch 可以近实时地搜索、索引、存储和分析各种形状和大小的数据。

Elasticsearch 是 Elastic Stack 的核心。与 Kibana 结合使用，它为以下 Elastic 解决方案提供支持：

- 可观测性（Observability）
- 搜索（Search）
- 安全（Security）

Elasticsearch 拥有大量功能。你可以在产品网页上查看完整列表。

:::note 什么是 Elastic Stack？

Elasticsearch 是 Elastic Stack 的核心组件，Elastic Stack 是一套用于收集、存储、搜索和可视化数据的产品。了解更多关于 Elastic Stack 的信息。

:::

## 用例

Elasticsearch 被用于广泛且不断增长的用例中。以下是一些示例：

### 可观测性

- **日志、指标和追踪**：收集、存储和分析来自应用程序、系统和服务的日志、指标和追踪。
- **应用程序性能监控（APM）**：监控和分析业务关键软件应用程序的性能。
- **真实用户监控（RUM）**：监控、量化和分析用户与 Web 应用程序的交互。
- **OpenTelemetry**：复用你现有的检测工具，使用 OpenTelemetry 标准向 Elastic Stack 发送遥测数据。

### 搜索

- **全文搜索**：使用倒排索引、分词和文本分析构建快速、相关的全文搜索解决方案。
- **向量数据库**：存储和搜索向量化数据，并使用内置和第三方的自然语言处理（NLP）模型创建向量嵌入。
- **语义搜索**：使用同义词、稠密向量嵌入和学习的稀疏查询-文档扩展等工具理解搜索查询背后的意图和上下文含义。
- **混合搜索**：使用最先进的排序算法将全文搜索与向量搜索相结合。
- **构建搜索体验**：为应用或网站添加混合搜索功能，或者基于你组织的内部数据源构建企业搜索引擎。
- **检索增强生成（RAG）**：使用 Elasticsearch 作为检索引擎，用更相关、更新或专有的数据补充生成式 AI 模型，适用于各种用例。
- **地理空间搜索**：使用地理空间查询搜索位置并计算空间关系。

### 安全

- **安全信息和事件管理（SIEM）**：收集、存储和分析来自应用程序、系统和服务的安全数据。
- **终端安全**：监控和分析终端安全数据。
- **威胁狩猎**：搜索和分析数据以检测和响应安全威胁。

这只是 Elasticsearch 支持的搜索、可观测性和安全用例的一部分示例。有关各行业的具体示例，请参阅 Elastic 客户成功案例。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/elasticsearch-intro-what-is-es.html)
