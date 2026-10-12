# 删除同义词规则 API

从同义词集中删除单条同义词规则。

```txt
DELETE _synonyms/<synonyms_set>/<synonym_rule>
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。

## 路径参数

`<synonyms_set>`

（必需，字符串）要更新的同义词集标识符。

`<synonym_rule>`

（必需，字符串）要删除的同义词规则标识符。

## 响应码

- `404`（缺少资源）：未找到 `synonyms_set` 标识符对应的同义词集，或者在该同义词集中未找到 `synonym_rule` 指定的同义词规则。

## 分析器重新加载

使用受影响的同义词集的所有分析器都会被**自动重新加载**，以反映被删除的规则。响应中包含描述哪些索引/分析器被重新加载的 `reload_analyzers_details`。

## 响应体

`result`

操作的结果，`deleted` 确认规则已被移除。

`reload_analyzers_details`

分片级状态以及每个索引的重新加载详细信息，列出索引、重新加载的分析器以及发生重新加载的节点 ID。

## 示例

以下示例删除同义词集 `my-synonyms-set` 中名为 `test-1` 的现有同义词规则：

```txt
DELETE _synonyms/my-synonyms-set/test-1
```

API 返回以下响应：

```json
{
  "result": "deleted",
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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-synonym-rule.html)
