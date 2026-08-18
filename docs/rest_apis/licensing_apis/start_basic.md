# 启动基础版 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

此 API 启动无限期的基础版许可证。

## 请求

```bash
POST /_license/start_basic
```

## 描述

启动基础版 API 使你能够启动无限期的基础版许可证，从而获得所有基础功能的访问权限。但是，如果基础版许可证不支持当前许可证可用的所有功能，你将在响应中收到通知。此时，你必须将 `acknowledge` 参数设置为 `true` 后重新提交 API 请求。

要检查基础版许可证的状态，请使用[获取基础版状态 API](./get_basic_status)。

有关不同许可证类型的更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 示例

以下示例在你当前没有许可证时启动基础版许可证：

```bash
POST /_license/start_basic
```

响应示例：

```json
{
  "basic_was_started": true,
  "acknowledged": true
}
```

以下示例在你当前拥有比基础版许可证更多功能的许可证时启动基础版许可证。由于你将失去部分功能，必须传入 `acknowledge` 参数：

```bash
POST /_license/start_basic?acknowledge=true
```

响应示例：

```json
{
  "basic_was_started": true,
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/start-basic.html)
