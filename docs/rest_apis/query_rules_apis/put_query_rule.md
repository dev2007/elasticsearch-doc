# 创建或更新查询规则 API

在查询规则集内创建或更新单个查询规则。

```txt
PUT _query_rules/<ruleset_id>/_rule/<rule_id>
```

## 前置条件

- 需要 `manage_search_query_rules` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<ruleset_id>`

（必需，字符串）包含此规则的查询规则集的标识符。

`<rule_id>`

（必需，字符串）要创建或更新的查询规则的标识符。

## 请求体

`type`

（必需，字符串）规则的类型。目前允许以下查询规则类型：

- `pinned`

  识别特定文档并将其固定到搜索结果的顶部。

- `exclude`

  从搜索结果中排除特定文档。

`criteria`

（必需，对象数组）应用规则所必须满足的条件。如果为一个规则指定了多个条件，则必须满足所有条件才会应用规则。

条件必须包含以下信息：

- `type`

  （必需，字符串）条件的类型。支持以下条件类型：

  - `exact`

    仅精确匹配满足规则定义的条件。适用于字符串或数值。

  - `fuzzy`

    精确匹配或在允许的 Levenshtein 编辑距离内的匹配满足规则定义的条件。仅适用于字符串值。

  - `prefix`

    以此值开头的匹配满足规则定义的条件。仅适用于字符串值。

  - `suffix`

    以此值结尾的匹配满足规则定义的条件。仅适用于字符串值。

  - `contains`

    在字段中任意位置包含此值的匹配满足规则定义的条件。仅适用于字符串值。

  - `lt`

    值小于此值的匹配满足规则定义的条件。仅适用于数值。

  - `lte`

    值小于或等于此值的匹配满足规则定义的条件。仅适用于数值。

  - `gt`

    值大于此值的匹配满足规则定义的条件。仅适用于数值。

  - `gte`

    值大于或等于此值的匹配满足规则定义的条件。仅适用于数值。

  - `always`

    匹配所有查询，与输入无关。

- `metadata`

  （可选，字符串）要匹配的元数据字段。此元数据将用于与规则查询中发送的 `match_criteria` 进行匹配。除 `always` 外的所有条件类型均为必需。

- `values`

  （可选，字符串数组）要与元数据字段匹配的值。只需一个值匹配即可满足条件。除 `always` 外的所有条件类型均为必需。

`actions`

（必需，对象）规则匹配时要执行的操作。此操作的格式取决于规则类型。

操作取决于规则类型。`pinned` 或 `exclude` 规则允许以下操作：

- `ids`

  （可选，字符串数组）要应用规则的文档的唯一文档 ID。只能指定 `ids` 或 `docs` 之一，且必须至少指定一个。

- `docs`

  （可选，对象数组）要应用规则的文档。只能指定 `ids` 或 `docs` 之一，且必须至少指定一个。一个规则中最多 100 个文档。可以为每个文档指定以下属性：

  - `_index`

    （必需，字符串）文档所在的索引。如果为 null，则所有被搜索索引中具有指定 `_id` 的文档都会受到影响。

  - `_id`

    （必需，字符串）文档的唯一 ID。

由于固定查询（Pinned queries）的限制，只能使用 `ids` 或 `docs` 固定文档，不能在单个规则中同时使用两者。建议在查询规则集中使用其中一种以避免错误。此外，固定查询最多固定 100 个命中。如果多个匹配规则固定的文档超过 100 个，则仅按规则集中指定的顺序固定前 100 个文档。

## 示例

以下示例在名为 `my-ruleset` 的查询规则集中创建 ID 为 `my-rule1` 的新查询规则。

- 当 `user_query` 包含 `pugs` 或 `puggles` 且 `user_country` 精确匹配 `us` 时，`my-rule1` 将选择要提升的 ID 为 `id1` 和 `id2` 的文档。

```json
PUT _query_rules/my-ruleset/_rule/my-rule1
{
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
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-query-rule.html)
