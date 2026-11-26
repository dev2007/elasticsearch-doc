# Dictionary decompounder 词元过滤器

::::tip 提示
在大多数情况下，我们建议使用更快的 `hyphenation_decompounder` 词元过滤器替代此过滤器。不过，你可以先使用 `dictionary_decompounder` 过滤器检查词表的质量，然后再将其应用到 `hyphenation_decompounder` 过滤器中。
::::

使用指定的词表和暴力方式在复合词中查找子词。如果找到，这些子词将被包含在词元输出中。

此过滤器使用 Lucene 的 DictionaryCompoundWordTokenFilter，专为日耳曼语系构建。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `dictionary_decompounder` 过滤器在 `Donaudampfschiff` 中查找子词，并将子词与指定词表 `Donau`、`dampf`、`meer`、`schiff` 进行比对：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "dictionary_decompounder",
      "word_list": ["Donau", "dampf", "meer", "schiff"]
    }
  ],
  "text": "Donaudampfschiff"
}
```

该过滤器产生以下词元：

```text
[ Donaudampfschiff, Donau, dampf, schiff ]
```

## 可配置参数

- `word_list`

  （必需*，字符串数组）用于在词元流中查找的子词列表。若找到，该子词将被包含在词元输出中。此参数与 `word_list_path` 必须指定其一。

- `word_list_path`

  （必需*，字符串）包含待查找子词列表的文件路径。若找到，该子词将被包含在词元输出中。路径必须为绝对路径或相对于 `config` 目录的路径，文件必须为 UTF-8 编码，文件中每个词元需以换行符分隔。此参数与 `word_list` 必须指定其一。

- `max_subword_size`

  （可选，整数）子词的最大字符长度。超过此长度的子词词元会被排除在输出之外。默认值：`15`。

- `min_subword_size`

  （可选，整数）子词的最小字符长度。短于此长度的子词词元会被排除在输出之外。默认值：`2`。

- `min_word_size`

  （可选，整数）单词的最小字符长度。短于此长度的单词词元会被排除在输出之外。默认值：`5`。

- `only_longest_match`

  （可选，布尔值）若为 `true`，仅包含最长匹配的子词。默认值：`false`。

## 自定义并添加到分析器

要自定义 `dictionary_decompounder` 过滤器，请复制它作为新自定义词元过滤器的基础，然后使用其可配置参数进行修改。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义的 `dictionary_decompounder` 过滤器配置一个新的自定义分析器。

该自定义 `dictionary_decompounder` 过滤器在 `analysis/example_word_list.txt` 文件中查找子词。超过 22 个字符的子词将被排除在词元输出之外：

```bash
PUT dictionary_decompound_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_dictionary_decompound": {
          "tokenizer": "standard",
          "filter": [ "22_char_dictionary_decompound" ]
        }
      },
      "filter": {
        "22_char_dictionary_decompound": {
          "type": "dictionary_decompounder",
          "word_list_path": "analysis/example_word_list.txt",
          "max_subword_size": 22
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-dict-decomp-tokenfilter.html)
