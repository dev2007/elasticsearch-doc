# 弃用信息 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [迁移 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-migration)。

:::::

这些 API 为 Kibana 的升级助手功能提供支持。我们强烈建议你使用升级助手从 7.17 升级到 8.18.8。有关升级说明，请参阅[升级到 Elastic 8.18.8](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/setup-upgrade.html)。

弃用 API 用于检索有关不同集群、节点和索引级别设置的信息，这些设置使用了将在未来版本中移除或更改的已弃用功能。

## 请求

```bash
GET /_migration/deprecations
```

```bash
GET /<target>/_migration/deprecations
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<target>`

  （可选，字符串）要检查的数据流或索引的逗号分隔列表。支持通配符（`*`）表达式。

  指定此参数时，仅返回指定数据流或索引的弃用信息。

## 设置

你可以使用以下设置控制弃用信息 API 的行为：

此设置为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 的间接使用而设计。不支持直接使用。

- `deprecation.skip_deprecated_settings`

  （动态）默认为空列表。设置为要被弃用信息 API 忽略的设置名称列表。与此列表中设置相关的任何弃用信息将不会被 API 返回。支持简单的通配符匹配。

## 示例

要查看集群中的违规者列表，向 `_migration/deprecations` 端点提交 GET 请求：

```bash
GET /_migration/deprecations
```

响应示例：

```json
{
  "cluster_settings" : [
    {
      "level" : "critical",
      "message" : "Cluster name cannot contain ':'",
      "url" : "https://www.elastic.co/guide/en/elasticsearch/reference/7.0/breaking-changes-7.0.html#_literal_literal_is_no_longer_allowed_in_cluster_name",
      "details" : "This cluster is named [mycompany:logging], which contains the illegal character ':'."
    }
  ],
  "node_settings" : [ ],
  "index_settings" : {
    "logs:apache" : [
      {
        "level" : "warning",
        "message" : "Index name cannot contain ':'",
        "url" : "https://www.elastic.co/guide/en/elasticsearch/reference/7.0/breaking-changes-7.0.html#_literal_literal_is_no_longer_allowed_in_index_name",
        "details" : "This index is named [logs:apache], which contains the illegal character ':'."
      }
    ]
  },
  "ml_settings" : [ ]
}
```

响应分解了所有在升级集群前应解决的具体向前不兼容设置。任何违规设置都表示为弃用警告。

以下是弃用警告示例：

```json
{
  "level" : "warning",
  "message" : "This is the generic descriptive message of the breaking change",
  "url" : "https://www.elastic.co/guide/en/elasticsearch/reference/6.0/breaking_60_indices_changes.html",
  "details" : "more information, like which nodes, indices, or settings are to blame"
}
```

如上所示，`level` 属性描述了问题的重要性：

- `warning`：可以直接升级，但正在使用已弃用的功能，该功能在未来版本中将不可用或行为不同。
- `critical`：不修复此问题无法升级。

`message` 属性和可选的 `details` 属性提供有关弃用警告的描述性信息。`url` 属性提供指向破坏性变更文档的链接，你可以在其中找到有关此更改的更多信息。

任何集群级别的弃用警告可以在 `cluster_settings` 键下找到。类似地，任何节点级别的警告在 `node_settings` 下找到。由于只有部分节点可能包含这些设置，阅读 `details` 部分获取有关哪些节点受影响的更多信息很重要。索引警告按索引分区，可以使用查询中的索引模式进行过滤。此部分包括请求路径中指定的数据流的后备索引的警告。机器学习相关的弃用警告可以在 `ml_settings` 键下找到。

以下示例请求仅显示所有 `logstash-*` 索引的索引级别弃用信息：

```bash
GET /logstash-*/_migration/deprecations
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/migration-api-deprecation.html)
