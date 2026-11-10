# 配置内置分析器

内置分析器无需任何配置即可直接使用。不过，其中一些分析器支持通过配置选项来改变其行为。例如，可以将标准分析器配置为支持一个停用词列表：

```bash
# 定义基于标准分析器的 std_english 分析器，并移除预定义的英语停用词
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "std_english": {
          "type": "standard",
          "stopwords": "_english_"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "my_text": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "english": {
            "type": "text",
            "analyzer": "std_english"
          }
        }
      }
    }
  }
}

# my_text 字段直接使用标准分析器，不移除停用词
POST my-index-000001/_analyze
{
  "field": "my_text",
  "text": "The old brown cow"
}

# my_text.english 字段使用 std_english 分析器，移除英语停用词
POST my-index-000001/_analyze
{
  "field": "my_text.english",
  "text": "The old brown cow"
}
```

1. 我们定义了 `std_english` 分析器：它基于标准分析器，但被配置为移除预定义的英语停用词列表。
2. `my_text` 字段直接使用标准分析器，没有任何配置。该字段不会移除任何停用词，产出的词项为：`[ the, old, brown, cow ]`。
3. `my_text.english` 字段使用 `std_english` 分析器，因此会移除英语停用词，产出的词项为：`[ old, brown, cow ]`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/configuring-analyzers.html)
