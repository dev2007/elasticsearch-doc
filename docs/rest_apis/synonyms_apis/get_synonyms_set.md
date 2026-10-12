# 获取同义词集 API

检索一个同义词集。

```txt
GET _synonyms/<synonyms_set>
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。

## 路径参数

`<synonyms_set>`

（必需，字符串）要检索的同义词集标识符。

## 查询参数

`from`

（可选，整数）默认为 `0`。要检索的同义词规则的起始偏移量。

`size`

（可选，整数）默认为 `10`。要检索的同义词规则的最大数量。

## 响应码

- `400`：未提供 `synonyms_set` 标识符。
- `404`：未找到标识符为 `synonyms_set` 的同义词集（缺少资源）。

## 响应体

`count`

（整数）该同义词集包含的同义词规则的总数。

`synonyms_set`

（数组）根据 `from` 和 `size` 参数返回的同义词规则。每个元素包含：

- `id`：单条同义词规则的标识符。
- `synonyms`：同义词规则本身（例如 `"hello, hi"` 或 `"test => check"`）。

## 示例

以下示例检索名为 `my-synonyms-set` 的同义词集：

```txt
GET _synonyms/my-synonyms-set
```

API 返回以下响应：

```json
{
  "count": 3,
  "synonyms_set": [
    {
      "id": "test-1",
      "synonyms": "hello, hi"
    },
    {
      "id": "test-2",
      "synonyms": "bye, goodbye"
    },
    {
      "id": "test-3",
      "synonyms": "test => check"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-synonyms-set.html)
