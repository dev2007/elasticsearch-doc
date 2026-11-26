# Keyword marker 词元过滤器

将指定的词元标记为关键词（keyword），这些词元不会被词干提取（stemming）处理。

keyword_marker 过滤器会为指定的词元赋予 `keyword` 属性值 `true`。[stemmer](/text_analysis/analysis_stemmer_tokenfilter) 或 [porter_stem](/text_analysis/analysis_porterstem_tokenfilter) 等词干提取过滤器会跳过 `keyword` 属性为 `true` 的词元。

:::::warning 警告
要正常工作，keyword_marker 过滤器必须在分析器配置中列于任何词干提取过滤器之前。
:::::

此过滤器使用 Lucene 的 KeywordMarkerFilter。

## 示例

为了演示 keyword_marker 过滤器的工作方式，先看仅使用 stemmer 过滤器时的词干提取效果。以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 stemmer 过滤器对 `fox running and jumping` 进行词干提取：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": ["stemmer"],
  "text": "fox running and jumping"
}
```

该过滤器产生以下词元。注意 `running` 被词干提取为 `run`，`jumping` 被词干提取为 `jump`：

```text
[ fox, run, and, jump ]
```

以下请求在 stemmer 过滤器之前添加了 keyword_marker 过滤器，并在其 `keywords` 参数中指定了 `jumping`：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "keyword_marker",
      "keywords": [ "jumping" ]
    },
    "stemmer"
  ],
  "text": "fox running and jumping"
}
```

该过滤器产生以下词元。注意 `running` 仍被词干提取为 `run`，但 `jumping` 未被词干提取：

```text
[ fox, run, and, jumping ]
```

要查看词元的 `keyword` 属性，可以在请求中添加 `"explain": true` 和 `"attributes": "keyword"` 参数：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "keyword_marker",
      "keywords": [ "jumping" ]
    },
    "stemmer"
  ],
  "text": "fox running and jumping",
  "explain": true,
  "attributes": "keyword"
}
```

API 返回以下响应。注意 `jumping` 词元的 `keyword` 属性为 `true`：

```json
{
  "detail": {
    "custom_analyzer": true,
    "charfilters": [],
    "tokenizer": {
      "name": "whitespace",
      "tokens": [
        {
          "token": "fox",
          "start_offset": 0,
          "end_offset": 3,
          "type": "word",
          "position": 0
        },
        {
          "token": "running",
          "start_offset": 4,
          "end_offset": 11,
          "type": "word",
          "position": 1
        },
        {
          "token": "and",
          "start_offset": 12,
          "end_offset": 15,
          "type": "word",
          "position": 2
        },
        {
          "token": "jumping",
          "start_offset": 16,
          "end_offset": 23,
          "type": "word",
          "position": 3
        }
      ]
    },
    "tokenfilters": [
      {
        "name": "__anonymous__keyword_marker",
        "tokens": [
          {
            "token": "fox",
            "start_offset": 0,
            "end_offset": 3,
            "type": "word",
            "position": 0,
            "keyword": false
          },
          {
            "token": "running",
            "start_offset": 4,
            "end_offset": 11,
            "type": "word",
            "position": 1,
            "keyword": false
          },
          {
            "token": "and",
            "start_offset": 12,
            "end_offset": 15,
            "type": "word",
            "position": 2,
            "keyword": false
          },
          {
            "token": "jumping",
            "start_offset": 16,
            "end_offset": 23,
            "type": "word",
            "position": 3,
            "keyword": true
          }
        ]
      },
      {
        "name": "stemmer",
        "tokens": [
          {
            "token": "fox",
            "start_offset": 0,
            "end_offset": 3,
            "type": "word",
            "position": 0,
            "keyword": false
          },
          {
            "token": "run",
            "start_offset": 4,
            "end_offset": 11,
            "type": "word",
            "position": 1,
            "keyword": false
          },
          {
            "token": "and",
            "start_offset": 12,
            "end_offset": 15,
            "type": "word",
            "position": 2,
            "keyword": false
          },
          {
            "token": "jumping",
            "start_offset": 16,
            "end_offset": 23,
            "type": "word",
            "position": 3,
            "keyword": true
          }
        ]
      }
    ]
  }
}
```

## 可配置参数

- `ignore_case`

  （可选，布尔值）如果为 `true`，则 `keywords` 和 `keywords_path` 参数的匹配不区分大小写。默认为 `false`。

- `keywords`

  （必需*，字符串数组）关键词数组。与这些关键词匹配的词元不会被词干提取。

  必须指定此参数、`keywords_path` 或 `keywords_pattern` 三者之一。

  此参数不能与 `keywords_pattern` 参数同时指定。

- `keywords_path`

  （必需*，字符串）指向包含关键词列表的文件的路径。与这些关键词匹配的词元不会被词干提取。

  此路径必须是绝对路径，或相对于 `config` 位置的相对路径。文件必须是 UTF-8 编码，且每个单词以换行符分隔。

  必须指定此参数、`keywords` 或 `keywords_pattern` 三者之一。

  此参数不能与 `keywords_pattern` 参数同时指定。

- `keywords_pattern`

  （必需*，字符串）用于匹配词元的 Java 正则表达式。与此表达式匹配的词元会被标记为关键词，不会被词干提取。

  必须指定此参数、`keywords` 或 `keywords_path` 三者之一。

  此参数不能与 `keywords` 参数同时指定。

:::::warning 警告
编写不当的正则表达式可能导致 Elasticsearch 运行缓慢或抛出栈溢出（stack overflow）错误，从而导致正在运行的节点突然退出。
:::::

## 自定义并添加到分析器

要自定义 keyword_marker 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义的 keyword_marker 过滤器和 porter_stem 过滤器配置一个新的自定义分析器。该自定义 keyword_marker 过滤器会将 `analysis/example_word_list.txt` 文件中指定的词元标记为关键词。porter_stem 过滤器不会对这些词元进行词干提取：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "my_custom_keyword_marker_filter",
            "porter_stem"
          ]
        }
      },
      "filter": {
        "my_custom_keyword_marker_filter": {
          "type": "keyword_marker",
          "keywords_path": "analysis/example_word_list.txt"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-keyword-marker-tokenfilter.html)
