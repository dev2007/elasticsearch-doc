# 生成 SAML 元数据 API

为 SAML 2.0 服务提供商（Service Provider）生成 SAML 元数据。

```txt
GET /_security/saml/metadata/<realm_name>
```

## 描述

SAML 2.0 规范提供了一种机制，服务提供商可以使用元数据文件来描述其功能和配置。此 API 根据 Elasticsearch 中 SAML realm 的配置生成服务提供商元数据。

## 路径参数

`<realm_name>`

（必需，字符串）Elasticsearch 中 SAML realm 的名称。

## 响应体

`metadata`

一个 XML 字符串，包含该 realm 的 SAML 服务提供商元数据。

## 示例

以下示例为 realm `saml1` 生成服务提供商元数据：

```txt
GET /_security/saml/metadata/saml1
```

API 返回以下响应：

```json
{
  "metadata": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><md:EntityDescriptor xmlns:md=\"urn:oasis:names:tc:SAML:2.0:metadata\" entityID=\"https://kibana.org\"><md:SPSSODescriptor AuthnRequestsSigned=\"false\" WantAssertionsSigned=\"true\" protocolSupportEnumeration=\"urn:oasis:names:tc:SAML:2.0:protocol\"><md:SingleLogoutService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect\" Location=\"https://kibana.org/logout\"/><md:AssertionConsumerService Binding=\"urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST\" Location=\"https://kibana.org/api/security/saml/callback\" index=\"1\" isDefault=\"true\"/></md:SPSSODescriptor></md:EntityDescriptor>"
}
```

解码后的 XML 元数据如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://kibana.org">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleLogoutService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
        Location="https://kibana.org/logout"/>
    <md:AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="https://kibana.org/api/security/saml/callback"
        index="1" isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-saml-sp-metadata.html)
