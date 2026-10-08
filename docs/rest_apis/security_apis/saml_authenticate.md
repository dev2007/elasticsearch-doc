# SAML 提交验证响应 API

提交 SAML 响应消息供 Elasticsearch 消费。

```txt
POST /_security/saml/authenticate
```

## 描述

此 API 旨在用于 Kibana 之外的自定义 Web 应用程序。如果使用 Kibana，请参见[在 Elastic Stack 上配置 SAML 单点登录](/secure_the_stack/saml_single_sign_on)。

提交的 SAML 消息可以是以下两种情况之一：

- 对先前通过 SAML 准备验证请求 API 创建的 SAML 验证请求的响应；或者
- 在 IdP 发起的单点登录（SSO）流程中的主动提供的 SAML 消息。

在这两种情况下，SAML 消息都必须是一个根元素为 `<Response>` 的 Base64 编码 XML 文档。

验证成功后，Elasticsearch 会返回一个可用于后续身份验证的内部访问令牌和刷新令牌。

SAML 相关 API 包括：SAML 准备验证请求 API、SAML 使失效 API、SAML 注销 API 和 SAML 完成注销 API。这些 API 由 Kibana 内部使用，但也可以由自定义 Web 应用程序或其他客户端使用。

## 请求体

`content`

（必需，字符串）由用户浏览器发送的 SAML 响应，通常是一个 Base64 编码的 XML 文档。

`ids`

（必需，字符串数组）调用者拥有的当前用户的所有有效 SAML 请求 ID 的数组。

`realm`

（可选，字符串）应用于对此 SAML 响应进行身份验证的 realm 的名称。当定义了多个 SAML realm 时很有用。

## 响应体

`access_token`

由 Elasticsearch 生成的访问令牌。

`username`

已通过身份验证的用户的名称。

`expires_in`

令牌过期前的剩余时间（以秒为单位）。

`refresh_token`

由 Elasticsearch 生成的刷新令牌。

`realm`

对此用户进行身份验证的 realm 的名称。

## 示例

以下示例将用户浏览器返回的 SAML 响应交换为 Elasticsearch 访问令牌和刷新令牌：

```txt
POST /_security/saml/authenticate
{
  "content" : "PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zOnNhbWw9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMD.....",
  "ids" : [ "4fee3b046395c4e751011e97f8900b5273d56685" ]
}
```

API 返回以下响应：

```json
{
  "access_token" : "46ToAxZVaXVVZTVKOVF5YU04ZFJVUDVSZlV3",
  "username" : "r1clinna",
  "expires_in" : 1200,
  "refresh_token" : "mJdXLtmvTUSpoLwMvdBt_w",
  "realm" : "saml1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-saml-authenticate.html)
