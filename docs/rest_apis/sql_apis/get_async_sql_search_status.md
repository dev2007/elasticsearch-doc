# 获取异步 SQL 搜索状态 API

返回一个异步 SQL 搜索或已存储的同步 SQL 搜索的当前状态。

```txt
GET _sql/async/status/<search_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor` 集群权限才能使用此 API。

## 描述

有关限制，参见[SQL 限制](/explore_analyze/sql/sql-limitations)。

## 路径参数

`<search_id>`

（必需，字符串）搜索的标识符。

## 响应体

`id`

搜索的标识符。

`is_running`

（布尔值）如果为 `true`，则搜索仍在运行。如果为 `false`，则搜索已完成。

`is_partial`

（布尔值）如果为 `true`，则响应不包含完整的搜索结果。如果 `is_partial` 为 `true` 且 `is_running` 为 `true`，则搜索仍在运行。如果 `is_partial` 为 `true` 但 `is_running` 为 `false`，则结果因失败或超时而是部分结果。

`start_time_in_millis`

（整数）搜索开始的时间戳（自 Unix 纪元以来的毫秒数）。仅对正在运行的搜索返回。

`expiration_time_in_millis`

（整数）Elasticsearch 将删除该搜索及其结果的时间戳（自 Unix 纪元以来的毫秒数），即使搜索仍在运行。

`completion_status`

（整数）搜索的 HTTP 状态码。仅对已完成的搜索返回。

## 示例

以下示例检索一个异步 SQL 搜索的状态：

```txt
GET _sql/async/status/FmdMX2pIang3UWhLRU5QS0lqdlppYncaMUpYQ05oSkpTc3kwZ21EdC1tbFJXQToxOTI=?format=json
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-async-sql-search-status-api.html)
