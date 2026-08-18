# 启动试用 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

启动 30 天试用。

## 请求

```bash
POST /_license/start_trial
```

## 描述

启动试用 API 使你能够启动 30 天试用，从而获得所有订阅功能的访问权限。

仅当集群尚未为当前主要产品版本激活试用时，才允许启动试用。例如，如果你已经为 v6.0 激活了试用，则在 v7.0 之前无法启动新的试用。但是，你可以在 [https://www.elastic.co/trialextension](https://www.elastic.co/trialextension) 申请延长试用。

要检查试用状态，请使用[获取试用状态 API](./get_trial_status)。

有关功能和订阅的更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 查询参数

- `acknowledge`

  （布尔值）当为 `true` 时，确认你要启动试用，即使它将会过期。由于你正在启动将会过期的许可证，此参数为必需。

## 示例

以下示例启动 30 天试用。由于你正在启动将会过期的许可证，`acknowledge` 参数为必需。

```bash
POST /_license/start_trial?acknowledge=true
```

响应示例：

```json
{
  "trial_was_started": true,
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/start-trial.html)
