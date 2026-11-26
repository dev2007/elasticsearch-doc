# Remove duplicates 词元过滤器

移除处于同一位置的重复词元。

此过滤器使用 Lucene 的 RemoveDuplicatesTokenFilter。

## 示例

要查看 remove_duplicates 过滤器的工作方式，首先需要生成包含“同一位置重复词元”的词元流。

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 [keyword_repeat](/text_analysis/analysis_keyword_repeat_tokenfilter) 和 [stemmer](/text_analysis/analysis_stemmer_tokenfilter) 过滤器，为 `jumping dog` 创建词干化和非词干化的词元：

```bash
GET _analyze
{
  "tokenizer": "whitespace",
  "filter": [
    "keyword_repeat",
    "stemmer"
  ],
  "text": "jumping dog"
}
```

API 返回如下结果。注意：位置 `1` 的 `dog` 词元被重复生成了两次：

```json
{
  "tokens": [
    {
      "token": "jumping",
      "start_offset": 0,
      "end_offset": 7,
      "type": "word",
      "position": 0
    },
    {
      "token": "jump",
      "start_offset": 0,
      "end_offset": 7,
      "type": "word",
      "position": 0
    },
    {
      "token": "dog",
      "start_offset": 8,
      "end_offset": 11,
      "type": "word",
      "position": 1
    },
    {
      "token": "dog",
      "start_offset": 8,
      "end_offset": 11,
      "type": "word",
      "position": 1
    }
  ]
}
```

要移除其中一个重复的 `dog` 词元，可在前面的请求中加入 remove_duplicates 过滤器：

```bash
GET _analyze
{
  "tokenizer": "whitespace",
  "filter": [
    "keyword_repeat",
    "stemmer",
    "remove_duplicates"
  ],
  "text": "jumping dog"
}
```

API 返回如下结果。位置 `1` 现在只有一个 `dog` 词元：

```json
{
  "tokens": [
    {
      "token": "jumping",
      "start_offset": 0,
      "end_offset": 7,
      "type": "word",
      "position": 0
    },
    {
      "token": "jump",
      "start_offset": 0,
      "end_offset": 7,
      "type": "word",
      "position": 0
    },
    {
      "token": "dog",
      "start_offset": 8,
      "end_offset": 11,
      "type": "word",
      "position": 1
    }
  ]
}
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 remove_duplicates 过滤器配置一个新的自定义分析器。

该自定义分析器使用 keyword_repeat 和 stemmer 过滤器为词元流中的每个词元创建词干化和非词干化版本。随后，remove_duplicates 过滤器会移除同一位置的重复词元：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "tokenizer": "standard",
          "filter": [
            "keyword_repeat",
            "stemmer",
            "remove_duplicates"
          ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-remove-duplicates-tokenfilter.html)
