# 使用聚合分析结果

Elasticsearch 聚合能让你获取搜索结果的元信息，并回答这些问题，如“德克萨斯州有多少账户所有者？”或“田纳西州的账户平均余额是多少？”。你可以在一个请求中搜索文档、过滤命中以及使用聚合分析结果。

例如，以下的请求使用一个词语聚合分组在银行（`bank`）索引中按州对所有账户分组，并按降序返回账户最多的十个州：

```bash
GET /bank/_search
{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "state.keyword"
      }
    }
  }
}
```

响应中的桶（`bucket`）是州（`state`）字段的值。`doc_count` 显示每个州的账户数量。例如，你可以看到 ID（爱达荷州）有 27 个账户。由于这个请求设置 `size=0`，这个请求只包含聚合结果。

```json
{
  "took": 29,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "skipped" : 0,
    "failed": 0
  },
  "hits" : {
     "total" : {
        "value": 1000,
        "relation": "eq"
     },
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "group_by_state" : {
      "doc_count_error_upper_bound": 20,
      "sum_other_doc_count": 770,
      "buckets" : [ {
        "key" : "ID",
        "doc_count" : 27
      }, {
        "key" : "TX",
        "doc_count" : 27
      }, {
        "key" : "AL",
        "doc_count" : 25
      }, {
        "key" : "MD",
        "doc_count" : 25
      }, {
        "key" : "TN",
        "doc_count" : 23
      }, {
        "key" : "MA",
        "doc_count" : 21
      }, {
        "key" : "NC",
        "doc_count" : 21
      }, {
        "key" : "ND",
        "doc_count" : 21
      }, {
        "key" : "ME",
        "doc_count" : 20
      }, {
        "key" : "MO",
        "doc_count" : 20
      } ]
    }
  }
}
```

你可以合并聚合来构建更复杂的数据摘要。例如，以下请求在前一个按州分组（`group_by_state`）聚合嵌套一个 `avg` 聚合，以计算每个州的平均账户余额。

```bash
GET /bank/_search
{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "state.keyword"
      },
      "aggs": {
        "average_balance": {
          "avg": {
            "field": "balance"
          }
        }
      }
    }
  }
}
```

你可以使用嵌套聚合结果进行排序（通过指定词语聚合顺序），而不是按计数结果进行排序：

```bash
GET /bank/_search
{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "state.keyword",
        "order": {
          "average_balance": "desc"
        }
      },
      "aggs": {
        "average_balance": {
          "avg": {
            "field": "balance"
          }
        }
      }
    }
  }
}
```

除了这些基本的桶和度量聚合外，Elasticsearch 提供了特定的聚合用于操作多个字段和分析特定类型数据，如日期、IP 地址以及地理数据。你还可以将单个聚合的结果输入管道聚合用于进一步的分析。

聚合提供的核心分析能力支持高级特性，如使用机器学习来检测异常。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-aggregations.html)
