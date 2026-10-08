# 获取内置权限 API

获取此版本的 Elasticsearch 中可用的集群权限和索引权限的列表。

```txt
GET /_security/privilege/_builtin
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 响应体

`cluster`

（必需，字符串数组）此版本的 Elasticsearch 所理解的集群权限列表。

`index`

（必需，字符串数组）此版本的 Elasticsearch 所理解的索引权限列表。

`remote_cluster`

（必需，字符串数组）此版本的 Elasticsearch 所理解的 `remote_cluster` 权限列表。有效值为 `monitor_enrich` 或 `monitor_stats`。

## 示例

```txt
GET /_security/privilege/_builtin
```

响应示例：

```json
{
  "cluster" : [
    "all",
    "cancel_task",
    "create_snapshot",
    "cross_cluster_replication",
    "cross_cluster_search",
    "delegate_pki",
    "grant_api_key",
    "manage",
    "manage_api_key",
    "manage_autoscaling",
    "manage_behavioral_analytics",
    "manage_ccr",
    "manage_connector",
    "manage_data_frame_transforms",
    "manage_data_stream_global_retention",
    "manage_enrich",
    "manage_ilm",
    "manage_index_templates",
    "manage_inference",
    "manage_ingest_pipelines",
    "manage_logstash_pipelines",
    "manage_ml",
    "manage_oidc",
    "manage_own_api_key",
    "manage_pipeline",
    "manage_rollup",
    "manage_saml",
    "manage_search_application",
    "manage_search_query_rules",
    "manage_search_synonyms",
    "manage_security",
    "manage_service_account",
    "manage_slm",
    "manage_token",
    "manage_transform",
    "manage_user_profile",
    "manage_watcher",
    "monitor",
    "monitor_connector",
    "monitor_data_frame_transforms",
    "monitor_data_stream_global_retention",
    "monitor_enrich",
    "monitor_inference",
    "monitor_ml",
    "monitor_rollup",
    "monitor_snapshot",
    "monitor_stats",
    "monitor_text_structure",
    "monitor_transform",
    "monitor_watcher",
    "none",
    "post_behavioral_analytics_event",
    "read_ccr",
    "read_connector_secrets",
    "read_fleet_secrets",
    "read_ilm",
    "read_pipeline",
    "read_security",
    "read_slm",
    "transport_client",
    "write_connector_secrets",
    "write_fleet_secrets"
  ],
  "index" : [
    "all",
    "auto_configure",
    "create",
    "create_doc",
    "create_index",
    "cross_cluster_replication",
    "cross_cluster_replication_internal",
    "delete",
    "delete_index",
    "index",
    "maintenance",
    "manage",
    "manage_data_stream_lifecycle",
    "manage_follow_index",
    "manage_ilm",
    "manage_leader_index",
    "monitor",
    "none",
    "read",
    "read_cross_cluster",
    "view_index_metadata",
    "write"
  ],
  "remote_cluster" : [
    "monitor_enrich",
    "monitor_stats"
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-builtin-privileges.html)
