# 认领连接器同步作业 API

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

认领连接器同步作业。此操作将作业的状态更新为 `in_progress`，并将 `last_seen` 和 `started_at` 时间戳设置为当前时间。此外，它还可以设置同步作业的 `sync_cursor` 属性。

`_claim` 端点**不用于用户直接管理连接器**。它的存在是为了支持利用连接器协议与 Elasticsearch 通信的服务实现。

## 请求

```json
PUT _connector/_sync_job/<connector_sync_job_id>/_claim
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_sync_job_id` 参数应引用一个现有的连接器同步作业。

## 路径参数

- `<connector_sync_job_id>`（必需，字符串）

  要认领的连接器同步作业的 ID。

## 请求体

- `worker_hostname`（必需，字符串）

  将执行该作业的当前系统的主机名。

- `sync_cursor`（可选，对象）

  上次增量同步作业的游标对象。此对象应引用执行该作业的连接器状态中的 `sync_cursor` 字段。

## 响应码

- `200`：连接器同步作业认领成功。
- `404`：找不到匹配 `connector_sync_job_id` 的连接器同步作业。

## 示例

以下示例认领 ID 为 `my-connector-sync-job-id` 的连接器同步作业：

```json
PUT _connector/_sync_job/my-connector-sync-job-id/_claim
{
  "worker_hostname": "some-machine"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/claim-connector-sync-job-api.html)
