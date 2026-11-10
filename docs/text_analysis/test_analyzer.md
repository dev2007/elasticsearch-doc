# 测试分析器

[`analyze` API](/rest_apis/indices_apis/analyze) 是查看分析器产出的词项的宝贵工具。可以在请求中内联指定一个内置分析器：

```bash
POST _analyze
{
  "analyzer": "whitespace",
  "text": "The quick brown fox."
}
```

上述请求返回以下响应：

```json
{
  "tokens": [
    {
      "token": "The",
      "start_offset": 0,
      "end_offset": 3,
      "type": "word",
      "position": 0
    },
    {
      "token": "quick",
      "start_offset": 4,
      "end_offset": 9,
      "type": "word",
      "position": 1
    },
    {
      "token": "brown",
      "start_offset": 10,
      "end_offset": 15,
      "type": "word",
      "position": 2
    },
    {
      "token": "fox.",
      "start_offset": 16,
      "end_offset": 20,
      "type": "word",
      "position": 3
    }
  ]
}
```

你也可以测试以下组件的组合：

- 一个分词器
- 零个或多个词元过滤器
- 零个或多个字符过滤器

```bash
POST _analyze
{
  "tokenizer": "standard",
  "filter": [ "lowercase", "asciifolding" ],
  "text": "Is this déja vu?"
}
```

上述请求返回以下响应：

```json
{
  "tokens": [
    {
      "token": "is",
      "start_offset": 0,
      "end_offset": 2,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "this",
      "start_offset": 3,
      "end_offset": 7,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "deja",
      "start_offset": 8,
      "end_offset": 12,
      "type": "<ALPHANUM>",
      "position": 2
    },
    {
      "token": "vu",
      "start_offset": 13,
      "end_offset": 15,
      "type": "<ALPHANUM>",
      "position": 3
    }
  ]
}
```

::::note 提示
从 `analyze` API 的输出可以看到，分析器不仅将单词转换为词项，还会记录每个词项的顺序或相对**位置**（position，用于短语查询或词语邻近查询），以及每个词项在原始文本中的起止**字符偏移量**（character offsets，用于高亮搜索摘要）。
::::

或者，你也可以在特定索引上运行 `analyze` API 时引用一个[自定义分析器](/text_analysis/analysis_custom_analyzer)：

```bash
# 定义一个名为 std_folded 的自定义分析器，并让 my_text 字段使用它
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "std_folded": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [ "lowercase", "asciifolding" ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "my_text": {
        "type": "text",
        "analyzer": "std_folded"
      }
    }
  }
}

# 按名称引用该分析器
GET my-index-000001/_analyze
{
  "analyzer": "std_folded",
  "text": "Is this déjà vu?"
}

# 引用字段 my_text 所使用的分析器
GET my-index-000001/_analyze
{
  "field": "my_text",
  "text": "Is this déjà vu?"
}
```

上述请求返回以下响应：

```json
{
  "tokens": [
    {
      "token": "is",
      "start_offset": 0,
      "end_offset": 2,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "this",
      "start_offset": 3,
      "end_offset": 7,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "deja",
      "start_offset": 8,
      "end_offset": 12,
      "type": "<ALPHANUM>",
      "position": 2
    },
    {
      "token": "vu",
      "start_offset": 13,
      "end_offset": 15,
      "type": "<ALPHANUM>",
      "position": 3
    }
  ]
}
```

1. 定义一个名为 `std_folded` 的 `custom` 分析器。
2. 字段 `my_text` 使用 `std_folded` 分析器。
3. 要引用该分析器，`analyze` API 必须指定索引名称。
4. 按名称引用分析器。
5. 引用字段 `my_text` 所使用的分析器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/test-analyzer.html)
