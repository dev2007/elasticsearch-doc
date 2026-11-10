# 词干提取

词干提取（Stemming）是将单词还原为其词根形式的过程。这能确保一个单词的各种变体在搜索时能够匹配。

例如，*walking* 和 *walked* 可以被提取为同一个词根单词：*walk*。提取之后，搜索时出现其中任何一个单词都会匹配另一个。

词干提取依赖于具体语言，但通常涉及去除单词的前缀和后缀。

在某些情况下，提取后的词根形式可能不是一个真实的单词。例如，*jumping* 和 *jumpiness* 都可以被提取为 *jumpi*。虽然 *jumpi* 不是真实的英语单词，但这并不影响搜索；只要一个单词的所有变体都被还原为相同的词根形式，它们就能正确匹配。

## 词干提取词元过滤器

在 Elasticsearch 中，词干提取由词干提取词元过滤器（stemmer token filters）处理。这些词元过滤器可以按提取单词的方式分类：

- **算法词干提取器**（algorithmic stemmers），基于一组规则提取单词
- **词典词干提取器**（dictionary stemmers），通过在词典中查找来提取单词

由于词干提取会更改词元，我们建议在索引分析和搜索分析中使用相同的词干提取词元过滤器。

## 算法词干提取器

算法词干提取器对每个单词应用一系列规则，将其还原为词根形式。例如，英语算法词干提取器可能会去掉复数单词末尾的 *-s* 和 *-es* 后缀。

算法词干提取器有几个优点：

- 几乎无需设置，通常开箱即用。
- 占用内存少。
- 通常比词典词干提取器更快。

不过，大多数算法词干提取器只会更改单词的现有文本。这意味着它们可能无法很好地处理不包含其词根形式的不规则单词，例如：

- *be*、*are* 和 *am*
- *mouse* 和 *mice*
- *foot* 和 *feet*

**以下词元过滤器使用算法词干提取：**

- [`stemmer`](/text_analysis/analysis_stemmer_tokenfilter)，为多种语言提供算法词干提取，其中部分语言还有额外的变体。
- [`kstem`](/text_analysis/analysis_kstem_tokenfilter)，一种英语词干提取器，将算法词干提取与内置词典相结合。
- [`porter_stem`](/text_analysis/analysis_porterstem_tokenfilter)，我们推荐的英语算法词干提取器。
- [`snowball`](/text_analysis/analysis_snowball_tokenfilter)，对多种语言使用基于 Snowball 的词干提取规则。

## 词典词干提取器

词典词干提取器在提供的词典中查找单词，将未提取词根的单词变体替换为词典中的已提取词根单词。

理论上，词典词干提取器非常适合：

- 提取不规则单词的词干
- 区分拼写相似但概念上不相关的单词，例如：
  - *organ* 和 *organization*
  - *broker* 和 *broken*

在实践中，算法词干提取器的表现通常优于词典词干提取器。这是因为词典词干提取器有以下缺点：

**词典质量**

词典词干提取器的效果完全取决于其词典的质量。要良好工作，这些词典必须包含大量单词、定期更新，并随语言趋势而变化。通常，当一本词典可用时，它已经不完整，并且其中一些条目已经过时。

**体积与性能**

词典词干提取器必须将词典中的所有单词、前缀和后缀加载到内存中。这可能会占用大量 RAM。质量较低的词典在前缀和后缀去除方面的效率也可能较低，从而显著减慢词干提取过程。

你可以使用 [`hunspell`](/text_analysis/analysis_hunspell_tokenfilter) 词元过滤器执行词典词干提取。

如果可用，我们建议在使用 hunspell 词元过滤器之前，先尝试针对你的语言的算法词干提取器。

## 控制词干提取

有时，词干提取可能产生拼写相似但概念上不相关的共同词根单词。例如，词干提取器可能将 *skies* 和 *skiing* 都还原为同一个词根单词：*ski*。

为避免这种情况并更好地控制词干提取，可以使用以下词元过滤器：

- [`stemmer_override`](/text_analysis/analysis_stemmer_override_tokenfilter)，允许你为特定词元的词干提取定义规则。
- [`keyword_marker`](/text_analysis/analysis_keyword_marker_tokenfilter)，将指定词元标记为关键词。关键词词元不会被后续的词干提取词元过滤器处理。
- [`conditional`](/text_analysis/analysis_condition_tokenfilter)，可用于将词元标记为关键词，作用类似于 keyword_marker 过滤器。

对于内置语言分析器，你还可以使用 **stem_exclusion** 参数指定一个不会被词干提取的单词列表。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/stemming.html)
