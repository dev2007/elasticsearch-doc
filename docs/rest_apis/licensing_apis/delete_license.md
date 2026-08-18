# 删除许可证 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

此 API 使你能够删除许可证信息。

## 请求

```bash
DELETE /_license
```

## 描述

当许可证过期时，X-Pack 将以降级模式运行。有关更多信息，请参阅[许可证过期](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/license-expiration.html)。

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。
- 如果启用了操作员权限功能，只有操作员用户才能使用此 API。

## 示例

以下示例删除许可证：

```bash
DELETE /_license
```

许可证成功删除后，API 返回以下响应：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-license.html)
