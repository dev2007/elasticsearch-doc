# _ignored 字段

`_ignored` 字段会索引并存储文档中在文档被索引时被忽略的每个字段的名称。例如，当字段格式错误且 `ignore_malformed` 已开启时、当 keyword 字段的值超过其可选的 `ignore_above` 设置时，或者当已达到 `index.mapping.total_fields.limit` 且 `index.mapping.total_fields.ignore_dynamic_beyond_limit` 设置为 `true` 时，就可能发生这种情况。

此字段可以使用 `term`、`terms` 和 `exists` 查询进行搜索，并作为搜索命中的一部分返回。

例如，下面的查询匹配所有拥有一个或多个被忽略字段的文档：

```bash
GET _search
{
  "query": {
    "exists": {
      "field": "_ignored"
    }
  }
}
```

类似地，下面的查询找出所有在索引时 `@timestamp` 字段被忽略的文档：

```bash
GET _search
{
  "query": {
    "term": {
      "_ignored": "@timestamp"
    }
  }
}
```

自 8.15.0 起，`_ignored` 字段也支持聚合。例如，下面的查询找出所有被忽略的字段：

```bash
GET _search
{
  "aggs": {
    "ignored_fields": {
      "terms": {
         "field": "_ignored"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-ignored-field.html)
