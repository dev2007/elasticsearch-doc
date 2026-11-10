# ignore_malformed

有时你无法控制收到的数据。一个用户可能发送一个作为日期的 `login` 字段，而另一个用户发送一个作为电子邮件地址的 `login` 字段。

尝试将错误的数据类型索引到字段时，默认会抛出异常并拒绝整个文档。如果 `ignore_malformed` 参数设置为 `true`，则允许忽略该异常。格式错误的字段不会被索引，但文档中的其他字段会正常处理。

例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "number_one": {
        "type": "integer",
        "ignore_malformed": true
      },
      "number_two": {
        "type": "integer"
      }
    }
  }
}

# 此文档将索引 text 字段，但不索引 number_one 字段
PUT my-index-000001/_doc/1
{
  "text":       "Some text value",
  "number_one": "foo"
}

# 由于 number_two 不允许格式错误的值，此文档将被拒绝
PUT my-index-000001/_doc/2
{
  "text":       "Some text value",
  "number_two": "foo"
}
```

`ignore_malformed` 设置目前受以下映射类型支持：

| 映射类型 | 类型 |
|:--|:--|
| Numeric | `long`、`integer`、`short`、`byte`、`double`、`float`、`half_float`、`scaled_float` |
| Boolean | `boolean` |
| Date | `date` |
| Date nanoseconds | `date_nanos` |
| Geopoint | `geo_point`（用于经纬度点） |
| Geoshape | `geo_shape`（用于多边形等复杂形状） |
| IP | `ip`（用于 IPv4 和 IPv6 地址） |

`ignore_malformed` 设置的值可以使用更新映射 API 在现有字段上更新。

## 索引级默认值

可以在索引级别设置 `index.mapping.ignore_malformed`，以便在所有允许的映射类型之间全局忽略格式错误的内容。不支持该设置的映射类型如果在索引级别设置会忽略它。

```bash
PUT my-index-000001
{
  "settings": {
    # number_one 字段继承索引级设置
    "index.mapping.ignore_malformed": true
  },
  "mappings": {
    "properties": {
      "number_one": {
        "type": "byte"
      },
      # number_two 字段覆盖索引级设置以关闭 ignore_malformed
      "number_two": {
        "type": "integer",
        "ignore_malformed": false
      }
    }
  }
}
```

## 处理格式错误的字段

开启 `ignore_malformed` 后，格式错误的字段会在索引时被静默忽略。建议尽可能将包含格式错误字段的文档数量控制在一定范围内，否则对该字段的查询将变得没有意义。Elasticsearch 让你可以通过对特殊的 [`_ignored`](/mapping/metadata_fields/ignored) 字段使用 `exists`、`term` 或 `terms` 查询，轻松检查有多少文档包含格式错误的字段。

## JSON 对象的限制

你不能将 `ignore_malformed` 用于以下数据类型：

- `nested` 数据类型
- `object` 数据类型
- range 数据类型

你也不能使用 `ignore_malformed` 来忽略提交给错误数据类型字段的 JSON 对象。JSON 对象是由花括号 `"{}"` 包围的任何数据，包括映射到 `nested`、`object` 和 `range` 数据类型的数据。

如果你将 JSON 对象提交到不支持的字段，无论 `ignore_malformed` 设置如何，Elasticsearch 都会返回错误并拒绝整个文档。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ignore-malformed.html)
