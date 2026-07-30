# 获取连接器 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

检索有关连接器的详细信息。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
GET _connector/<connector_id>
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 响应码

- `400`：未提供 `connector_id`。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例获取连接器 `my-connector`：

```json
GET _connector/my-connector
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-connector-api.html)
