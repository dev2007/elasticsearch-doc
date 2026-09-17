# 测试查询规则集 API

根据查询规则集评估匹配条件，识别会匹配该条件的规则。

:::warning 技术预览

此功能处于技术预览阶段，可能会在未来版本中更改或删除。Elastic 将努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。

:::

```txt
POST _query_rules/<ruleset_id>/_test
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<ruleset_id>`

（必需，字符串）要测试的查询规则集的标识符。

## 请求体

`match_criteria`

（必需，对象）定义要应用于给定查询规则集中规则的匹配条件。匹配条件应与规则的 `criteria.metadata` 字段中定义的键匹配。

## 响应码

- `400`

  未提供 `ruleset_id` 或 `match_criteria`。

- `404`（资源缺失）

  找不到与 `ruleset_id` 匹配的查询规则集。

## 示例

要测试规则集，请提供要测试的匹配条件：

```json
POST _query_rules/my-ruleset/_test
{
    "match_criteria": {
        "query_string": "puggles"
    }
}
```

响应示例：

```json
{
    "total_matched_rules": 1,
    "matched_rules": [
        {
            "ruleset_id": "my-ruleset",
            "rule_id": "my-rule1"
        }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/test-query-ruleset.html)
