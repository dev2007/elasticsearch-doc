# 获取异步 SQL 搜索 API

返回一个异步 SQL 搜索或已存储的同步 SQL 搜索的结果。

```txt
GET _sql/async/<search_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，只有首次提交该 SQL 搜索的用户可以使用此 API 检索该搜索。

## 描述

有关限制，参见[SQL 限制](/explore_analyze/sql/sql-limitations)。

此 API 返回与 SQL 搜索 API 相同的响应体，响应中通常包含以下字段：

- `id`：异步搜索的标识符（当结果为部分结果且搜索仍在运行或已存储时出现）。
- `is_running`：搜索是否仍在运行。
- `is_partial`：返回的结果是否为部分结果。
- `columns`：列描述符的数组（名称和类型）。
- `values`：行的数组，每行包含各列的值。
- `cursor`：用于检索下一批结果的分页游标。
- `rows`：返回的行数。

## 路径参数

`<search_id>`

（必需，字符串）搜索的标识符。

## 查询参数

`delimiter`

（可选，字符串）默认为 `,`。CSV 结果的分隔符。仅支持 CSV 响应。

`format`

（必需，字符串）响应的格式。必须通过此参数或 `Accept` HTTP 请求头指定；如果两者都提供，此参数优先。有效值参见[响应数据格式](/explore_analyze/sql/rest)。

`keep_alive`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）搜索及其结果的保留期限。默认为原始 SQL 搜索的 `keep_alive` 期限。

`wait_for_completion_timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）等待完整结果的期限。默认为**无超时**（请求会等待完整的搜索结果）。

## 示例

以下示例检索一个异步 SQL 搜索的结果：

```txt
GET _sql/async/FmdMX2pIang3UWhLRU5QS0lqdlppYncaMUpYQ05oSkpTc3kwZ21EdC1tbFJXQToxOTI=?format=json
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-async-sql-search-api.html)
