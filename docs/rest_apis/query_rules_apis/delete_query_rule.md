# 删除查询规则 API

移除现有查询规则集内的单个查询规则。这是一个破坏性操作，只能通过[创建或更新查询规则 API](./put_query_rule) 重新添加相同的规则来恢复。

```txt
DELETE _query_rules/<ruleset_id>/_rule/<rule_id>
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<ruleset_id>`

（必需，字符串）包含此规则的查询规则集的标识符。

`<rule_id>`

（必需，字符串）要删除的查询规则的标识符。

## 响应码

- `400`

  缺少 `ruleset_id`、`rule_id`，或两者都缺少。

- `404`（资源缺失）

  找不到与 `ruleset_id` 匹配的查询规则集，或在该规则集内找不到与 `rule_id` 匹配的规则。

## 示例

以下示例从名为 `my-ruleset` 的查询规则集中删除 ID 为 `my-rule1` 的查询规则：

```txt
DELETE _query_rules/my-ruleset/_rule/my-rule1
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-query-rule.html)
