# fields（多字段）

以不同方式索引同一字段以用于不同目的通常很有用。这就是**多字段**（multi-fields）的用途。例如，一个 `string` 字段可以映射为用于全文搜索的 `text` 字段，以及用于排序或聚合的 `keyword` 字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "city": {
        "type": "text",
        "fields": {
          "raw": {
            "type": "keyword"
          }
        }
      }
    }
  }
}

# city.raw 字段是 city 字段的 keyword 版本
# city 字段可用于全文搜索
# city.raw 字段可用于排序和聚合
PUT my-index-000001/_doc/1
{
  "city": "New York"
}

PUT my-index-000001/_doc/2
{
  "city": "York"
}

GET my-index-000001/_search
{
  "query": {
    "match": {
      "city": "york"
    }
  },
  "sort": {
    "city.raw": "asc"
  },
  "aggs": {
    "Cities": {
      "terms": {
        "field": "city.raw"
      }
    }
  }
}
```

你可以使用[更新映射 API](/rest_apis/index_apis/update_mapping) 向现有字段添加多字段。

如果在添加多字段时索引（或数据流）已包含文档，这些文档将不会拥有新多字段的值。你可以使用[按查询更新 API](/rest_apis/document_apis/update_by_query#拾取新属性)填充新的多字段。

多字段的映射与父字段的映射完全分离。多字段不会从其父字段继承任何映射选项。多字段不会更改原始 `_source` 字段。

## 使用多种分析器的多字段

多字段的另一个用例是以不同方式分析同一字段以获得更好的相关性。例如，我们可以使用将文本拆分为单词的 [`standard` 分析器](/text_analysis/analyzers/standard_analyzer)索引一个字段，并再次使用将单词词干化为根形式的 [`english` 分析器](/text_analysis/analyzers/lang_analyzer#english-分析器)索引它：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "fields": {
          "english": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}

# text 字段使用 standard 分析器
# text.english 字段使用 english 分析器
# 索引两个文档，一个包含 fox，另一个包含 foxes
PUT my-index-000001/_doc/1
{
  "text": "quick brown fox"
}

PUT my-index-000001/_doc/2
{
  "text": "quick brown foxes"
}

# 查询 text 和 text.english 字段并合并评分
GET my-index-000001/_search
{
  "query": {
    "multi_match": {
      "query": "quick brown foxes",
      "fields": ["text", "text.english"],
      "type": "most_fields"
    }
  }
}
```

`text` 字段在第一个文档中包含词元 `fox`，在第二个文档中包含 `foxes`。`text.english` 字段对两个文档都包含 `fox`，因为 `foxes` 被词干化为 `fox`。

查询字符串也会由 `standard` 分析器为 `text` 字段分析，并由 `english` 分析器为 `text.english` 字段分析。词干化字段允许对 `foxes` 的查询也匹配只包含 `fox` 的文档。这使我们可以匹配尽可能多的文档。同时查询未词干化的 `text` 字段，可以提高精确匹配 `foxes` 的文档的相关性得分。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/multi-fields.html)
