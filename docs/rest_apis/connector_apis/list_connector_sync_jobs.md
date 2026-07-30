# 列出连接器同步作业 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

返回有关所有已存储的连接器同步作业的信息，按创建日期升序排列。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
GET _connector/_sync_job
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。

## 查询参数

- `size`（可选，整数）

  要检索的最大结果数。默认为 `100`。

- `from`（可选，整数）

  从第一个结果开始获取的偏移量。默认为 `0`。

- `status`（可选，作业状态）

  用于过滤结果的作业状态。可用状态包括：`canceling`、`canceled`、`completed`、`error`、`in_progress`、`pending`、`suspended`。

- `connector_id`（可选，字符串）

  获取的同步作业需要具有的连接器 ID。

- `job_type`（可选，作业类型）

  作业类型的逗号分隔列表。可用作业类型为：`full`、`incremental` 和 `access_control`。

## 响应码

- `200`：表示结果已成功返回（结果也可能为空）。
- `400`：表示请求格式不正确。

## 示例

### 示例 1：列出所有连接器同步作业

```json
GET _connector/_sync_job
```

### 示例 2：列出前两个连接器同步作业

```json
GET _connector/_sync_job?from=0&size=2
```

### 示例 3：列出待处理的连接器同步作业（默认前 100 个）

```json
GET _connector/_sync_job?status=pending
```

### 示例 4：列出特定连接器 ID 的连接器同步作业

```json
GET _connector/_sync_job?connector_id=connector-1
```

### 示例 5：按作业类型列出连接器同步作业（full 或 incremental）

```json
GET _connector/_sync_job?job_type=full,incremental
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-connector-sync-jobs-api.html)
