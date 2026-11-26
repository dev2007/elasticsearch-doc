# Keyword repeat 词元过滤器

为词元流中的每个词元额外输出一个关键词版本。这些关键词词元不会被词干提取（stemming）处理。

keyword_repeat 过滤器会为关键词词元赋予 `keyword` 属性值 `true`。[stemmer](/text_analysis/analysis_stemmer_tokenfilter) 或 [porter_stem](/text_analysis/analysis_porterstem_tokenfilter) 等词干提取过滤器会跳过 `keyword` 属性为 `true` 的词元。

此过滤器通常与词干提取过滤器配合使用，为每个词元同时输出词干提取和未词干提取的版本。

:::::warning 警告
要正常工作，keyword_repeat 过滤器必须在分析器配置中列于任何词干提取过滤器之前。
:::::

由于词干提取并非对所有词元都有效果，词元流中可能在相同位置出现重复词元。要移除这些重复词元，请在词干提取过滤器之后添加 [remove_duplicates 词元过滤器](/text_analysis/analysis_remove_duplicates_tokenfilter)。

此过滤器使用 Lucene 的 KeywordRepeatFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 keyword_repeat 过滤器为文本 `fox running and jumping` 的每个词元输出关键词版和非关键词版：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    "keyword_repeat"
  ],
  "text": "fox running and jumping",
  "explain": true,
  "attributes": "keyword"
}
```

该请求添加了 `"explain": true` 和 `"attributes": "keyword"` 参数，以便返回每个词元的 `keyword` 属性。该过滤器为每个词元输出两个版本，其中一个的 `keyword` 属性为 `true`，另一个为 `false`：

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
        "name": "keyword_repeat",
        "tokens": [
          {
            "token": "fox",
            "start_offset": 0,
            "end_offset": 3,
            "type": "word",
            "position": 0,
            "keyword": true
          },
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
            "keyword": true
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
            "keyword": true
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
          },
          {
            "token": "jumping",
            "start_offset": 16,
            "end_offset": 23,
            "type": "word",
            "position": 3,
            "keyword": false
          }
        ]
      }
    ]
  }
}
```

以下请求在 keyword_repeat 过滤器之后添加了 stemmer 过滤器：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    "keyword_repeat",
    "stemmer"
  ],
  "text": "fox running and jumping",
  "explain": true,
  "attributes": "keyword"
}
```

stemmer 过滤器会对 `keyword` 属性为 `false` 的词元进行词干提取：

- 非关键词版的 `running` 被词干提取为 `run`
- 非关键词版的 `jumping` 被词干提取为 `jump`

`fox` 和 `and` 的关键词版与非关键词版完全相同且处于相同位置，因此会产生重复词元：

```json
{
  "name": "stemmer",
  "tokens": [
    {
      "token": "fox",
      "start_offset": 0,
      "end_offset": 3,
      "type": "word",
      "position": 0,
      "keyword": true
    },
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
      "keyword": true
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
      "keyword": true
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
    },
    {
      "token": "jump",
      "start_offset": 16,
      "end_offset": 23,
      "type": "word",
      "position": 3,
      "keyword": false
    }
  ]
}
```

以下请求在 stemmer 过滤器之后添加了 remove_duplicates 过滤器：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    "keyword_repeat",
    "stemmer",
    "remove_duplicates"
  ],
  "text": "fox running and jumping",
  "explain": true,
  "attributes": "keyword"
}
```

remove_duplicates 过滤器会移除 `fox` 和 `and` 的重复词元，最终输出 6 个词元：

```json
{
  "name": "remove_duplicates",
  "tokens": [
    {
      "token": "fox",
      "start_offset": 0,
      "end_offset": 3,
      "type": "word",
      "position": 0,
      "keyword": true
    },
    {
      "token": "running",
      "start_offset": 4,
      "end_offset": 11,
      "type": "word",
      "position": 1,
      "keyword": true
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
      "keyword": true
    },
    {
      "token": "jumping",
      "start_offset": 16,
      "end_offset": 23,
      "type": "word",
      "position": 3,
      "keyword": true
    },
    {
      "token": "jump",
      "start_offset": 16,
      "end_offset": 23,
      "type": "word",
      "position": 3,
      "keyword": false
    }
  ]
}
```

## 添加到分析器

keyword_repeat 过滤器无需任何配置，直接按名称使用即可。

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 keyword_repeat、porter_stem 和 remove_duplicates 过滤器的组合配置一个新的自定义分析器，为每个词元同时保留词干提取和未词干提取的版本并移除重复词元：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "tokenizer": "standard",
          "filter": [
            "keyword_repeat",
            "porter_stem",
            "remove_duplicates"
          ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-keyword-repeat-tokenfilter.html)
