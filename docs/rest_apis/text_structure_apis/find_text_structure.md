# 获取文本结构 API

查找文本的结构。

```txt
POST _text_structure/find_structure
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor_text_structure` 或 `monitor` 集群权限。

## 描述

该文本必须包含适合摄取到 Elastic Stack 中的数据。此 API 为以适合后续与其他 Elastic Stack 功能配合使用的格式将数据摄取到 Elasticsearch 提供了一个起点。

与其他 Elasticsearch 端点不同，发布的数据**不需要**是 UTF-8 编码或 JSON。但它必须是文本；不支持二进制文本格式。

响应中包含：

- 文本开头的几条消息。
- 揭示所有字段的最常见值以及数值字段的基本数值统计信息的统计数据。
- 有关文本结构的信息（这在编写摄取配置时非常有用）。
- 用于摄取该文本的适当 Elasticsearch 索引映射。

所有信息都可以**无需指导**地计算出来，但查询参数可以覆盖某些决策。如果结果不符合预期，请使用 `explain` 查询参数；它会在响应中添加一个解释数组。

## 查询参数

`charset`

（可选，字符串）文本的字符集；必须为 JVM 所支持（例如 `UTF-8`、`UTF-16LE`、`windows-1252`、`EUC-JP`）。如果未指定，结构查找器会选择一个。

`column_names`

（可选，字符串）如果 `format` 为 `delimited`，则为逗号分隔的列名列表。如果未设置，则使用标题行中的名称；如果没有标题行，则列名默认为 "column1"、"column2" 等。

`delimiter`

（可选，字符串）如果 `format` 为 `delimited`，则为单字符分隔符。会考虑的默认候选值为逗号、制表符、分号和竖线（`|`）— 此时所有行必须具有相同的字段数量。如果指定了分隔符，则允许最多 10% 的行的列数与第一行不同。

`ecs_compatibility`

（可选，字符串）与 ECS 兼容的 Grok 模式模式。有效值为 `disabled`（默认）和 `v1`。它影响整条消息的 Grok 模式（例如 `%{CATALINALOG}`）。如果识别出某种结构但含义未知，则使用通用名称（`path`、`ipaddress`、`field1`、`field2`），应由用户重命名。

`explain`

（可选，布尔值）默认为 `false`。如果为 `true`，则响应包含一个字符串数组 `explanation`，指示结果是如何产生的。

`format`

（可选，字符串）文本的高级结构：`ndjson`、`xml`、`delimited` 或 `semi_structured_text`。默认由 API 选择。在默认模式下，对于 `delimited` 格式的检测，所有行必须具有相同的字段数量；如果设置了 `delimited` 且未设置分隔符，则允许最多 5% 的行与第一行不同。

`grok_pattern`

（可选，字符串）如果 `format` 为 `semi_structured_text`，则为用于从每条消息中提取字段的 Grok 模式。模式中的时间戳字段名称必须与 `timestamp_field` 匹配（如果未设置该参数，则必须为 `timestamp`）。如果未指定，结构查找器会创建一个 Grok 模式。

`has_header_row`

（可选，布尔值）如果 `format` 为 `delimited`，则为列名是否位于第一行。如果未设置，查找器会根据第一行与其他行的相似程度进行猜测。

`line_merge_size_limit`

（可选，无符号整数）在为半结构化文本分析合并行时，单条消息的最大字符数。默认为 `10000`。对于非常长的消息可以增大该值（需谨慎 — 误检的分组可能会导致处理时间过长）。

`lines_to_sample`

（可选，无符号整数）从文本开头开始要分析的行数。最小值为 `2`；默认为 `1000`。如果该值大于行数，则对所有行进行分析。前 1000 行的多样性越高，比采样 100,000 行的效率更高。

`quote`

（可选，字符串）如果 `format` 为 `delimited`，则为对包含换行符或分隔符的值加引号所使用的字符。只能为单字符。默认为双引号（`"`）。对于不支持加引号的格式的变通方法：将其设置为一个在样本中从未出现的字符。

`should_trim_fields`

（可选，布尔值）如果 `format` 为 `delimited`，则为是否应修剪分隔符之间的空白字符。如果分隔符为竖线（`|`），默认为 `true`；否则默认为 `false`。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）分析的最长时间；超过后分析会停止。默认为 `25s`。

