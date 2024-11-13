# 乐观并发控制

Elasticsearch 是分布式的。当创建、更新或删除文档时，文档的新版本必须复制到集群中的其他节点。Elasticsearch 也是异步和并发的，这意味着这些复制请求是并行发送的，而且可能会不按顺序到达目的地。Elasticsearch 需要一种方法来确保文档的旧版本永远不会覆盖新版本。
为了确保文档的旧版本不会覆盖新版本，对文档执行的每次操作都会由负责协调更改的主分片分配一个序列号。每次操作都会增加序列号，因此较新操作的序列号会高于较旧操作的序列号。然后，Elasticsearch 可以使用操作的序列号来确保较新的文档版本不会被分配给它的序列号较小的变更所覆盖。

例如，下面的索引命令将创建一个文档，并为其分配一个初始序列号和主要词：

```bash
PUT products/_doc/1567
{
  "product" : "r2d2",
  "details" : "A resourceful astromech droid"
}
```

你可以在响应的 `_seq_no` 和 `_primary_term` 字段中看到分配的序列号和主要词：

```json
{
  "_shards": {
    "total": 2,
    "failed": 0,
    "successful": 1
  },
  "_index": "products",
  "_id": "1567",
  "_version": 1,
  "_seq_no": 362,
  "_primary_term": 2,
  "result": "created"
}
```

Elasticsearch 会记录上次更改其存储的每个文档的操作的序列号和主要词。序列号和主要词会在 [获取 API](/rest_apis/document_apis/get) 响应的 `_seq_no` 和 `_primary_term` 字段中返回：

```bash
GET products/_doc/1567
```

返回：

```json
{
  "_index": "products",
  "_id": "1567",
  "_version": 1,
  "_seq_no": 362,
  "_primary_term": 2,
  "found": true,
  "_source": {
    "product": "r2d2",
    "details": "A resourceful astromech droid"
  }
}
```

注意：通过设置 [`seq_no_primary_term` 参数](/rest_apis/search_apis/search)，搜索 API 可以返回每个搜索结果的 `_seq_no` 和 `_primary_term`。

序列号和主要术语可唯一标识一项更改。通过记下返回的序列号和主要术语，可以确保只有在检索后没有其他更改的情况下才更改文档。这可以通过设置[索引 API](/rest_apis/document_apis/docs_index)、[更新 API](/rest_apis/document_apis/update) 或[删除 API](/rest_apis/document_apis/delete) 的 `if_seq_no` 和 `if_primary_term` 参数来实现。

例如，下面的索引调用将确保在文档中添加一个标签，而不会丢失描述的任何潜在更改或其他 API 添加的另一个标签：

```bash
PUT products/_doc/1567?if_seq_no=362&if_primary_term=2
{
  "product": "r2d2",
  "details": "A resourceful astromech droid",
  "tags": [ "droid" ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/optimistic-concurrency-control.html)
