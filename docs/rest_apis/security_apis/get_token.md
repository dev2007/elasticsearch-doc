# 获取令牌 API

创建用于访问的持有者令牌（bearer token）。

```txt
POST /_security/oauth2/token
```

## 前置条件

- 要使用此 API，你必须具有 `manage_token` 集群权限。

## 描述

获取令牌 API 创建一个持有者令牌，无需基本身份验证即可访问。令牌由 Elasticsearch 令牌服务创建。

当在 HTTP 接口上配置了 TLS 时，Elasticsearch 令牌服务会自动启用（参见[加密 Elasticsearch 的 HTTP 客户端通信](/secure_the_stack/set_up_minimal_security/encrypt_http_client_communications)）。或者，也可以通过 `xpack.security.authc.token.enabled` 设置显式启用它。

:::important 重要

在生产模式下，引导检查会阻止启用令牌服务，除非同时启用了 HTTP 接口上的 TLS。

:::

此 API 接受与典型 OAuth 2.0 令牌 API 相同的参数，但它使用 JSON 请求体。成功调用会返回一个包含访问令牌、以秒为单位的过期时间、类型和范围（scope，如果可用）的 JSON 结构。

令牌的有效期是有限的，由 `xpack.security.authc.token.timeout` 设置定义（参见[令牌服务设置](/secure_the_stack/security_settings)）。

要立即使令牌失效，请使用[使令牌失效 API](./invalidate_token)。

## 请求体

`grant_type`

（必需，字符串）授权类型。支持的授权类型包括 `password`、`_kerberos`、`client_credentials` 和 `refresh_token`。

`username`

（仅在 `password` 授权类型下必需，字符串）标识用户的用户名。对任何其他授权类型无效。

`password`

（仅在 `password` 授权类型下必需，字符串）用户的密码。对任何其他授权类型无效。

`kerberos_ticket`

（仅在 `_kerberos` 授权类型下必需，字符串）Base64 编码的 Kerberos 票据。对任何其他授权类型无效。

`refresh_token`

（仅在 `refresh_token` 授权类型下必需，字符串）创建令牌时返回的字符串，用于延长令牌的生命周期。对任何其他授权类型无效。

`scope`

（可选，字符串）令牌的范围。当前无论发送什么值，令牌都仅以 `FULL` 范围颁发。

### 授权类型

`client_credentials`

实现 OAuth2 客户端凭据授权（Client Credentials Grant）。适用于机器对机器的通信；不适合自服务用户令牌创建，因为它仅生成无法刷新的访问令牌。此授权的前提是拥有对一组凭据（客户端凭据，而非终端用户凭据）的恒定访问权限，并且可以随意对自己进行身份验证。

`password`

实现 OAuth2 资源所有者密码凭据授权（Resource Owner Password Credentials Grant）。受信任的客户端用终端用户的凭据交换访问令牌和（可能的）刷新令牌。此请求必须由一个已通过身份验证的用户代表另一个已通过身份验证的用户发起，该用户的凭据作为参数传递。不适合自服务用户令牌创建。

`refresh_token`

实现 OAuth2 刷新令牌授权（Refresh Token Grant）。用户用先前颁发的刷新令牌交换新的访问令牌和新的刷新令牌。

`_kerberos`

内部支持，实现基于 SPNEGO 的 Kerberos 支持。此授权在不同版本之间可能会有所变化。

## 响应体

`access_token`

持有者令牌字符串。

`type`

令牌类型（`Bearer`）。

`expires_in`

令牌过期前的剩余时间（以秒为单位），例如 `1200` 表示 20 分钟。

`refresh_token`

刷新令牌，为 `password`、`refresh_token` 和 `_kerberos` 授权类型返回（`client_credentials` 授权类型不返回）。每个刷新令牌只能使用一次。

`scope`

令牌的范围（如果可用），当前为 `FULL`。

`kerberos_authentication_response_token`

（仅限 Kerberos）当在 Spnego GSS 上下文中请求相互身份验证时返回的 Base64 编码令牌，供客户端消费并完成身份验证。

`authentication`

令牌用户的身份验证信息，包含：

- `username`：用户名。
- `roles`：用户角色数组。
- `full_name`：用户全名。
- `email`：用户电子邮件。
- `metadata`：用户元数据。
- `enabled`：用户是否启用。
- `authentication_realm`：用于身份验证的 realm（`name`、`type`）。
- `lookup_realm`：用于查找的 realm（`name`、`type`）。
- `authentication_type`：身份验证类型，例如 `realm` 或 `token`。

## 令牌过期和刷新

- 令牌的生命周期由 `xpack.security.authc.token.timeout` 设置控制。
- 通过 `password` 授权类型获得的刷新令牌必须在令牌创建后的 24 小时内使用。
- 每个刷新令牌只能使用一次；刷新时 API 会返回一个新令牌和一个新的刷新令牌。

## 示例

以下示例使用 `client_credentials` 授权类型获取令牌：

```txt
POST /_security/oauth2/token
{
  "grant_type" : "client_credentials"
}
```

API 返回以下响应：

```json
{
  "access_token" : "dGhpcyBpcyBub3QgYSByZWFsIHRva2VuIGJ1dCBpdCBpcyBvbmx5IHRlc3QgZGF0YS4gZG8gbm90IHRyeSB0byByZWFkIHRva2VuIQ==",
  "type" : "Bearer",
  "expires_in" : 1200,
  "authentication" : {
    "username" : "test_admin",
    "roles" : [ "superuser" ],
    "full_name" : null,
    "email" : null,
    "metadata" : { },
    "enabled" : true,
    "authentication_realm" : {
      "name" : "file",
      "type" : "file"
    },
    "lookup_realm" : {
      "name" : "file",
      "type" : "file"
    },
    "authentication_type" : "realm"
  }
}
```

要使用此令牌，请发送带有 `Bearer ` 前缀（后跟 `access_token`）的 `Authorization` 请求头：

```sh
curl -H "Authorization: Bearer dGhpcyBpcyBub3QgYSByZWFsIHRva2VuIGJ1dCBpdCBpcyBvbmx5IHRlc3QgZGF0YS4gZG8gbm90IHRyeSB0byByZWFkIHRva2VuIQ==" http://localhost:9200/_cluster/health
```

以下示例使用 `password` 授权类型获取令牌：

```txt
POST /_security/oauth2/token
{
  "grant_type" : "password",
  "username" : "test_admin",
  "password" : "x-pack-test-password"
}
```

响应中包含 `access_token`、`type`、`expires_in`、`refresh_token` 和 `authentication` 对象。

以下示例使用 `refresh_token` 授权类型刷新令牌：

```txt
POST /_security/oauth2/token
{
  "grant_type": "refresh_token",
  "refresh_token": "vLBPvmAB6KvwvJZr27cS"
}
```

API 返回一个新令牌和新的刷新令牌，响应中的 `authentication_type` 为 `token`。

以下示例使用 `_kerberos` 授权类型获取令牌：

```txt
POST /_security/oauth2/token
{
  "grant_type" : "_kerberos",
  "kerberos_ticket" : "YIIB6wYJKoZIhvcSAQICAQBuggHaMIIB1qADAgEFoQMCAQ6iBtaDcp4cdMODwOsIvmvdX//sye8NDJZ8Gstabor3MOGryBWyaJ1VxI4WBVZaSn1WnzE06Xy2"
}
```

响应中包含 `access_token`、`type`、`expires_in`、`refresh_token`，以及（当请求相互身份验证时）`kerberos_authentication_response_token`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-token.html)
