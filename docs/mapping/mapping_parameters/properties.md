# properties

类型映射、object 字段和 nested 字段包含称为属性（properties）的子字段。这些属性可以是任何数据类型，包括 `object` 和 `nested`。属性可以通过以下方式添加：

- 在创建索引时显式定义它们。
- 通过更新映射 API 在添加或更新映射类型时显式定义它们。
- 仅通过索引包含新字段的文档动态添加。

以下示例向映射类型、object 字段和 nested 字段添加属性：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      # 顶层 mappings 定义中的属性
      "manager": {
        "properties": {
          "age":  { "type": "integer" },
          "name": { "type": "text"  }
        }
      },
      # employees nested 字段下的属性
      "employees": {
        "type": "nested",
        "properties": {
          "age":  { "type": "integer" },
          "name": { "type": "text"  }
        }
      }
    }
  }
}

# 与上述映射对应的示例文档
PUT my-index-000001/_doc/1
{
  "region": "US",
  "manager": {
    "name": "Alice White",
    "age": 30
  },
  "employees": [
    {
      "name": "John Smith",
      "age": 34
    },
    {
      "name": "Peter Brown",
      "age": 26
    }
  ]
}
```

`properties` 设置允许同一索引中同名的字段具有不同的设置。可以使用更新映射 API 向现有字段添加新属性。

## 点表示法

可以使用点表示法在查询、聚合等中引用内部字段：

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "manager.name": "Alice White"
    }
  },
  "aggs": {
    "Employees": {
      "nested": {
        "path": "employees"
      },
      "aggs": {
        "Employee Ages": {
          "histogram": {
            "field": "employees.age",
            "interval": 5
          }
        }
      }
    }
  }
}
```

1. 必须指定内部字段的完整路径。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/properties.html)
