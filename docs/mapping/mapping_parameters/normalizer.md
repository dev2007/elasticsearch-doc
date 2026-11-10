# normalizer

`keyword` 字段的 `normalizer` 属性类似于 `analyzer`，只是它保证分析链产生单个词元。

`normalizer` 在索引关键字之前应用，以及在通过查询解析器（例如 `match` 查询）或词条级查询（例如 `term` 查询）搜索关键字字段时的搜索阶段应用。

Elasticsearch 自带一个名为 `lowercase` 的简单 normalizer，可以直接使用。自定义 normalizer 可以作为分析设置的一部分定义，如下所示：

```bash
PUT index
{
  "settings": {
    "analysis": {
      "normalizer": {
        "my_normalizer": {
          "type": "custom",
          "char_filter": [],
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "foo": {
        "type": "keyword",
        "normalizer": "my_normalizer"
      }
    }
  }
}

PUT index/_doc/1
{
  "foo": "BÀR"
}

PUT index/_doc/2
{
  "foo": "bar"
}

PUT index/_doc/3
{
  "foo": "baz"
}

POST index/_refresh

GET index/_search
{
  "query": {
    "term": {
      "foo": "BAR"
    }
  }
}

GET index/_search
{
  "query": {
    "match": {
      "foo": "BAR"
    }
  }
}
```

上面的查询匹配文档 1 和 2，因为 `BÀR` 在索引和查询时都被转换为 `bar`。

```json
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped" : 0,
    "failed": 0
  },
  "hits": {
    "total" : {
        "value": 2,
        "relation": "eq"
    },
    "max_score": 0.4700036,
    "hits": [
      {
        "_index": "index",
        "_id": "1",
        "_score": 0.4700036,
        "_source": {
          "foo": "BÀR"
        }
      },
      {
        "_index": "index",
        "_id": "2",
        "_score": 0.4700036,
        "_source": {
          "foo": "bar"
        }
      }
    ]
  }
}
```

此外，关键字在索引之前被转换这一事实也意味着聚合返回的是归一化后的值：

```bash
GET index/_search
{
  "size": 0,
  "aggs": {
    "foo_terms": {
      "terms": {
        "field": "foo"
      }
    }
  }
}
```

返回：

```json
{
  "took": 43,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped" : 0,
    "failed": 0
  },
  "hits": {
    "total" : {
        "value": 3,
        "relation": "eq"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "foo_terms": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "bar",
          "doc_count": 2
        },
        {
          "key": "baz",
          "doc_count": 1
        }
      ]
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/normalizer.html)
