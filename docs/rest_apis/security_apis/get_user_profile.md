# 获取用户配置文件 API

返回与指定 `uid` 匹配的用户配置文件文档。

```txt
GET /_security/profile/<uid>
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限（或更大的权限，例如 `manage_user_profile` 或 `manage_security`）。

## 描述

:::important 重要

用户配置文件功能仅供 Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic Security 解决方案使用。个别用户和外部应用程序不应直接调用此 API。Elastic 保留在未来版本中更改或删除此功能而不事先通知的权利。

:::

此 API 返回与指定 `uid` 匹配的用户配置文件文档，该 `uid` 在激活用户配置文件时生成。

## 路径参数

`<uid>`

（必需，字符串）用户配置文件的唯一标识符。可以用逗号分隔的列表指定多个 ID。

## 查询参数

`data`

（可选，字符串）用于筛选配置文件文档 `data` 字段的逗号分隔列表。使用 `data=*` 返回全部内容；使用 `data=<key>` 返回指定 `<key>` 下嵌套的内容子集。默认不返回任何内容。

:::note 注意

默认情况下不返回 `data` 字段的内容，以避免反序列化可能非常大的负载。

:::

## 响应体

成功的调用返回用户配置文件的 JSON 表示及其内部版本控制编号。如果没有为提供的 `uid` 找到配置文件文档，则返回一个空对象。

`uid`

配置文件的唯一标识符。

`enabled`

指示配置文件是否启用的布尔值。

`last_synchronized`

上次同步的时间戳（以毫秒为单位的 epoch 时间）。

`user`

用户信息对象，包含 `username`、`roles`、`realm_name`、`full_name` 和 `email`。

`labels`

键值对元数据。

`data`

应用程序特定的数据（默认为空，除非通过 `data` 查询参数筛选）。

`_doc`

内部版本控制编号，包含 `_primary_term` 和 `_seq_no`。

`errors`

（失败时）包含 `count` 和以失败的 `uid` 为键的 `details`。

## 示例

以下示例检索 uid 为 `u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0` 的用户配置文件：

```txt
GET /_security/profile/u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0
```

API 返回以下响应（默认不返回 `data` 内容）：

```json
{
  "profiles": [
    {
      "uid": "u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0",
      "enabled": true,
      "last_synchronized": 1642650651037,
      "user": {
        "username": "jacknich",
        "roles": [ "admin", "other_role1" ],
        "realm_name": "native",
        "full_name": "Jack Nicholson",
        "email": "jacknich@example.com"
      },
      "labels": {
        "direction": "north"
      },
      "data": {},
      "_doc": {
        "_primary_term": 88,
        "_seq_no": 66
      }
    }
  ]
}
```

以下示例使用 `data=app1.key1` 查询参数检索 `data` 字段的内容子集：

```txt
GET /_security/profile/u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0?data=app1.key1
```

API 返回以下响应：

```json
{
  "profiles": [
    {
      "uid": "u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0",
      "enabled": true,
      "last_synchronized": 1642650651037,
      "user": {
        "username": "jacknich",
        "roles": [ "admin", "other_role1" ],
        "realm_name": "native",
        "full_name": "Jack Nicholson",
        "email": "jacknich@example.com"
      },
      "labels": {
        "direction": "north"
      },
      "data": {
        "app1": {
          "key1": "value1"
        }
      },
      "_doc": {
        "_primary_term": 88,
        "_seq_no": 66
      }
    }
  ]
}
```

以下示例展示了包含错误的响应：

```json
{
  "profiles": [],
  "errors": {
    "count": 1,
    "details": {
      "u_FmxQt3gr1BBH5wpnz9HkouPj3Q710XkOgg1PWkwLPBW_5": {
        "type": "resource_not_found_exception",
        "reason": "profile document not found"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-user-profile.html)
