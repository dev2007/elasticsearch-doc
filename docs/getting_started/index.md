# 索引一些文档

一旦你有一个集群启动并运行了，你就能索引一些数据。Elasticsearch 有多种接收选项，但他们最终都做了同样的事：将 JSON 文档存入Elasticsearch 索引中。

你可以通过一个简单的 `PUT` 请求直接执行这种操作，并且在请求体中指定要添加文档的索引、唯一的文档 ID 以及一个或者多个“字段-数值”对：

```bash
PUT /customer/_doc/1
{
  "name": "John Doe"
}
```

如果 `customer` 索引还不存在，请求将自动创建它，添加一个 ID 为1的文档，并存储和索引名字字段。

由于这是一个新的文档，这个响应表明这个操作的结果为版本1的文档被创建：

```json
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  },
  "_seq_no" : 26,
  "_primary_term" : 4
}
```

新的文档可以从集群中的任一节点立即获得。你可以通过指定它的文档 ID 的 GET 请求来检索它：

```bash
GET /customer/_doc/1
```

响应表明指定 ID 的文档被找到，并显示了被索引的原始源字段。

```json
{
  "_index" : "customer",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 26,
  "_primary_term" : 4,
  "found" : true,
  "_source" : {
    "name": "John Doe"
  }
}
```

> 编程语言实例代码: [Go](https://pkg.go.dev/github.com/goclub/es#example-Example.Index)

## 批量索引文档

如果你有大量文档要索引，你能通过`批量 API`（`bulk API`） 来批量提交它们。批量文档操作比单独提交请求显著更快，因为它极简了网络往返。

最佳的批量数量取决于许多因素：文档的大小和复杂度、索引和搜索的负载以及集群可用资源。一种好的方式是批量处理 1,000 到 5,000 个文档，且总负载在 5 MB 到 15 MB。基于这个，你能尝试找到最佳的方式。

向 Elasticsearch 导入一些数据，你就能开始搜索和分析：

1. 下载 [accounts.json](https://download.elastic.co/demos/kibana/gettingstarted/accounts.zip) 示例数据集。这个随机生成的数据集文档表示具体以下信息的用户账户：

```json
{
  "account_number": 0,
  "balance": 16623,
  "firstname": "Bradshaw",
  "lastname": "Mckenzie",
  "age": 29,
  "gender": "F",
  "address": "244 Columbus Place",
  "employer": "Euron",
  "email": "bradshawmckenzie@euron.com",
  "city": "Hobucken",
  "state": "CO"
}
```

2. 使用以下的 `_bulk` 请求将账户数据索引到银行（`bank`） 索引中：

```bash
curl -H "Content-Type: application/json" -XPOST "localhost:9200/bank/_bulk?pretty&refresh" --data-binary "@accounts.json"
curl "localhost:9200/_cat/indices?v=true"
```

响应表明 1,000 个文档被成功索引：

```bash
health status index uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   bank  l7sSYV2cQXmu6_4rJWVIww   5   1       1000            0    128.6kb        128.6kb
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-index.html)
