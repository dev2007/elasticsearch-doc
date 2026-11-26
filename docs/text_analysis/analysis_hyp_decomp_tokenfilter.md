# Hyphenation decompounder 词元过滤器

使用基于 XML 的连字符模式（hyphenation patterns）查找复合词中的潜在子词。随后，这些子词会根据指定的词列表进行检查。不在列表中的子词会被排除在词元输出之外。

此过滤器使用 Lucene 的 HyphenationCompoundWordTokenFilter，该过滤器是为日耳曼语系语言构建的。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 hyphenation_decompounder 过滤器，基于 `analysis/hyphenation_patterns.xml` 文件中的德语连字符模式，在 `Kaffeetasse` 中查找子词。随后，过滤器会根据指定的词列表检查这些子词：`Kaffee`、`zucker` 和 `tasse`：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "hyphenation_decompounder",
      "hyphenation_patterns_path": "analysis/hyphenation_patterns.xml",
      "word_list": [ "Kaffee", "zucker", "tasse" ]
    }
  ],
  "text": "Kaffeetasse"
}
```

该过滤器产生以下词元：

```text
[ Kaffeetasse, Kaffee, tasse ]
```

## 可配置参数

- `hyphenation_patterns_path`

  （必需，字符串）Apache FOP（Formatting Objects Processor）XML 连字符模式文件的路径。

  此路径必须是绝对路径，或相对于 `config` 位置的相对路径。仅支持 FOP v1.2 兼容文件，不支持 v2.0 及以上版本的连字符模式文件。

  示例 FOP XML 连字符模式文件可参考 [OFFO（Objects For Formatting Objects）Sourceforge 项目](http://offo.sourceforge.net/#FOP+XML+Hyphenation+Patterns)。

- `word_list`

  （必需*，字符串数组）子词列表。通过连字符模式找到但不在该列表中的子词，会被排除在词元输出之外。

  必须指定此参数或 `word_list_path` 参数。

  可以使用 [dictionary_decompounder 过滤器](/text_analysis/analysis_dict_decomp_tokenfilter)在实现前测试词列表的质量。

- `word_list_path`

  （必需*，字符串）包含子词列表的文件路径。通过连字符模式找到但不在该文件中的子词，会被排除在词元输出之外。

  此路径必须是绝对路径，或相对于 `config` 位置的相对路径。文件必须为 UTF-8 编码，且每个词元以换行符分隔。

  必须指定此参数或 `word_list` 参数。

- `max_subword_size`

  （可选，整数）子词的最大字符长度。更长的子词词元会被排除在输出之外。默认为 `15`。

- `min_subword_size`

  （可选，整数）子词的最小字符长度。更短的子词词元会被排除在输出之外。默认为 `2`。

- `min_word_size`

  （可选，整数）词的最小字符长度。更短的词词元会被排除在输出之外。默认为 `5`。

- `only_longest_match`

  （可选，布尔值）如果为 `true`，仅包含最长匹配的子词。默认为 `false`。

- `no_sub_matches`

  （可选，布尔值）如果为 `true`，对于已经位于词列表中的词元，不再匹配其中的子词元。默认为 `false`。

- `no_overlapping_matches`

  （可选，布尔值）如果为 `true`，不允许重叠词元。默认为 `false`。

:::::note 提示
通常情况下，用户只会希望启用 `only_longest_match`、`no_sub_matches` 和 `no_overlapping_matches` 这三个标志中的一个。

`no_overlapping_matches` 是限制最严格的选项，`no_sub_matches` 比 `only_longest_match` 更严格。启用更严格的选项时，较不严格选项的状态不会产生任何影响。
:::::

## 自定义并添加到分析器

要自定义 hyphenation_decompounder 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用一个自定义的 hyphenation_decompounder 过滤器配置新的自定义分析器。该过滤器基于 `analysis/hyphenation_patterns.xml` 文件中的连字符模式查找子词，并根据 `analysis/example_word_list.txt` 文件中的词列表检查这些子词。长度超过 22 个字符的子词会被排除在词元输出之外：

```bash
PUT hyphenation_decompound_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_hyphenation_decompound": {
          "tokenizer": "standard",
          "filter": [ "22_char_hyphenation_decompound" ]
        }
      },
      "filter": {
        "22_char_hyphenation_decompound": {
          "type": "hyphenation_decompounder",
          "word_list_path": "analysis/example_word_list.txt",
          "hyphenation_patterns_path": "analysis/hyphenation_patterns.xml",
          "max_subword_size": 22
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-hyp-decomp-tokenfilter.html)
