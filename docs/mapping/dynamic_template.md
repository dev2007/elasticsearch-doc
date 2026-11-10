# 动态模板

动态模板（dynamic templates）让你在默认动态字段映射规则之外，更好地控制 Elasticsearch 如何映射数据。你可以通过以下匹配条件启用动态模板：

- `match_mapping_type` 和 `unmatch_mapping_type`：按 Elasticsearch 检测到的数据类型匹配或排除字段
- `match` 和 `unmatch`：按字段名称的模式匹配或排除字段
- `path_match` 和 `path_unmatch`：按字段的完整点号路径（dotted path）匹配或排除字段

如果模板未定义任何匹配条件，则不会匹配任何字段。但你仍然可以在批量请求中按名称引用该模板。

动态映射的字段值为 `null` 或空数组时，不会被添加动态映射。使用 `null_value` 映射参数时，只有当第一个包含该字段具体值的文档被索引之后，`null_value` 才会生效。

动态模板按顺序处理，**第一个匹配的模板生效**。使用更新映射 API 更新动态模板时，会整体替换已有的动态模板。

## 校验动态模板

无效的映射片段会在模板更新期间或索引文档时返回校验错误。

未指定 `match_mapping_type` 但至少对一个预定义类型有效的模板可能被接受，但如果在索引时字段类型不同则会报错。我们建议你在动态模板中明确指定 `match_mapping_type`。

使用 `{name}` 占位符时，映射片段会在更新阶段跳过校验，改为在索引文档时校验。

## 在动态模板中映射运行时字段

除了定义索引字段的映射，你还可以在动态模板中定义运行时字段的映射。你可以通过两种方式实现：

1. 将 `dynamic` 参数设置为 `runtime`，让新字段默认作为运行时字段添加。
2. 保持 `dynamic` 为 `true`，并使用动态模板将匹配的字段映射为运行时字段。

例如，以下动态模板将名为 `ip*` 的字符串字段映射为 `ip` 类型的运行时字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_ip": {
          "match_mapping_type": "string",
          "match": "ip*",
          "runtime": { "type": "ip" }
        }
      }
    ]
  }
}
```

## match_mapping_type 和 unmatch_mapping_type

`match_mapping_type` 会匹配 JSON 解析器检测到的数据类型。由于 JSON 不区分 `long` 和 `integer`，也不区分 `double` 和 `float`，因此总是会选择更宽泛的类型，即 `long` 对应整数、`double` 对应浮点数。

下表显示了 JSON 解析器检测到的数据类型，以及在 `dynamic` 参数为 `true` 或 `runtime` 时字段分别映射的类型：

| JSON 检测到的类型 | `"dynamic":"true"` | `"dynamic":"runtime"` |
|:--|:--|:--|
| `null` | 不添加字段 | 不添加字段 |
| `true` 或 `false` | `boolean` | `boolean` |
| `double` | `float` | `double` |
| `long` | `long` | `long` |
| `object` | `object` | 不添加字段 |
| `array` | 取决于第一个非空值 | 取决于第一个非空值 |
| 通过日期检测的字符串 | `date` | `date` |
| 通过数字检测的字符串 | `float` 或 `long` | `double` 或 `long` |
| 其他字符串 | 带有 `.keyword` 子字段的 `text` | `keyword` |

`match_mapping_type` 支持指定单个类型、类型数组或通配符 `*`。`unmatch_mapping_type` 则排除指定的数据类型。

例如，以下动态模板包含四个模板。第一个模板匹配类型为 `long` 或 `double` 且名称含 `count` 的字段，将其映射为 `{dynamic_type}` 类型并禁用索引；其余模板分别将 `long` 映射为 `integer`、将字符串映射为带 `raw` 子字段的 `text`，以及将除对象外的所有类型映射为 `keyword`：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "numeric_counts": {
          "match_mapping_type": ["long","double"],
          "match": "count",
          "mapping": { "type": "{dynamic_type}", "index": false }
        }
      },
      {
        "integers": {
          "match_mapping_type": "long",
          "mapping": { "type": "integer" }
        }
      },
      {
        "strings": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "fields": { "raw": { "type": "keyword", "ignore_above": 256 } }
          }
        }
      },
      {
        "non_objects_keyword": {
          "match_mapping_type": "*",
          "unmatch_mapping_type": "object",
          "mapping": { "type": "keyword" }
        }
      }
    ]
  }
}
```

按照上述映射索引文档后：

- `my_integer` 字段被映射为 `integer`
- `my_string` 字段被映射为带 `keyword` 多字段的 `text`
- `my_boolean` 字段（值为字符串 `"false"`）被映射为 `keyword`
- `field.count` 字段被映射为 `long`（因为 `numeric_counts` 模板排在前面）

## match 和 unmatch

