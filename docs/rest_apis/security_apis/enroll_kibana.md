# 注册新 Kibana 实例 API

使 Kibana 实例能够自行配置以与受保护的 Elasticsearch 集群通信。

:::note 注意

此 API 目前仅供 Kibana 内部使用。Kibana 使用此 API 在内部自行配置以与已启用安全功能的 Elasticsearch 集群通信。

:::

```txt
GET /_security/enroll/kibana
```

## 响应体

`token`

（必需，对象）`elastic/kibana` 服务账户的令牌对象，包含：

- `name`（必需，字符串）`elastic/kibana` 服务账户持有者令牌的名称。
- `value`（必需，字符串）`elastic/kibana` 服务账户持有者令牌的值。使用此值对 Elasticsearch 验证服务账户。

`http_ca`

（必需，字符串）用于签署 Elasticsearch 在 HTTP 层进行 TLS 所用节点证书的 CA 证书。证书以证书 ASN.1 DER 编码的 **Base64 编码字符串**形式返回。

## 示例

```txt
GET /_security/enroll/kibana
```

响应示例：

```json
{
  "token" : {
    "name" : "enroll-process-token-1629123923000",
    "value": "AAEAAWVsYXN0aWM...vZmxlZXQtc2VydmVyL3Rva2VuMTo3TFdaSDZ"
  },
  "http_ca" : "MIIJlAIBAzVoGCSqGSIb3...vsDfsA3UZBAjEPfhubpQysAICAA="
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-kibana-enrollment.html)
