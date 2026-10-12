# 创建或更新同义词规则 API

为一个同义词集创建或更新同义词规则。

```txt
PUT _synonyms/<synonyms_set>/<synonym_rule>
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。

## 路径参数

`<synonyms_set>`

（必需，字符串）要更新的同义词集标识符。

`<synonym_rule>`

（必需，字符串）要创建或更新的同义词规则标识符。

## 请求体

`synonyms`

（必需，字符串）同义词规则定义。必须是 **Solr 格式**，例如：

- `"i-pod, i pod ⇒ ipod"`
- `"universe, cosmos"`

## 响应体

`result`

操作的结果（例如 `updated`）。

`reload_analyzers_details`

有关哪些分片/索引被重新加载的详细信息，包括受影响的 `index`、`reloaded_analyzers` 和 `reloaded_node_ids`。

## 示例

以下示例更新同义词集 `my-synonyms-set` 中名为 `test-1` 的现有同义词规则：

```txt
PUT _synonyms/my-synonyms-set/test-1
{
  "synonyms": "hello, hi, howdy"
}
```

API 返回以下响应：

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

:::note 注意

使用此同义词集的所有分析器都会被自动重新加载，以反映新规则。如果任何包含的同义词规则无效，API 会返回错误。

:::

以下示例展示了一条无效规则（错误情况）：

```txt
PUT _synonyms/my-synonyms-set/test-1
{
  "synonyms": "hello => hi => howdy"
}
```

API 返回以下错误响应（HTTP 400）：

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

出现此错误是因为单个同义词规则不能包含多于一个显式（`=>`）映射。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-synonym-rule.html)
