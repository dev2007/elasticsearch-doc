# 创建服务账户令牌 API

创建一个无需基本身份验证即可访问的服务账户令牌。

:::note 注意

服务账户令牌永不过期。如果不再需要，你必须主动删除它们。

:::

```txt
POST /_security/service/{namespace}/{service}/credential/token/{name}
PUT /_security/service/{namespace}/{service}/credential/token/{name}
POST /_security/service/{namespace}/{service}/credential/token
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_service_account` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`namespace`

（必需，字符串）命名空间的名称，服务账户的顶级分组。

`service`

（必需，字符串）服务的名称。

`name`

（必需，字符串）服务账户令牌的名称。如果省略，将生成一个随机名称。必须为 1–256 个字符；允许字母数字、短划线（`-`）和下划线（`_`）；不能以下划线开头。令牌名称在每个服务账户内必须唯一，并且在全局范围内以 `<namespace>/<service>/<token-name>` 形式保持唯一。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使操作对搜索可见；如果为 `wait_for`，等待刷新；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 响应体

`created`

（必需，布尔值）令牌是否已创建。

`token`

（必需，对象）令牌对象，包含：

- `name`（必需，字符串）令牌名称。
- `value`（必需，字符串）令牌的密钥值（持有者令牌）。

## 示例

以下示例为 `elastic` 命名空间中的 `fleet-server` 服务创建名为 `token1` 的服务账户令牌：

```txt
POST /_security/service/elastic/fleet-server/credential/token/token1
```

响应示例：

```json
{
  "created": true,
  "token": {
    "name": "token1",
    "value": "AAEAAWVsYXN0aWM...vZmxlZXQtc2VydmVyL3Rva2VuMTo3TFdaSDZ"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-create-service-token.html)
