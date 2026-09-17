# 获取查询规则集 API

检索有关查询规则集的信息。

```txt
GET _query_rules/<ruleset_id>
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<ruleset_id>`

（必需，字符串）要检索的查询规则集的标识符。

## 响应码

- `400`

  未提供 `ruleset_id`。

- `404`（资源缺失）

  找不到与 `ruleset_id` 匹配的查询规则集。

## 示例

以下示例获取名为 `my-ruleset` 的查询规则集：

```txt
GET _query_rules/my-ruleset/
```

响应示例：

```json
{
    "ruleset_id": "my-ruleset",
    "rules": [
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
        },
        {
            "rule_id": "my-rule2",
            "type": "pinned",
            "criteria": [
                {
                    "type": "fuzzy",
                    "metadata": "query_string",
                    "values": [ "rescue dogs" ]
                }
            ],
            "actions": {
                "docs": [
                    {
                        "_index": "index1",
                        "_id": "id3"
                    },
                    {
                        "_index": "index2",
                        "_id": "id4"
                    }
                ]
            }
        }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-query-ruleset.html)
