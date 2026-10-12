# 获取消息结构 API

查找文本消息列表的结构。

```txt
GET _text_structure/find_message_structure
POST _text_structure/find_message_structure
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor_text_structure` 或 `monitor` 集群权限才能使用此 API。

## 描述

此 API 查找文本消息列表的结构。它为以适合后续与其他 Elastic Stack 功能配合使用的格式将数据摄取到 Elasticsearch 提供了一个起点。当你的输入文本已被其他进程拆分为单独的消息时，**优先**使用此 API 而非获取文本结构 API。

响应中包含：

- 示例消息。
- 揭示文本中检测到的所有字段的最常见值以及数值字段的基本数值统计信息的统计数据。
- 有关文本结构的信息 — 这在编写用于索引该文本或类似格式文本的摄取配置时非常有用。
- 可用于摄取该文本的适当 Elasticsearch 索引映射。

所有这些信息都可以由结构查找器**无需指导**地计算出来，不过你可以选择通过查询参数覆盖某些决策。如果结果不符合预期，请指定 `explain` 查询参数，响应中会出现解释。

## 查询参数

`column_names`

（可选，字符串）如果 `format` 为 `delimited`，则为逗号分隔的列名列表。如果未指定，则使用标题行中的名称；如果没有标题行，则列名默认为 `column1`、`column2` 等。

`delimiter`

（可选，字符串）如果 `format` 为 `delimited`，则为单字符分隔符。默认候选值为逗号、制表符、分号和竖线（`|`）。在默认模式下，所有行必须具有相同的字段数量；如果指定了分隔符，则允许最多 **10%** 的行与第一行不同。

`ecs_compatibility`

（可选，字符串）与 ECS 兼容的 Grok 模式的兼容模式。有效值为 `disabled` 或 `v1`。默认为 `disabled`。主要影响整条消息的 Grok 模式（例如 `%{CATALINALOG}`）。在含义未知时使用通用名称（`path`、`ipaddress`、`field1`、`field2`），这些名称应由用户重命名。

`explain`

（可选，布尔值）默认为 `false`。如果为 `true`，则响应包含一个 `explanation` 字段 — 一个字符串数组，指示结构查找器是如何得出结果的。

`format`

（可选，字符串）文本的高级结构。有效值为 `ndjson`、`xml`、`delimited` 或 `semi_structured_text`。默认情况下由 API 选择。在默认模式下，对于 `delimited` 格式的检测，所有行必须具有相同的字段数量；如果 `format` 为 `delimited` 且未设置分隔符，则 API 允许最多 **5%** 的行具有不同的列数。

`grok_pattern`

（可选，字符串）如果 `format` 为 `semi_structured_text`，则为用于从每条消息中提取字段的 Grok 模式。模式中的时间戳字段名称必须与 `timestamp_field` 匹配（如果未设置该参数，则必须为 `timestamp`）。如果未指定，结构查找器会创建一个 Grok 模式。

`quote`

（可选，字符串）如果 `format` 为 `delimited`，则为对包含换行符或分隔符的值加引号所使用的字符。只能为单字符。默认为 `"`（双引号）。对于不支持加引号的格式的变通方法：将其设置为一个在样本中从未出现的字符。

`should_trim_fields`

（可选，布尔值）如果 `format` 为 `delimited`，则为是否应修剪分隔符之间值的空白字符。如果分隔符为竖线（`|`），默认为 `true`；否则默认为 `false`。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 **25 秒**。结构分析可占用的最长时间；到期后分析会停止。

`timestamp_field`

（可选，字符串）包含每条记录的主要时间戳的字段的名称（在摄取时会填充 `@timestamp`）。对于 `semi_structured_text`，它必须与 Grok 提取名称匹配 — 除非同时设置了 `grok_pattern`，否则最好不要设置。对于结构化文本，该字段必须存在。如果未设置，结构查找器会决定哪个字段（如果有）是主要时间戳；结构化文本不强制要求时间戳。

`timestamp_format`

（可选，字符串）时间戳字段的 Java 时间格式。支持的字母组包括：`a`、`d`、`dd`、`EEE`、`EEEE`、`H`、`HH`、`h`、`M`、`MM`、`MMM`、`MMMM`、`mm`、`ss`、`XX`、`XXX`、`yy`、`yyyy`、`zzz`。在 `ss` 之后支持 `S` 组（秒的小数部分，长度 1-9），由 `.`、`,` 或 `:` 分隔。允许空格和标点符号（`?`、换行符、回车符除外）；允许字面文本放在单引号中（例如 `MM/dd HH.mm.ss,SSSSSS 'in' yyyy`）。在以下情况下很有用：(1) 半结构化文本具有多种时间戳格式，并且你知道哪一种是主要格式，但不想指定完整的 `grok_pattern`；(2) 该格式不在内置集合中。如果未设置，则从内置集合中选择最佳格式。特殊值 `null` 会禁用时间戳检测 — 对于半结构化文本，这会使查找器将各行视为单行消息。

