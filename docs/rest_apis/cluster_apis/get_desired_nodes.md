# 获取期望节点 API

::::warning 警告
此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 间接使用而设计。不支持直接使用。
::::

:::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
:::

获取期望节点。

## 请求

```bash
GET /_internal/desired_nodes/_latest
```

## 描述

此 API 获取最新的期望节点。

## 示例

此示例获取最新的期望节点。

```bash
GET /_internal/desired_nodes/_latest
```

API 返回以下结果：

```json
{
    "history_id": "<history_id>",
    "version": "<version>",
    "nodes": [
        {
            "settings": "<node_settings>",
            "processors": "<node_processors>",
            "memory": "<node_memory>",
            "storage": "<node_storage>"
        }
    ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-desired-nodes.html)
