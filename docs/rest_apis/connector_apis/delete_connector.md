# 删除连接器 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

移除连接器及相关的同步作业。这是一个不可恢复的破坏性操作。

:::note 注意
此操作不会删除与连接器关联的任何 API 密钥、接入管道或数据索引。这些需要手动移除。
:::

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
DELETE _connector/<connector_id>
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

- `delete_sync_jobs`（可选，布尔值）

  指示是否也应移除相关的同步作业的标志。默认为 `false`。

## 响应码

- `400`：未提供 `connector_id`。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例删除 ID 为 `another-connector` 的连接器及其相关的同步作业：

```json
DELETE _connector/another-connector?delete_sync_jobs=true
```

API 返回以下结果：

```json
{
    "acknowledged": true
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-connector-api.html)