`match` 参数使用完整匹配模式（如 `long_*`），`unmatch` 参数用于排除匹配的名称。你可以使用 `match_pattern` 参数，将其设置为 `regex` 来支持完整的 Java 正则表达式，例如 `"match": "^profit_\\d+$"`。

`match` 和 `unmatch` 都支持传入 JSON 数组形式的多个模式。

例如，以下模板将名称匹配 `long_*` 且不匹配 `*_text` 的字符串字段映射为 `long`：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "longs_as_strings": {
          "match_mapping_type": "string",
          "match": "long_*",
          "unmatch": "*_text",
          "mapping": { "type": "long" }
        }
      }
    ]
  }
}
```

索引文档后：

- `long_num` 字段被映射为 `long`
- `long_text` 字段使用默认的字符串映射

以下模板使用多模式匹配将名称匹配 `ip_*` 或 `*_ip`、且不匹配以 `one` 开头或以 `two` 结尾的字段映射为 `ip`：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "ip_fields": {
          "match": ["ip_*", "*_ip"],
          "unmatch": ["one*", "*two"],
          "mapping": { "type": "ip" }
        }
      }
    ]
  }
}
```

索引文档后：

- `one_ip` 和 `ip_two` 字段使用默认的 `text` 映射
- `three_ip` 和 `ip_four` 字段被映射为 `ip`

## path_match 和 path_unmatch

`path_match` 和 `path_unmatch` 参数的工作方式与 `match` 和 `unmatch` 类似，但匹配的是字段的完整点号路径，例如 `some_object.*.some_field`。

与 `match` 和 `unmatch` 不同，`path_match` 和 `path_unmatch` 会匹配对象路径本身。如果一个对象与模板匹配且其映射不是有效的对象映射，映射片段可能会报错。

例如，以下模板将 `name` 对象下的所有字段映射为 `text` 并复制到 `full_name`，但排除 `middle` 字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "full_name": {
          "path_match": "name.*",
          "path_unmatch": "*.middle",
          "mapping": { "type": "text", "copy_to": "full_name" }
        }
      }
    ]
  }
}
```

`path_match` 和 `path_unmatch` 同样支持多模式，例如 `"path_match": ["name.*", "user.name.*"]`、`"path_unmatch": ["*.middle", "*.midinitial"]`。

## 模板变量

`{name}` 和 `{dynamic_type}` 占位符会在映射中被替换为实际的字段名称和检测到的数据类型。以下示例使用 `analyzer` 映射参数，将字符串字段设置为使用以字段名命名的分析器，并为所有非字符串字段禁用 `doc_values`：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "named_analyzers": {
          "match_mapping_type": "string",
          "match": "*",
          "mapping": { "type": "text", "analyzer": "{name}" }
        }
      },
      {
        "no_doc_values": {
          "match_mapping_type": "*",
          "mapping": { "type": "{dynamic_type}", "doc_values": false }
        }
      }
    ]
  }
}
```

索引文档后：

- `english` 字段使用 `english` 分析器
- `count` 字段被映射为 `long` 且禁用 `doc_values`

## 动态模板示例

### 结构化搜索

默认情况下，Elasticsearch 会将字符串字段映射为带 `keyword` 子字段的 `text` 字段。但如果你只对结构化搜索感兴趣，可以只将它们映射为 `keyword`：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": { "type": "keyword" }
        }
      }
    ]
  }
}
```

### 字符串的纯 text 映射

如果你只需要字符串字段的全文检索能力，可以将它们映射为 `text` 字段。或者，你可以使用空的 `runtime` 映射定义，将字符串字段映射为 `keyword` 类型的运行时字段。这样字段不会被索引，而是从 `_source` 读取，但仍可用于搜索、聚合和排序：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "runtime": {}
        }
      }
    ]
  }
}
```

使用获取映射 API 查看映射时，会返回如下运行时定义：`"runtime": {"english": {"type": "keyword"}}`。

### 禁用 norms

如果你不关心相关性评分，可以禁用 `norms` 来节省磁盘空间：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "norms": false,
            "fields": {
              "keyword": { "type": "keyword", "ignore_above": 256 }
            }
          }
        }
      }
    ]
  }
}
```

上述模板中的子字段实现了与默认动态映射规则相同的功能。

### 时序数据

对于经常聚合但不过滤的数值字段，可以禁用索引以节省磁盘空间并提升索引速度：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic_templates": [
      {
        "unindexed_longs": {
          "match_mapping_type": "long",
          "mapping": { "type": "long", "index": false }
        }
      },
      {
        "unindexed_doubles": {
          "match_mapping_type": "double",
          "mapping": { "type": "float", "index": false }
        }
      }
    ]
  }
}
```

上述模板将 `double` 映射为 `float`，通常可以将存储空间减半。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dynamic-templates.html)
