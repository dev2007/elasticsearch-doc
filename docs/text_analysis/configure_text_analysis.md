# 配置文本分析

默认情况下，Elasticsearch 使用标准分析器执行所有文本分析。标准分析器开箱即用，支持大多数自然语言和使用场景。如果你选择原样使用标准分析器，则无需进一步配置。

如果标准分析器不能满足你的需求，请查看并测试 Elasticsearch 的[其他内置分析器](/text_analysis/analysis_analyzers)。内置分析器无需配置，但其中一些支持用于调整其行为的选项。例如，你可以为标准分析器配置一个要移除的自定义停用词列表。

如果没有内置分析器符合你的需求，你可以测试并创建一个[自定义分析器](/text_analysis/analysis_custom_analyzer)。自定义分析器需要选择并组合不同的分析器组件，让你对分析过程拥有更大的控制权。

- [测试分析器](/text_analysis/test_analyzer)
- [配置内置分析器](/text_analysis/configuring_analyzers)
- [创建自定义分析器](/text_analysis/analysis_custom_analyzer)
- [指定分析器](/text_analysis/specify_analyzer)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/configure-text-analysis.html)
