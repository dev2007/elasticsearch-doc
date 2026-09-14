# 特性迁移 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [迁移 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-migration)。

:::::

这些 API 为 Kibana 的升级助手功能提供支持。我们强烈建议你使用升级助手从 7.17 升级到 8.18.8。有关升级说明，请参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)。

版本升级有时需要更改特性在系统索引中存储配置信息和数据的方式。特性迁移 API 使你能够查看哪些特性需要更改、启动自动迁移过程并检查迁移状态。

在迁移过程中，某些功能可能会暂时不可用。

## 请求

```bash
GET /_migration/system_features
```

```bash
POST /_migration/system_features
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

向 `_migration/system_features` 端点提交 GET 请求可查看哪些特性需要迁移以及任何正在进行的迁移的状态。

向端点提交 POST 请求可启动迁移过程。

## 示例

向 `_migration/system_features` 端点提交 GET 请求时，响应指示需要迁移的特性的状态：

```bash
GET /_migration/system_features
```

响应示例：

```json
{
  "features" : [
    {
      "feature_name" : "async_search",
      "minimum_index_version" : "8100099",
      "migration_status" : "NO_MIGRATION_NEEDED",
      "indices" : [ ]
    },
    {
      "feature_name" : "enrich",
      "minimum_index_version" : "8100099",
      "migration_status" : "NO_MIGRATION_NEEDED",
      "indices" : [ ]
    },
    ...
  ],
  "migration_status" : "NO_MIGRATION_NEEDED"
}
```

向 `_migration/system_features` 端点提交 POST 请求启动迁移过程时，响应指示将要迁移的特性：

```bash
POST /_migration/system_features
```

响应示例：

```json
{
  "accepted" : true,
  "features" : [
    {
      "feature_name" : "security"
    }
  ]
}
```

Elasticsearch 安全特性将在集群升级前迁移。

后续的 GET 请求将返回迁移过程的状态。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/feature-migration-api.html)
