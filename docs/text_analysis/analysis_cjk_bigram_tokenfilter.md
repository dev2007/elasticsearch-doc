# CJK bigram 词元过滤器

将 CJK（中文、日文、韩文）词元组合成[二元组（bigram）](https://en.wikipedia.org/wiki/Bigram)。

此过滤器已包含在 Elasticsearch 内置的 [CJK 语言分析器](/text_analysis/analysis_lang_analyzer#cjk-分析器)中。它使用 Lucene 的 [CJKBigramFilter](https://lucene.apache.org/core/9_12_1/analysis/common/org/apache/lucene/analysis/cjk/CJKBigramFilter.html)。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求演示了 `cjk_bigram` 词元过滤器的工作方式：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": ["cjk_bigram"],
  "text": "東京都は、日本の首都であり"
}
```

该过滤器产生以下词元：

```text
[东京, 京都, 都は, 日本, 本の, の首, 首都, 都で, であ, あり]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 CJK bigram 词元过滤器配置一个新的[自定义分析器](/text_analysis/analysis_custom_analyzer)：

```bash
PUT /cjk_bigram_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_cjk_bigram": {
          "tokenizer": "standard",
          "filter": ["cjk_bigram"]
        }
      }
    }
  }
}
```

## 可配置参数

- `ignored_scripts`

  （可选，字符脚本数组）需要禁用二元组的字符脚本数组。可选值：`han`（汉字）、`hangul`（谚文）、`hiragana`（平假名）、`katakana`（片假名）。所有非 CJK 输入将原样通过。

- `output_unigrams`

  （可选，布尔值）若为 `true`，同时以二元组和一元组（unigram）两种形式输出词元。若为 `false`，仅当某个 CJK 字符没有相邻字符时，才以一元组形式输出。默认值为 `false`。

## 自定义

要自定义 CJK bigram 词元过滤器，请复制它以创建新的自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建一个仅对汉字生成二元组的自定义 `cjk_bigram` 过滤器：

```bash
PUT /cjk_bigram_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "han_bigrams": {
          "tokenizer": "standard",
          "filter": ["han_bigrams_filter"]
        }
      },
      "filter": {
        "han_bigrams_filter": {
          "type": "cjk_bigram",
          "ignored_scripts": ["hangul", "hiragana", "katakana"],
          "output_unigrams": true
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-cjk-bigram-tokenfilter.html)
