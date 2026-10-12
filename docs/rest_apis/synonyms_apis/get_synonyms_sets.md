# 列出同义词集 API

检索所有已定义同义词集的摘要。

```txt
GET _synonyms
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。

## 描述

此 API 允许你检索已定义的同义词集的总数。对于每个同义词集，它会返回其**标识符**以及**已定义同义词规则的总数**。

## 查询参数

`from`

（可选，整数）默认为 `0`。要检索的同义词集的起始偏移量。

`size`

（可选，整数）默认为 `10`。指定要检索的同义词集的最大数量。

## 响应体

`count`

（整数）已定义的同义词集的总数。

`results`

（数组）同义词集列表（根据 `from`/`size` 分页），每个元素包含：

- `synonyms_set`：同义词集的标识符（名称）。
- `count`：该同义词集中定义的同义词规则的总数。

## 示例

以下示例检索所有同义词集的摘要：

```txt
GET _synonyms
```

API 返回以下响应：

```json
{
  "count": 3,
  "results": [
    {
      "synonyms_set": "ecommerce-synonyms",
      "count": 2
    },
    {
      "synonyms_set": "my-synonyms-set",
      "count": 3
    },
    {
      "synonyms_set": "new-ecommerce-synonyms",
      "count": 1
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-synonyms-sets.html)
