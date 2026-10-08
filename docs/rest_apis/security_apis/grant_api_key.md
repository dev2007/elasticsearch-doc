# 授予 REST API 密钥 API

代表其他用户创建 REST API 密钥。

```txt
POST /_security/api_key/grant
```

## 前置条件

- 要使用此 API，你必须具有 `grant_api_key` 或 `manage_api_key` 集群权限。

## 描述

此 API 与创建 REST API 密钥 API 类似，但创建的 API 密钥是属于另一个用户的。

调用者必须拥有要代表其创建 API 密钥的用户的身份验证凭据。支持的凭据类型包括用户名和密码、Elasticsearch 访问令牌以及 JWT。

已通过身份验证的用户可以选择 run as（模拟）另一个用户 — 此时将代表被模拟的用户创建 API 密钥。

此 API 适用于为无权创建自己密钥的终端用户创建和管理 API 密钥的应用程序。

成功调用会返回一个 JSON 结构，其中包含 API 密钥、其唯一的 `id`、其 `name`，以及（如适用）以毫秒为单位的过期信息。默认情况下，API 密钥永不过期；可以在创建时指定过期时间。

API 密钥由 Elasticsearch API 密钥服务创建（该服务自动启用）。有关配置信息，参见 API 密钥服务设置。

## 请求体

`grant_type`

（必需，字符串）授权类型。支持的值包括：

- `access_token`：提供由 Elasticsearch 令牌服务创建的访问令牌（参见获取令牌 API 或[加密 Elasticsearch 的 HTTP 客户端通信](/secure_the_stack/set_up_minimal_security/encrypt_http_client_communications)），或提供 JWT（JWT `access_token` 或 JWT `id_token`，取决于底层 JWT realm 的配置）。
- `password`：提供要为其创建 API 密钥的用户 ID 和密码。

`username`

（仅在 `password` 授权类型下必需，字符串）标识用户的用户名。对任何其他授权类型无效。

`password`

（仅在 `password` 授权类型下必需，字符串）用户的密码。对任何其他授权类型无效。

`access_token`

（仅在 `access_token` 授权类型下必需，字符串）用户的 Elasticsearch 访问令牌或 JWT。对任何其他授权类型无效。所创建的 API 密钥会获得令牌用户权限的一个时间点快照（可能更受限 — 参见 `role_descriptors`）。

`run_as`

（可选，字符串）要被模拟的用户名称。将代表被模拟的用户创建 API 密钥。

`api_key`

（必需，对象）定义 API 密钥，包含：

- `name`（必需，字符串）此 API 密钥的名称。
- `expiration`（可选，字符串）API 密钥的过期时间。默认情况下，API 密钥永不过期。
- `role_descriptors`（可选，对象）此 API 密钥的角色描述符。当省略或为空数组时，API 密钥会获得指定用户/令牌权限的一个时间点快照。如果提供，生成的权限是 API 密钥权限与用户/令牌权限的交集。结构与创建 REST API 密钥 API 请求相同。
- `metadata`（可选，对象）与 API 密钥关联的任意元数据。支持嵌套的数据结构。以 `_` 开头的键保留供系统使用。

`client_authentication`

（可选，对象）当使用带有需要客户端身份验证的 JWT 的 `access_token` 授权类型时（即通常通过 `ES-Client-Authentication` 请求头发送的内容），包含：

- `scheme`（必需，字符串）`ES-Client-Authentication` 请求头中提供的区分大小写的方案。当前唯一支持的值是 `SharedSecret`。
- `value`（必需，字符串）方案后面的值。例如，如果请求头为 `ES-Client-Authentication: SharedSecret myShar3dS3cret`，则 `value` 应为 `myShar3dS3cret`。

## 示例

以下示例使用 `password` 授权类型并指定角色描述符和元数据来创建 API 密钥：

```txt
POST /_security/api_key/grant
{
  "grant_type" : "password",
  "username" : "test_admin",
  "password" : "x-pack-test-password",
  "api_key" : {
    "name" : "my-api-key",
    "expiration" : "1d",
    "role_descriptors" : {
      "role-a" : {
        "cluster" : ["all"],
        "indices" : [
          {
            "names" : ["index-a*"],
            "privileges" : ["read"]
          }
        ]
      },
      "role-b" : {
        "cluster" : ["all"],
        "indices" : [
          {
            "names" : ["index-b*"],
            "privileges" : ["all"]
          }
        ]
      }
    },
    "metadata" : {
      "application" : "my-application",
      "environment" : {
        "level" : 1,
        "trusted" : true,
        "tags" : ["dev", "staging"]
      }
    }
  }
}
```

以下示例使用 `password` 授权类型并配合 `run_as` 模拟来创建 API 密钥。提供凭据的用户（`test_admin`）可以 run as 另一个用户（`test_user`），API 密钥将授予被模拟的用户（`test_user`）：

```txt
POST /_security/api_key/grant
{
  "grant_type" : "password",
  "username" : "test_admin",
  "password" : "x-pack-test-password",
  "run_as" : "test_user",
  "api_key" : {
    "name" : "another-api-key"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-grant-api-key.html)
