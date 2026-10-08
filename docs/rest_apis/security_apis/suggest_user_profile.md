# 建议用户配置文件 API

获取与指定搜索条件匹配的用户配置文件的建议。

```txt
GET /_security/profile/_suggest
POST /_security/profile/_suggest
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限（或更大的权限，例如 `manage_user_profile` 或 `manage_security`）。

## 描述

:::important 重要

用户配置文件功能仅供 Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic Security 解决方案使用。个别用户和外部应用程序不应直接调用此 API。Elastic 保留在未来版本中更改或删除此功能而不事先通知的权利。

:::

## 查询参数

`data`

（可选，字符串）用于筛选配置文件文档 `data` 字段的逗号分隔列表。使用 `data=*` 返回全部内容，或使用 `data=<key>` 返回指定键下嵌套的内容。默认不返回任何内容。

## 请求体

`name`

（可选，字符串）用于匹配用户配置文件文档中与名称相关字段的查询字符串。与名称相关的字段包括用户的 `username`、`full_name` 和 `email`。

`size`

（可选，整数）要返回的配置文件数量。默认为 `10`。

`data`

（可选，字符串）用于筛选配置文件文档 `data` 字段的逗号分隔列表。其工作方式与 `data` 查询参数相同。同时将 `data` 指定为查询参数和请求体字段是错误的。

`hint`

（可选，对象）用于提高建议结果相关性的额外搜索条件。与提示（hint）匹配的配置文件排名更高，但只要与 `name` 查询匹配，不匹配提示并不会将配置文件从响应中排除。

`hint` 的属性包括：

- `uids`（可选，字符串数组）用于匹配的配置文件 UID 列表。
- `labels`（可选，对象）用于匹配配置文件 `labels` 部分的单个键值对。键必须是字符串；值必须是字符串或字符串列表。只要匹配其中一个字符串，配置文件即被视为匹配。

## 响应体

`total`

关于匹配配置文件数量的元数据。

`took`

Elasticsearch 执行请求所花费的时间（以毫秒为单位）。

`profiles`

按相关性排序的、与搜索条件匹配的配置文件文档列表。

## 示例

以下示例获取与名称相关字段匹配 `jack` 的配置文件文档的建议，并同时指定 `uids` 和 `labels` 提示以提高相关性：

```txt
POST /_security/profile/_suggest
{
  "name" : "jack",
  "hint" : {
    "uids" : [
      "u_8RKO7AKfEbSiIHZkZZ2LJy2MUSDPWDr3tMI_CkIGApU_0",
      "u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0"
    ],
    "labels" : {
      "direction" : [ "north", "east" ]
    }
  }
}
```

在该示例中：

- 配置文件的名称相关字段必须匹配 `jack` 才会被包含在响应中。
- `uids` 提示包含用户 `jackspa` 和 `jacknich` 的配置文件 UID。
- `labels` 提示会将 `direction` 标签匹配 `north` 或 `east` 的配置文件排在更高位置。

API 返回以下响应：

```json
{
  "took": 30,
  "total": {
    "value": 3,
    "relation": "eq"
  },
  "profiles": [
    {
      "uid": "u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0",
      "user": {
        "username": "jacknich",
        "roles": [ "admin", "other_role1" ],
        "realm_name": "native",
        "email": "jacknich@example.com",
        "full_name": "Jack Nicholson"
      },
      "labels": {
        "direction": "north"
      },
      "data": {}
    },
    {
      "uid": "u_8RKO7AKfEbSiIHZkZZ2LJy2MUSDPWDr3tMI_CkIGApU_0",
      "user": {
        "username": "jackspa",
        "roles": [ "user" ],
        "realm_name": "native",
        "email": "jackspa@example.com",
        "full_name": "Jack Sparrow"
      },
      "labels": {
        "direction": "south"
      },
      "data": {}
    },
    {
      "uid": "u_P_0BMHgaOK3p7k-PFWUCbw9dQ-UFjt01oWJ_Dp2PmPc_0",
      "user": {
        "username": "jackrea",
        "roles": [ "admin" ],
        "realm_name": "native",
        "email": "jackrea@example.com",
        "full_name": "Jack Reacher"
      },
      "labels": {
        "direction": "west"
      },
      "data": {}
    }
  ]
}
```

排名说明：

- **jacknich** 排名最高 — 同时匹配 `uids` 和 `labels` 提示。
- **jackspa** 排名第二 — 仅匹配 `uids` 提示。
- **jackrea** 排名最低 — 不匹配任何提示，但由于其匹配 `name` 查询，因此不会被排除。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-suggest-user-profile.html)
