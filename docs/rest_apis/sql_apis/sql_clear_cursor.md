# 清除 SQL 游标 API

清除 SQL 搜索游标。

```txt
POST _sql/close
```

## 描述

此 API 用于清除 SQL 搜索游标。它用于显式关闭/释放由分页 SQL 搜索返回的游标，以释放相关资源。

有关限制，参见[SQL 限制](/explore_analyze/sql/sql-limitations)。

## 请求体

`cursor`

（必需，字符串）要清除的游标。

## 响应体

`succeeded`

（布尔值）指示游标是否已成功清除。

## 示例

以下示例清除一个 SQL 搜索游标：

```txt
POST _sql/close
{
  "cursor": "sDXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAEWYUpOYklQMHhRUEtld3RsNnFtYU1hQQ==:BAFmBGRhdGUBZgVsaWtlcwFzB21lc3NhZ2UBZgR1c2Vy9f///w8="
}
```

API 返回以下响应：

```json
{
  "succeeded": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/clear-sql-cursor-api.html)
