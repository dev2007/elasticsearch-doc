# 获取同义词规则 API

从同义词集中检索一条同义词规则。

```txt
GET _synonyms/<synonyms_set>/<synonym_rule>
```

## 前置条件

- 此 API 需要 `manage_search_synonyms` 集群权限。

## 路径参数

`<synonyms_set>`

（必需，字符串）要从中检索同义词规则的同义词集标识符。

`<synonym_rule>`

（必需，字符串）要检索的同义词规则标识符。

## 响应码

- `404`（缺少资源）：未找到 `synonyms_set` 标识符对应的同义词集，**或者**在该同义词集中未找到 `synonym_rule` 指定的同义词规则。

## 响应体

`id`

同义词规则的标识符。

`synonyms`

同义词规则定义（例如一个逗号分隔的等价词列表）。

## 示例

以下示例检索同义词集 `my-synonyms-set` 中的规则 `test-1`：

```txt
GET _synonyms/my-synonyms-set/test-1
```

API 返回以下响应：

```json
{
  "id": "test-1",
  "synonyms": "hello, hi"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-synonym-rule.html)
