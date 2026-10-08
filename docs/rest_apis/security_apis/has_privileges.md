# 是否具有权限 API

确定已登录用户是否具有指定的权限列表。

```txt
GET /_security/user/_has_privileges
POST /_security/user/_has_privileges
```

## 前置条件

- 所有用户都可以使用此 API，但仅用于确定自己的权限。
- 要检查其他用户的权限，必须使用 run as 功能（参见[代表其他用户提交请求](/secure_the_stack/submitting_requests_on_behalf_of_other_users)）。

## 描述

有关可以在此 API 中指定的权限列表，参见[安全权限](../security_privileges/security_privileges)。

成功调用会返回一个 JSON 结构，显示每个指定的权限是否已分配给该用户。

## 请求体

`cluster`

（可选，字符串数组）要检查的集群权限列表。

`index`

（可选，对象数组）要检查的索引权限条目列表，每个条目包含：

- `names`（字符串数组）索引列表。
- `privileges`（字符串数组）要为指定索引检查的权限列表。
- `allow_restricted_indices`（可选，布尔值）当使用覆盖受限索引（restricted indices）的通配符或正则表达式模式时，必须设置为 `true`（默认为 `false`）。受限索引不会隐式匹配索引模式，因为它们通常具有有限的权限，将它们包含在模式测试中会使大多数此类测试返回 `false`。如果在 `names` 中显式列出了受限索引，则无论 `allow_restricted_indices` 的值如何，都会对它们检查权限。

`application`

（可选，对象数组）要检查的应用程序权限条目列表，每个条目包含：

- `application`（字符串）应用程序的名称。
- `privileges`（字符串数组）要为指定资源检查的权限列表。可以是应用程序权限名称，也可以是由这些权限授予的操作名称。
- `resources`（字符串数组）要对其检查权限的资源名称列表。

## 示例

以下示例检查当前用户是否具有一组特定的集群、索引和应用程序权限：

```txt
GET /_security/user/_has_privileges
{
  "cluster": [ "monitor", "manage" ],
  "index": [
    { "names": [ "suppliers", "products" ], "privileges": [ "read" ] },
    { "names": [ "inventory" ], "privileges": [ "read", "write" ] }
  ],
  "application": [
    {
      "application": "inventory_manager",
      "privileges": [ "read", "data:write/inventory" ],
      "resources": [ "product/1852563" ]
    }
  ]
}
```

API 返回以下响应：

```json
{
  "username": "rdeniro",
  "has_all_requested": false,
  "cluster": {
    "monitor": true,
    "manage": false
  },
  "index": {
    "suppliers": { "read": true },
    "products": { "read": true },
    "inventory": { "read": true, "write": false }
  },
  "application": {
    "inventory_manager": {
      "product/1852563": {
        "read": false,
        "data:write/inventory": false
      }
    }
  }
}
```

- `username`：被检查权限的用户。
- `has_all_requested`：布尔值，只有当**所有**请求的权限都被持有时才为 `true`。
- `cluster`：集群权限名称到布尔值的映射（`true` 表示已授予）。
- `index`：索引名称到权限名称再到布尔值的嵌套映射。
- `application`：应用程序名称到资源再到权限名称再到布尔值的嵌套映射。

在此示例中，用户拥有集群 `monitor` 权限（但没有 `manage`），对 `suppliers`、`products` 和 `inventory` 索引拥有 `read` 权限，但对 `inventory` 没有 `write` 权限，并且对 `inventory_manager` 应用程序的 `product/1852563` 资源没有任何应用程序权限（`read` 或 `data:write/inventory`）— 因此 `has_all_requested` 为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-has-privileges.html)
