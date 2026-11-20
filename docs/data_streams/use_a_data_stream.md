# 使用数据流

[设置数据流](/data_streams/set_up_a_data_stream)之后，你可以执行以下操作：

- [添加文档到数据流](#添加文档到数据流)
- [搜索数据流](#搜索数据流)
- [获取数据流的统计信息](#获取数据流的统计信息)
- [手动翻转数据流](#手动翻转数据流)
- [打开已关闭的支持索引](#打开已关闭的支持索引)
- [重索引到数据流](#重索引到数据流)
- [通过查询更新数据流中的文档](#通过查询更新数据流中的文档)
- [通过查询删除数据流中的文档](#通过查询删除数据流中的文档)
- [更新或删除备份索引中的文档](#更新或删除备份索引中的文档)

## 添加文档到数据流

要添加单个文档，请使用[索引 API](/rest_apis/document_apis/docs_index)。支持[摄取管道](/rest_apis/ingest_apis/ingest_apis)。

```bash
POST my-data-stream/_doc
{
  "@timestamp": "2099-03-08T11:06:07.000Z",
  "user": {
    "id": "8a4f500d"
  },
  "message": "Login successful"
}
```

你不能使用索引 API 的 `PUT /<target>/_doc/<_id>` 请求格式向数据流添加新文档。要指定文档 ID，请改用 `PUT /<target>/_create/<_id>` 格式。只支持 [`op_type`](/rest_apis/document_apis/docs_index#docs-index-api-op_type) 为 `create` 的操作。

要使用单个请求添加多个文档，请使用[批量 API](/rest_apis/document_apis/bulk)。只支持 `create` 操作。

```bash
PUT my-data-stream/_bulk?refresh
{ "create":{ } }
{ "@timestamp": "2099-03-08T11:04:05.000Z", "user": { "id": "vlb44hny" }, "message": "Login attempt failed" }
{ "create":{ } }
{ "@timestamp": "2099-03-08T11:06:07.000Z", "user": { "id": "8a4f500d" }, "message": "Login successful" }
{ "create":{ } }
{ "@timestamp": "2099-03-09T11:07:08.000Z", "user": { "id": "l7gk7f82" }, "message": "Logout successful" }
```

## 搜索数据流

以下搜索 API 支持数据流：

- [搜索 API](/rest_apis/search_apis/search)
- [异步搜索](/rest_apis/search_apis/async_search)
- [批量搜索 API](/rest_apis/search_apis/multi_search)
- [字段Capabilities API](/rest_apis/search_apis/field_capabilities)
- [EQL 搜索 API](/rest_apis/eql_qpis/eql_search)

## 获取数据流的统计信息

使用[数据流统计 API](/rest_apis/data_stream_apis/data_stream_stats) 获取一个或多个数据流的统计信息：

```bash
GET /_data_stream/my-data-stream/_stats?human=true
```

## 手动翻转数据流

使用[翻转 API](/rest_apis/index_apis/rollover_index) 手动[翻转](/data_streams/data_streams#翻转)数据流。手动翻转时你有两个选择：

1. 要立即触发翻转：

   ```bash
   POST my-data-stream/_rollover/
   ```

2. 或者将翻转推迟到下一个索引事件发生时：

   ```bash
   POST my-data-stream/_rollover?lazy
   ```

   对于更新不频繁的数据流，使用第二种方式可以避免产生空的支持索引。

## 打开已关闭的支持索引

你无法搜索[已关闭的](/rest_apis/index_apis/close_index)支持索引，即使通过搜索其数据流也不行。你也无法[更新](#通过查询更新数据流中的文档)或[删除](#通过查询删除数据流中的文档)已关闭索引中的文档。

要重新打开已关闭的支持索引，请直接向该索引提交[打开索引 API](/rest_apis/index_apis/open_index) 请求：

```bash
POST .ds-my-data-stream-2099.03.07-000001/_open/
```

要重新打开数据流的所有已关闭支持索引，请向该流提交打开索引 API 请求：

```bash
POST my-data-stream/_open/
```

## 重索引到数据流

使用[重索引 API](/rest_apis/document_apis/reindex) 将文档从现有索引、别名或数据流复制到数据流。因为数据流是[仅追加的](/data_streams/data_streams#仅追加大部分情况)，重索引到数据流必须使用 `op_type` 为 `create` 的操作。重索引不能更新数据流中的现有文档。

```bash
POST /_reindex
{
  "source": {
    "index": "archive"
  },
  "dest": {
    "index": "my-data-stream",
    "op_type": "create"
  }
}
```

## 通过查询更新数据流中的文档

使用 [update by query API](/rest_apis/document_apis/update_by_query) 更新数据流中匹配给定查询的文档：

```bash
POST my-data-stream/_update_by_query
{
  "query": {
    "match": {
      "user.id": "l7gk7f82"
    }
  },
  "script": {
    "source": "ctx._source.user.id = params.new_id",
    "params": {
      "new_id": "XgdX0NoX"
    }
  }
}
```

## 通过查询删除数据流中的文档

使用 [delete by query API](/rest_apis/document_apis/delete_by_query) 删除数据流中匹配给定查询的文档：

```bash
POST my-data-stream/_delete_by_query
{
  "query": {
    "match": {
      "user.id": "vlb44hny"
    }
  }
}
```

## 更新或删除备份索引中的文档

如果需要，你可以通过向包含该文档的支持索引发送请求来更新或删除数据流中的文档。你需要：

- [文档 ID](/mapping/metadata_fields/id)
- 包含该文档的支持索引的名称
- 如果要更新文档，还需要它的[序列号和主分片期数](/rest_apis/document_apis/docs_index#乐观并发控制)

要获取这些信息，请使用[搜索请求](#搜索数据流)：

```bash
GET my-data-stream/_search
{
  "seq_no_primary_term": true,
  "query": {
    "match": {
      "user.id": "yWIumJd7"
    }
  }
}
```

响应：

```json
{
  "took": 20,
  "timed_out": false,
  "_shards": {
    "total": 3,
    "successful": 3,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": ".ds-my-data-stream-2099.03.08-000003",
        "_id": "bfspvnIBr7VVZlfp2lqX",
        "_seq_no": 0,
        "_primary_term": 1,
        "_score": 0.2876821,
        "_source": {
          "@timestamp": "2099-03-08T11:06:07.000Z",
          "user": {
            "id": "yWIumJd7"
          },
          "message": "Login successful"
        }
      }
    ]
  }
}
```

1. 包含匹配文档的支持索引。
2. 该文档的文档 ID。
3. 该文档的当前序列号。
4. 该文档的主分片期数。

要更新该文档，请使用带有有效 `if_seq_no` 和 `if_primary_term` 参数的[索引 API](/rest_apis/document_apis/docs_index) 请求：

```bash
PUT .ds-my-data-stream-2099-03-08-000003/_doc/bfspvnIBr7VVZlfp2lqX?if_seq_no=0&if_primary_term=1
{
  "@timestamp": "2099-03-08T11:06:07.000Z",
  "user": {
    "id": "8a4f500d"
  },
  "message": "Login successful"
}
```

要删除该文档，请使用[删除 API](/rest_apis/document_apis/delete)：

```bash
DELETE .ds-my-data-stream-2099.03.08-000003/_doc/bfspvnIBr7VVZlfp2lqX
```

要在单个请求中删除或更新多个文档，请使用[批量 API](/rest_apis/document_apis/bulk) 的 `delete`、`index` 和 `update` 操作。对于 `index` 操作，请包含有效的 [`if_seq_no` 和 `if_primary_term`](/rest_apis/document_apis/bulk#乐观并发控制) 参数。

```bash
PUT /_bulk?refresh
{ "index": { "_index": ".ds-my-data-stream-2099.03.08-000003", "_id": "bfspvnIBr7VVZlfp2lqX", "if_seq_no": 0, "if_primary_term": 1 } }
{ "@timestamp": "2099-03-08T11:06:07.000Z", "user": { "id": "8a4f500d" }, "message": "Login successful" }
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/use-a-data-stream.html)
