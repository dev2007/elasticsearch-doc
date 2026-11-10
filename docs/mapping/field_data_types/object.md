# object 字段类型

JSON 文档本质上是分层的：文档可能包含内部对象，而内部对象又可能包含其他内部对象：

```bash
PUT my-index-000001/_doc/1
{
  "region": "US",
  "manager": {
    "age":     30,
    "name": {
      "first": "John",
      "last":  "Smith"
    }
  }
}
```

1. 外部文档也是一个 JSON 对象。
2. 它包含一个名为 `manager` 的内部对象。
3. 而 `manager` 又包含一个名为 `name` 的内部对象。

在内部，此文档被索引为一个简单的扁平键值对列表，如下所示：

```json
{
  "region":             "US",
  "manager.age":        30,
  "manager.name.first": "John",
  "manager.name.last":  "Smith"
}
```

上述文档的显式映射可以如下所示：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "region": {
        "type": "keyword"
      },
      "manager": {
        "properties": {
          "age":  { "type": "integer" },
          "name": {
            "properties": {
              "first": { "type": "text" },
              "last":  { "type": "text" }
            }
          }
        }
      }
    }
  }
}
```

1. 顶层 `mappings` 定义中的属性。
2. `manager` 字段是一个内部对象字段。
3. `manager.name` 字段是 `manager` 字段内的一个内部对象字段。

你不需要将字段类型显式设置为 `object`，因为这是默认值。

## object 字段的参数

object 字段接受以下参数：

- `dynamic`
  （可选，字符串）是否应将新属性动态添加到现有对象。接受 `true`（默认）、`runtime`、`false` 和 `strict`。
- `enabled`
  （可选，Boolean）是否应该解析并索引为对象字段给定的 JSON 值（`true`，默认），还是完全忽略它（`false`）。
- `subobjects`
  （可选，Boolean）对象是否可以包含子对象（`true`，默认）。如果不能，名称中带点的子字段将被视为叶子字段；否则，它们的字段名称将被展开为相应的对象结构。
- `properties`
  （可选，对象）对象内的字段，可以是任何数据类型，包括 `object`。可以向现有对象添加新属性。

如果你需要索引对象数组而不是单个对象，请先阅读 [`nested`](/mapping/field_data_types/nested)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/object.html)
