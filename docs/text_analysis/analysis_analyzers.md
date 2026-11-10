# 内置分析器参考

Elasticsearch 自带大量内置分析器，无需进一步配置即可在任何索引中使用：

1. [标准分析器](/text_analysis/analysis_standard_analyzer)——标准分析器按 Unicode 文本分段算法定义的单词边界将文本拆分为词项。它移除大多数标点符号，将词项小写化，并支持移除停用词。
2. [simple 分析器](/text_analysis/analysis_simple_analyzer)——simple 分析器在遇到非字母字符时将文本拆分为词项。它将所有词项小写化。
3. [whitespace 分析器](/text_analysis/analysis_whitespace_analyzer)——whitespace 分析器在遇到任何空白字符时将文本拆分为词项。它不会将词项小写化。
4. [stop 分析器](/text_analysis/analysis_stop_analyzer)——stop 分析器类似于 simple 分析器，但还支持移除停用词。
5. [keyword 分析器](/text_analysis/analysis_keyword_analyzer)——keyword 分析器是一个“noop”分析器，它接受给定的任何文本，并输出完全相同的文本作为单个词项。
6. [pattern 分析器](/text_analysis/analysis_pattern_analyzer)——pattern 分析器使用正则表达式将文本拆分为词项。它支持小写化和停用词。
7. [语言分析器](/text_analysis/analysis_lang_analyzer)——Elasticsearch 提供许多针对特定语言的分析器，比如 `english` 或 `french`。
8. [fingerprint 分析器](/text_analysis/analysis_fingerprint_analyzer)——fingerprint 分析器是一种专用分析器，它会创建一个可用于重复检测的指纹。

如果你没有找到适合需求的分析器，你可以创建一个[自定义分析器](/text_analysis/analysis_custom_analyzer)，它组合适当的字符过滤器、分词器和词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-analyzers.html)