示例时间格式值：

- `yyyy-MM-dd HH:mm:ssZ` → `2019-04-20 13:15:22+0000`
- `EEE, d MMM yyyy HH:mm:ss Z` → `Sat, 20 Apr 2019 13:15:22 +0000`
- `dd.MM.yy HH:mm:ss.SSS` → `20.04.19 13:15:22.285`

## 请求体

`messages`

（必需，字符串数组）要分析的消息列表。

## 示例

以下示例分析一组 Elasticsearch 日志消息：

```txt
POST _text_structure/find_message_structure
{
  "messages": [
    "[2024-03-05T10:52:36,256][INFO ][o.a.l.u.VectorUtilPanamaProvider] [laptop] Java vector incubator API enabled; uses preferredBitSize=128",
    "[2024-03-05T10:52:41,038][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [repository-url]",
    "[2024-03-05T10:52:41,042][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [rest-root]",
    "[2024-03-05T10:52:41,043][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-core]",
    "[2024-03-05T10:52:41,043][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-redact]",
    "[2024-03-05T10:52:41,043][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [ingest-user-agent]",
    "[2024-03-05T10:52:41,044][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-monitoring]",
    "[2024-03-05T10:52:41,044][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [repository-s3]",
    "[2024-03-05T10:52:41,044][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-analytics]",
    "[2024-03-05T10:52:41,044][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-ent-search]",
    "[2024-03-05T10:52:41,044][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-autoscaling]",
    "[2024-03-05T10:52:41,044][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [lang-painless]]",
    "[2024-03-05T10:52:41,059][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [lang-expression]",
    "[2024-03-05T10:52:41,059][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [x-pack-eql]",
    "[2024-03-05T10:52:43,291][INFO ][o.e.e.NodeEnvironment    ] [laptop] heap size [16gb], compressed ordinary object pointers [true]",
    "[2024-03-05T10:52:46,098][INFO ][o.e.x.s.Security         ] [laptop] Security is enabled",
    "[2024-03-05T10:52:47,227][INFO ][o.e.x.p.ProfilingPlugin  ] [laptop] Profiling is enabled",
    "[2024-03-05T10:52:47,259][INFO ][o.e.x.p.ProfilingPlugin  ] [laptop] profiling index templates will not be installed or reinstalled",
    "[2024-03-05T10:52:47,755][INFO ][o.e.i.r.RecoverySettings ] [laptop] using rate limit [40mb] with [default=40mb, read=0b, write=0b, max=0b]",
    "[2024-03-05T10:52:47,787][INFO ][o.e.d.DiscoveryModule    ] [laptop] using discovery type [multi-node] and seed hosts providers [settings]",
    "[2024-03-05T10:52:49,188][INFO ][o.e.n.Node               ] [laptop] initialized",
    "[2024-03-05T10:52:49,199][INFO ][o.e.n.Node               ] [laptop] starting ..."
  ]
}
```

如果请求没有遇到错误，API 返回以下响应：

```json
{
  "num_lines_analyzed": 22,
  "num_messages_analyzed": 22,
  "sample_start": "[2024-03-05T10:52:36,256][INFO ][o.a.l.u.VectorUtilPanamaProvider] [laptop] Java vector incubator API enabled; uses preferredBitSize=128\n[2024-03-05T10:52:41,038][INFO ][o.e.p.PluginsService     ] [laptop] loaded module [repository-url]\n",
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

响应字段说明：

- `num_lines_analyzed` / `num_messages_analyzed`：处理的行数/消息数（此示例中均为 22）。
- `sample_start`：分析的样本文本的起始部分。
- `charset`：检测到的字符集（`UTF-8`）。
- `format`：检测到的高级格式（`semi_structured_text`）。
- `multiline_start_pattern`：标识新（多行）消息开始位置的正则表达式。
- `grok_pattern`：生成的提取 `timestamp` 和 `loglevel` 的 Grok 模式。
- `ecs_compatibility`：使用的 Grok 兼容模式（`disabled`）。
- `timestamp_field`：被识别为主要时间戳的字段（`timestamp`）。
- `joda_timestamp_formats` / `java_timestamp_formats`：检测到的时间戳格式（`ISO8601`）。
- `need_client_timezone`：客户端是否必须提供时区（`true`）。
- `mappings`：建议的 Elasticsearch 索引映射（`@timestamp` 为 date、`loglevel` 为 keyword、`message` 为 text）。
- `ingest_pipeline`：可直接使用的摄取管道（grok → date → remove 处理器）。
- `field_stats`：每个字段的统计信息：`count`、`cardinality`、`top_hits`，对于时间戳字段还包含 `earliest`/`latest`。

有关响应格式的详细说明，或有关分隔文本（CSV）和换行符分隔 JSON 的其他示例，参见获取文本结构 API 的示例。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/find-message-structure.html)
