# 获取试用状态 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

使你能够检查试用的状态。

## 请求

```bash
GET /_license/trial_status
```

## 描述

如果你想尝试所有订阅功能，可以启动 30 天试用。

仅当集群尚未为当前主要产品版本激活试用时，才允许启动试用。例如，如果你已经为 v6.0 激活了试用，则在 v7.0 之前无法启动新的试用。但是，你可以在 [https://www.elastic.co/trialextension](https://www.elastic.co/trialextension) 申请延长试用。

有关功能和订阅的更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 示例

以下示例检查你是否有资格启动试用：

```bash
GET /_license/trial_status
```

响应示例：

```json
{
  "eligible_to_start_trial": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-trial-status.html)
