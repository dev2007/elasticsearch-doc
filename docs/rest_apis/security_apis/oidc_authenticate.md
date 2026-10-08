# OpenID Connect 提交验证响应 API

将成功的 OpenID Connect 验证响应交换为用于身份验证的 Elasticsearch 访问令牌和刷新令牌。

```txt
POST /_security/oidc/authenticate
```

## 描述

此 API 提交针对 OAuth 2.0 验证请求的响应，供 Elasticsearch 消费。验证成功后，Elasticsearch 会返回一个可用于后续身份验证的 Elasticsearch 内部访问令牌（Access Token）和刷新令牌（Refresh Token）。

Elasticsearch 通过 OpenID Connect API 暴露所有必要的 OpenID Connect 相关功能。这些 API 由 Kibana 内部使用以提供基于 OpenID Connect 的身份验证，但也可以由其他自定义 Web 应用程序或客户端使用。

OpenID Connect 提交验证响应 API 用于消费 OpenID Connect 提供商（OP）对验证请求的响应。使用此 API 之前，必须先调用[OpenID Connect 准备验证请求 API](./oidc_prepare_authentication)，并使用其响应中的 `state` 和 `nonce` 值。最后，可以使用[OpenID Connect 注销已验证用户 API](./oidc_logout) 注销用户。

## 请求体

`redirect_uri`

（必需，字符串）OpenID Connect 提供商在身份验证成功后为响应验证请求而将用户代理（User Agent）重定向到的 URL。此 URL 应按原样提供（URL 编码），取自响应体，或取自 OpenID Connect 提供商响应中的 `Location` 请求头的值。

`state`

（必需，字符串）用于在验证请求和响应之间维护状态。必须是先前提供给 OpenID Connect 准备验证请求 API 调用的值，或由 Elasticsearch 生成并包含在该调用响应中的值。

`nonce`

（必需，字符串）用于将客户端会话与 ID 令牌关联并缓解重放攻击。必须是先前提供给 OpenID Connect 准备验证请求 API 调用的值，或由 Elasticsearch 生成并包含在该调用响应中的值。

`realm`

（可选，字符串）用于标识应用于对此请求进行身份验证的 OpenID Connect realm 的名称。当定义了多个 realm 时很有用。

## 示例

以下示例将 OpenID Connect 提供商在身份验证成功后返回的响应（授权码授权流程）交换为 Elasticsearch 访问令牌和刷新令牌：

```txt
POST /_security/oidc/authenticate
{
  "redirect_uri" : "https://oidc-kibana.elastic.co:5603/api/security/oidc/callback?code=jtI3Ntt8v3_XvcLzCFGq&state=4dbrihtIAt3wBTwo6DxK-vdk-sSyDBV8Yf0AjdkdT5I",
  "state" : "4dbrihtIAt3wBTwo6DxK-vdk-sSyDBV8Yf0AjdkdT5I",
  "nonce" : "WaBPH0KqPVdG5HHdSxPRjfoZbXMCicm5v1OiAj0DUFM",
  "realm" : "oidc1"
}
```

API 返回以下响应，其中包含为响应而生成的访问令牌、令牌过期前的剩余时间（以秒为单位）、令牌类型以及刷新令牌：

```json
{
  "access_token" : "dGhpcyBpcyBub3QgYSByZWFsIHRva2VuIGJ1dCBpdCBpcyBvbmx5IHRlc3QgZGF0YS4gZG8gbm90IHRyeSB0byByZWFkIHRva2VuIQ==",
  "type" : "Bearer",
  "expires_in" : 1200,
  "refresh_token" : "vLBPvmAB6KvwvJZr27cS"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-oidc-authenticate.html)
