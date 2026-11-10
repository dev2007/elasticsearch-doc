# coerce

数据并不总是干净的。根据数据的产生方式，一个数字在 JSON 主体中可能被渲染为真正的 JSON 数字，例如 `5`，但也可能被渲染为字符串，例如 `"5"`。或者，本应是整数的数字可能被渲染为浮点数，例如 `5.0`，甚至 `"5.0"`。

强制转换（Coercion）尝试清理脏值以适应字段的数据类型。例如：

- 字符串将被强制转换为数字。
- 浮点数对于整数值将被截断。

例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "number_one": {
        "type": "integer"
      },
      "number_two": {
        "type": "integer",
        "coerce": false
      }
    }
  }
}

# number_one 字段将包含整数 10
PUT my-index-000001/_doc/1
{
  "number_one": "10"
}

# 由于禁用了强制转换，此文档将被拒绝
PUT my-index-000001/_doc/2
{
  "number_two": "10"
}
```

`coerce` 设置的值可以使用[更新映射 API](/rest_apis/index_apis/update_mapping) 在现有字段上更新。

## 索引级默认值

可以在索引级别设置 `index.mapping.coerce`，以在所有映射类型之间全局禁用强制转换：

```bash
PUT my-index-000001
{
  "settings": {
    "index.mapping.coerce": false
  },
  "mappings": {
    "properties": {
      "number_one": {
        "type": "integer",
        "coerce": true
      },
      "number_two": {
        "type": "integer"
      }
    }
  }
}

# number_one 字段覆盖索引级设置以启用强制转换
PUT my-index-000001/_doc/1
{
  "number_one": "10"
}

# 由于 number_two 字段继承了索引级强制转换设置，此文档将被拒绝
PUT my-index-000001/_doc/2
{
  "number_two": "10"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/coerce.html)
