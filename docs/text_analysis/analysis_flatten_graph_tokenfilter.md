# Flatten graph 词元过滤器

将[图词元过滤器](/text_analysis/token_graphs)（如 `synonym_graph` 或 `word_delimiter_graph`）生成的词元图扁平化。

扁平化包含多位置词元的词元图后，该图才适合索引。否则，索引不支持包含多位置词元的词元图。

扁平化图是有损过程。

如果可以的话，请避免使用 `flatten_graph` 过滤器。改为仅在搜索分析器中使用图词元过滤器，这样就无需使用 `flatten_graph` 过滤器。

`flatten_graph` 过滤器使用 Lucene 的 FlattenGraphFilter。

## 示例

要了解 `flatten_graph` 过滤器的工作方式，首先需要生成一个包含多位置词元的词元图。

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `synonym_graph` 过滤器，在文本 `domain name system is fragile` 中为 `domain name system` 添加 `internet phonebook` 作为多位置同义词：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "synonym_graph",
      "synonyms": [ "internet phonebook, domain name system" ]
    }
  ],
  "text": "domain name system is fragile"
}
```

该过滤器产生以下词元图，其中 `internet phonebook` 为多位置词元。

索引不支持包含多位置词元的词元图。要使此词元图适合索引，需要将其扁平化。

要扁平化该词元图，可在之前的 analyze API 请求中在 `synonym_graph` 过滤器之后添加 `flatten_graph` 过滤器：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "synonym_graph",
      "synonyms": [ "internet phonebook, domain name system" ]
    },
    "flatten_graph"
  ],
  "text": "domain name system is fragile"
}
```

该过滤器产生以下扁平化后的词元图，适合索引使用。

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `flatten_graph` 词元过滤器配置一个新的自定义分析器。

在此分析器中，自定义的 `word_delimiter_graph` 过滤器生成包含连接的、多位置词元的词元图。`flatten_graph` 过滤器将这些词元图扁平化，使其适合索引：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_index_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "my_custom_word_delimiter_graph_filter",
            "flatten_graph"
          ]
        }
      },
      "filter": {
        "my_custom_word_delimiter_graph_filter": {
          "type": "word_delimiter_graph",
          "catenate_all": true
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-flatten-graph-tokenfilter.html)
