# 获取字段结构 API

为从已摄取到 Elasticsearch 中的日志消息提取更多信息提供一个起点。

```txt
GET _text_structure/find_field_structure
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor_text_structure` 或 `monitor` 集群权限才能使用此 API。

## 描述

如果你有一个仅包含 `@timestamp` 和 `message` 字段的索引，可以使用此 API 来查看 `message` 字段中的公共结构。响应中包含：

- 示例消息。
- 揭示文本中检测到的所有字段的最常见值以及数值字段的基本数值统计信息的统计数据。
- 有关文本结构的信息，这在编写摄取配置时非常有用。
- 用于摄取该文本的适当 Elasticsearch 索引映射。

所有信息都可以自动计算（"无需指导"），但查询参数可以覆盖有关文本结构的决策。如果结果不符合预期，请设置 `explain` 参数以在响应中获取解释。

## 查询参数

`index`

（必需，字符串）包含该字段的索引的名称。

`field`

（必需，字符串）要分析的字段的名称。

`column_names`

（可选，字符串）如果 `format` 为 `delimited`，则为逗号分隔的列名。如果未设置，则使用标题行；如果没有标题行，则列名默认为 "column1"、"column2" 等。

`delimiter`

（可选，字符串）如果 `format` 为 `delimited`，则为单字符分隔符。默认候选值为逗号、制表符、分号和竖线（`|`）。默认情况下，所有行必须具有相同的字段数量；如果指定了分隔符，则允许最多 **10%** 的行与第一行不同。

`documents_to_sample`

（可选，无符号整数）要包含在分析中的文档数量。最小值为 **2**；默认为 **1000**。

`ecs_compatibility`

（可选，字符串）与 ECS 兼容的 Grok 模式模式：`disabled` 或 `v1`。默认为 `disabled`。它影响整条消息的 Grok 模式（例如 `%{CATALINALOG}`）；在含义未知时使用通用字段名（`path`、`ipaddress`、`field1`、`field2`）。

`explain`

（可选，布尔值）默认为 `false`。如果为 `true`，则响应包含一个字符串数组 `explanation`，描述结果是如何产生的。

`format`

（可选，字符串）文本的高级结构：`ndjson`、`xml`、`delimited` 或 `semi_structured_text`。默认为自动检测（对于 `delimited` 格式的检测，所有行必须具有相同的字段数量）。如果显式设置为 `delimited` 且未设置分隔符，则允许最多 **5%** 的行与第一行不同。

`grok_pattern`

（可选，字符串）如果 `format` 为 `semi_structured_text`，则为用于从每条消息中提取字段的 Grok 模式。其时间戳字段必须与 `timestamp_field` 匹配（如果未设置该参数，则必须命名为 `timestamp`）。如果省略，结构查找器会创建一个 Grok 模式。

`quote`

（可选，字符串）如果 `format` 为 `delimited`，则为包含换行符或分隔符的值使用的单字符引号。默认为 `"`。对于不支持引号的变通方法：将其设置为一个在样本中从未出现的字符。

`should_trim_fields`

（可选，布尔值）如果 `format` 为 `delimited`，则为是否修剪分隔符之间的空白字符。如果分隔符为竖线（`|`），默认为 `true`；否则默认为 `false`。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 **25 秒**。分析的最长时间。

`timestamp_field`

（可选，字符串）包含每条记录的主要时间戳的字段（在摄取时用于填充 `@timestamp`）。对于 `semi_structured_text` 格式，该字段必须与一个 Grok 提取名称匹配 — 除非同时设置了 `grok_pattern`，否则最好不要设置。对于结构化文本，该字段必须存在；时间戳不是必需的。如果未设置，将自动检测。

`timestamp_format`

