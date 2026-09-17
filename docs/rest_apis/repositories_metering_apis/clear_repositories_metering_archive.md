# 清除仓库计量归档 API

移除集群中存在的已归档仓库计量信息。

```txt
DELETE /_nodes/<node_id>/_repositories_metering/<max_version_to_clear>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor` 或 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 描述

可以使用此 API 清除集群中已归档的仓库计量信息。

## 路径参数

`<node_id>`

（可选，字符串）用于限制返回信息的节点 ID 或名称的逗号分隔列表。

所有节点选择选项的说明请参阅[节点信息 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-nodes-info.html)。

`<max_version_to_clear>`

（long）指定要从归档中清除的最大 `archive_version`。

## 响应体

返回已删除的已归档仓库计量信息。响应体结构与[获取仓库计量信息 API](./get_repositories_metering) 相同，包含以下顶层属性：

`_nodes`

（对象）包含请求所选择节点数量的统计信息，子属性包括 `total`、`successful`、`failed`。

`cluster_name`

（字符串）集群的名称。基于[集群名称设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-name-setting.html)。

`nodes`

（对象）包含请求所选择节点的仓库计量信息，其中每个 `<node_id>` 为仓库计量信息数组，数组元素的属性（`repository_name`、`repository_type`、`repository_location`、`repository_ephemeral_id`、`repository_started_at`、`repository_stopped_at`、`archived`、`cluster_version`、`request_counts`）详见[获取仓库计量信息 API](./get_repositories_metering#响应体)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/clear-repositories-metering-archive-api.html)
