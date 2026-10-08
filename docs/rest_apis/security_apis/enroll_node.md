# 注册新节点 API

注册一个新节点，使其能够加入启用了安全功能的现有集群。

响应包含加入节点引导发现和安全相关设置所需的所有信息，使其能够成功加入集群。响应包含密钥和证书材料，允许调用者为集群中所有节点的 HTTP 层生成有效的签名证书。

```txt
GET /_security/enroll/node
```

## 响应体

`http_ca_key`

（必需，字符串）新节点可用于为其 HTTP 层证书签名的 CA 私钥，以密钥 ASN.1 DER 编码的 Base64 编码字符串形式返回。

`http_ca_cert`

（必需，字符串）新节点可用于为其 HTTP 层证书签名的 CA 证书，以证书 ASN.1 DER 编码的 Base64 编码字符串形式返回。

`transport_ca_cert`

（必需，字符串）用于签署传输层 TLS 证书的 CA 证书，以证书 ASN.1 DER 编码的 Base64 编码字符串形式返回。

`transport_key`

（必需，字符串）节点可用于其传输层 TLS 的私钥，以密钥 ASN.1 DER 编码的 Base64 编码字符串形式返回。

`transport_cert`

（必需，字符串）节点可用于其传输层 TLS 的证书，以证书 ASN.1 DER 编码的 Base64 编码字符串形式返回。

`nodes_addresses`

（必需，字符串数组）已是集群成员节点的传输地址列表（`host:port` 形式）。

## 示例

```txt
GET /_security/enroll/node
```

响应示例：

```json
{
  "http_ca_key": "MIIJlAIBAzCCCVoGCSqGSIb3DQEHAaCCCUsEgglHMIIJQzCCA98GCSqGSIb3DQ....vsDfsA3UZBAjEPfhubpQysAICCAA=",
  "http_ca_cert": "MIIJlAIBAzCCCVoGCSqGSIb3DQEHAaCCCUsEgglHMIIJQzCCA98GCSqGSIb3DQ....vsDfsA3UZBAjEPfhubpQysAICCAA=",
  "transport_ca_cert": "MIIJlAIBAzCCCVoGCSqGSIb3DQEHAaCCCUsEgglHMIIJQzCCA98GCSqG....vsDfsA3UZBAjEPfhubpQysAICCAA=",
  "transport_key": "MIIEJgIBAzCCA98GCSqGSIb3DQEHAaCCA9AEggPMMIIDyDCCA8QGCSqGSIb3....YuEiOXvqZ6jxuVSQ0CAwGGoA==",
  "transport_cert": "MIIEJgIBAzCCA98GCSqGSIb3DQEHAaCCA9AEggPMMIIDyDCCA8QGCSqGSIb3....YuEiOXvqZ6jxuVSQ0CAwGGoA==",
  "nodes_addresses": [
    "192.168.1.2:9300"
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-node-enrollment.html)
