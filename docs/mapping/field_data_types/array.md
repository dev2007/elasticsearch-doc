# 数组

在 Elasticsearch 中，没有专门的 `array` 数据类型。默认情况下，任何字段都可以包含零个或多个值，但数组中的所有值必须是相同的数据类型。例如：

- 字符串数组：`[ "one", "two" ]`
- 整数数组：`[ 1, 2 ]`
- 数组的数组：`[ 1, [ 2, 3 ]]`，它等价于 `[ 1, 2, 3 ]`
- 对象数组：`[ { "name": "Mary", "age": 12 }, { "name": "John", "age": 10 }]`

## object 字段类型与 nested 类型的数组对比

在 Elasticsearch 中，对象数组的行为可能与你的预期不符：查询可能会匹配到数组中不同对象的字段，导致意外的结果。默认情况下，对象数组在索引时会被扁平化。要确保查询只匹配同一对象内的值，请使用 `nested` 类型而不是 `object` 类型。

此行为在 [`nested`](/mapping/field_data_types/nested) 中有更详细的说明。

动态添加字段时，数组中的第一个值决定字段类型。所有后续值必须是相同的数据类型，或者至少能够被强制转换为相同的数据类型。

不支持包含多种数据类型混合的数组：`[ 10, "some string" ]`

数组可以包含 `null` 值，`null` 值要么被配置的 `null_value` 替换，要么被完全跳过。空数组 `[]` 被视为缺失字段，即一个没有任何值的字段。

使用数组不需要预先做任何配置，开箱即用：

```bash
PUT my-index-000001/_doc/1
{
  "message": "some arrays in this document...",
  "tags":  [ "elasticsearch", "wow" ],
  "lists": [
    {
      "name": "prog_list",
      "description": "programming list"
    },
    {
      "name": "cool_list",
      "description": "cool stuff list"
    }
  ]
}

# 第二个文档不包含数组，但可以索引到相同的字段中
PUT my-index-000001/_doc/2
{
  "message": "no arrays in this document...",
  "tags":  "elasticsearch",
  "lists": {
    "name": "prog_list",
    "description": "programming list"
  }
}

# 查询在 tags 字段中查找 elasticsearch，并匹配两个文档
GET my-index-000001/_search
{
  "query": {
    "match": {
      "tags": "elasticsearch"
    }
  }
}
```

`tags` 字段被动态添加为字符串字段。

`lists` 字段被动态添加为对象字段。

第二个文档不包含数组，但可以索引到相同的字段中。

查询在 `tags` 字段中查找 `elasticsearch`，并匹配两个文档。

你可以使用更新 API 修改数组。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/array.html)
