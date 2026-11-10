# 文本分析概述

文本分析使 Elasticsearch 能够执行**全文搜索**，即返回所有相关结果的搜索，而不仅仅是精确匹配。

例如，如果你搜索 `Quick fox jumps`，你很可能希望返回包含 *A quick brown fox jumps over the lazy dog* 的文档，也可能希望返回包含相关词汇的文档，比如 *fast fox* 或 *foxes leap*。

## 分词

分析通过**分词**（tokenization）使全文搜索成为可能：将文本拆分为更小的块，称为**词元**（token）。在大多数情况下，这些词元就是单个单词。

如果将短语 *the quick brown fox jumps* 作为单个字符串进行索引，而用户搜索 `quick fox`，则不会被视为匹配。但是，如果对该短语进行分词并单独索引每个单词，查询字符串中的单词就可以被逐个查找。这意味着它们可以被 `quick fox`、`fox brown` 或其他变体的搜索匹配到。

## 规范化

分词实现了按单个词元匹配，但每个词元仍然是字面上的精确匹配。这意味着：

- 搜索 `Quick` 不会匹配 `quick`，尽管你很可能希望两者能够互相匹配
- 虽然 `fox` 和 `foxes` 共享同一个词根，但搜索 `foxes` 不会匹配 `fox`，反之亦然
- 搜索 `jumps` 不会匹配 `leaps`。虽然它们没有共同的词根，但它们是同义词，含义相近

为了解决这些问题，文本分析可以将这些词元**规范化**（normalize）为标准格式。这使你能够匹配与搜索词不完全相同、但相似到依然相关的词元。例如：

- `Quick` 可以被**小写化**为 `quick`
- `foxes` 可以被**词干提取**（还原为词根形式）：`fox`
- `jump` 和 `leap` 是同义词，可以作为同一个词索引：`jump`

为确保搜索词按预期匹配这些单词，可以对查询字符串应用相同的分词和规范化规则。例如，对 *Foxes leap* 的搜索可以被规范化为对 `fox jump` 的搜索。

## 自定义文本分析

文本分析由[分析器](/text_analysis/analyzer_anatomy)执行，它是一组管控整个分析过程的规则。

Elasticsearch 内置了一个名为[标准分析器](/text_analysis/analysis_standard_analyzer)的默认分析器，开箱即用即可满足大多数使用场景。

如果你想定制搜索体验，可以选择[其他内置分析器](/text_analysis/analysis_analyzers)，甚至配置[自定义分析器](/text_analysis/analysis_custom_analyzer)。自定义分析器让你可以控制分析过程的每一步，包括：

- 文本在分词**之前**所做的更改
- 文本如何被转换为词元
- 词元在索引或搜索之前所做的规范化更改

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-overview.html)
