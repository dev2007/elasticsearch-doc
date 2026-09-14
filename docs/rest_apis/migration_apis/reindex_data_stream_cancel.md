# 重新索引数据流取消 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [迁移 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-migration)。

:::::

这些 API 为 Kibana 的升级助手功能提供支持。我们强烈建议你使用升级助手从 7.17 升级到 8.18.8。有关升级说明，请参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)。

取消由重新索引数据流 API 启动的正在运行的数据流重新索引任务。已重新索引并交换到数据流中的任何后备索引将保留在数据流中。只有当前正在重新索引的后备索引或仍在等待重新索引的待处理后备索引才会被取消。数据流重新索引任务取消后，将无法通过状态 API 访问。如果重新索引任务当前未运行，此 API 将返回 `resource_not_found_exception`。

## 请求

```bash
GET /_migration/reindex/<data-stream>/_cancel
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对数据流拥有**管理索引**[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 路径参数

- `<data-stream>`

  （必需，字符串）要取消重新索引的数据流名称。

## 示例

```bash
POST _migration/reindex/my-data-stream/_cancel
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/data-stream-reindex-cancel-api.html)
