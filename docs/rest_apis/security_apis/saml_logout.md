# SAML 注销已验证用户 API

提交使访问令牌和刷新令牌失效的请求，这些令牌是作为对 `/_security/saml/authenticate` 调用的响应而生成的。

```txt
POST /_security/saml/logout
```

## 描述

此 API 旨在用于 Kibana 之外的自定义 Web 应用程序。如果使用 Kibana，请参见[在 Elastic Stack 上配置 SAML 单点登录](/secure_the_stack/saml_single_sign_on)。

如果 Elasticsearch 中的 SAML realm 进行了相应配置并且 SAML 身份提供商（IdP）支持，则 Elasticsearch 的响应将包含一个用于将用户重定向到 IdP 的 URL，其中包含一个 SAML 注销请求（启动 SP 发起的 SAML 单点注销）。

Elasticsearch 通过 SAML API 暴露所有必要的 SAML 相关功能。这些 API 由 Kibana 内部使用以提供基于 SAML 的身份验证，但也可以由其他自定义 Web 应用程序或客户端使用。

SAML 注销已验证用户 API 用于使由[SAML 提交验证响应 API](./saml_authenticate) 返回的令牌失效。

## 请求体

`token`

（必需，字符串）由 SAML 提交验证响应 API 返回的访问令牌。或者，在通过刷新令牌刷新原始令牌后收到的最新令牌。

`refresh_token`

（可选，字符串）由 SAML 提交验证响应 API 返回的刷新令牌。或者，在刷新原始访问令牌后收到的最新刷新令牌。

## 响应体

`redirect`

一个包含 SAML 注销请求作为参数的 URL。用户可以使用此 URL 重定向回 SAML IdP 并启动单点注销。

## 示例

以下示例使访问令牌和刷新令牌失效：

```txt
POST /_security/saml/logout
{
  "token" : "46ToAxZVaXVVZTVKOVF5YU04ZFJVUDVSZlV3",
  "refresh_token" : "mJdXLtmvTUSpoLwMvdBt_w"
}
```

API 返回以下响应：

```json
{
  "redirect" : "https://my-idp.org/logout/SAMLRequest=...."
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-saml-logout.html)
