# JSON 处理器

将 JSON 字符串转换为结构化的 JSON 对象。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要解析的字段。 |
| `target_field` | 否 | `field` | 转换后的结构化对象写入的字段。该字段中已有的内容会被覆盖。 |
| `add_to_root` | 否 | `false` | 强制将解析后的 JSON 添加到文档顶层的标志。选择此选项时不能设置 `target_field`。 |
| `add_to_root_conflict_strategy` | 否 | `replace` | 设为 `replace` 时，与解析 JSON 冲突的根字段会被覆盖；设为 `merge` 时，冲突字段将被合并。仅在 `add_to_root` 为 `true` 时适用。 |
| `allow_duplicate_keys` | 否 | `false` | 设为 `true` 时，JSON 含重复键不会导致解析失败；重复键以最后出现的值为准。 |
| `strict_json_parsing` | 否 | `true` | 设为 `true` 时，JSON 解析器严格解析字段值。设为 `false` 时更宽松，但更可能丢弃字段值的部分内容。例如值为 `123 "foo"` 时，严格模式抛出 `IllegalArgumentException`，宽松模式则解析为 `123`。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

所有 JSON 支持的类型都会被解析（`null`、布尔值、数字、数组、对象、字符串）。

## 示例 1：指定 target_field

假设你提供以下 `json` 处理器配置：

```json
{
  "json" : {
    "field" : "string_source",
    "target_field" : "json_target"
  }
}
```

如果处理以下文档：

```json
{
  "string_source": "{\"foo\": 2000}"
}
```

在 `json` 处理器处理之后，它将变为：

```json
{
  "string_source": "{\"foo\": 2000}",
  "json_target": {
    "foo": 2000
  }
}
```

## 示例 2：省略 target_field

如果提供以下配置，省略可选的 `target_field` 设置：

```json
{
  "json" : {
    "field" : "source_and_target"
  }
}
```

则在该处理器处理此文档之后：

```json
{
  "source_and_target": "{\"foo\": 2000}"
}
```

它将变为：

```json
{
  "source_and_target": {
    "foo": 2000
  }
}
```

这说明：除非在处理器配置中显式指定 `target_field`，否则默认写入 `field` 指定的同一字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/json-processor.html)