`timestamp_field`

（可选，字符串）包含每条记录的主要时间戳的字段的名称（用于填充 `@timestamp`）。对于 `semi_structured_text`，它必须与 `grok_pattern` 的提取名称匹配 — 除非同时指定了 `grok_pattern`，否则最好不要指定。对于结构化文本，该字段必须存在。如果未设置，查找器会决定；结构化文本不强制要求时间戳。

`timestamp_format`

（可选，字符串）时间戳字段的 Java 时间格式。支持的字母组包括：`a`、`d`、`dd`、`EEE`、`EEEE`、`H`、`HH`、`h`、`M`、`MM`、`MMM`、`MMMM`、`mm`、`ss`、`XX`、`XXX`、`yy`、`yyyy`、`zzz`。在 `ss` 之后支持 `S` 组（秒的小数部分，长度 1-9），由 `.`、`,` 或 `:` 分隔。允许空格和标点符号（`?`、换行符、回车符除外）；字面文本需放在单引号中（例如 `MM/dd HH.mm.ss,SSSSSS 'in' yyyy`）。适用于半结构化文本包含多种时间戳格式或格式不是默认格式的情况。特殊值 `null` 会禁用时间戳搜索（半结构化文本随后会被视为单行消息）。示例映射：

- `yyyy-MM-dd HH:mm:ssZ` → `2019-04-20 13:15:22+0000`
- `EEE, d MMM yyyy HH:mm:ss Z` → `Sat, 20 Apr 2019 13:15:22 +0000`
- `dd.MM.yy HH:mm:ss.SSS` → `20.04.19 13:15:22.285`

## 请求体

要分析的文本。必须适合摄取到 Elasticsearch 中；不必是 JSON 或 UTF-8。大小受 Elasticsearch HTTP 接收缓冲区大小限制（默认为 **100 Mb**）。

## 响应体

- `num_lines_analyzed`：分析的行数。
- `num_messages_analyzed`：这些行包含的不同消息的数量。对于 NDJSON，与行数相同；对于其他格式，一条消息可能跨越多行。
- `sample_start`：逐字复制文本的前两条消息（有助于诊断解析错误或错误的文件上传）。
- `charset`：用于解析文本的字符编码。
- `has_byte_order_marker`：对于 UTF 编码，指示文本是否以 BOM（字节顺序标记）开头。
- `format`：`ndjson`、`xml`、`delimited` 或 `semi_structured_text` 之一。
- `ecs_compatibility`：`disabled` 或 `v1`；默认为 `disabled`。
- `multiline_start_pattern`：（半结构化/分隔文本）标识每条多行消息第一行的模式。
- `exclude_lines_pattern`：（CSV 示例）要排除的行（例如标题行）的模式。
- `column_names`：（分隔文本）按样本顺序排列的列名。
- `has_header_row`：（分隔文本）第一行是否为列名。
- `delimiter` / `quote`：（分隔文本）检测到的分隔符和引号。
- `grok_pattern`：（半结构化文本）提取时间戳以及所有消息公共字段的 Grok 模式。
- `timestamp_field`：被认为最可能是主要时间戳的字段。
- `joda_timestamp_formats`：用于 Logstash 时间戳解析。
- `java_timestamp_formats`：时间字段中识别出的 Java 时间格式；由 Elasticsearch 映射和摄取管道使用。
- `need_client_timezone`：当检测到的时间戳格式不包含时区时为 `true`（客户端必须告知服务器正确的时区）；当格式包含时区时为 `false`。
- `mappings`：适合的索引映射（例如 `@timestamp` 为 date；当 `release_date` 不够具体无法确定为 date 类型时，它会保留为 keyword）。
- `ingest_pipeline`：描述为 "Ingest pipeline created by text structure finder" 的摄取管道及其处理器（例如 `csv`、`grok`、带 `"timezone": "{{ event.timezone }}"` 的 `date`、`convert`、`remove`）。
- `field_stats`：每个字段的 `count`、`cardinality`、`top_hits`（最常见的值及其计数）；对于数值字段还包含 `min_value`、`max_value`、`mean_value`、`median_value`；对于日期字段还包含 `earliest`/`latest`。这些是提示数据清洗/转换需求的线索。

