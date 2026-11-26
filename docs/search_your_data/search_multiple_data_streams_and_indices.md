# 使用查询搜索多个数据流和索引（Search multiple data streams and indices）

在 Elasticsearch 中，跨多个数据流和索引搜索主要有两种方法：

- **查询层级（Query Level）**：直接在搜索请求路径中指定索引，或使用索引模式（index patterns）来定位多个索引。
- **索引层级（Index level）**：使用索引别名（index aliases）。别名充当指向一个或多个后备索引的指针，可用于逻辑分组和管理索引。

## 使用逗号分隔多个数据流和索引

要搜索多个数据流和索引，可在搜索 API 的请求路径中以逗号分隔值的形式添加它们。以下请求搜索 `my-index-000001` 和 `my-index-000002` 索引：

```bash
GET /my-index-000001,my-index-000002/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

## 使用索引模式 / 通配符搜索

也可以使用索引模式搜索多个数据流和索引。以下请求使用 `my-index-*` 索引模式，搜索集群中所有以 `my-index-` 开头的数据流或索引：

```bash
GET /my-index-*/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

## 从搜索中排除特定索引

以下请求从所有以 `my-index-` 开头的索引中检索数据，但排除 `my-index-01`：

```bash
GET /my-index-*/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "user.id": "kimchy"
          }
        }
      ],
      "must_not": [
        {
          "terms": {
            "_index": [
              "my-index-01"
            ]
          }
        }
      ]
    }
  }
}
```

## 搜索集群中的所有数据流和索引

要搜索集群中的所有数据流和索引，可以省略请求路径中的目标，也可以使用 `_all` 或 `*`。以下三个请求等价：

```bash
GET /_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}

GET /_all/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}

GET /*/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

## 索引提升（Index Boost）

搜索多个索引时，可以使用 `indices_boost` 参数提升一个或多个指定索引中的结果。当某些索引中的命中结果比其他索引更重要时，这很有用。

不能对数据流使用 `indices_boost`。

以下示例提升来自 `my-index-000001` 和 `my-index-000002` 的结果：

```bash
GET /_search
{
  "indices_boost": [
    { "my-index-000001": 1.4 },
    { "my-index-000002": 1.3 }
  ]
}
```

也可以使用别名和索引模式：

```bash
GET /_search
{
  "indices_boost": [
    { "my-alias":  1.4 },
    { "my-index*": 1.3 }
  ]
}
```

如果找到多个匹配项，将使用第一个匹配项。例如，如果一个索引包含在 `alias1` 中，并且也匹配 `my-index*` 模式，则会应用 `1.4` 的提升值。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-multiple-indices.html)
