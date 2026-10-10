# SQL 搜索 API

返回一个 SQL 搜索的结果。

```txt
GET _sql
POST _sql
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对所搜索的数据流、索引或别名具有读取索引权限。

## 描述

有关限制，参见[SQL 限制](/explore_analyze/sql/sql-limitations)。

## 查询参数

`delimiter`

（可选，字符串）默认为 `,`。CSV 结果的分隔符。仅支持 CSV 响应。

`format`

（可选，字符串）响应的格式。有效值参见[响应数据格式](/explore_analyze/sql/rest)。也可以通过 `Accept` HTTP 请求头设置；如果两者都指定，此参数优先。

## 请求体

`allow_partial_search_results`

（可选，布尔值）默认为 `false`。如果为 `true`，则在存在分片请求超时或分片失败时返回部分结果。如果为 `false`，则返回错误且不提供部分结果。

`catalog`

（可选，字符串）查询的默认目录（集群）。如果未指定，查询仅在本地集群上执行。**[技术预览]** — 此功能可能会被更改或移除；不受 GA 支持 SLA 约束。参见跨集群搜索。

`columnar`

（可选，布尔值）默认为 `false`。如果为 `true`，则以列式格式返回结果。仅支持 CBOR、JSON、SMILE 和 YAML 响应。参见[列式结果](/explore_analyze/sql/rest)。

`cursor`

（可选，字符串）用于检索一组分页结果的游标。如果指定了此参数，API 仅使用 `columnar` 和 `time_zone` 请求体参数，所有其他参数将被忽略。

`fetch_size`

（可选，整数）默认为 `1000`。响应中要返回的最大行数。

`field_multi_value_leniency`

（可选，布尔值）默认为 `false`。如果为 `false`，则对于包含数组值的字段，API 会返回错误。如果为 `true`，则返回数组中的第一个值，但不保证结果的一致性。

`filter`

（可选，对象）用于筛选 SQL 搜索文档的 Query DSL。参见[使用 Elasticsearch Query DSL 进行筛选](/explore_analyze/sql/rest)。

`index_include_frozen`

（可选，布尔值）默认为 `false`。如果为 `true`，则搜索可以在冻结索引上运行。

`keep_alive`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `5d`。异步或已保存同步搜索的保留期限。

`keep_on_completion`

（可选，布尔值）默认为 `false`。如果为 `true`，则当你同时指定了 `wait_for_completion_timeout` 时，Elasticsearch 会存储同步搜索。如果为 `false`，则仅存储在超时前未完成的异步搜索。

`page_timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `45s`。滚动游标（scroll cursor）的最小保留期限。超过此期限后，分页请求可能会因为滚动游标不再可用而失败。后续的滚动请求会以 `page_timeout` 的时长延长游标的生命周期。

`params`

（可选，数组）查询中参数的值。有关语法，参见[向查询传递参数](/explore_analyze/sql/rest)。

`query`

（必需，对象）要运行的 SQL 查询。有关语法，参见[SQL 语言](/explore_analyze/sql/sql-language)。

`request_timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `90s`。请求失败前的超时时间。

`time_zone`

（可选，字符串）默认为 `Z`（UTC）。搜索使用的 ISO-8601 时区 ID。多个 SQL 日期/时间函数使用此时区。

`wait_for_completion_timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）无超时（默认）。等待完整结果的期限。如果搜索在此期限内未完成，则变为异步。要保存一个同步搜索，你必须同时指定此参数和 `keep_on_completion`。

`runtime_mappings`

（可选，对象的对象）在搜索请求中定义一个或多个运行时字段。这些字段优先于同名的映射字段。

`runtime_mappings` 对象的属性 — `<field-name>`

（必需，对象）运行时字段的配置；键为字段名称，包含：

- `type`（必需，字符串）字段类型 — 以下之一：`boolean`、`composite`、`date`、`double`、`geo_point`、`ip`、`keyword`、`long`、`lookup`。
- `script`（可选，字符串）在查询时执行的 Painless 脚本。它可以访问整个文档上下文，包括原始 `_source` 以及任何映射字段及其值。必须包含 `emit` 以返回计算后的值，例如：

```json
"script": "emit(doc['@timestamp'].value.dayOfWeekEnum.toString())"
```

## 响应体

SQL 搜索 API 支持多种响应格式。大多数格式使用表格布局。**JSON 响应**包含以下属性：

`id`

搜索的标识符。仅对异步搜索和已保存的同步搜索返回。对于 CSV/TSV/TXT 响应，通过 `Async-ID` HTTP 请求头返回。

`is_running`

（布尔值）如果为 `true`，则搜索仍在运行；如果为 `false`，则已完成。仅对异步搜索和已保存的同步搜索返回。对于 CSV/TSV/TXT 响应，通过 `Async-partial` HTTP 请求头返回。

`is_partial`

（布尔值）如果为 `true`，则响应不包含完整的结果。如果 `is_partial` 为 `true` 且 `is_running` 为 `true`，则搜索仍在运行。如果 `is_partial` 为 `true` 但 `is_running` 为 `false`，则结果因失败或超时而是部分结果。仅对异步搜索和已保存的同步搜索返回。对于 CSV/TSV/TXT 响应，通过 `Async-partial` HTTP 请求头返回。

`rows`

（数组的数组）搜索结果的值。

`columns`

（对象数组）搜索结果的列标题；每个对象为一列，包含：

- `name`：列的名称。
- `type`：列的数据类型。

`cursor`

用于下一组分页结果的游标。对于 CSV/TSV/TXT 响应，通过 `Cursor` HTTP 请求头返回。

## 示例

以下示例运行一个 SQL 查询，返回 `library` 索引中按 `page_count` 降序排列的前 5 行结果：

```txt
POST _sql?format=txt
{
  "query": "SELECT * FROM library ORDER BY page_count DESC LIMIT 5"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/sql-search-api.html)
