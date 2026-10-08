# 删除服务账户令牌 API

删除指定命名空间中某项服务的服务账户令牌。

```txt
DELETE /_security/service/<namespace>/<service>/credential/token/<name>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_service_account` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`namespace`

（必需，字符串）命名空间，即服务账户的顶级分组。

`service`

（必需，字符串）服务名称。

`name`

（必需，字符串）服务账户令牌的名称。

## 查询参数

`refresh`

（可选，字符串）如果为 `true`（默认），刷新受影响的分片以使此操作对搜索可见；如果为 `wait_for`，等待刷新以使此操作对搜索可见；如果为 `false`，不进行任何刷新操作。有效值为：`true`、`false`、`wait_for`。

## 示例

以下示例删除 `elastic` 命名空间中 `fleet-server` 服务的 `token42` 令牌：

```txt
DELETE /_security/service/elastic/fleet-server/credential/token/token42
```

如果服务账户令牌成功删除，请求返回：

```json
{
  "found": true
}
```

否则，响应具有状态码 `404`，且 `found` 设置为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-delete-service-token.html)
