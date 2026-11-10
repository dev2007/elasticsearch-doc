# nested 字段类型

`nested` 类型是 `object` 数据类型的一个特化版本，它允许对象数组以可以彼此独立查询的方式进行索引。

在摄取具有大量任意键的键值对时，你可能会考虑将每个键值对建模为带有 `key` 和 `value` 字段的独立嵌套文档。作为替代，请考虑使用 [`flattened`](/mapping/field_data_types/flattened) 数据类型，它将整个对象映射为单一字段，并允许对其内容进行简单搜索。嵌套文档和查询通常开销很大，因此对于此用例，使用 flattened 数据类型是更好的选择。

嵌套字段在 Kibana 中的支持不完整。虽然它们在 Discover 中可见且可搜索，但不能用于在 Lens 中构建可视化。

## 对象数组是如何被扁平化的

Elasticsearch 没有内部对象（inner objects）的概念。因此，它会将对象层次结构扁平化为一个由字段名称和值组成的简单列表。例如，考虑以下文档：

```bash
# user 字段被动态添加为 object 类型的字段
PUT my-index-000001/_doc/1
{
  "group" : "fans",
  "user" : [
    {
      "first" : "John",
      "last" :  "Smith"
    },
    {
      "first" : "Alice",
      "last" :  "White"
    }
  ]
}
```

上一个文档在内部会被转换成一个更像下面这样的文档：

```json
{
  "group" :        "fans",
  "user.first" : [ "alice", "john" ],
  "user.last" :  [ "smith", "white" ]
}
```

`user.first` 和 `user.last` 字段被扁平化为多值字段，`alice` 和 `white` 之间的关联丢失了。此文档会错误地匹配 `alice AND smith` 的查询：

```bash
GET my-index-000001/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "user.first": "Alice" }},
        { "match": { "user.last":  "Smith" }}
      ]
    }
  }
}
```

## 对对象数组使用 nested 字段

如果你需要索引对象数组并保持数组中每个对象的独立性，请使用 `nested` 数据类型而不是 `object` 数据类型。

在内部，嵌套对象会将数组中的每个对象索引为一个单独的隐藏文档。这意味着每个嵌套对象都可以使用 [`nested` 查询](/query_dsl/joining_queries/nested)独立于其他对象进行查询：

```bash
# user 字段被映射为 nested 类型而不是 object 类型
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "user": {
        "type": "nested"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "group" : "fans",
  "user" : [
    {
      "first" : "John",
      "last" :  "Smith"
    },
    {
      "first" : "Alice",
      "last" :  "White"
    }
  ]
}

# 此查询不匹配，因为 Alice 和 Smith 不在同一个嵌套对象中
GET my-index-000001/_search
{
  "query": {
    "nested": {
      "path": "user",
      "query": {
        "bool": {
          "must": [
            { "match": { "user.first": "Alice" }},
            { "match": { "user.last":  "Smith" }}
          ]
        }
      }
    }
  }
}

# 此查询匹配，因为 Alice 和 White 在同一个嵌套对象中
# inner_hits 允许我们高亮匹配的嵌套文档
GET my-index-000001/_search
{
  "query": {
    "nested": {
      "path": "user",
      "query": {
        "bool": {
          "must": [
            { "match": { "user.first": "Alice" }},
            { "match": { "user.last":  "White" }}
          ]
        }
      },
      "inner_hits": {
        "highlight": {
          "fields": {
            "user.first": {}
          }
        }
      }
    }
  }
}
```

## 与嵌套文档交互

嵌套文档可以：

- 使用 [`nested` 查询](/query_dsl/joining_queries/nested)进行查询。
- 使用 [`nested` 和 `reverse_nested`](/aggregations/bucket/nested_aggregation) 聚合进行分析。
- 使用[嵌套排序](/search/search_your_data/sort_search_results#嵌套排序)进行排序。
- 使用[嵌套内部命中](/search/search_your_data/inner_hits#嵌套内部命中)进行检索和高亮显示。

由于嵌套文档被索引为单独的文档，它们只能在 `nested` 查询、`nested`/`reverse_nested` 聚合或嵌套内部命中的作用域内访问。

例如，如果嵌套文档中的字符串字段将 `index_options` 设置为 `offsets` 以允许在高亮显示期间使用倒排表（postings），那么这些偏移量在主高亮阶段将不可用。相反，需要通过嵌套内部命中来执行高亮显示。在搜索期间通过 `docvalue_fields` 或 `stored_fields` 加载字段时，也有同样的考虑。

## nested 字段的参数

`nested` 字段接受以下参数：

- `dynamic`
  （可选，字符串）是否应将新属性动态添加到现有的嵌套对象。接受 `true`（默认）、`false` 和 `strict`。
- `properties`
  （可选，对象）嵌套对象内的字段，可以是任何数据类型，包括 `nested`。可以向现有的嵌套对象添加新属性。
- `include_in_parent`
  （可选，Boolean）如果为 `true`，嵌套对象中的所有字段也会作为标准（扁平）字段添加到父文档中。默认为 `false`。
- `include_in_root`
  （可选，Boolean）如果为 `true`，嵌套对象中的所有字段也会作为标准（扁平）字段添加到根文档中。默认为 `false`。

## 嵌套映射和对象的限制

如前所述，每个嵌套对象都被索引为一个单独的 Lucene 文档。继续前面的例子，如果我们索引一个包含 100 个 `user` 对象的单个文档，那么将创建 101 个 Lucene 文档：一个用于父文档，每个嵌套对象各一个。由于嵌套映射相关的开销，Elasticsearch 设置了以下配置来防范性能问题：

- `index.mapping.nested_fields.limit`
  （可选，整数）索引中不同 `nested` 映射的最大数量。`nested` 类型只应在特殊情况（即需要独立查询对象数组）下使用。为防止设计不当的映射，此设置限制了每个索引唯一嵌套类型的数量。默认值为 50。

  在前面的示例中，`user` 映射对此限制只计为 1。

- `index.mapping.nested_objects.limit`
  （可选，整数）单个文档在所有 `nested` 类型中可以包含的嵌套 JSON 对象的最大数量。此限制有助于在文档包含过多嵌套对象时防止内存溢出错误。默认值为 10000。

  为了说明此设置的工作方式，考虑在前一个示例映射中添加另一个名为 `comments` 的嵌套类型。对于每个文档，它包含的 `user` 和 `comment` 对象的总数必须低于此限制。

关于防止映射爆炸的其他设置，参阅[防止映射爆炸](/mapping/#防止映射爆炸)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/nested.html)
