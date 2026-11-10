# dynamic

当你索引一个包含新字段的文档时，Elasticsearch 会将该字段动态添加到文档或文档内的内部对象中。以下文档添加了字符串字段 `username`、对象字段 `name`，以及 `name` 对象下的两个字符串字段：

```bash
# 检查映射以查看更改
PUT my-index-000001/_doc/1
{
  "username": "johnsmith",
  "name": {
    "first": "John",
    "last": "Smith"
  }
}

GET my-index-000001/_mapping
```

将 `name` 对象下的字段引用为 `name.first` 和 `name.last`。

以下文档添加了两个字符串字段：`email` 和 `name.middle`：

```bash
PUT my-index-000001/_doc/2
{
  "username": "marywhite",
  "email": "mary@white.com",
  "name": {
    "first": "Mary",
    "middle": "Alice",
    "last": "White"
  }
}

GET my-index-000001/_mapping
```

## 在内部对象上设置 dynamic

内部对象从其父对象继承 `dynamic` 设置。在下面的示例中，动态映射在类型级别被禁用，因此不会动态添加任何新的顶层字段。

但是，`user.social_networks` 对象启用了动态映射，因此你可以向这个内部对象添加字段。

```bash
# 在类型级别禁用动态映射
# user 对象继承类型级设置
# 为此内部对象启用动态映射
PUT my-index-000001
{
  "mappings": {
    "dynamic": false,
    "properties": {
      "user": {
        "properties": {
          "name": {
            "type": "text"
          },
          "social_networks": {
            "dynamic": true,
            "properties": {}
          }
        }
      }
    }
  }
}
```

## dynamic 的参数

`dynamic` 参数控制是否动态添加新字段，它接受以下值：

- `true`
  新字段被添加到映射中（默认）。
- `runtime`
  新字段被作为运行时字段添加到映射中。这些字段不被索引，并在查询时从 `_source` 加载。
- `false`
  新字段被忽略。这些字段不会被索引或搜索，但仍会出现在返回命中的 `_source` 字段中。这些字段不会被添加到映射中，新字段必须显式添加。
- `strict`
  如果检测到新字段，会抛出异常并拒绝该文档。新字段必须显式添加到映射中。

## 达到字段限制时的行为

将 `dynamic` 设置为 `true` 或 `runtime` 只会动态添加字段，直到达到 `index.mapping.total_fields.limit`。默认情况下，对于会超出字段限制的文档，索引请求会失败，除非 `index.mapping.total_fields.ignore_dynamic_beyond_limit` 设置为 `true`。在这种情况下，被忽略的字段会被添加到 [`_ignored`](/mapping/metadata_fields/ignored) 元数据字段中。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dynamic.html)
