# Foreach 处理器

对数组或对象的每个元素运行一个摄取处理器。

所有摄取处理器都可以针对数组或对象元素运行。但如果元素数量未知，用同样的方式逐一处理会很繁琐。

foreach 处理器让你可以指定一个包含数组或对象值的字段，以及一个对该字段中每个元素运行的处理器。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 包含数组或对象值的字段。 |
| `processor` | 是 | - | 对每个元素运行的摄取处理器。 |
| `ignore_missing` | 否 | `false` | 如果为 `true`，且字段为 `null` 或缺失，处理器会静默退出而不修改文档。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 访问键和值

遍历数组或对象时，foreach 处理器会将当前元素的值存储在 `_ingest._value` 摄取元数据字段中。`_ingest._value` 包含完整的元素值，包括任何子字段。你可以在 `_ingest._value` 字段上使用点号表示法访问子字段的值。

遍历对象时，foreach 处理器还会将当前元素的键作为字符串存储在 `_ingest._key` 中。

你可以在处理器中访问和修改 `_ingest._key` 和 `_ingest._value`。示例参阅[对象示例](#对象示例)。

## 失败处理

如果 foreach 处理器处理某个元素失败且未指定 `on_failure` 处理器，foreach 处理器会静默退出。这会使整个数组或对象值保持不变。

## 示例

以下示例展示如何将 foreach 处理器用于不同的数据类型和选项：

- 数组
- 对象数组
- 对象
- 失败处理

### 数组

假设有以下文档：

```json
{
  "values" : ["foo", "bar", "baz"]
}
```

当此 foreach 处理器处理该示例文档时：

```json
{
  "foreach" : {
    "field" : "values",
    "processor" : {
      "uppercase" : {
        "field" : "_ingest._value"
      }
    }
  }
}
```

处理完成后，文档将如下所示：

```json
{
  "values" : ["FOO", "BAR", "BAZ"]
}
```

### 对象数组

假设有以下文档：

```json
{
  "persons" : [
    {
      "id" : "1",
      "name" : "John Doe"
    },
    {
      "id" : "2",
      "name" : "Jane Doe"
    }
  ]
}
```

在此例中，需要移除 `id` 字段，因此使用以下 foreach 处理器：

```json
{
  "foreach" : {
    "field" : "persons",
    "processor" : {
      "remove" : {
        "field" : "_ingest._value.id"
      }
    }
  }
}
```

处理后的结果为：

```json
{
  "persons" : [
    {
      "name" : "John Doe"
    },
    {
      "name" : "Jane Doe"
    }
  ]
}
```

另一个对象数组的示例，参阅 [attachment 处理器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/attachment-processor.html)文档。

### 对象

你也可以对对象字段使用 foreach 处理器。例如，以下文档包含一个带对象值的 `products` 字段。

```json
{
  "products" : {
    "widgets" : {
      "total_sales" : 50,
      "unit_price": 1.99,
      "display_name": ""
    },
    "sprockets" : {
      "total_sales" : 100,
      "unit_price": 9.99,
      "display_name": "Super Sprockets"
    },
    "whizbangs" : {
      "total_sales" : 200,
      "unit_price": 19.99,
      "display_name": "Wonderful Whizbangs"
    }
  }
}
```

以下 foreach 处理器将 `products.display_name` 的值更改为大写。

```json
{
  "foreach": {
    "field": "products",
    "processor": {
      "uppercase": {
        "field": "_ingest._value.display_name"
      }
    }
  }
}
```

对该文档运行时，foreach 处理器返回：

```json
{
  "products" : {
    "widgets" : {
      "total_sales" : 50,
      "unit_price" : 1.99,
      "display_name" : ""
    },
    "sprockets" : {
      "total_sales" : 100,
      "unit_price" : 9.99,
      "display_name" : "SUPER SPROCKETS"
    },
    "whizbangs" : {
      "total_sales" : 200,
      "unit_price" : 19.99,
      "display_name" : "WONDERFUL WHIZBANGS"
    }
  }
}
```

以下 foreach 处理器将每个元素的键设置为 `products.display_name` 的值。如果 `products.display_name` 包含空字符串，处理器会删除该元素。

```json
{
  "foreach": {
    "field": "products",
    "processor": {
      "set": {
        "field": "_ingest._key",
        "value": "{{_ingest._value.display_name}}"
      }
    }
  }
}
```

对之前的文档运行时，foreach 处理器返回：

```json
{
  "products" : {
    "Wonderful Whizbangs" : {
      "total_sales" : 200,
      "unit_price" : 19.99,
      "display_name" : "Wonderful Whizbangs"
    },
    "Super Sprockets" : {
      "total_sales" : 100,
      "unit_price" : 9.99,
      "display_name" : "Super Sprockets"
    }
  }
}
```

### 失败处理

被包装的处理器可以有 `on_failure` 定义。例如，并非所有 person 对象都可能有 `id` 字段。此时你可以使用 `on_failure` 块将该文档发送到 `failure_index` 索引以便稍后检查，而不是让索引请求失败：

```json
{
  "foreach" : {
    "field" : "persons",
    "processor" : {
      "remove" : {
        "field" : "_value.id",
        "on_failure" : [
          {
            "set" : {
              "field": "_index",
              "value": "failure_index"
            }
          }
        ]
      }
    }
  }
}
```

在此示例中，如果 remove 处理器确实失败了，则目前已处理的数组元素会被更新。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/foreach-processor.html)
