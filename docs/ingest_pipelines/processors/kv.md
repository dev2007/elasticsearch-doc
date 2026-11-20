# KV 处理器

自动解析 `foo=bar` 形式的消息（或事件的特定字段）。

例如，如果日志消息中包含 `ip=1.2.3.4 error=REFUSED`，则可以通过如下配置自动解析这些字段：

```json
{
  "kv": {
    "field": "message",
    "field_split": " ",
    "value_split": "="
  }
}
```

:::note 提示
使用 KV 处理器可能产生你无法控制的字段名。建议考虑改用 `flattened`（扁平化）数据类型，它将整个对象映射为单个字段，并允许对其内容进行简单搜索。
:::

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要解析的字段。支持模板片段。 |
| `field_split` | 是 | - | 用于分隔键值对的正则表达式模式。 |
| `value_split` | 是 | - | 用于在键值对中分隔键与值的正则表达式模式。 |
| `target_field` | 否 | `null` | 将提取的键插入的目标字段。默认插入文档根级。支持模板片段。 |
| `include_keys` | 否 | `null` | 用于过滤并插入文档的键列表。默认包含所有键。 |
| `exclude_keys` | 否 | `null` | 要从文档中排除的键列表。 |
| `ignore_missing` | 否 | `false` | 设为 `true` 时，如果字段不存在或为 `null`，处理器将安静地退出而不修改文档。 |
| `prefix` | 否 | `null` | 添加到提取键之前的前缀。 |
| `trim_key` | 否 | `null` | 由要从提取键中裁剪的字符组成的字符串。 |
| `trim_value` | 否 | `null` | 由要从提取值中裁剪的字符组成的字符串。 |
| `strip_brackets` | 否 | `false` | 设为 `true` 时，从提取的值中去除括号 `()`、`<>`、`[]` 以及引号 `'` 和 `"`。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/kv-processor.html)
