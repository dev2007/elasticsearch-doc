# 查询用户 API

使用 Query DSL 以分页方式检索原生用户的信息。

```txt
GET /_security/_query/user
POST /_security/_query/user
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限。

## 描述

与获取用户 API 不同，此 API 的结果中不包含内置用户 — 它仅返回由原生 realm 管理的用户。可以使用查询来筛选结果。

## 查询参数

`with_profile_uid`

（可选，布尔值）默认为 `false`。确定是否为用户检索其用户档案 `uid`（如果存在）。

## 请求体

`query`

（可选，Query DSL）用于筛选要返回的用户的查询。支持的查询类型包括：`match_all`、`bool`、`term`、`terms`、`match`、`ids`、`prefix`、`wildcard`、`exists`、`range` 和简单查询字符串。

`from`

（可选，整数）起始文档偏移量。必须为非负值，默认为 `0`。默认情况下，无法通过 `from` 和 `size` 参数翻页超过 10,000 条命中，如需更深的分页，请使用 `search_after`。

`size`

（可选，整数）要返回的命中数量。不能为负值，默认为 `10`。同样适用上述 10,000 条命中的分页限制。

`sort`

（可选，对象）排序定义。可以按 `username`、`roles`、`enabled` 或 `_doc`（索引顺序）排序。

`search_after`

（可选，数组）用于深度分页（超过 10,000 条命中）的 search-after 定义。

### 可查询的字段

- `username`：用户的标识符。
- `roles`：分配给用户的角色名称数组。
- `full_name`：用户全名。
- `email`：用户的电子邮件。
- `enabled`：用户是否启用。

## 响应体

`total`

找到的用户总数。

`count`

响应中返回的用户数量。

`users`

匹配的用户列表，每个用户包含 `username`、`roles`、`full_name`、`email`、`metadata`、`enabled`，以及（仅在 `with_profile_uid=true` 时）`profile_uid`。

## 示例

以下示例检索所有用户的信息：

```txt
GET /_security/_query/user
```

API 返回以下响应：

```json
{
  "total" : 2,
  "count" : 2,
  "users" : [
    {
      "username" : "jacknich",
      "roles" : [ "admin", "other_role1" ],
      "full_name" : "Jack Nicholson",
      "email" : "jacknich@example.com",
      "metadata" : { "intelligence": 7 },
      "enabled" : true
    },
    {
      "username" : "sandrakn",
      "roles" : [ "admin", "other_role1" ],
      "full_name" : "Sandra Knight",
      "email" : "sandrakn@example.com",
      "metadata" : { "intelligence": 7 },
      "enabled" : true
    }
  ]
}
```

以下示例首先创建一个用户 `jacknich`：

```txt
POST /_security/user/jacknich
{
  "password" : "l0ng-r4nd0m-p@ssw0rd",
  "roles" : [ "admin", "other_role1" ],
  "full_name" : "Jack Nicholson",
  "email" : "jacknich@example.com",
  "metadata" : { "intelligence" : 7 }
}
```

以下示例使用 `prefix` 查询检索角色名称以 `other` 开头的用户：

```txt
POST /_security/_query/user
{
  "query": {
    "prefix": {
      "roles": "other"
    }
  }
}
```

以下示例配合 `with_profile_uid=true` 查询参数检索用户，响应中会包含用户的 `profile_uid`：

```txt
POST /_security/_query/user?with_profile_uid=true
{
  "query": {
    "prefix": {
      "roles": "other"
    }
  }
}
```

以下示例使用复杂的 `bool` 查询并配合分页和排序：

```txt
POST /_security/_query/user
{
  "query": {
    "bool": {
      "must": [
        {
          "wildcard": {
            "email": "*example.com"
          }
        },
        {
          "term": {
            "enabled": true
          }
        }
      ],
      "filter": [
        {
          "wildcard": {
            "roles": "*other*"
          }
        }
      ]
    }
  },
  "from": 1,
  "size": 2,
  "sort": [
    { "username": { "order": "desc" } }
  ]
}
```

该查询返回满足以下条件的用户：电子邮件以 `example.com` 结尾，用户已启用，并且至少有一个角色名称包含子串 `other`。`from: 1` 表示偏移量从第二个（从零开始的索引）用户开始，`size: 2` 表示页面大小为 2 个用户，按 `username` 降序排序。响应中的每个用户都包含一个 `_sort` 数组，其中包含这些排序值：

```json
{
  "total" : 5,
  "count" : 2,
  "users" : [
    {
      "username" : "ray",
      "roles" : [ "other_role3" ],
      "full_name" : "Ray Nicholson",
      "email" : "rayn@example.com",
      "metadata" : { "intelligence": 7 },
      "enabled" : true,
      "_sort" : [ "ray" ]
    },
    {
      "username" : "lorraine",
      "roles" : [ "other_role3" ],
      "full_name" : "Lorraine Nicholson",
      "email" : "lorraine@example.com",
      "metadata" : { "intelligence": 7 },
      "enabled" : true,
      "_sort" : [ "lorraine" ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-query-user.html)
