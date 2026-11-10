# enabled

Elasticsearch 会尝试索引你给它的所有字段，但有时你只想存储字段而不索引它。例如，假设你将 Elasticsearch 用作 Web 会话存储。你可能希望索引会话 ID 和最后更新时间，但不需要对会话数据本身进行查询或运行聚合。

`enabled` 设置只可以应用于顶层映射定义和 object 字段，它使 Elasticsearch 完全跳过对该字段内容的解析。JSON 仍然可以从 `_source` 字段检索，但不可搜索，也不会以任何其他方式存储：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "user_id": {
        "type":  "keyword"
      },
      "last_updated": {
        "type": "date"
      },
      # session_data 字段被禁用
      "session_data": {
        "type": "object",
        "enabled": false
      }
    }
  }
}

# 任何任意数据都可以传递给 session_data 字段，因为它将被完全忽略
PUT my-index-000001/_doc/session_1
{
  "user_id": "kimchy",
  "session_data": {
    "arbitrary_object": {
      "some_array": [ "foo", "bar", { "baz": 2 } ]
    }
  },
  "last_updated": "2015-12-06T18:20:22"
}

# session_data 也会忽略不是 JSON 对象的值
PUT my-index-000001/_doc/session_2
{
  "user_id": "jpountz",
  "session_data": "none",
  "last_updated": "2015-12-06T18:22:13"
}
```

整个映射也可以被禁用，在这种情况下，文档存储在 `_source` 字段中，这意味着它可以被检索，但其任何内容都不会以任何方式被索引：

```bash
# 整个映射被禁用
PUT my-index-000001
{
  "mappings": {
    "enabled": false
  }
}

PUT my-index-000001/_doc/session_1
{
  "user_id": "kimchy",
  "session_data": {
    "arbitrary_object": {
      "some_array": [ "foo", "bar", { "baz": 2 } ]
    }
  },
  "last_updated": "2015-12-06T18:20:22"
}

# 文档可以被检索
GET my-index-000001/_doc/session_1

# 检查映射会发现没有添加任何字段
GET my-index-000001/_mapping
```

现有字段和顶层映射定义的 `enabled` 设置无法更新。

注意，由于 Elasticsearch 完全跳过对字段内容的解析，因此可以向禁用的字段添加非对象数据：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "session_data": {
        "type": "object",
        "enabled": false
      }
    }
  }
}

# 即使 session_data 包含非对象数据，文档也会被成功添加
PUT my-index-000001/_doc/session_1
{
  "session_data": "foo bar"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enabled.html)
