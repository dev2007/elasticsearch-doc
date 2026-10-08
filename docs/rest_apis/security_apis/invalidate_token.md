# 使令牌失效 API

使一个或多个访问令牌或刷新令牌失效。

```txt
DELETE /_security/oauth2/token
```

## 描述

由获取令牌 API 返回的访问令牌具有有限的有效期，由 `xpack.security.authc.token.timeout` 设置定义（参见[令牌服务设置](/secure_the_stack/security_settings)）。超过该期限后，它们将无法再被使用。

由获取令牌 API 返回的刷新令牌有效期为 24 小时，并且只能使用一次。

使用此 API 可以立即使访问令牌或刷新令牌失效。

## 请求体

`token`

（可选，字符串）访问令牌。不能与 `refresh_token`、`realm_name` 或 `username` 同时使用。

`refresh_token`

（可选，字符串）刷新令牌。不能与 `token`、`realm_name` 或 `username` 同时使用。

`realm_name`

（可选，字符串）身份验证 realm 的名称。不能与 `refresh_token` 或 `token` 同时使用。

`username`

（可选，字符串）用户的用户名。不能与 `refresh_token` 或 `token` 同时使用。

:::note 注意

虽然所有参数都是可选的，但必须至少提供一个。具体来说，必须提供 `token` 或 `refresh_token`；如果两者都未指定，则必须指定 `realm_name` 和/或 `username`。

:::

## 响应体

成功的调用返回一个 JSON 结构，其中包含：

`invalidated_tokens`

作为此请求的一部分而失效的令牌数量。

`previously_invalidated_tokens`

之前已经失效的令牌数量。

`error_count`

使令牌失效时遇到的错误数量。

`error_details`

错误的详细信息。当 `error_count` 为 `0` 时，响应中不存在此字段。

## 示例

以下示例使用 `client_credentials` 授权类型创建一个访问令牌：

```txt
POST /_security/oauth2/token
{
  "grant_type" : "client_credentials"
}
```

以下示例使该访问令牌立即失效：

```txt
DELETE /_security/oauth2/token
{
  "token" : "dGhpcyBpcyBub3QgYSByZWFsIHRva2VuIGJ1dCBpdCBpcyBvbmx5IHRlc3QgZGF0YS4gZG8gbm90IHRyeSB0byByZWFkIHRva2VuIQ=="
}
```

以下示例使用 `password` 授权类型创建令牌并获取刷新令牌，然后使该刷新令牌失效：

```txt
POST /_security/oauth2/token
{
  "grant_type" : "password",
  "username" : "test_admin",
  "password" : "x-pack-test-password"
}
```

```txt
DELETE /_security/oauth2/token
{
  "refresh_token" : "vLBPvmAB6KvwvJZr27cS"
}
```

以下示例使 `saml1` realm 中的所有用户的令牌失效：

```txt
DELETE /_security/oauth2/token
{
  "realm_name" : "saml1"
}
```

以下示例使用户 `myuser` 在所有 realm 中的令牌失效：

```txt
DELETE /_security/oauth2/token
{
  "username" : "myuser"
}
```

以下示例使用户 `myuser` 在 `saml1` realm 中的所有令牌失效：

```txt
DELETE /_security/oauth2/token
{
  "username" : "myuser",
  "realm_name" : "saml1"
}
```

以下示例展示了包含错误的响应：

```json
{
  "invalidated_tokens": 9,
  "previously_invalidated_tokens": 15,
  "error_count": 2,
  "error_details": [
    {
      "type": "exception",
      "reason": "Elasticsearch exception [type=exception, reason=foo]",
      "caused_by": {
        "type": "exception",
        "reason": "Elasticsearch exception [type=illegal_argument_exception, reason=bar]"
      }
    },
    {
      "type": "exception",
      "reason": "Elasticsearch exception [type=exception, reason=boo]",
      "caused_by": {
        "type": "exception",
        "reason": "Elasticsearch exception [type=illegal_argument_exception, reason=far]"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-invalidate-token.html)
