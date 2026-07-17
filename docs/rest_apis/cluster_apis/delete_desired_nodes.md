# 删除期望节点 API

:::::warning 警告
此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 间接使用而设计。不支持直接使用。
:::::

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
::::

删除期望节点。

## 请求

```bash
DELETE /_internal/desired_nodes
```

## 描述

此 API 删除期望节点。

## 示例

此示例删除当前的期望节点。

```bash
DELETE /_internal/desired_nodes
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-desired-nodes.html)
