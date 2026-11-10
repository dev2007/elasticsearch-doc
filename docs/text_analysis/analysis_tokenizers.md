# 分词器参考

## Elasticsearch 分词与神经分词的区别

Elasticsearch 的分词过程产出语言学词元，为搜索和检索而优化。这与机器学习和自然语言处理中的神经分词（neural tokenization）不同。神经分词器将字符串转换为更小的子词（subword）词元，这些词元会被编码为向量供神经网络使用。Elasticsearch 没有内置的神经分词器。

## 定义

分词器接收一个字符流，将其拆分为独立的词元（通常是单个单词），并输出一个词元流。例如，空白分词器在遇到任何空白字符时都会将文本拆分为词元。它会把文本 `"Quick brown fox!"` 转换为词项 `[Quick, brown, fox!]`。

分词器还负责记录以下内容：

- 每个词项的**顺序或位置**（position，用于短语查询和词语邻近查询）
- 该词项所代表的原始单词的**起止字符偏移量**（character offsets，用于高亮搜索摘要）
- **词元类型**（token type），即产出的每个词项的分类，例如 `<ALPHANUM>`、`<HANGUL>` 或 `<NUM>`。较简单的分析器只产出 word 词元类型。

Elasticsearch 内置了多个分词器，可用于构建自定义分析器。

## 面向单词的分词器

以下分词器通常用于将全文分词为独立的单词：

| 分词器 | 描述 |
|:--|:--|
| **[标准分词器](/text_analysis/analysis_standard_tokenizer)** | 标准分词器按 Unicode 文本分段算法定义的单词边界将文本拆分为词项。它移除大多数标点符号，对大多数语言而言是最佳选择。 |
| **[letter 分词器](/text_analysis/analysis_letter_tokenizer)** | letter 分词器在遇到非字母字符时将文本拆分为词项。 |
| **[lowercase 分词器](/text_analysis/analysis_lowercase_tokenizer)** | lowercase 分词器与 letter 分词器一样，在遇到非字母字符时将文本拆分为词项，但它还会将所有词项小写化。 |
| **[whitespace 分词器](/text_analysis/analysis_whitespace_tokenizer)** | whitespace 分词器在遇到任何空白字符时将文本拆分为词项。 |
| **[UAX URL email 分词器](/text_analysis/analysis_uaxurlemail_tokenizer)** | uax_url_email 分词器与标准分词器类似，但它能将 URL 和电子邮件地址识别为单个词元。 |
| **[classic 分词器](/text_analysis/analysis_classic_tokenizer)** | classic 分词器是一种基于语法的英语分词器。 |
| **[thai 分词器](/text_analysis/analysis_thai_tokenizer)** | thai 分词器将泰语文本分段为单词。 |

## 部分单词分词器

这些分词器将文本或单词拆分为更小的片段，用于部分单词匹配：

| 分词器 | 描述 |
|:--|:--|
| **[N-Gram 分词器](/text_analysis/analysis_ngram_tokenizer)** | ngram 分词器在遇到指定字符列表（如空白或标点）中的任意字符时将文本拆分为单词，然后返回每个单词的 n-gram：连续字母的滑动窗口，例如 `quick → [qu, ui, ic, ck]`。 |
| **[Edge N-Gram 分词器](/text_analysis/analysis_edgengram_tokenizer)** | edge_ngram 分词器在遇到指定字符列表（如空白或标点）中的任意字符时将文本拆分为单词，然后返回每个单词的 n-gram，这些 n-gram 锚定在单词的开头，例如 `quick → [q, qu, qui, quic, quick]`。 |

## 结构化文本分词器

以下分词器通常用于结构化文本（如标识符、电子邮件地址、邮编和路径），而不是全文：

| 分词器 | 描述 |
|:--|:--|
| **[keyword 分词器](/text_analysis/analysis_keyword_tokenizer)** | keyword 分词器是一个“noop”分词器，它接受给定的任何文本，并输出完全相同的文本作为单个词项。它可以与 lowercase 等词元过滤器组合，以规范化分析后的词项。 |
| **[pattern 分词器](/text_analysis/analysis_pattern_tokenizer)** | pattern 分词器使用正则表达式，或者在匹配单词分隔符时将文本拆分为词项，或者将匹配的文本捕获为词项。 |
| **[simple_pattern 分词器](/text_analysis/analysis_simple_pattern_tokenizer)** | simple_pattern 分词器使用正则表达式将匹配的文本捕获为词项。它使用正则表达式功能的一个受限子集，通常比 pattern 分词器更快。 |
| **[char_group 分词器](/text_analysis/analysis_chargroup_tokenizer)** | char_group 分词器通过要拆分的字符集合进行配置，这通常比运行正则表达式开销更低。 |
| **[simple_pattern_split 分词器](/text_analysis/analysis_simple_pattern_split_tokenizer)** | simple_pattern_split 分词器使用与 simple_pattern 分词器相同的受限正则表达式子集，但在匹配处拆分输入，而不是将匹配项作为词项返回。 |
| **[path_hierarchy 分词器](/text_analysis/analysis_pathhierarchy_tokenizer)** | path_hierarchy 分词器接受文件系统路径等分层值，按路径分隔符拆分，并为树中的每个组件产出一个词项，例如 `/foo/bar/baz → [/foo, /foo/bar, /foo/bar/baz]`。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-tokenizers.html)
