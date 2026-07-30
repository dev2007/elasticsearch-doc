# 更新连接器状态 API

:::warning 警告
此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新连接器的状态。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_status
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。
- 状态更改必须是连接器协议规定的有效状态转换。

## 路径参数

- `<connector_id>`（必需，字符串）

  要更新状态的连接器的 ID。

## 请求体

- `status`（必需，字符串）

  连接器框架中定义的有效连接器状态字符串。

## 响应码

- `200`：连接器状态字段已成功更新。
- `400`：未提供 `connector_id`、请求负载格式不正确，或不支持给定的状态转换。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例更新 ID 为 `my-connector` 的连接器的状态：

```json
PUT _connector/my-connector/_status
{
    "status": "needs_configuration"
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-status-api.html)
