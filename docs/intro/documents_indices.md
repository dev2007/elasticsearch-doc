# 索引、文档和字段

索引是 Elasticsearch 中的基本存储单元，是一个用于存储具有相似特征的数据的逻辑命名空间。在你部署好 Elasticsearch 之后，你将首先创建一个索引来存储你的数据。

索引是通过名称或别名唯一标识的文档集合。这个唯一名称非常重要，因为它用于在搜索查询和其他操作中定位索引。

一个密切相关的概念是数据流。这种索引抽象针对仅追加的时间戳数据进行了优化，由隐藏的、自动生成的后备索引组成。如果你正在处理时间戳数据，我们推荐使用 Elastic Observability 解决方案，它提供了额外的工具和优化的内容。

## 文档和字段

Elasticsearch 以 JSON 文档的形式序列化和存储数据。文档是一组字段，字段是包含你数据的键值对。每个文档都有一个唯一的 ID，你可以自己创建，也可以让 Elasticsearch 自动生成。

一个简单的 Elasticsearch 文档可能如下所示：

```json
{
  "_index": "my-first-elasticsearch-index",
  "_id": "DyFpo5EBxE8fzbb95DOa",
  "_version": 1,
  "_seq_no": 0,
  "_primary_term": 1,
  "found": true,
  "_source": {
    "email": "john@smith.com",
    "first_name": "John",
    "last_name": "Smith",
    "info": {
      "bio": "Eco-warrior and defender of the weak",
      "age": 25,
      "interests": [
        "dolphins",
        "whales"
      ]
    },
    "join_date": "2024/05/01"
  }
}
```

## 元数据字段

被索引的文档包含数据和元数据。元数据字段是存储有关文档信息的系统字段。在 Elasticsearch 中，元数据字段以下划线为前缀。例如，以下字段是元数据字段：

- **`_index`**：存储文档的索引名称。
- **`_id`**：文档的 ID。ID 在每个索引中必须是唯一的。

## 映射和数据类型

每个索引都有一个映射（或称模式），用于定义文档中的字段如何被索引。映射定义了每个字段的数据类型、字段应如何被索引以及应如何存储。在向 Elasticsearch 添加文档时，你有两种映射选择：

- **动态映射**：让 Elasticsearch 自动检测数据类型并为你创建映射。动态映射帮助你快速上手，但由于自动的字段类型推断，对于你的特定用例可能会产生次优结果。
- **显式映射**：通过为每个字段指定数据类型来预先定义映射。推荐在生产用例中使用，因为你可以完全控制数据的索引方式，以适应你的特定用例。

你可以在同一个索引上组合使用动态映射和显式映射。当你的数据中同时包含已知和未知字段时，这会非常有用。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/documents-indices.html)
