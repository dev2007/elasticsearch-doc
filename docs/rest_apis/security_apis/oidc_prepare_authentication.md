# OpenID Connect 准备验证请求 API

根据 Elasticsearch 中相应 OpenID Connect 验证 realm 的配置，创建一个作为 URL 字符串的 OAuth 2.0 验证请求。

```txt
POST /_security/oidc/prepare
```

## 描述

此 API 创建一个指向所配置的 OpenID Connect 提供商（OpenID Connect Provider，OP）的授权端点（Authorization Endpoint）的 URL，用于将用户的浏览器重定向到该端点以继续身份验证。响应中包含作为 HTTP GET 参数的所有验证请求参数。

这些 OpenID Connect API 由 Kibana 内部使用，但也可以由自定义 Web 应用程序或其他客户端使用。 OpenID Connect 准备验证请求 API 返回的重定向 URL 使用户的浏览器能够向 OpenID Connect 提供商进行身份验证。然后，可以使用 OpenID Connect 提交验证响应 API 完成身份验证过程。最后，可以使用 OpenID Connect 注销已验证用户 API 注销用户。

## 请求体

`realm`

（可选，字符串）用于生成验证请求的 OpenID Connect realm 的名称。不能与 `iss` 同时指定。

`state`

（可选，字符串）用于在请求和响应之间维护状态的值；通常用作 CSRF 缓解措施。如果省略，Elasticsearch 会生成一个具有足够熵的值并将其返回。

`nonce`

（可选，字符串）用于将客户端会话与 ID 令牌关联的值；可缓解重放攻击。如果省略，Elasticsearch 会自动生成。

`iss`

（可选，字符串）用于第三方发起的 SSO：RP 向其发送验证请求的 OP 的颁发者标识符（Issuer Identifier）。不能与 `realm` 同时指定。

`login_hint`

（可选，字符串）用于第三方发起的 SSO：包含在验证请求中作为 `login_hint` 参数的字符串。指定 `realm` 时无效。

:::note 注意

`realm` 和 `iss` 必须指定其中一个（两者互斥）。

:::

## 响应体

`redirect`

指向 OP 授权端点的 URL，其中包含作为 HTTP GET 参数的所有验证请求参数（例如 `scope=openid`、`response_type=id_token`、`redirect_uri`、`state`、`nonce`、`client_id`）。

`state`

状态值（提供的或自动生成的）。

`nonce`

nonce 值（提供的或自动生成的）。

`realm`

匹配到的 OIDC realm 的名称（例如 `oidc1`）。

## 示例

以下示例为 realm `oidc1` 生成验证请求：

```txt
POST /_security/oidc/prepare
{
  "realm" : "oidc1"
}
```

API 返回以下响应：

```json
{
  "redirect" : "http://127.0.0.1:8080/c2id-login?scope=openid&response_type=id_token&redirect_uri=https%3A%2F%2Fmy.fantastic.rp%2Fcb&state=4dbrihtIAt3wBTwo6DxK-vdk-sSyDBV8Yf0AjdkdT5I&nonce=WaBPH0KqPVdG5HHdSxPRjfoZbXMCicm5v1OiAj0DUFM&client_id=elasticsearch-rp",
  "state" : "4dbrihtIAt3wBTwo6DxK-vdk-sSyDBV8Yf0AjdkdT5I",
  "nonce" : "WaBPH0KqPVdG5HHdSxPRjfoZbXMCicm5v1OiAj0DUFM",
  "realm" : "oidc1"
}
```

以下示例由客户端提供 `state` 和 `nonce` 值：

```txt
POST /_security/oidc/prepare
{
  "realm" : "oidc1",
  "state" : "lGYK0EcSLjqH6pkT5EVZjC6eIW5YCGgywj2sxROO",
  "nonce" : "zOBXLJGUooRrbLbQk5YCcyC8AXw3iloynvluYhZ5"
}
```

响应中的 `redirect`、`state`、`nonce` 和 `realm` 字段将包含这些值。

以下示例使用 `iss` 和 `login_hint` 进行第三方发起的 SSO：

```txt
POST /_security/oidc/prepare
{
  "iss" : "http://127.0.0.1:8080",
  "login_hint" : "this_is_an_opaque_string"
}
```

API 返回以下响应：

```json
{
  "redirect" : "http://127.0.0.1:8080/c2id-login?login_hint=this_is_an_opaque_string&scope=openid&response_type=id_token&redirect_uri=https%3A%2F%2Fmy.fantastic.rp%2Fcb&state=4dbrihtIAt3wBTwo6DxK-vdk-sSyDBV8Yf0AjdkdT5I&nonce=WaBPH0KqPVdG5HHdSxPRjfoZbXMCicm5v1OiAj0DUFM&client_id=elasticsearch-rp",
  "state" : "4dbrihtIAt3wBTwo6DxK-vdk-sSyDBV8Yf0AjdkdT5I",
  "nonce" : "WaBPH0KqPVdG5HHdSxPRjfoZbXMCicm5v1OiAj0DUFM",
  "realm" : "oidc1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-oidc-prepare-authentication.html)
