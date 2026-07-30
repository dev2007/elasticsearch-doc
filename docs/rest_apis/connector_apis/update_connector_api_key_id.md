# 更新连接器 API 密钥 ID API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新连接器的 `api_key_id` 和/或 `api_key_secret_id` 字段，指定：

1. 用于授权的 API 密钥 ID
2. 存储 API 密钥的连接器密钥 ID

连接器密钥 ID 仅用于 **Elastic 托管连接器**。自托管连接器不使用此字段。有关更多详细信息，请参阅[以编程方式管理连接器 API 密钥](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)的文档。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_api_key_id
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。
- `api_key_id` 参数应引用一个现有的 API 密钥。
- `api_key_secret_id` 参数应引用一个包含编码 API 密钥值的现有连接器密钥。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `api_key_id`（可选，字符串）

  连接器用于授权访问所需索引的 API 密钥 ID。每个连接器最多只能关联一个 API 密钥。

- `api_key_secret_id`（可选，字符串）

  包含编码 API 密钥的连接器密钥 ID。此 API 密钥应与 `api_key_id` 引用的相同。**仅用于 Elastic 托管连接器。**

## 响应码

- `200`：连接器的 `api_key_id` 和/或 `api_key_secret_id` 字段已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例更新 ID 为 `my-connector` 的连接器的 `api_key_id` 和 `api_key_secret_id` 字段：

```json
PUT _connector/my-connector/_api_key_id
{
    "api_key_id": "my-api-key-id",
    "api_key_secret_id": "my-connector-secret-id"
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-api-key-id-api.html)
