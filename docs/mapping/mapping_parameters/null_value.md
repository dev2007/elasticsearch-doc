# null_value

null 值无法被索引或搜索。当字段被设置为 null（或空数组、或全为 null 值的数组）时，它被视为该字段没有任何值。

`null_value` 参数允许你用指定的值替换显式的 `null` 值，使其可以被索引和搜索。例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "status_code": {
        "type":       "keyword",
        "null_value": "NULL"
      }
    }
  }
}

# 用词元 NULL 替换显式的 null 值
PUT my-index-000001/_doc/1
{
  "status_code": null
}

# 空数组不包含显式的 null，因此不会被替换为 null_value
PUT my-index-000001/_doc/2
{
  "status_code": []
}

# 对 NULL 的查询返回文档 1，但不返回文档 2
GET my-index-000001/_search
{
  "query": {
    "term": {
      "status_code": "NULL"
    }
  }
}
```

`null_value` 需要与字段具有相同的数据类型。例如，long 字段不能有字符串类型的 `null_value`。

`null_value` 只影响数据的索引方式，它不会修改 `_source` 文档。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/null-value.html)
