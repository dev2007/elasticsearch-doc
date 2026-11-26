# N-gram 词元过滤器

从一个词元中生成指定长度的 n-gram。

例如，可以使用 ngram 词元过滤器将 `fox` 转换为：

```text
[ f, fo, o, ox, x ]
```

此过滤器使用 Lucene 的 NGramTokenFilter。

ngram 过滤器与 [edge_ngram 词元过滤器](/text_analysis/analysis_edgengram_tokenfilter)类似。不同之处在于：edge_ngram 只输出从词元开头开始的 n-gram。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 ngram 过滤器将 `Quick fox` 转换为 1 字符和 2 字符的 n-gram：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [ "ngram" ],
  "text": "Quick fox"
}
```

该过滤器产生以下词元：

```text
[ Q, Qu, u, ui, i, ic, c, ck, k, f, fo, o, ox, x ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 ngram 过滤器配置一个新的自定义分析器：

```bash
PUT ngram_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_ngram": {
          "tokenizer": "standard",
          "filter": [ "ngram" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `max_gram`

  （可选，整数）gram 中字符的最大长度。默认为 `2`。

- `min_gram`

  （可选，整数）gram 中字符的最小长度。默认为 `1`。

- `preserve_original`

  （可选，布尔值）如果为 `true`，则输出原始词元。默认为 `false`。

`max_gram` 与 `min_gram` 之间允许的最大差值由索引级设置 `index.max_ngram_diff` 控制。

## 自定义并添加到分析器

要自定义 ngram 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建了一个自定义 ngram 过滤器，用于生成 3 到 5 个字符之间的 n-gram。该请求还将 `index.max_ngram_diff` 设置增加到 `2`：

```bash
PUT ngram_custom_example
{
  "settings": {
    "index": {
      "max_ngram_diff": 2
    },
    "analysis": {
      "analyzer": {
        "default": {
          "tokenizer": "whitespace",
          "filter": [ "3_5_grams" ]
        }
      },
      "filter": {
        "3_5_grams": {
          "type": "ngram",
          "min_gram": 3,
          "max_gram": 5
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-ngram-tokenfilter.html)
