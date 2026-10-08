# 获取服务账户凭据 API

检索服务账户的所有凭据。

```txt
GET /_security/service/<namespace>/<service>/credential
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限（或更大的权限，例如 `manage_service_account` 或 `manage_security`）。

## 描述

使用此 API 检索服务账户的凭据列表。

响应中包括通过创建服务账户令牌 API 创建的服务账户令牌，以及来自集群所有节点的基于文件的令牌（file-backed tokens）。

对于由 `service_tokens` 文件支持的令牌，此 API 会从集群的所有节点收集它们。来自不同节点的同名令牌被假定为同一个令牌，并且只计算一次服务令牌总数。

## 路径参数

`namespace`

（必需，字符串）命名空间的名称。

`service`

（必需，字符串）服务的名称。

## 示例

以下示例为 `elastic/fleet-server` 服务账户创建一个名为 `token1` 的服务账户令牌：

```txt
POST /_security/service/elastic/fleet-server/credential/token/token1
```

然后，以下示例检索 `elastic/fleet-server` 服务账户的所有凭据：

```txt
GET /_security/service/elastic/fleet-server/credential
```

API 返回以下响应：

```json
{
  "service_account": "elastic/fleet-server",
  "count": 3,
  "tokens": {
    "token1": {},
    "token42": {}
  },
  "nodes_credentials": {
    "_nodes": {
      "total": 3,
      "successful": 3,
      "failed": 0
    },
    "file_tokens": {
      "my-token": {
        "nodes": [ "node0", "node1" ]
      }
    }
  }
}
```

- `tokens` 中的 `token1` 是由 `.security` 索引支持的（新创建的）服务账户令牌。
- `tokens` 中的 `token42` 是由 `.security` 索引支持的（已存在的）服务账户令牌。
- `nodes_credentials` 是从集群所有节点收集的服务账户凭据。
- `nodes_credentials._nodes` 显示节点如何响应收集请求的常规状态。
- `nodes_credentials.file_tokens` 是从所有节点收集的基于文件的令牌。
- `nodes_credentials.file_tokens.my-token.nodes` 是（基于文件的）`my-token` 所在的节点列表。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-service-credentials.html)
