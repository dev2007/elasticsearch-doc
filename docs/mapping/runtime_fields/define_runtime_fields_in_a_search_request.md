# 在搜索请求中定义运行时字段

你可以在搜索请求中指定 `runtime_mappings` 部分，创建仅作为查询的一部分而存在的运行时字段。你在 `runtime_mappings` 部分中指定脚本，其方式与向映射添加运行时字段时相同。

在搜索请求中定义运行时字段所使用的格式，与在索引映射中定义运行时字段相同。只需将索引映射中 `runtime` 的字段定义复制到搜索请求的 `runtime_mappings` 部分即可。

以下搜索请求向 `runtime_mappings` 部分添加了一个 `day_of_week` 字段。字段值将被动态计算，并且仅在此搜索请求的上下文中有效：

```bash
GET my-index-000001/_search
{
  "runtime_mappings": {
    "day_of_week": {
      "type": "keyword",
      "script": {
        "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH))"
      }
    }
  },
  "aggs": {
    "day_of_week": {
      "terms": {
        "field": "day_of_week"
      }
    }
  }
}
```

## 创建使用其他运行时字段的运行时字段

你甚至可以在搜索请求中定义返回其他运行时字段值的运行时字段。例如，假设你批量索引了一些传感器数据：

```bash
POST my-index-000001/_bulk?refresh=true
{"index":{}}
{"@timestamp":1516729294000,"model_number":"QVKC92Q","measures":{"voltage":"5.2","start": "300","end":"8675309"}}
{"index":{}}
{"@timestamp":1516642894000,"model_number":"QVKC92Q","measures":{"voltage":"5.8","start": "300","end":"8675309"}}
{"index":{}}
{"@timestamp":1516556494000,"model_number":"QVKC92Q","measures":{"voltage":"5.1","start": "300","end":"8675309"}}
{"index":{}}
{"@timestamp":1516470094000,"model_number":"QVKC92Q","measures":{"voltage":"5.6","start": "300","end":"8675309"}}
{"index":{}}
{"@timestamp":1516383694000,"model_number":"HG537PU","measures":{"voltage":"4.2","start": "400","end":"8625309"}}
{"index":{}}
{"@timestamp":1516297294000,"model_number":"HG537PU","measures":{"voltage":"4.0","start": "400","end":"8625309"}}
```

索引之后你发现数值数据被映射成了 `text` 类型。你想对 `measures.start` 和 `measures.end` 字段进行聚合，但聚合失败了，因为不能对 `text` 类型的字段进行聚合。运行时字段来救场！你可以添加与索引字段同名的运行时字段，并修改数据类型：

```bash
PUT my-index-000001/_mapping
{
  "runtime": {
    "measures.start": {
      "type": "long"
    },
    "measures.end": {
      "type": "long"
    }
  }
}
```

运行时字段优先于索引映射中定义的同名字段。这种灵活性允许你遮蔽（shadow）现有字段并计算不同的值，而无需修改字段本身。如果你在索引映射中犯了错误，可以使用运行时字段在搜索请求期间计算值来覆盖映射中的值。

现在，你可以轻松地对 `measures.start` 和 `measures.end` 字段运行平均值聚合：

```bash
GET my-index-000001/_search
{
  "aggs": {
    "avg_start": {
      "avg": {
        "field": "measures.start"
      }
    },
    "avg_end": {
      "avg": {
        "field": "measures.end"
      }
    }
  }
}
```

响应中包含聚合结果，而不会更改底层数据的值：

```json
{
  "aggregations" : {
    "avg_start" : {
      "value" : 333.3333333333333
    },
    "avg_end" : {
      "value" : 8658642.333333334
    }
  }
}
```

此外，你还可以在搜索查询中定义一个用于计算值的运行时字段，然后在同一个查询中对该字段运行 stats 聚合。

`duration` 运行时字段在索引映射中并不存在，但我们仍然可以在该字段上进行搜索和聚合。以下查询返回 `duration` 字段的计算值，并运行 stats 聚合来计算从聚合文档中提取的数值的统计信息。

```bash
GET my-index-000001/_search
{
  "runtime_mappings": {
    "duration": {
      "type": "long",
      "script": {
        "source": """
          emit(doc['measures.end'].value - doc['measures.start'].value);
          """
      }
    }
  },
  "aggs": {
    "duration_stats": {
      "stats": {
        "field": "duration"
      }
    }
  }
}
```

即使 `duration` 运行时字段只存在于搜索查询的上下文中，你仍然可以在该字段上进行搜索和聚合。这种灵活性非常强大，让你能够在单个搜索请求中纠正索引映射中的错误并动态完成计算。

```json
{
  "aggregations" : {
    "duration_stats" : {
      "count" : 6,
      "min" : 8624909.0,
      "max" : 8675009.0,
      "avg" : 8658309.0,
      "sum" : 5.1949854E7
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/runtime-search-request.html)
