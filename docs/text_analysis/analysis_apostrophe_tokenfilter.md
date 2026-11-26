# Apostrophe 词元过滤器

去除撇号（`'`）之后的所有字符，包括撇号本身。

该过滤器包含在 Elasticsearch 内置的[土耳其语分析器](/text_analysis/analysis_lang_analyzer#turkish-分析器)中。它使用 Lucene 的 ApostropheFilter，该过滤器专为土耳其语设计。

## 示例

以下 analyze API 请求演示了 `apostrophe` 词元过滤器的工作方式：

```bash
GET /_analyze
{
  "tokenizer" : "standard",
  "filter" : ["apostrophe"],
  "text" : "Istanbul'a veya Istanbul'dan"
}
```

该过滤器产生以下词元：

```text
[ Istanbul, veya, Istanbul ]
```

## 添加到分析器

以下创建索引 API 请求使用 `apostrophe` 词元过滤器配置一个新的自定义分析器：

```bash
PUT /apostrophe_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_apostrophe": {
          "tokenizer": "standard",
          "filter": [ "apostrophe" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-apostrophe-tokenfilter.html)
