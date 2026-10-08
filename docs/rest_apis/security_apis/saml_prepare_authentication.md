# SAML 准备验证请求 API

根据 Elasticsearch 中相应 SAML realm 的配置，创建一个作为 URL 字符串的 SAML 验证请求（`<AuthnRequest>`）。

```txt
POST /_security/saml/prepare
```

## 描述

此 API 旨在用于 Kibana 之外的自定义 Web 应用程序。如果使用 Kibana，请参见[在 Elastic Stack 上配置 SAML 单点登录](/secure_the_stack/saml_single_sign_on)。

该 API 返回一个指向 SAML 身份提供商（Identity Provider，IdP）的 URL，用于将用户的浏览器重定向到该 URL 以继续身份验证。此 URL 包含一个 `SAMLRequest` 参数，其中包含一个经过 DEFLATE 压缩和 Base64 编码的 SAML 验证请求。如果配置要求签名验证请求，则此 URL 还包含两个额外的参数：`SigAlg`（签名算法）和 `Signature`（签名值）。

它还返回一个唯一标识该 SAML 验证请求的随机字符串。调用者必须存储此标识符，因为身份验证过程的后续步骤需要它（参见 SAML 提交验证响应 API）。

SAML 相关 API 包括：SAML 提交验证响应 API、SAML 使失效 API、SAML 注销 API 和 SAML 完成注销 API。这些 API 由 Kibana 内部使用，但也可以由自定义 Web 应用程序或其他客户端使用。

## 请求体

`acs`

（可选，字符串）与 Elasticsearch 中某个 SAML realm 匹配的断言消费服务（Assertion Consumer Service）URL；将使用该 realm 生成验证请求。

`realm`

（可选，字符串）Elasticsearch 中用于生成验证请求的 SAML realm 的名称。

`relay_state`

（可选，字符串）包含在返回的重定向 URL 中作为 `RelayState` 查询参数的字符串。如果验证请求经过签名，此值将用作签名计算的一部分。

:::note 注意

必须指定 `acs` 或 `realm` 中的一个。

:::

## 响应体

`id`

SAML 请求的唯一标识符，由 API 调用者存储。

`realm`

用于构造验证请求的 Elasticsearch realm 的名称。

`redirect`

用户应重定向到的 URL。

## 示例

以下示例为 realm `saml1` 生成验证请求：

```txt
POST /_security/saml/prepare
{
  "realm" : "saml1"
}
```

API 返回以下响应：

```json
{
  "redirect" : "https://my-idp.org/login?SAMLRequest=fVJdc6IwFP0rmbwDgUKLGbFDtc462%2B06FX3Yl50rBJsKCZsbrPbXL6J22hdfk%2FNx7zl3eL%2BvK7ITBqVWCfVdRolQuS6k2iR0mU2dmN6Phgh1FTQ8be2rehH%2FWoGWdESF%2FPST0NYorgElcgW1QG5zvkh%2FPfHAZbwx2upcV5SkiMLYzmqsFba1MAthdjIXy5enhL5a23DPOyo6W7kGBa7cwhZ2gO7G8OiW%2BR400kORt0bag7fzezAlk24eqcD2OxxlsNN5O3MdsW9c6CZnbq7rntF4d3s0D7BaHTZhIWN52P%2BcjiuGRbDU6cdj%2BEjJbJLQv4N4ADdhxBiEZbQuWclY4Q8iABbCXczCdSiKMAC%2FgyO2YqbQgrIJDZg%2FcFjsMD%2Fzb3gUcBa5sR%2F9oWR%2BzuJBqlPG14Jbn0DIf2TZ3Jn%2FXmSUrC5ddQB6bob37uZrJdeF4dIDHV3iuhb70Ptq83kOz53ubDLXlcwPJK0q%2FT42AqxIaAkVCkqm2tRgr49yfJGFU%2FZQ3hy3QyuUpd7obPv97kb%2FAQ%3D%3D",
  "realm" : "saml1",
  "id" : "_989a34500a4f5bf0f00d195aa04a7804b4ed42a1"
}
```

以下示例通过断言消费服务 URL 生成验证请求：

```txt
POST /_security/saml/prepare
{
  "acs" : "https://kibana.org/api/security/saml/callback"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-saml-prepare-authentication.html)
