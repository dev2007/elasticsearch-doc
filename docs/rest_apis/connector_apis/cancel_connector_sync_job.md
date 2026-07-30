# 取消连接器同步作业 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

取消连接器同步作业。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/_sync_job/<connector_sync_job_id>/_cancel
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_sync_job_id` 参数应引用一个现有的连接器同步作业。

## 描述

取消连接器同步作业，将状态设置为 `canceling`，并将 `cancellation_requested_at` 更新为当前时间。然后由连接器服务负责将连接器同步作业的状态设置为 `cancelled`。

## 路径参数

- `<connector_sync_job_id>`（必需，字符串）

  连接器同步作业 ID。

## 响应码

- `200`：连接器同步作业取消请求成功。
- `404`：找不到匹配 `connector_sync_job_id` 的连接器同步作业。

## 示例

以下示例取消 ID 为 `my-connector-sync-job-id` 的连接器同步作业：

```json
PUT _connector/_sync_job/my-connector-sync-job-id/_cancel
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cancel-connector-sync-job-api.html)