## 示例

以下示例分析换行符分隔的 JSON（NDJSON）图书数据：

```txt
POST _text_structure/find_structure
{"name": "Leviathan Wakes", "author": "James S.A. Corey", "release_date": "2011-06-02", "page_count": 561}
{"name": "Hyperion", "author": "Dan Simmons", "release_date": "1989-05-26", "page_count": 482}
{"name": "Dune", "author": "Frank Herbert", "release_date": "1965-06-01", "page_count": 604}
...（共 24 条图书记录）
```

API 返回以下响应（关键字段）：

```json
{
  "num_lines_analyzed": 24,
  "num_messages_analyzed": 24,
  "charset": "UTF-8",
  "has_byte_order_marker": false,
  "format": "ndjson",
  "ecs_compatibility": "disabled",
  "timestamp_field": "release_date",
  "joda_timestamp_formats": [ "ISO8601" ],
  "java_timestamp_formats": [ "ISO8601" ],
  "need_client_timezone": true,
  "mappings": {
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "author": {
        "type": "keyword"
      },
      "name": {
        "type": "keyword"
      },
      "page_count": {
        "type": "long"
      },
      "release_date": {
        "type": "date",
        "format": "iso8601"
      }
    }
  },
  "ingest_pipeline": {
    "description": "Ingest pipeline created by text structure finder",
    "processors": [
      {
        "date": {
          "field": "release_date",
          "timezone": "{{ event.timezone }}",
          "formats": [ "ISO8601" ]
        }
      }
    ]
  },
  "field_stats": {
    "author": {
      "count": 24,
      "cardinality": 20,
      "top_hits": [
        { "value": "Frank Herbert", "count": 4 },
        { "value": "Robert A. Heinlein", "count": 2 }
      ]
    },
    "name": {
      "count": 24,
      "cardinality": 24
    },
    "page_count": {
      "count": 24,
      "cardinality": 24,
      "min_value": 180,
      "max_value": 768,
      "mean_value": 387.08,
      "median_value": 329.5
    },
    "release_date": {
      "count": 24,
      "cardinality": 20,
      "earliest": "1932-06-01",
      "latest": "2011-06-02"
    }
  }
}
```

原文档还提供了以下示例场景：

- **分析纽约黄色出租车 CSV 数据**：`format` 为 `delimited`，检测到 17 个 `column_names`、`has_header_row` 为 `true`、分隔符为 `"`、`quote` 为 `"`；`num_lines_analyzed` 为 20000，`num_messages_analyzed` 为 19998（标题行和空行不计为消息）；`timestamp_field` 选择 `tpep_pickup_datetime`（因为它在列顺序中最先出现，`tpep_dropoff_datetime` 也可胜任 — 可通过 `timestamp_field` 参数强制指定）；摄取管道包含 `csv`、`date`、一系列 `convert`（long/double）处理器，最后是 `remove` 处理器。注意即使对于非 JSON 数据也必须设置 `Content-Type: application/json` 请求头；引号字符为默认的双引号 — 查找器不会推断其他引号字符，如不同请通过 `quote` 参数指定。
- **设置 `timeout` 参数**：超时时返回 `timeout_exception` 错误（状态码 500），reason 说明在哪个分析阶段中止（例如 "Aborting structure analysis during [delimited record parsing]"）。注意 curl 的整体运行时间会超过 1 秒，因为下载 200,000 行需要时间 — 超时是从端点开始处理数据时计算的。
- **分析 Elasticsearch 日志文件**：`format` 为 `semi_structured_text`，生成 `multiline_start_pattern`（时间戳位于每条多行消息的开头）和 `grok_pattern`（仅提取时间戳和日志级别）；摄取管道为 `grok` → `date` → `remove` 处理器。
- **通过查询参数指定 `grok_pattern`**：使用更完整的 Grok 模式后，输出的 `grok_pattern` 为查询参数中提供的模式；返回的 `field_stats` 会包含额外字段（`class`、`node`）的条目，映射中会将它们添加为 `keyword`。注意 URL 转义很麻烦 — 在交互式环境中，最好使用 UI。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/find-structure.html)
