# 创建或更新查询规则集 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [查询规则 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-query-rules)。

:::::

创建或更新一个查询规则集。

## 请求

```bash
PUT _query_rules/<ruleset_id>
```

## 前置条件

- 需要 `manage_search_query_rules` 权限。

## 路径参数

- `<ruleset_id>`

  （必需，字符串）规则集的唯一标识符。

## 请求体

- `rules`

  （必需，对象数组）此查询规则集中包含的特定规则。

  每个规则集最多 100 个规则。可以通过 `xpack.applications.rules.max_rules_per_ruleset` 集群设置增加到最多 1000 个。

  每个规则必须包含以下信息：

  - `rule_id`（必需，字符串）规则的唯一标识符。
  - `type`（必需，字符串）规则类型。目前仅允许 `pinned`（固定）和 `exclude`（排除）查询规则类型。
  - `criteria`（必需，对象数组）规则应用必须满足的条件。如果指定多个条件，所有条件都必须满足才能应用规则。
  - `actions`（必需，对象）规则匹配时采取的操作。操作格式取决于规则类型。

  条件必须包含以下信息：

  - `type`（必需，字符串）条件类型。支持以下条件类型：

    - `exact`：仅精确匹配满足规则定义的条件。适用于字符串或数值。
    - `fuzzy`：精确匹配或允许的 Levenshtein 编辑距离内的匹配满足条件。仅适用于字符串。
    - `prefix`：以此值开头的匹配满足条件。仅适用于字符串。
    - `suffix`：以此值结尾的匹配满足条件。仅适用于字符串。
    - `contains`：包含此值的匹配满足条件。仅适用于字符串。
    - `lt`：值小于此值的匹配满足条件。仅适用于数值。
    - `lte`：值小于或等于此值的匹配满足条件。仅适用于数值。
    - `gt`：值大于此值的匹配满足条件。仅适用于数值。
    - `gte`：值大于或等于此值的匹配满足条件。仅适用于数值。
    - `always`：匹配所有查询，无论输入如何。

  - `metadata`（可选，字符串）要匹配的元数据字段。用于匹配规则查询中发送的 `match_criteria`。除 `always` 外所有条件类型都需要。
  - `values`（可选，字符串数组）与元数据字段匹配的值。只需一个值匹配即可满足条件。除 `always` 外所有条件类型都需要。

  操作取决于规则类型。以下操作适用于 `pinned` 或 `exclude` 规则：

  - `ids`（可选，字符串数组）应用规则的文档唯一 ID。只能指定 `ids` 或 `docs` 之一，且至少必须指定一个。
  - `docs`（可选，对象数组）应用规则的文档。只能指定 `ids` 或 `docs` 之一，且至少必须指定一个。每个规则最多 100 个文档。每个文档可指定以下属性：
    - `_index`（必需，字符串）要固定的文档所在索引。
    - `_id`（必需，字符串）唯一文档 ID。

  由于固定查询的限制，只能在单个规则中使用 `ids` 或 `docs`，不能同时使用两者。建议在查询规则集中使用其中一种以避免错误。此外，固定查询最多 100 个固定命中。如果多个匹配规则固定超过 100 个文档，仅固定按规则集中指定顺序的前 100 个文档。

## 示例

以下示例创建名为 `my-ruleset` 的新查询规则集。

`my-ruleset` 关联两个规则：

- `my-rule1`：当 `user_query` 包含 `pugs` 或 `puggles` 且 `user_country` 精确匹配 `us` 时，固定 ID 为 `id1` 和 `id2` 的文档。
- `my-rule2`：当 `user_query` 模糊匹配 `rescue dogs` 时，排除来自不同指定索引中 ID 为 `id3` 和 `id4` 的文档。

```json
PUT _query_rules/my-ruleset
{
    "rules": [
        {
            "rule_id": "my-rule1",
            "type": "pinned",
            "criteria": [
                {
                    "type": "contains",
                    "metadata": "user_query",
                    "values": [ "pugs", "puggles" ]
                },
                {
                    "type": "exact",
                    "metadata": "user_country",
                    "values": [ "us" ]
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
            "type": "exclude",
            "criteria": [
                {
                    "type": "fuzzy",
                    "metadata": "user_query",
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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-query-ruleset.html)
