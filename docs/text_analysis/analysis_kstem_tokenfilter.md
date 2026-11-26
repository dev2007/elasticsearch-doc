# KStem 词元过滤器

为英语提供基于 KStem 的词干提取（stemming）。

kstem 过滤器将算法词干提取与内置词典相结合。与其他英语词干提取过滤器（如 [porter_stem](/text_analysis/analysis_porterstem_tokenfilter)）相比，kstem 过滤器的词干提取激进程度较低。

kstem 过滤器等同于 [stemmer 过滤器](/text_analysis/analysis_stemmer_tokenfilter)的 `light_english` 变体。

此过滤器使用 Lucene 的 KStemFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 kstem 过滤器将 `the foxes jumping quickly` 词干提取为 `the fox jump quick`：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [ "kstem" ],
  "text": "the foxes jumping quickly"
}
```

该过滤器产生以下词元：

```text
[ the, fox, jump, quick ]
```

## 添加到分析器

kstem 过滤器要正常工作，需要小写的词元。为确保词元为小写，请在分析器配置中将 [lowercase 过滤器](/text_analysis/analysis_lowercase_tokenfilter)添加到 kstem 过滤器之前。

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 kstem 过滤器配置一个新的自定义分析器。注意 lowercase 过滤器位于 kstem 过滤器之前：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "whitespace",
          "filter": [
            "lowercase",
            "kstem"
          ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-kstem-tokenfilter.html)
