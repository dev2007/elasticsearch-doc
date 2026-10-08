# SAML 完成注销 API

验证由 SAML IdP 发送的注销响应。

```txt
POST /_security/saml/complete_logout
```

## 描述

此 API 旨在用于 Kibana 之外的自定义 Web 应用程序。如果使用 Kibana，请参见[在 Elastic Stack 上配置 SAML 单点登录](/secure_the_stack/saml_single_sign_on)。

SAML IdP 在处理 SP 发起的 SAML 单点注销后，可能会将注销响应发回给 SP。此 API 通过确保响应内容相关并验证其签名来验证该响应。

如果验证过程成功，则返回一个空响应。

注销响应可以由 IdP 通过 HTTP-Redirect 或 HTTP-Post 绑定发送。调用者必须相应地准备请求，以便此 API 可以处理这两种情况。

Elasticsearch 通过 SAML API 暴露所有必要的 SAML 相关功能。这些 API 由 Kibana 内部使用以提供基于 SAML 的身份验证，但也可以由其他自定义 Web 应用程序或客户端使用。

## 请求体

`realm`

（必需，字符串）Elasticsearch 中 SAML realm 的名称，用于验证注销响应的配置。

`ids`

（必需，字符串数组）包含 API 调用者拥有的当前用户的所有有效 SAML 请求 ID 的 JSON 数组。

`query_string`

（可选，字符串）如果 SAML IdP 通过 HTTP-Redirect 绑定发送注销响应，这必须是重定向 URI 的查询字符串。

`content`

（可选，字符串）如果 SAML IdP 通过 HTTP-Post 绑定发送注销响应，这必须是注销响应中 `SAMLResponse` 表单参数的值。

:::note 注意

参数 `queryString` 已在 7.14.0 中弃用，请改用 `query_string`。

:::

## 响应体

如果验证成功，此 API 返回一个空响应。

## 示例

以下示例验证由 IdP 通过 HTTP-Redirect 绑定发送的注销响应：

```txt
POST /_security/saml/complete_logout
{
  "realm" : "saml1",
  "ids" : [ "_1c368075e0b3d1ff1f368bf39bb2bd3b3f055f4b" ],
  "query_string" : "SAMLResponse=fZHLasMwEEVbfb1bf.....&SigAlg=http%3A%2F%2Fwww.w3.org%2F2000%2F09%2Fxmldsig%23rsa-sha1&Signature=CuCmFn%2BLqnaZGZJqK....."
}
```

以下示例验证由 IdP 通过 HTTP-Post 绑定发送的注销响应：

```txt
POST /_security/saml/complete_logout
{
  "realm" : "saml1",
  "ids" : [ "_1c368075e0b3d1ff1f368bf39bb2bd3b3f055f4b" ],
  "content" : "PHNhbWxwOkxvZ291dFJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46....."
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-saml-complete-logout.html)
