# 删除查询规则集 API

移除一个查询规则集及其关联数据。这是一个破坏性操作，不可恢复。

```txt
DELETE _query_rules/<ruleset_id>
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<ruleset_id>`

（必需，字符串）要删除的查询规则集的标识符。

## 响应码

- `400`

  未提供 `ruleset_id`。

- `404`（资源缺失）

  找不到与 `ruleset_id` 匹配的查询规则集。

## 示例

以下示例删除名为 `my-ruleset` 的查询规则集：

```txt
DELETE _query_rules/my-ruleset/
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-query-ruleset.html)
