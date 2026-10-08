# OpenID Connect 注销已验证用户 API

提交使访问令牌和刷新令牌失效的请求，这些令牌是作为对 `/_security/oidc/authenticate` 调用的响应而生成的。

```txt
POST /_security/oidc/logout
```

## 描述

如果 Elasticsearch 中的 OpenID Connect 验证 realm 进行了相应配置，则响应将包含一个指向 OpenID Connect 提供商（OP）的结束会话端点（End Session Endpoint）的 URI，以执行单点注销（Single Logout）。

Elasticsearch 通过 OpenID Connect API 暴露所有必要的 OpenID Connect 相关功能。这些 API 由 Kibana 内部使用以提供基于 OpenID Connect 的身份验证，但也可以由其他自定义 Web 应用程序或客户端使用。

OpenID Connect 注销已验证用户 API 用于使由[OpenID Connect 提交验证响应 API](./oidc_authenticate) 返回的令牌失效。

## 请求体

`access_token`

（必需，字符串）要在注销时使其失效的访问令牌的值。

`refresh_token`

（可选，字符串）要在注销时使其失效的刷新令牌的值。

## 示例

以下示例使访问令牌和刷新令牌失效：

```txt
POST /_security/oidc/logout
{
  "token" : "dGhpcyBpcyBub3QgYSByZWFsIHRva2VuIGJ1dCBpdCBpcyBvbmx5IHRlc3QgZGF0YS4gZG8gbm90IHRyeSB0byByZWFkIHRva2VuIQ==",
  "refresh_token": "vLBPvmAB6KvwvJZr27cS"
}
```

API 返回以下响应，其中包含指向 OpenID Connect 提供商的结束会话端点的 URI，注销请求的所有参数均作为 HTTP GET 参数：

```json
{
  "redirect" : "https://op-provider.org/logout?id_token_hint=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c&post_logout_redirect_uri=http%3A%2F%2Foidc-kibana.elastic.co%2Floggedout&state=lGYK0EcSLjqH6pkT5EVZjC6eIW5YCGgywj2sxROO"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-oidc-logout.html)
