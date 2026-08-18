# 获取许可证 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

此 API 使你能够检索许可证信息。

## 请求

```bash
GET /_license
```

## 描述

此 API 返回有关许可证类型、颁发时间和过期时间等信息。

有关不同许可证类型的更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

如果主节点正在生成新的集群状态，获取许可证 API 可能返回 404 Not Found 响应。如果在集群启动后收到意外的 404 响应，请稍等片刻后重试请求。

## 查询参数

- `local`

  （布尔值）指定是否检索本地信息。默认为 `false`，表示从主节点检索信息。

- `accept_enterprise`

  （布尔值）如果为 `true`，此参数为 Enterprise 许可证类型返回 `enterprise`。如果为 `false`，此参数对 platinum 和 enterprise 许可证类型都返回 `platinum`。此行为是为了向后兼容而保留的。

  在 7.6.0 中已弃用。

  此参数已弃用，在 8.x 中将始终设置为 `true`。

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 示例

以下示例提供有关试用许可证的信息：

```bash
GET /_license
```

API 返回以下响应：

```json
{
  "license" : {
    "status" : "active",
    "uid" : "cbff45e7-c553-41f7-ae4f-9205eabd80xx",
    "type" : "trial",
    "issue_date" : "2018-10-20T22:05:12.332Z",
    "issue_date_in_millis" : 1540073112332,
    "expiry_date" : "2018-11-19T22:05:12.332Z",
    "expiry_date_in_millis" : 1542665112332,
    "max_nodes" : 1000,
    "max_resource_units" : null,
    "issued_to" : "test",
    "issuer" : "elasticsearch",
    "start_date_in_millis" : -1
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-license.html)
