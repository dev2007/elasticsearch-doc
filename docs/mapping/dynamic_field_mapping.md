# 动态字段映射

当 Elasticsearch 在文档中检测到新字段时，默认会动态地将该字段添加到类型映射中。`dynamic` 参数控制此行为。

你可以将 `dynamic` 参数设置为 `true` 或 `runtime`，显式地指示 Elasticsearch 基于传入文档动态创建字段。启用动态字段映射后，Elasticsearch 会使用下表中的规则来确定如何映射每个字段的数据类型。

下表中的字段数据类型是 Elasticsearch 唯一会动态检测的字段数据类型。所有其他数据类型都必须显式映射。

| Elasticsearch 数据类型 | JSON 数据类型 | `"dynamic":"true"` | `"dynamic":"runtime"` |
|:--|:--|:--|:--|
| `null` | — | 不添加字段 | 不添加字段 |
| `true` 或 `false` | — | `boolean` | `boolean` |
| `double` | — | `float` | `double` |
| `long` | — | `long` | `long` |
| `object` | — | `object` | 不添加字段 |
| `array` | — | 取决于数组中第一个非空值 | 取决于数组中第一个非空值 |
| 通过日期检测的字符串 | — | `date` | `date` |
| 通过数字检测的字符串 | — | `float` 或 `long` | `double` 或 `long` |
| 未通过日期检测或数字检测的字符串 | — | 带有 `.keyword` 子字段的 `text` | `keyword` |

你可以在文档级别和对象级别禁用动态映射。将 `dynamic` 参数设置为 `false` 会忽略新字段，设置为 `strict` 时，如果 Elasticsearch 遇到未知字段，将拒绝该文档。

使用[更新映射 API](/rest_apis/index_apis/update_mapping) 可以更新现有字段的 `dynamic` 设置。

你可以为日期检测和数字检测自定义动态字段映射规则。要定义可应用于其他动态字段的自定义映射规则，请使用 `dynamic_templates`。

## 日期检测

如果 `date_detection` 已启用（默认），则会对新字符串字段进行检查，看其内容是否匹配 `dynamic_date_formats` 中指定的任何日期模式。如果找到匹配项，就会添加一个带有相应格式的新 `date` 字段。

`dynamic_date_formats` 的默认值为：

```bash
[ "strict_date_optional_time","yyyy/MM/dd HH:mm:ss Z||yyyy/MM/dd Z"]
```

例如：

```bash
PUT my-index-000001/_doc/1
{
  "create_date": "2015/09/02"
}

# 查看映射结果
GET my-index-000001/_mapping
```

`create_date` 字段已被添加为一个 `date` 字段，格式为 `"yyyy/MM/dd HH:mm:ss Z||yyyy/MM/dd Z"`。

## 禁用日期检测

可以通过将 `date_detection` 设置为 `false` 来禁用动态日期检测：

```bash
PUT my-index-000001
{
  "mappings": {
    "date_detection": false
  }
}

PUT my-index-000001/_doc/1
{
  "create_date": "2015/09/02"
}
```

`create_date` 字段已被添加为一个 `text` 字段。

## 自定义检测到的日期格式

或者，你也可以自定义 `dynamic_date_formats` 以支持自己的日期格式：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_date_formats": ["MM/dd/yyyy"]
  }
}

PUT my-index-000001/_doc/1
{
  "create_date": "09/25/2015"
}
```

配置日期模式数组与在单个字符串中配置多个以 `||` 分隔的模式是有区别的。配置日期模式数组时，与第一个包含未映射日期字段的文档中的日期相匹配的模式将决定该字段的映射：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_date_formats": [ "yyyy/MM", "MM/dd/yyyy"]
  }
}

PUT my-index-000001/_doc/1
{
  "create_date": "09/25/2015"
}
```

得到的映射为：

```json
{
  "my-index-000001": {
    "mappings": {
      "dynamic_date_formats": [
        "yyyy/MM",
        "MM/dd/yyyy"
      ],
      "properties": {
        "create_date": {
          "type": "date",
          "format": "MM/dd/yyyy"
        }
      }
    }
  }
}
```

在单个字符串中配置多个以 `||` 分隔的模式，会得到一个支持任意日期格式的映射。这使你可以索引使用不同格式的文档：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_date_formats": [ "yyyy/MM||MM/dd/yyyy"]
  }
}

PUT my-index-000001/_doc/1
{
  "create_date": "09/25/2015"
}
```

得到的映射为：

```json
{
  "my-index-000001": {
    "mappings": {
      "dynamic_date_formats": [
        "yyyy/MM||MM/dd/yyyy"
      ],
      "properties": {
        "create_date": {
          "type": "date",
          "format": "yyyy/MM||MM/dd/yyyy"
        }
      }
    }
  }
}
```

:::note[提示]
Epoch 格式（`epoch_millis` 和 `epoch_second`）不支持作为动态日期格式。
:::

## 数字检测

虽然 JSON 原生支持浮点数和整数数据类型，但某些应用程序或语言有时可能会将数字渲染为字符串。通常正确的做法是显式映射这些字段，但也可以启用数字检测（默认禁用）来自动完成这一操作：

```bash
PUT my-index-000001
{
  "mappings": {
    "numeric_detection": true
  }
}

PUT my-index-000001/_doc/1
{
  "my_float":   "1.0",
  "my_integer": "1"
}
```

`my_float` 字段被添加为 `float` 字段。

`my_integer` 字段被添加为 `long` 字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dynamic-field-mapping.html)
