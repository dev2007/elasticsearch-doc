# 获取查询规则 API

检索单个查询规则集内某个查询规则的信息。

```txt
GET _query_rules/<ruleset_id>/_rule/<rule_id>
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<ruleset_id>`

（必需，字符串）包含此规则的查询规则集的标识符。

`<rule_id>`

（必需，字符串）要检索的查询规则的标识符。

## 响应码

- `400`

  缺少 `ruleset_id` 或 `rule_id`，或两者都缺少。

- `404`（资源缺失）

  找不到与 `ruleset_id` 匹配的查询规则集，或在该规则集内找不到与 `rule_id` 匹配的规则。

## 示例

以下示例从名为 `my-ruleset` 的规则集中获取 ID 为 `my-rule1` 的查询规则：

```txt
GET _query_rules/my-ruleset/_rule/my-rule1
```

响应示例：

```json
{
    "rule_id": "my-rule1",
    "type": "pinned",
    "criteria": [
        {
            "type": "contains",
            "metadata": "query_string",
            "values": [ "pugs", "puggles" ]
        }
    ],
    "actions": {
        "ids": [
            "id1",
            "id2"
        ]
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-query-rule.html)
