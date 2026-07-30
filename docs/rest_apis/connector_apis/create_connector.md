# 创建连接器 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

创建一个 Elastic 连接器。连接器是 Elasticsearch 集成功能，用于从第三方数据源引入内容，可部署在 Elastic Cloud 或你自己的基础设施上：

- **托管连接器**是 Elastic Cloud 上的托管服务
- **自托管连接器**在你的基础设施上自行托管

在[连接器文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)中查找所有支持的服务类型列表。

如需开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
POST _connector
```

```json
PUT _connector/<connector_id>
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `service_type` 参数应引用受支持的第三方服务。请查看 [Elastic 托管和自托管连接器的可用服务类型](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)。此参数也可以引用你的自定义连接器的服务类型。

## 描述

创建一个连接器文档到内部索引中，并使用默认值初始化其配置、过滤和调度。这些值可以在之后根据需要进行更新。

## 路径参数

- `<connector_id>`（可选，字符串）

  连接器的唯一标识符。

## 请求体

- `description`（可选，字符串）

  连接器的描述。

- `index_name`（可选，字符串）

  同步数据的目标索引。如果索引不存在，将在首次同步时创建。

- `name`（可选，字符串）

  连接器的名称。在 Kibana 中管理连接器时建议设置连接器名称。

- `is_native`（可选，布尔值）

  指示是否为托管连接器。默认为 `false`。

- `language`（可选，字符串）

  数据的语言分析器。限于[支持的语言](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-languages.html)。

- `service_type`（可选，字符串）

  连接器服务类型。可引用 Elastic 支持的第三方服务或自定义连接器类型。请查看 [Elastic 托管和自托管连接器的可用服务类型](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)。

## 响应体

- `id`（字符串）

  与连接器文档关联的 ID。使用 `POST` 请求时返回。

- `result`（字符串）

  索引操作的结果，`created` 或 `updated`。使用 `PUT` 请求时返回。

## 响应码

- `200`：表示现有连接器已成功更新。
- `201`：表示连接器已成功创建。
- `400`：表示请求格式不正确。

## 示例

```json
PUT _connector/my-connector
{
  "index_name": "search-google-drive",
  "name": "My Connector",
  "description": "My Connector to sync data to Elastic index from Google Drive",
  "service_type": "google_drive",
  "language": "en"
}
```

API 返回以下结果：

```json
{
  "result": "created",
  "id": "my-connector"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/create-connector-api.html)
