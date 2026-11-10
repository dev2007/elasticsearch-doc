# ignore_above

超过 `ignore_above` 设置的字符串不会被索引或存储。对于字符串数组，`ignore_above` 会分别应用于每个数组元素，超过 `ignore_above` 的字符串元素不会被索引或存储。

如果 `_source` 字段已启用（在 Elasticsearch 中默认启用），所有字符串/数组元素仍会出现在 `_source` 字段中。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "message": {
        "type": "keyword",
        "ignore_above": 20
      }
    }
  }
}

# 该字段会忽略任何超过 20 个字符的字符串
# 此文档被成功索引
PUT my-index-000001/_doc/1
{
  "message": "Syntax error"
}

# 此文档会被索引，但不会索引 message 字段
PUT my-index-000001/_doc/2
{
  "message": "Syntax error with some long stacktrace"
}

# 搜索返回两个文档，但只有第一个出现在 terms 聚合中
GET my-index-000001/_search
{
  "aggs": {
    "messages": {
      "terms": {
        "field": "message"
      }
    }
  }
}
```

`ignore_above` 设置可以使用更新映射 API 在现有字段上更新。

此选项还可用于防止超出 Lucene 的词元字节长度限制 32766。

`ignore_above` 的值是字符数，但 Lucene 计算的是字节数。如果你使用包含大量非 ASCII 字符的 UTF-8 文本，可能需要将限制设置为 `32766 / 4 = 8191`，因为 UTF-8 字符最多可能占用 4 个字节。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ignore-above.html)
