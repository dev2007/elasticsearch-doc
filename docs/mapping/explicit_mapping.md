# 显式映射

你比 Elasticsearch 更了解自己的数据，因此虽然动态映射有助于快速上手，但在某个阶段你还是会希望指定自己的显式映射。

你可以在创建索引时创建字段映射，也可以向现有索引添加字段。

## 创建带显式映射的索引

你可以使用[创建索引 API](/rest_apis/index_apis/create_index) 创建一个带显式映射的新索引：

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "age":    { "type": "integer" },
      "email":  { "type": "keyword"  },
      "name":   { "type": "text"  }
    }
  }
}
```

1. 创建 `age`，一个整数字段
2. 创建 `email`，一个关键字字段
3. 创建 `name`，一个文本字段

## 向现有映射添加字段

你可以使用[更新映射 API](/rest_apis/index_apis/update_mapping) 向现有索引添加一个或多个新字段。

以下示例添加了 `employee-id`，一个 `index` 映射参数值为 `false` 的关键字字段。这意味着 `employee-id` 字段的值会被存储，但不会被索引，也不可用于搜索。

```bash
PUT /my-index-000001/_mapping
{
  "properties": {
    "employee-id": {
      "type": "keyword",
      "index": false
    }
  }
}
```

## 更新字段的映射

除受支持的[映射参数](/mapping/mapping_parameters)外，你无法更改现有字段的映射或字段类型。更改现有字段可能会使已索引的数据失效。

如果需要更改数据流后备索引中某个字段的映射，参阅[更改数据流的映射和设置](/data_streams/data_stream_mapping_and_settings)。

如果需要更改其他索引中某个字段的映射，请使用正确的映射创建一个新索引，并将数据重新索引到该索引中。

重命名一个字段会使已使用旧字段名索引的数据失效。作为替代，可以添加一个 `alias` 字段来创建一个备用字段名。

## 查看索引的映射

你可以使用[获取映射 API](/rest_apis/index_apis/get_mapping) 查看现有索引的映射。

```bash
GET /my-index-000001/_mapping
```

该 API 返回以下响应：

```json
{
  "my-index-000001" : {
    "mappings" : {
      "properties" : {
        "age" : {
          "type" : "integer"
        },
        "email" : {
          "type" : "keyword"
        },
        "employee-id" : {
          "type" : "keyword",
          "index" : false
        },
        "name" : {
          "type" : "text"
        }
      }
    }
  }
}
```

## 查看特定字段的映射

如果只想查看一个或多个特定字段的映射，可以使用[获取字段映射 API](/rest_apis/index_apis/get_field_mapping)。

如果你不需要索引的完整映射，或者索引包含大量字段，这会很有用。

以下请求检索 `employee-id` 字段的映射。

```bash
GET /my-index-000001/_mapping/field/employee-id
```

该 API 返回以下响应：

```json
{
  "my-index-000001" : {
    "mappings" : {
      "employee-id" : {
        "full_name" : "employee-id",
        "mapping" : {
          "employee-id" : {
            "type" : "keyword",
            "index" : false
          }
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/explicit-mapping.html)
