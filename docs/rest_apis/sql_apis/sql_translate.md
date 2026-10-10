# SQL 转换 API

SQL 转换 API 将一个 SQL 搜索转换为包含 Query DSL 的搜索 API 请求。

```txt
GET _sql/translate
POST _sql/translate
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对所搜索的数据流、索引或别名具有 `read` 索引权限。

## 描述

有关限制，参见[SQL 限制](/explore_analyze/sql/sql-limitations)。

## 请求体

SQL 转换 API 接受与 SQL 搜索 API 相同的请求体参数，**但不包括 `cursor`**。

## 响应体

SQL 转换 API 返回与搜索 API 相同的响应体 — 即转换后的 Elasticsearch Query DSL 搜索请求。

## 示例

以下示例将一个 SQL 查询转换为 Elasticsearch Query DSL：

```txt
POST _sql/translate
{
  "query": "SELECT * FROM library ORDER BY page_count DESC",
  "fetch_size": 10
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/sql-translate-api.html)
