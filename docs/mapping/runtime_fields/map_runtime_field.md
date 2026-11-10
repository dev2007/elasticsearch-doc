# 映射运行时字段

你可以在映射定义下添加 `runtime` 部分并定义 Painless 脚本来映射运行时字段。此脚本可以访问文档的整个上下文，包括通过 `params._source` 访问的原始 `_source`，以及任何已映射字段及其值。在查询时，脚本会运行并为查询所需的每个脚本字段生成值。

## 输出运行时字段值

定义与运行时字段一起使用的 Painless 脚本时，必须包含 `emit` 方法来输出计算后的值。

例如，以下请求中的脚本从定义为 `date` 类型的 `@timestamp` 字段计算星期几。脚本基于 `timestamp` 的值计算星期几，并使用 `emit` 返回计算后的值。

```bash
PUT my-index-000001/
{
  "mappings": {
    "runtime": {
      "day_of_week": {
        "type": "keyword",
        "script": {
          "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH))"
        }
      }
    },
    "properties": {
      "@timestamp": {"type": "date"}
    }
  }
}
```

`runtime` 部分可以是以下任意数据类型：

- `boolean`
- `composite`
- `date`
- `double`
- `geo_point`
- `ip`
- `keyword`
- `long`
- `lookup`

类型为 `date` 的运行时字段可以像[日期字段类型](/mapping/field_data_types/date)一样接受 `format` 参数。

类型为 `lookup` 的运行时字段允许从相关索引中检索字段。参阅[从相关索引检索字段](/mapping/runtime_fields/retrieve_a_runtime_field#从相关索引检索字段)。

如果在 `dynamic` 参数设置为 `runtime` 的地方启用了动态字段映射，新字段会自动作为运行时字段添加到索引映射中：

```bash
PUT my-index-000001
{
  "mappings": {
    "dynamic": "runtime",
    "properties": {
      "@timestamp": {
        "type": "date"
      }
    }
  }
}
```

## 不使用脚本定义运行时字段

运行时字段通常包含一个以某种方式处理数据的 Painless 脚本。但在某些情况下，你可以定义一个不带脚本的运行时字段。例如，如果你想从 `_source` 中检索单个字段而不做任何更改，则不需要脚本。你可以直接创建一个不带脚本的运行时字段，例如 `day_of_week`：

```bash
PUT my-index-000001/
{
  "mappings": {
    "runtime": {
      "day_of_week": {
        "type": "keyword"
      }
    }
  }
}
```

当未提供脚本时，Elasticsearch 会在查询时隐式地在 `_source` 中查找与运行时字段同名的字段，如果存在则返回其值。如果不存在同名字段，响应中不会包含该运行时字段的任何值。

在大多数情况下，应尽可能通过 `doc_values` 检索字段值。由于数据从 Lucene 加载的方式，通过运行时字段访问 `doc_values` 比从 `_source` 检索值更快。

不过，在某些情况下必须从 `_source` 检索字段。例如，`text` 字段默认没有可用的 `doc_values`，因此你必须从 `_source` 检索值。在其他情况下，你可能会选择对特定字段禁用 `doc_values`。

你也可以在要检索值的字段前加上 `params._source` 前缀（例如 `params._source.day_of_week`）。为简单起见，只要可能，建议在映射定义中定义不带脚本的运行时字段。

## 忽略运行时字段的脚本错误

脚本可能会在运行时抛出错误，例如访问文档中缺失或无效的值，或执行了无效操作。`on_script_error` 参数可用于控制发生此类错误时的行为。将此参数设置为 `continue` 会静默忽略此运行时字段上的所有错误。默认值 `fail` 会导致分片失败，并在搜索响应中报告。

## 更新和删除运行时字段

你可以随时更新或删除运行时字段。要替换现有的运行时字段，请向映射中添加一个同名的新运行时字段。要从映射中删除运行时字段，请将该运行时字段的值设置为 `null`：

```bash
PUT my-index-000001/_mapping
{
 "runtime": {
   "day_of_week": null
 }
}
```

### 下游影响

在依赖查询运行期间更新或删除运行时字段可能会返回不一致的结果。每个分片可能访问不同版本的脚本，具体取决于映射更改何时生效。

依赖运行时字段的 Kibana 现有查询或可视化在你删除或更新该字段后可能会失败。例如，使用类型为 `ip` 的运行时字段的柱状图可视化，在该类型更改为 `boolean` 或该运行时字段被删除后将无法工作。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/runtime-mapping-fields.html)
