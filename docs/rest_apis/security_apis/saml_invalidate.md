# SAML 使失效 API

提交 SAML `LogoutRequest` 消息供 Elasticsearch 消费。

```txt
POST /_security/saml/invalidate
```

## 描述

此 API 旨在用于 Kibana 之外的自定义 Web 应用程序。如果使用 Kibana，请参见[在 Elastic Stack 上配置 SAML 单点登录](/secure_the_stack/saml_single_sign_on)。

该注销请求来自 SAML IdP，用于 IdP 发起的单点注销（Single Logout）。自定义 Web 应用程序可以使用此 API 让 Elasticsearch 处理该 `LogoutRequest`。在成功验证该请求后，Elasticsearch 会：

- 使与该特定 SAML 主体对应的访问令牌和刷新令牌失效。
- 提供一个包含 SAML `LogoutResponse` 消息的 URL，以便将用户重定向回其 IdP。

Elasticsearch 通过 SAML API 暴露所有必要的 SAML 相关功能。这些 API 由 Kibana 内部使用以提供基于 SAML 的身份验证，但也可以由其他自定义 Web 应用程序或客户端使用。

## 请求体

`query_string`

（必需，字符串）SAML IdP 为发起单点注销而将用户重定向到的 URL 的查询部分。此查询应包含一个名为 `SAMLRequest` 的参数，其中包含一个经过 DEFLATE 压缩和 Base64 编码的 SAML 注销请求。如果 SAML IdP 对注销请求进行了签名，则此 URL 还应包含两个额外的参数：`SigAlg` 和 `Signature`，分别包含签名算法和签名值本身。

:::important 重要

`query_string` 的值必须与浏览器提供的字符串完全匹配，以便 Elasticsearch 能够验证 IdP 的签名 — 客户端应用程序不得以任何方式解析或处理该字符串。

:::

`acs`

（可选，字符串）与应使用的 Elasticsearch 中某个 SAML realm 匹配的断言消费服务 URL。必须指定此参数或 `realm` 参数之一。

`realm`

（可选，字符串）Elasticsearch 配置中 SAML realm 的名称。必须指定此参数或 `acs` 参数之一。

:::note 注意

参数 `queryString` 已在 7.14.0 中弃用，请改用 `query_string`。

:::

## 响应体

`invalidated`

作为此注销的一部分而失效的令牌数量。

`realm`

对此用户进行身份验证的 Elasticsearch 中 SAML realm 的 realm 名称。

`redirect`

一个包含 SAML 注销响应作为参数的 URL，以便将用户重定向回 SAML IdP。

## 示例

以下示例使 realm `saml1` 中 SAML 注销请求所标识的用户的所有令牌失效：

```txt
POST /_security/saml/invalidate
{
  "query_string" : "SAMLRequest=nZFda4MwFIb%2FiuS%2BmviRpqFaClKQdbvo2g12M2KMraCJ9cRR9utnW4Wyi13sMie873MeznJ1aWrnS3VQGR0j4mLkKC1NUeljjA77zYyhVbIE0dR%2By7fmaHq7U%2BdegXWGpAZ%2B%2F4pR32luBFTAtWgUcCv56%2Fp5y30X87Yz1khTIycdgpUW9kY7WdsC9zxoXTvMvWuVV98YyMnSGH2SYE5pwALBIr9QKiwDGpW0oGVUznGeMyJZKFkQ4jBf5HnhUymjIhzCAL3KNFihbYx8TBYzzGaY7EnIyZwHzCWMfiDnbRIftkSjJr%2BFu0e9v%2B0EgOquRiiZjKpiVFp6j50T4WXoyNJ%2FEWC9fdqc1t%2F1%2B2F3aUpjzhPiXpqMz1%2FHSn4A&SigAlg=http%3A%2F%2Fwww.w3.org%2F2001%2F04%2Fxmldsig-more%23rsa-sha256&Signature=MsAYz2NFdovMG2mXf6TSpu5vlQQyEJAg%2B4KCwBqJTmrb3yGXKUtIgvjqf88eCAK32v3eN8vupjPC8LglYmke1ZnjK0%2FKxzkvSjTVA7mMQe2AQdKbkyC038zzRq%2FYHcjFDE%2Bz0qISwSHZY2NyLePmwU7SexEXnIz37jKC6NMEhus%3D",
  "realm" : "saml1"
}
```

API 返回以下响应：

```json
{
  "redirect" : "https://my-idp.org/logout/SAMLResponse=....",
  "invalidated" : 2,
  "realm" : "saml1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-saml-invalidate.html)