（可选，字符串）时间戳字段的 Java 时间格式。支持的字母组包括：`a`、`d`、`dd`、`EEE`、`EEEE`、`H`、`HH`、`h`、`M`、`MM`、`MMM`、`MMMM`、`mm`、`ss`、`XX`、`XXX`、`yy`、`yyyy`、`zzz`；此外，在 `ss` 之后可以是由 `.`、`,` 或 `:` 分隔的 `S` 组（1-9 个，表示秒的小数部分）。允许空格和标点符号（`?`、换行符、回车符除外）；字面文本需放在单引号中（例如 `MM/dd HH.mm.ss,SSSSSS 'in' yyyy`）。特殊值 `null` 会禁用时间戳检测（半结构化文本随后会被视为单行消息）。示例格式：

- `yyyy-MM-dd HH:mm:ssZ` → `2019-04-20 13:15:22+0000`
- `EEE, d MMM yyyy HH:mm:ss Z` → `Sat, 20 Apr 2019 13:15:22 +0000`
- `dd.MM.yy HH:mm:ss.SSS` → `20.04.19 13:15:22.285`

## 示例

以下示例分析 Elasticsearch 日志文件。首先将示例日志摄取到 `test-logs` 索引中：

```txt
POST _bulk?refresh=true
{"index":{"_index":"test-logs"}}
{"message":"[2024-03-05T10:52:36,256][INFO ][o.a.l.u.VectorUtilPanamaProvider] [laptop] Java vector incubator API enabled; uses preferredBitSize=128"}
{"index":{"_index":"test-logs"}}
{"message":"[2024-03-05T10:52:41,038][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [repository-url]"}
...
```

然后调用此 API 分析 `test-logs` 索引的 `message` 字段：

```txt
GET _text_structure/find_field_structure?index=test-logs&field=message
```

API 返回以下响应：

```json
{
  "num_lines_analyzed": 22,
  "num_messages_analyzed": 22,
  "sample_start": "[2024-03-05T10:52:36,256]...",
  "charset": "UTF-8",
  "format": "semi_structured_text",
  "multiline_start_pattern": "^\\[\\b\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}",
  "grok_pattern": "\\[%{TIMESTAMP_ISO8601:timestamp}\\]\\[%{LOGLEVEL:loglevel} \\]\\[.*",
  "ecs_compatibility": "disabled",
  "timestamp_field": "timestamp",
  "joda_timestamp_formats": [ "ISO8601" ],
  "java_timestamp_formats": [ "ISO8601" ],
  "need_client_timezone": true,
  "mappings": {
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "loglevel": {
        "type": "keyword"
      },
      "message": {
        "type": "text"
      }
    }
  },
  "ingest_pipeline": {
    "description": "Ingest pipeline created by text structure finder",
    "processors": [
      {
        "grok": {
          "field": "message",
          "patterns": [ "\\[%{TIMESTAMP_ISO8601:timestamp}\\]\\[%{LOGLEVEL:loglevel} \\]\\[.*" ],
          "ecs_compatibility": "disabled"
        }
      },
      {
        "date": {
          "field": "timestamp",
          "timezone": "{{ event.timezone }}",
          "formats": [ "ISO8601" ]
        }
      },
      {
        "remove": {
          "field": "timestamp"
        }
      }
    ]
  },
  "field_stats": {
    "loglevel": {
      "count": 22,
      "cardinality": 1,
      "top_hits": [
        { "value": "INFO", "count": 22 }
      ]
    },
    "message": {
      "count": 22,
      "cardinality": 22,
      "top_hits": [ "..." ]
    },
    "timestamp": {
      "count": 22,
      "cardinality": 14,
      "earliest": "2024-03-05T10:52:36,256",
      "latest": "2024-03-05T10:52:49,199",
      "top_hits": [
        { "value": "2024-03-05T10:52:41,044", "count": 6 },
        { "value": "2024-03-05T10:52:41,043", "count": 3 },
        { "value": "2024-03-05T10:52:41,059", "count": 2 }
      ]
    }
  }
}
```

`field_stats` 的条目包含 `count`（计数）、`cardinality`（基数）、`top_hits`（值/计数对），对于时间戳字段还包含 `earliest`（最早）和 `latest`（最晚）。在此示例中，`field_stats` 以字段名称为键返回。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/find-field-structure.html)
