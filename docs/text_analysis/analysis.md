# 文本分析

文本分析（Text analysis）是将非结构化文本（如邮件正文或产品描述）转换为针对搜索优化的结构化格式的过程。

## 何时配置文本分析

Elasticsearch 在索引或搜索文本字段时执行文本分析。

如果索引不包含文本字段，则无需进一步设置，可以跳过本节内容。

不过，如果你使用了文本字段，或者文本搜索没有按预期返回结果，配置文本分析通常会有所帮助。此外，当你使用 Elasticsearch 完成以下任务时，也应关注分析配置：

- 构建搜索引擎
- 挖掘非结构化数据
- 针对特定语言微调搜索
- 进行词典学或语言学研究

## 本节内容

- [概述](/text_analysis/analysis_overview)
- [概念](/text_analysis/analysis_concepts)
- [配置文本分析](/text_analysis/configure_text_analysis)
- [内置分析器参考](/text_analysis/analysis_analyzers)
- [分词器参考](/text_analysis/analysis_tokenizers)
- [词元过滤器参考](/text_analysis/analysis_token_filters)
- [字符过滤器参考](/text_analysis/analysis_char_filters)
- [规范化器](/text_analysis/analysis_normalizers)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis.html)
