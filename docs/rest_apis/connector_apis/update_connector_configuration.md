# 更新连接器配置 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新连接器的配置，允许在已注册的配置模式中更新配置值。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_configuration
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。
- 要更新配置值，连接器配置模式必须首先由运行中的 Elastic 连接器服务实例注册。
- 确保配置字段与第三方数据源的配置模式兼容。有关详细信息，请参阅各个连接器的参考文档。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `values`（可选，对象）

  连接器的配置值，表示为已注册模式中配置字段到其各自值的映射。

- `configuration`（可选，对象）

  连接器的配置模式定义。`configuration` 字段是一个映射，其中每个键代表一个特定的配置字段名称，值是一个 `ConnectorConfiguration` 对象。对于连接器管理，使用 `values` 传递配置值。`configuration` 对象由 Elastic 连接器服务用于注册连接器配置模式。

## 响应码

- `200`：连接器配置已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例配置一个 `sharepoint_online` 连接器。在 [SharePoint Online 连接器文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)中查找支持的配置选项，或使用[获取连接器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-connector-api.html) API 检查连接器 `configuration` 字段中的模式。

```json
PUT _connector/my-spo-connector/_configuration
{
    "values": {
        "tenant_id": "my-tenant-id",
        "tenant_name": "my-sharepoint-site",
        "client_id": "foo",
        "secret_value": "bar",
        "site_collections": "*"
    }
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```

首次设置连接器时，你需要提供所有必需的配置详细信息才能开始运行同步。但你也可以使用此 API 仅更新部分字段。以下是仅更新 `sharepoint_online` 连接器的 `secret_value` 字段的示例。其他配置值不会改变。

```json
PUT _connector/my-spo-connector/_configuration
{
    "values": {
        "secret_value": "foo-bar"
    }
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-configuration-api.html)
