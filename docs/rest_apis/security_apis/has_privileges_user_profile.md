# 用户配置文件是否具有权限 API

确定与指定用户配置文件 ID 关联的用户是否具有所有请求的权限。

```txt
GET /_security/profile/_has_privileges
POST /_security/profile/_has_privileges
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限（或更大的权限，例如 `manage_user_profile` 或 `manage_security`）。

## 描述

:::important 重要

用户配置文件功能仅供 Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic Security 解决方案使用。个别用户和外部应用程序不应直接调用此 API。Elastic 保留在未来版本中更改或删除此功能而不事先通知的权利。

:::

此 API 使用配置文件 ID（由激活用户配置文件 API 返回）来标识要检查权限的用户。它与[是否具有权限 API](./has_privileges) 类似，但不同的是，此 API 检查的是其他用户的权限，而不是调用者的权限。有关可以指定的权限列表，参见[安全权限](../security_privileges/security_privileges)。

## 请求体

`uids`

（必需，字符串数组）配置文件 ID 列表。将检查与这些配置文件关联的用户的权限。

`privileges`

（必需，对象）包含要检查的所有权限的对象（与是否具有权限 API 的请求体相同），包含：

- `cluster`（字符串数组）要检查的集群权限列表。
- `index`（对象数组）要检查的索引权限条目列表，每个条目包含：
  - `names`（字符串数组）索引列表。
  - `privileges`（字符串数组）要为指定索引检查的权限列表。
  - `allow_restricted_indices`（可选，布尔值）当使用覆盖受限索引的通配符或正则表达式模式时，必须设置为 `true`（默认为 `false`）。隐式地，受限索引不会匹配索引模式，因为受限索引通常具有有限的权限，将它们包含在模式测试中会使大多数此类测试返回 `false`。如果在 `names` 列表中显式列出了受限索引，则无论此值如何，都会对它们检查权限。
- `application`（对象数组）要检查的应用程序权限条目列表，每个条目包含：
  - `application`（字符串）应用程序的名称。
  - `privileges`（字符串数组）要为指定资源检查的权限列表。可以是应用程序权限名称，也可以是由这些权限授予的操作名称。
  - `resources`（字符串数组）要对其检查权限的资源名称列表。

## 响应体

成功的调用返回一个包含两个字段的 JSON 结构：

`has_privilege_uids`

（字符串数组）请求的配置文件 ID 中拥有**所有**请求权限的用户的子集。

`errors`

（对象）执行请求时遇到的错误。如果没有错误，则不会出现。它不包含没有所有请求权限的用户的配置文件 ID，包含：

- `count`：错误总数。
- `details`：详细错误报告；键为配置文件 ID，值为具体错误。

## 示例

以下示例检查与三个指定配置文件关联的用户是否具有所有请求的集群、索引和应用程序权限：

```txt
POST /_security/profile/_has_privileges
{
  "uids": [
    "u_LQPnxDxEjIH0GOUoFkZr5Y57YUwSkL9Joiq-g4OCbPc_0",
    "u_rzRnxDgEHIH0GOUoFkZr5Y27YUwSk19Joiq=g4OCxxB_1",
    "u_does-not-exist_0"
  ],
  "privileges": {
    "cluster": [ "monitor", "create_snapshot", "manage_ml" ],
    "index": [
      {
        "names": [ "suppliers", "products" ],
        "privileges": [ "create_doc" ]
      },
      {
        "names": [ "inventory" ],
        "privileges": [ "read", "write" ]
      }
    ],
    "application": [
      {
        "application": "inventory_manager",
        "privileges": [ "read", "data:write/inventory" ],
        "resources": [ "product/1852563" ]
      }
    ]
  }
}
```

API 返回以下响应，其中只有三个用户中的一个用户拥有所有权限，并且有一个配置文件未找到：

```json
{
  "has_privilege_uids": [ "u_rzRnxDgEHIH0GOUoFkZr5Y27YUwSk19Joiq=g4OCxxB_1" ],
  "errors": {
    "count": 1,
    "details": {
      "u_does-not-exist_0": {
        "type": "resource_not_found_exception",
        "reason": "profile document not found"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-has-privileges-user-profile.html)
