# 委托 PKI 验证 API

此 API 实现 **X509 证书链**（X509Certificate chain）与 **Elasticsearch 访问令牌**的交换。根据 **RFC 5280**，通过依次考虑每个将 `delegation.enabled` 设置为 `true` 的已安装 PKI realm 的信任配置来验证证书链。成功受信任的客户端证书还要根据相应 realm 的 `username_pattern` 对主题可分辨名称进行验证。

**用例：**此 API 由智能且受信任的代理（例如 **Kibana**）调用，这些代理终止了用户的 TLS 会话，但仍希望使用 PKI realm 对用户进行身份验证 — 就像用户直接连接到 Elasticsearch 一样。

:::warning 重要提示

目标证书中的主题公钥与相应私钥之间的关联**不会**被验证。这是 TLS 身份验证过程的一部分，它委托给调用此 API 的代理。代理被信任已执行了 TLS 身份验证，此 API 将该身份验证转换为 Elasticsearch 访问令牌。

:::

```txt
POST /_security/delegate_pki
```

## 前置条件

- 要使用此 API，你必须具有 `all` [集群权限](../security_privileges/cluster_privileges)。

## 请求体

`x509_certificate_chain`

（必需，字符串数组）X509 证书链，表示为**有序字符串数组**。每个字符串是证书 DER 编码的 **base64 编码**（RFC4648 第 4 节 — *不是* base64url 编码）。**第一个元素**是包含请求访问的主题可分辨名称的目标证书。后续证书对前一个证书进行认证。

## 示例

以下示例用单元素证书链交换访问令牌：

```json
POST /_security/delegate_pki
{
  "x509_certificate_chain": [
    "MIIDeDCCAmCgAwIBAgIUBzj/nGGKxP2iXawsSquHmQjCJmMwDQYJKoZIhvcNAQELBQAwUzErMCkGA1UEAxMiRWxhc3RpY3NlYXJjaCBUZXN0IEludGVybWVkaWF0ZSBDQTEWMBQGA1UECxMNRWxhc3RpY3NlYXJjaDEMMAoGA1UEChMDb3JnMB4XDTIzMDcxODE5MjkwNloXDTQzMDcxMzE5MjkwNlowSjEiMCAGA1UEAxMZRWxhc3RpY3NlYXJjaCBUZXN0IENsaWVudDEWMBQGA1UECxMNRWxhc3RpY3NlYXJjaDEMMAoGA1UEChMDb3JnMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAllHL4pQkkfwAm/oLkxYYO+r950DEy1bjH+4viCHzNADLCTWO+lOZJVlNx7QEzJE3QGMdif9CCBBxQFMapA7oUFCLq84fPSQQu5AnvvbltVD9nwVtCs+9ZGDjMKsz98RhSLMFIkxdxi6HkQ3Lfa4ZSI4lvba4oo+T/GveazBDS+NgmKyq00EOXt3tWi1G9vEVItommzXWfv0agJWzVnLMldwkPqsw0W7zrpyT7FZS4iLbQADGceOW8fiauOGMkscu9zAnDR/SbWl/chYioQOdw6ndFLn1YIFPd37xL0WsdsldTpn0vH3YfzgLMffT/3P6YlwBegWzsx6FnM/93Ecb4wIDAQABo00wSzAJBgNVHRMEAjAAMB0GA1UdDgQWBBQKNRwjW+Ad/FN1Rpoqme/5+jrFWzAfBgNVHSMEGDAWgBRcya0c0x/PaI7MbmJVIylWgLqXNjANBgkqhkiG9w0BAQsFAAOCAQEACZ3PF7Uqu47lplXHP6YlzYL2jL0D28hpj5lGtdha4Muw1m/BjDb0Pu8l0NQ1z3AP6AVcvjNDkQq6Y5jeSz0bwQlealQpYfo7EMXjOidrft1GbqOMFmTBLpLA9SvwYGobSTXWTkJzonqVaTcf80HpMgM2uEhodwTcvz6v1WEfeT/HMjmdIsq4ImrOL9RNrcZG6nWfw0HR3JNOgrbfyEztEI471jHznZ336OEcyX7gQuvHE8tOv5+oD1d7s3Xg1yuFp+Ynh+FfOi3hPCuaHA+7F6fLmzMDLVUBAllugst1C3U+L/paD7tqIa4ka+KNPCbSfwazmJrt4XNiivPR4hwH5g=="
  ]
}
```

成功响应：

```json
{
  "access_token": "dGhpcyBpcyBub3QgYSByZWFsIHRva2VuIGJ1dCBpdCBpcyBvbmx5IHRlc3QgZGF0YS4gZG8gbm90IHRyeSB0byByZWFkIHRva2VuIQ==",
  "type": "Bearer",
  "expires_in": 1200,
  "authentication": {
    "username": "Elasticsearch Test Client",
    "roles": [],
    "full_name": null,
    "email": null,
    "metadata": {
      "pki_dn": "O=org, OU=Elasticsearch, CN=Elasticsearch Test Client",
      "pki_delegated_by_user": "test_admin",
      "pki_delegated_by_realm": "file"
    },
    "enabled": true,
    "authentication_realm": {
      "name": "pki1",
      "type": "pki"
    },
    "lookup_realm": {
      "name": "pki1",
      "type": "pki"
    },
    "authentication_type": "realm"
  }
}
```

## 响应体

`access_token`

（必需，字符串）与客户端证书的主题可分辨名称关联的访问令牌。

`expires_in`

（必需，数字）令牌过期前的时长（秒）。

`type`

（必需，字符串）令牌的类型（例如 `Bearer`）。

`authentication`

（对象）详细的身份验证信息，包含 `username`、`roles`、`full_name`、`email`、`token`、`metadata`、`enabled`、`authentication_realm`（含 `name`、`type`、`domain`）、`lookup_realm`（含 `name`、`type`、`domain`）、`authentication_type`、`api_key` 等属性。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-delegate-pki-authentication.html)
