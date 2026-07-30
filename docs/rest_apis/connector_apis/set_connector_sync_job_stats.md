# 设置连接器同步作业统计信息 API

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

设置连接器同步作业的统计信息。统计信息包括：`deleted_document_count`、`indexed_document_count`、`indexed_document_volume` 和 `total_document_count`。也可以使用此 API 更新 `last_seen`。此 API 主要由连接器服务用于更新同步作业信息。

## 请求

```json
PUT _connector/_sync_job/<connector_sync_job_id>/_stats
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_sync_job_id` 参数应引用一个现有的连接器同步作业。

## 路径参数

- `<connector_sync_job_id>`（必需，字符串）

  连接器同步作业的 ID。

## 请求体

- `deleted_document_count`（必需，整数）

  同步作业删除的文档数。

- `indexed_document_count`（必需，整数）

  同步作业索引的文档数。

- `indexed_document_volume`（必需，整数）

  同步作业索引的数据总大小（以 MiB 为单位）。

- `total_document_count`（可选，整数）

  同步作业完成后目标索引中的文档总数。

- `last_seen`（可选，时间戳）

  用于设置连接器同步作业 `last_seen` 属性的时间戳。

- `metadata`（可选，对象）

  连接器特定的元数据。

## 响应码

- `200`：表示连接器同步作业统计信息已成功更新。
- `404`：找不到匹配 `connector_sync_job_id` 的连接器同步作业。

## 示例

以下示例为连接器同步作业 `my-connector-sync-job` 设置所有必需和可选统计信息：

```json
PUT _connector/_sync_job/my-connector-sync-job/_stats
{
    "deleted_document_count": 10,
    "indexed_document_count": 20,
    "indexed_document_volume": 1000,
    "total_document_count": 2000,
    "last_seen": "2023-01-02T10:00:00Z"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/set-connector-sync-job-stats-api.html)
