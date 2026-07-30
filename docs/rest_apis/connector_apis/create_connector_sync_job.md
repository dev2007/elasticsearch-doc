# 创建连接器同步作业 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

创建连接器同步作业。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
POST _connector/_sync_job
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 [Elastic 连接器服务](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-build-connector.html#es-connectors-deploy-connector-service)。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `id` 参数应引用一个现有的连接器。

## 描述

在内部索引中创建连接器同步作业文档，并使用默认值初始化其计数器和时间戳。某些值可以通过 API 更新。

## 请求体

- `id`（必需，字符串）

  要为其创建同步作业的连接器的 ID。

- `job_type`（可选，字符串）

  创建的同步作业的作业类型。默认为 `full`。

- `trigger_method`（可选，字符串）

  创建的同步作业的触发方法。默认为 `on_demand`。

## 响应体

- `id`（字符串）

  与连接器同步作业文档关联的 ID。

## 响应码

- `201`：表示连接器同步作业已成功创建。
- `400`：表示请求格式不正确。
- `404`：表示索引或引用的连接器不存在。

## 示例

```json
POST _connector/_sync_job
{
  "id": "connector-id",
  "job_type": "full",
  "trigger_method": "on_demand"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/create-connector-sync-job-api.html)
