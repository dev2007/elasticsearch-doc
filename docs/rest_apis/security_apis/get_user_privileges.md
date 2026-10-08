# 获取用户权限 API

检索已登录用户的安全权限。

```txt
GET /_security/user/_privileges
```

## 前置条件

- 所有用户都可以使用此 API，但仅用于确定自己的权限。
- 要检查其他用户的权限，必须使用 run as 功能（参见[代表其他用户提交请求](/secure_the_stack/submitting_requests_on_behalf_of_other_users)）。

## 描述

此 API 检索当前已登录用户的安全权限。

:::note 提示

要检查用户是否具有特定的权限列表，请使用[是否具有权限 API](./has_privileges)。

:::

## 示例

以下示例检索当前用户的安全权限：

```txt
GET /_security/user/_privileges
```

API 返回以下响应：

```json
{
  "cluster" : [
    "all"
  ],
  "global" : [ ],
  "indices" : [
    {
      "names" : [
        "*"
      ],
      "privileges" : [
        "all"
      ],
      "allow_restricted_indices" : true
    }
  ],
  "applications" : [
    {
      "application" : "*",
      "privileges" : [
        "*"
      ],
      "resources" : [
        "*"
      ]
    }
  ],
  "run_as" : [
    "*"
  ]
}
```

响应包含以下字段：

- `cluster`：用户拥有的集群级权限列表，例如 `all`、`monitor`、`manage`。
- `global`：应用程序级全局权限列表（例如 Kibana 空间管理权限）。
- `indices`：索引级权限条目列表，每个条目包含：
  - `names`：权限适用的索引名称模式，例如 `*`。
  - `privileges`：授予的索引权限，例如 `all`、`read`、`write`。
  - `allow_restricted_indices`：是否允许访问受限索引/系统索引。
- `applications`：应用程序特定权限（例如 Kibana）条目列表，每个条目包含：
  - `application`：应用程序名称模式，例如 `*`。
  - `privileges`：授予的应用程序权限。
  - `resources`：权限适用的资源。
- `run_as`：允许该用户代表其提交请求（run as）的用户列表。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-user-privileges.html)
