# 删除异步 SQL 搜索 API

删除一个异步 SQL 搜索或已存储的同步 SQL 搜索。

```txt
DELETE _sql/async/delete/<search_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，只有以下用户可以使用此 API 删除搜索：
  - 具有 `cancel_task` 集群权限的用户。
  - 首次提交该搜索的用户。

## 描述

:::important 重要

如果该搜索仍在运行，此 API 会将其取消。

:::

## 路径参数

`<search_id>`

（必需，字符串）搜索的标识符。

## 示例

以下示例删除一个异步 SQL 搜索：

```txt
DELETE _sql/async/delete/FkpMRkJGS1gzVDRlM3g4ZzMyRGlLbkEaTXlJZHdNT09TU2VTZVBoNDM3cFZMUToxMDM=
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-async-sql-search-api.html)
