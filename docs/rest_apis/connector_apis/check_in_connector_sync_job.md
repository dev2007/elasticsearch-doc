# 连接器同步作业签到 API

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

连接器同步作业签到（将 `last_seen` 更新为当前时间）。具体来说，它将 `last_seen` 设置为在内部索引中更新之前的时间。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/_sync_job/<connector_sync_job_id>/_check_in
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_sync_job_id` 参数应引用一个现有的连接器同步作业。

## 路径参数

- `<connector_sync_job_id>`（必需，字符串）

  要签到的连接器同步作业的 ID。

## 响应码

- `200`：连接器同步作业签到成功。
- `404`：找不到匹配 `connector_sync_job_id` 的连接器同步作业。

## 示例

以下示例对连接器同步作业 `my-connector-sync-job` 进行签到：

```json
PUT _connector/_sync_job/my-connector-sync-job/_check_in
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/check-in-connector-sync-job-api.html)
