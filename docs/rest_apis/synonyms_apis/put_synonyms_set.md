# 创建或更新同义词集 API

创建或更新一个同义词集。

```txt
PUT _synonyms/<synonyms_set>
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。

## 描述

:::note 注意

同义词集最多只能包含 **10,000 条同义词规则**。如果你需要管理更多同义词规则，可以创建多个同义词集。

:::

## 路径参数

`<synonyms_set>`

（必需，字符串）要创建的同义词集标识符。其他同义词 API 将使用此标识符来管理该同义词集。

## 请求体

`synonyms_set`

（必需，同义词规则对象的数组）同义词集的同义词规则定义。每个对象包含：

- `id`（可选，字符串）与同义词规则关联的标识符，可通过同义词规则 API 用于管理单条同义词规则。如果未指定，Elasticsearch 会自动创建一个标识符。
- `synonyms`（必需，字符串）同义词规则。必须是 **Solr 格式**，例如：
  - `"i-pod, i pod ⇒ ipod"`
  - `"universe, cosmos"`

## 示例

以下示例创建一个名为 `my-synonyms-set` 的新同义词集：

```txt
PUT _synonyms/my-synonyms-set
{
  "synonyms_set": [
    {
      "id": "test-1",
      "synonyms": "hello, hi"
    },
    {
      "synonyms": "bye, goodbye"
    },
    {
      "id": "test-2",
      "synonyms": "test => check"
    }
  ]
}
```

如果任何同义词规则无效，API 会返回错误。例如：

```txt
PUT _synonyms/my-synonyms-set
{
  "synonyms_set": [
    { "synonyms": "hello => hi => howdy" }
  ]
}
```

API 返回以下错误响应（状态码 400）：

```json
{
  "error": {
    "root_cause": [
      {
        "type": "action_request_validation_exception",
        "reason": "Validation Failed: 1: More than one explicit mapping specified in the same synonyms rule: [hello => hi => howdy];"
      }
    ],
    "type": "action_request_validation_exception",
    "reason": "Validation Failed: 1: More than one explicit mapping specified in the same synonyms rule: [hello => hi => howdy];"
  },
  "status": 400
}
```

## 分析器重新加载

当现有同义词集被**更新**时，使用该同义词集的搜索分析器会**自动在所有索引上重新加载**。这相当于对所有使用该同义词集的索引调用重新加载搜索分析器 API。

示例工作流程：

1. 创建一个包含一条规则的同义词集：

```txt
PUT _synonyms/my-synonyms-set
{
  "synonyms_set": [
    { "id": "test-1", "synonyms": "hello, hi" }
  ]
}
```

2. 创建一个使用该同义词集的索引（注意过滤器上的 `updateable: true` — 这是可重新加载的搜索时同义词所必需的）：

```txt
PUT /test-index
{
  "settings": {
    "analysis": {
      "filter": {
        "synonyms_filter": {
          "type": "synonym_graph",
          "synonyms_set": "my-synonyms-set",
          "updateable": true
        }
      },
      "analyzer": {
        "my_index_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [ "lowercase" ]
        },
        "my_search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [ "lowercase", "synonyms_filter" ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "my_index_analyzer",
        "search_analyzer": "my_search_analyzer"
      }
    }
  }
}
```

3. 更新该同义词集中的规则（将规则 `test-1` 更新为添加 `howdy`）：

```txt
PUT _synonyms/my-synonyms-set
{
  "synonyms_set": [
    { "id": "test-1", "synonyms": "hello, hi, howdy" }
  ]
}
```

## 响应体

重新加载的结果会作为更新响应的一部分包含在内：

```json
{
  "result": "updated",
  "reload_analyzers_details": {
    "_shards": {
      "total": 2,
      "successful": 1,
      "failed": 0
    },
    "reload_details": [
      {
        "index": "test-index",
        "reloaded_analyzers": [ "my_search_analyzer" ],
        "reloaded_node_ids": [ "1wYFZzq8Sxeu_Jvt9mlbkg" ]
      }
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-synonyms-set.html)
