# 列出连接器 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

返回有关所有已创建连接器的信息。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
GET _connector
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。

## 查询参数

- `size`（可选，整数）

  要检索的最大结果数。默认为 `100`。

- `from`（可选，整数）

  从第一个结果开始获取的偏移量。默认为 `0`。

- `index_name`（可选，字符串）

  与连接器关联的索引名称的逗号分隔列表，用于过滤搜索结果。

- `connector_name`（可选，字符串）

  连接器名称的逗号分隔列表，用于过滤搜索结果。

- `service_type`（可选，字符串）

  连接器服务类型的逗号分隔列表，用于过滤搜索结果。

## 示例

### 示例 1：列出所有连接器

```json
GET _connector
```

### 示例 2：列出前两个连接器

```json
GET _connector?from=0&size=2
```

### 示例 3：列出与 search-google-drive Elasticsearch 索引关联的连接器

```json
GET _connector?index_name=search-google-drive
```

### 示例 4：列出所有服务类型为 sharepoint_online 的连接器

```json
GET _connector?service_type=sharepoint_online
```

### 示例 5：列出所有服务类型为 sharepoint_online 或 google_drive 的连接器

```json
GET _connector?service_type=sharepoint_online,google_drive
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/list-connector-api.html)
