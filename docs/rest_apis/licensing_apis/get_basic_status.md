# 获取基础版状态 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [许可证 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-license)。

:::::

此 API 使你能够检查基础版许可证的状态。

## 请求

```bash
GET /_license/basic_status
```

## 描述

要启动基础版许可证，你当前不能已拥有基础版许可证。

有关不同许可证类型的更多信息，请参阅 [https://www.elastic.co/subscriptions](https://www.elastic.co/subscriptions)。

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `monitor` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。有关更多信息，请参阅[安全权限](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-privileges.html)。

## 示例

以下示例检查你是否有资格启动基础版：

```bash
GET /_license/basic_status
```

响应示例：

```json
{
  "eligible_to_start_basic": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-basic-status.html)
