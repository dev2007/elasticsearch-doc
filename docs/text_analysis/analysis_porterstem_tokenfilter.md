# Porter stem 词元过滤器

基于 Porter 词干提取算法为英语提供算法词干提取。

与其他英语词干提取过滤器（如 [kstem](/text_analysis/analysis_kstem_tokenfilter)）相比，porter_stem 过滤器的词干提取通常更激进。

porter_stem 过滤器等同于 [stemmer 过滤器](/text_analysis/analysis_stemmer_tokenfilter)的 `english` 变体。

此过滤器使用 Lucene 的 PorterStemFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 porter_stem 过滤器将 `the foxes jumping quickly` 词干提取为 `the fox jump quickli`：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [ "porter_stem" ],
  "text": "the foxes jumping quickly"
}
```

该过滤器产生以下词元：

```text
[ the, fox, jump, quickli ]
```

## 添加到分析器

porter_stem 过滤器要正常工作，需要小写的词元。为确保词元为小写，请在分析器配置中将 [lowercase 过滤器](/text_analysis/analysis_lowercase_tokenfilter)放在 porter_stem 过滤器之前。

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 porter_stem 过滤器配置一个新的自定义分析器：

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
            "porter_stem"
          ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-porterstem-tokenfilter.html)
