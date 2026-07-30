# 更新连接器上次同步统计信息 API

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新与连接器上次同步相关的字段。

此操作用于分析和监控。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_last_sync
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `last_access_control_sync_error`（可选，字符串）

  与上次访问控制同步相关的最后一条错误消息（如果有）。

- `last_access_control_sync_scheduled_at`（可选，日期时间）

  指示上次访问控制同步调度时间的日期时间。

- `last_access_control_sync_status`（可选，`ConnectorSyncStatus`）

  上次访问控制同步的状态。

- `last_deleted_document_count`（可选，long）

  上次同步过程中删除的文档数。

- `last_incremental_sync_scheduled_at`（可选，日期时间）

  上次增量同步调度的日期时间。

- `last_indexed_document_count`（可选，long）

  上次同步中索引的文档数。

- `last_sync_error`（可选，字符串）

  同步过程中遇到的最后一条错误消息（如果有）。

- `last_sync_scheduled_at`（可选，日期时间）

  上次同步调度的日期时间。

- `last_sync_status`（可选，`ConnectorSyncStatus`）

  上次同步的状态。

- `last_synced`（可选，日期时间）

  上次成功同步的日期时间。

`ConnectorSyncStatus` 的值为以下表示不同同步状态的小写字符串之一：

- `canceling`：同步过程正在被取消。
- `canceled`：同步过程已被取消。
- `completed`：同步过程已成功完成。
- `error`：同步过程中发生错误。
- `in_progress`：同步过程正在进行中。
- `pending`：同步已挂起但尚未开始。
- `suspended`：同步过程已被暂时暂停。

## 响应码

- `200`：连接器上次同步统计信息已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例更新 ID 为 `my-connector` 的连接器的上次同步统计信息：

```json
PUT _connector/my-connector/_last_sync
{
    "last_access_control_sync_error": "Houston, we have a problem!",
    "last_access_control_sync_scheduled_at": "2023-11-09T15:13:08.231Z",
    "last_access_control_sync_status": "pending",
    "last_deleted_document_count": 42,
    "last_incremental_sync_scheduled_at": "2023-11-09T15:13:08.231Z",
    "last_indexed_document_count": 42,
    "last_sync_error": "Houston, we have a problem!",
    "last_sync_scheduled_at": "2024-11-09T15:13:08.231Z",
    "last_sync_status": "completed",
    "last_synced": "2024-11-09T15:13:08.231Z"
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-last-sync-api.html)
