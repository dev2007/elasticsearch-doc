# 开始搜索

一旦你已将一些数据存入 Elasticsearch 索引，你就能通过向 `_search` 端点发送请求来搜索它。为了获取所有的搜索能力，你可以在请求体中使用 Elasticsearch 的查询 DSL 指定搜索条件。你可以在请求 URI 中指定你想要搜索的索引名称。

例如，以下请求获取按账号排序的银行（`bank`）索引中的所有文档：

```bash
GET /bank/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "account_number": "asc" }
  ]
}
```

默认情况下，响应的命中部分（`hits section`）包含符合搜索条件的前10个文档：

```json
{
  "took" : 63,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
        "value": 1000,
        "relation": "eq"
    },
    "max_score" : null,
    "hits" : [ {
      "_index" : "bank",
      "_type" : "_doc",
      "_id" : "0",
      "sort": [0],
      "_score" : null,
      "_source" : {"account_number":0,"balance":16623,"firstname":"Bradshaw","lastname":"Mckenzie","age":29,"gender":"F","address":"244 Columbus Place","employer":"Euron","email":"bradshawmckenzie@euron.com","city":"Hobucken","state":"CO"}
    }, {
      "_index" : "bank",
      "_type" : "_doc",
      "_id" : "1",
      "sort": [1],
      "_score" : null,
      "_source" : {"account_number":1,"balance":39225,"firstname":"Amber","lastname":"Duke","age":32,"gender":"M","address":"880 Holmes Lane","employer":"Pyrami","email":"amberduke@pyrami.com","city":"Brogan","state":"IL"}
    }, ...
    ]
  }
}
```

这个响应也提供关于搜索请求的以下信息：

- `took` —— Elasticsearch 执行查询的耗时（毫秒）
- `timed_out` —— 搜索请求是否超时
- `_shards` —— 多少分片被搜索，以及成功、失败或跳过的分片详情
- `max_score` —— 查找到的最相关的文档分数
- `hits.total.value` —— 查找到匹配文档数量
- `hits.sort` —— 文档的排序位置（不按相关分数排序时）
- `hits._score` —— 文档的相关分数（不适用于使用 `match_all`）

每个搜索请求都是独立的：Elasticsearch 不在请求间维护任何状态信息。在请求中指定 `from` 和 `size` 参数用来分页浏览搜索结果。

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.Search)

例如，以下请求获取 10 到 19 的结果：

```bash
GET /bank/_search
{
  "query": { "match_all": {} },
  "sort": [
    { "account_number": "asc" }
  ],
  "from": 10,
  "size": 10
}
```

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.SearchFromSize)

现在你已看到如何提交基本查询请求，你可以开始构造比 `match_all` 更有趣的查询。

为了在字段中搜索指定词语，你可以使用匹配查询。例如，以下的查询搜索地址（`address`）字段，用以查找地址包含 `mill` 或 `lane`的客户：

```bash
GET /bank/_search
{
  "query": { "match": { "address": "mill lane" } }
}
```

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.SearchMatch)

为了执行短语搜索而不是匹配单独的词语，你可以使用 `match_phrase` 替代 `match`。例如，以下请求只匹配包含短语 `mill lane` 的地址：

```bash
GET /bank/_search
{
  "query": { "match_phrase": { "address": "mill lane" } }
}
```

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.SearchMatchPhrase)

为了构造更复杂的查询，你可以使用包含多个查询条件的 `bool` 的查询。你可以按必须的（必须匹配）、可选的（应该匹配）或者不必的（必须不匹配）来指定条件。

例如，以下请求搜索银行（`bank`）索引中属于 40 岁客户的账号，但排除其中住在爱达荷州（`ID`）的人：

```bash
GET /bank/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "age": "40" } }
      ],
      "must_not": [
        { "match": { "state": "ID" } }
      ]
    }
  }
}
```

布尔查询中的每个 `must`、`should` 和 `must_not` 都称为查询子句。文档满足每个 `must` 或 `should` 条件子句的程度，有助于文档相关性的分数。分数越高，文档越符合你的搜索条件。默认情况下，Elasticsearch 返回按相关性分数排序的文档。

`must_not` 子句中的条件被认作过滤器。它影响文档是否包含在结果中，但不影响文档分数。你可以显式地指定任意的过滤器，用来包含或排除基于结构化数据的文档。

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.SearchBool)

例如，以下请求使用范围过滤器用以限定结果中账户余额在 $20,000 和 $30,000（含）之间。

```bash
GET /bank/_search
{
  "query": {
    "bool": {
      "must": { "match_all": {} },
      "filter": {
        "range": {
          "balance": {
            "gte": 20000,
            "lte": 30000
          }
        }
      }
    }
  }
}
```

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.SearchBoolFilter)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-search.html)
