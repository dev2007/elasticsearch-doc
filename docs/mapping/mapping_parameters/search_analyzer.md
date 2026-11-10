# search_analyzer

通常，索引时和搜索时应使用相同的分析器，以确保查询中的词元与倒排索引中的词元格式一致。

不过，有时在搜索时使用不同的分析器是有意义的，例如在使用 `edge_ngram` 分词器进行自动补全或使用搜索时同义词时。

默认情况下，查询将使用字段映射中定义的分析器，但这可以通过 `search_analyzer` 设置覆盖：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "filter": {
        "autocomplete_filter": {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 20
        }
      },
      "analyzer": {
        "autocomplete": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "autocomplete_filter"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "autocomplete",
        "search_analyzer": "standard"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "text": "Quick Brown Fox"
}

GET my-index-000001/_search
{
  "query": {
    "match": {
      "text": {
        "query": "Quick Br",
        "operator": "and"
      }
    }
  }
}
```

1. 用于定义自定义自动补全分析器的分析设置。
2. `text` 字段在索引时使用 `autocomplete` 分析器，但在搜索时使用 `standard` 分析器。
3. 此字段被索引为词元：`[ q, qu, qui, quic, quick, b, br, bro, brow, brown, f, fo, fox ]`。
4. 查询搜索这两个词元：`[ quick, br ]`。

关于此示例的完整说明参阅[索引时边输入边搜索](/search/search/autocomplete#索引时边输入边搜索)。

`search_analyzer` 设置可以使用更新映射 API 在现有字段上更新。注意，为此需要在更新后的字段定义中重复现有的 `analyzer` 设置和 `type`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-analyzer.html)
