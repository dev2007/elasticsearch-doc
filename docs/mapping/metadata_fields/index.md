# _index 字段

在跨多个索引执行查询时，有时需要添加仅与特定索引的文档相关联的查询子句。`_index` 字段允许匹配文档被索引到的索引。它的值可以在某些查询和聚合中访问，也可以在排序或脚本中使用：

```bash
PUT index_1/_doc/1
{
  "text": "Document in index 1"
}

PUT index_2/_doc/2?refresh=true
{
  "text": "Document in index 2"
}

# 在 _index 字段上查询
# 在 _index 字段上进行聚合
# 在 _index 字段上排序
# 在脚本中访问 _index 字段
GET index_1,index_2/_search
{
  "query": {
    "terms": {
      "_index": ["index_1", "index_2"]
    }
  },
  "aggs": {
    "indices": {
      "terms": {
        "field": "_index",
        "size": 10
      }
    }
  },
  "sort": [
    {
      "_index": {
        "order": "asc"
      }
    }
  ],
  "script_fields": {
    "index_name": {
      "script": {
        "lang": "painless",
        "source": "doc['_index']"
      }
    }
  }
}
```

`_index` 字段是虚拟暴露的——它不会作为真实字段添加到 Lucene 索引中。这意味着你可以在 `term` 或 `terms` 查询（或任何重写为 term 查询的查询，例如 `match`、`query_string` 或 `simple_query_string` 查询）以及 `prefix` 和 `wildcard` 查询中使用 `_index` 字段。但是，它不支持 `regexp` 和 `fuzzy` 查询。

对 `_index` 字段的查询除了具体的索引名称外，还接受索引别名。

当指定远程索引名称（例如 `cluster_1:index_3`）时，查询必须包含分隔符 `:`。例如，对 `cluster_*:index_3` 的通配符查询会匹配来自远程索引的文档。然而，对 `cluster*index_1` 的查询只会与本地索引匹配，因为不存在分隔符。此行为与远程索引名称的常规解析规则一致。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-index-field.html)
