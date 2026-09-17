# 列出查询规则集 API

返回有关所有已存储查询规则集的信息。将返回每个规则集的规则数量摘要信息，完整详情可通过[获取查询规则集 API](./get_query_ruleset) 命令返回。

```txt
GET _query_rules/
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 查询参数

`from`

（可选，整数）从第一个结果开始获取的偏移量。

`size`

（可选，整数）要检索的最大结果数。

## 示例

以下示例列出所有已配置的查询规则集：

```txt
GET _query_rules/
```

以下示例列出前三个查询规则集：

```txt
GET _query_rules/?from=0&size=3
```

响应示例：

```json
{
    "count": 3,
    "results": [
        {
            "ruleset_id": "ruleset-1",
            "rule_total_count": 1,
            "rule_criteria_types_counts": {
                "exact": 1
            },
            "rule_type_counts": {
                "pinned": 1
            }
        },
        {
            "ruleset_id": "ruleset-2",
            "rule_total_count": 2,
            "rule_criteria_types_counts": {
                "exact": 1,
                "fuzzy": 1
            },
            "rule_type_counts": {
                "pinned": 2
            }
        },
        {
            "ruleset_id": "ruleset-3",
            "rule_total_count": 3,
            "rule_criteria_types_counts": {
                "exact": 1,
                "fuzzy": 2
            },
            "rule_type_counts": {
                "pinned": 2,
                "exclude": 1
            }
        }
    ]
}
```

`rule_criteria_types_counts` 中的计数可能大于 `rule_total_count` 的值，因为一个规则可以具有多个条件。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-query-rulesets.html)
