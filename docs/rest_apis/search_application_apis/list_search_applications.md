# 列出搜索应用 API

:::warning Beta

此功能处于 Beta 阶段，可能会发生更改。其设计和代码不如正式 GA 功能成熟，按「原样」提供，不提供任何担保。Beta 功能不受正式 GA 功能的支持 SLA 约束。

:::

返回有关搜索应用的信息。

```txt
GET _application/search_application/
```

## 前置条件

- 需要 `manage_search_application` [集群权限](../security_privileges/cluster_privileges)。

## 查询参数

`q`

（可选，字符串）Lucene 查询字符串语法形式的查询，用于仅返回匹配该查询的搜索应用。

`from`

（可选，整数）从第一个结果开始获取的偏移量。

`size`

（可选，整数）要检索的最大结果数。

## 响应体

`count`

（整数）返回的搜索应用总数。

`results`

（数组）搜索应用对象的数组，每个对象包含：

- `name`（字符串）搜索应用的名称。

- `updated_at_millis`（整数）最后一次更新的时间戳（毫秒）。

## 示例

以下示例列出所有已配置的搜索应用：

```txt
GET _application/search_application/
```

以下示例查询名称以 "app" 开头的前三个搜索应用：

```txt
GET _application/search_application?from=0&size=3&q=app*
```

响应示例：

```json
{
  "count": 2,
  "results": [
    {
      "name": "app-1",
      "updated_at_millis": 1690981129366
    },
    {
      "name": "app-2",
      "updated_at_millis": 1691501823939
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-search-applications.html)
