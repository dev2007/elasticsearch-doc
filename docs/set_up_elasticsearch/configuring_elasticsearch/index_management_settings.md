# 索引管理设置

你可以使用以下集群设置来启用或禁用索引管理功能。

- `action.auto_create_index` ![cloud](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  [动态](/set_up_elasticsearch/configuring_elasticsearch)如果索引还不存在将[自动创建索引](/rest_apis/document_apis/index.html#自动创建数据流和索引)并应用任何配置的索引模板。默认为 `true`。

- `action.destructive_requires_name` ![cloud](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)设置为 `true` 时，必须指定索引名称以[删除索引](/rest_apis/index_apis/delete_index.html)。不可能删除所有带 `_all` 的索引或使用通配符。默认为 `true`。

- `cluster.indices.close.enable` ![cloud](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)允许关闭 Elasticsearch 中的开放索引。如果为 `false`，则无法关闭打开的索引。默认为 `true`。

::: tip 注意
关闭的索引仍然占用大量磁盘空间。
:::

- `reindex.remote.whitelist`  ![cloud](https://www.elastic.co/cloud/elasticsearch-service/signup?baymax=docs-body&elektra=docs)

  ([静态](/set_up_elasticsearch/configuring_elasticsearch)指定可以[从远程重索引](/rest_apis/document_apis/reindex.html#从远程重索引)的主机。期望它为 `host:port` 字符串的 YAML 数组。由逗号分隔的 `host:port` 条目列表组成。默认值为 `["\*.io:*"，"\*.com:*"]`。

- `stack.templates.enabled`

  ([动态](/set_up_elasticsearch/configuring_elasticsearch)如果为 `true`，则启用内置索引和组件模板。[Elastic Agent](/fleet_and_elastic_agent_overview.html) 使用这些模板创建数据流。如果为 `false`，Elasticsearch 将禁用这些索引和组件模板。默认为 `true`。

  此设置影响以下内置索引模板：

  - `logs-*-*`
  - `metrics-*-*`
  - `synthetics-*-*`

  此设置也影响以下内置的组件模板：

  - `logs-mappings`
  - `logs-settings`
  - `metrics-mappings`
  - `metrics-settings`
  - `synthetics-mapping`
  - `synthetics-settings`

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-management-settings.html)
