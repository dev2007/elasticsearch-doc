# Edge n-gram 词元过滤器

从词元的开头生成指定长度的 n 元组（n-gram）。

例如，可以使用 `edge_ngram` 词元过滤器将 `quick` 更改为 `qu`。

未自定义时，该过滤器默认创建 1 字符的前缘 n 元组。

此过滤器使用 Lucene 的 [EdgeNGramTokenFilter](https://lucene.apache.org/core/9_12_0/analysis/common/org/apache/lucene/analysis/ngram/EdgeNGramTokenFilter.html)。

`edge_ngram` 过滤器与 [`ngram` 词元过滤器](/text_analysis/analysis_ngram_tokenfilter)类似。但是，`edge_ngram` 只输出从词元开头开始的 n 元组。这些前缘 n 元组适用于“输入即搜”（search-as-you-type）查询。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `edge_ngram` 过滤器将 `the quick brown fox jumps` 转换为 1 字符和 2 字符的前缘 n 元组：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [
    { "type": "edge_ngram",
      "min_gram": 1,
      "max_gram": 2
    }
  ],
  "text": "the quick brown fox jumps"
}
```

该过滤器产生以下词元：

```text
[ t, th, q, qu, b, br, f, fo, j, ju ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `edge_ngram` 过滤器配置一个新的自定义分析器：

```bash
PUT edge_ngram_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_edge_ngram": {
          "tokenizer": "standard",
          "filter": [ "edge_ngram" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `max_gram`

  （可选，整数）n 元组的最大字符长度。对于自定义词元过滤器，默认为 `2`。对于内置的 `edge_ngram` 过滤器，默认为 `1`。

  参阅 [`max_gram` 参数的限制](#max_gram-参数的限制)。

- `min_gram`

  （可选，整数）n 元组的最小字符长度。默认为 `1`。

- `preserve_original`

  （可选，布尔值）设置为 `true` 时输出原始词元。默认为 `false`。

- `side`

  （可选，字符串）**自 8.16.0 起弃用。** 指示从前端还是后端截断词元。默认为 `front`。请改用 [reverse 词元过滤器](/text_analysis/analysis_reverse_tokenfilter)。

## 自定义

要自定义 `edge_ngram` 过滤器，请复制它以创建新的自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建一个生成 3-5 字符 n 元组的自定义 `edge_ngram` 过滤器：

```bash
PUT edge_ngram_custom_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "tokenizer": "whitespace",
          "filter": [ "3_5_edgegrams" ]
        }
      },
      "filter": {
        "3_5_edgegrams": {
          "type": "edge_ngram",
          "min_gram": 3,
          "max_gram": 5
        }
      }
    }
  }
}
```

## `max_gram` 参数的限制

`edge_ngram` 过滤器的 `max_gram` 值限制词元的字符长度。当 `edge_ngram` 过滤器与索引分析器一起使用时，这意味着超过 `max_gram` 长度的搜索词可能无法匹配任何已索引的词项。

例如，如果 `max_gram` 为 `3`，对 `apple` 的搜索将无法匹配已索引的词项 `app`。

为解决这个问题，可以将 [truncate 过滤器](/text_analysis/analysis_truncate_tokenfilter)与搜索分析器配合使用，将搜索词缩短到 `max_gram` 的字符长度。但这可能返回不相关的结果。

例如，如果 `max_gram` 为 `3` 且搜索词被截断为三个字符，搜索词 `apple` 会被缩短为 `app`。这意味着对 `apple` 的搜索会返回任何匹配 `app` 的已索引词项，例如 `apply`、`snapped` 和 `apple`。

我们建议对两种方法都进行测试，看哪种最符合你的用例和期望的搜索体验。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-edgengram-tokenfilter.html)
