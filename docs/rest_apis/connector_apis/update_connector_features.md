# 更新连接器功能 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

管理连接器的功能。此端点可用于控制连接器的以下方面：

- 文档级安全
- 增量同步
- 高级同步规则
- 基本同步规则

通常，运行中的连接器服务会自动管理这些功能。但是，你可以使用此 API 覆盖默认行为。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_features
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `features`（必需，对象）

  包含连接器功能的对象。

  - `document_level_security`（可选，对象）

    通过 `enabled` 标志控制是否启用文档级安全。

  - `incremental_sync`（可选，对象）

    通过 `enabled` 标志控制是否启用增量同步。

  - `native_connector_api_keys`（可选，对象）

    通过 `enabled` 标志控制是否启用托管连接器 API 密钥。

  - `sync_rules`（可选，对象）

    控制同步规则。

    - `advanced`（可选，对象）

      通过 `enabled` 标志控制是否启用高级同步规则。

    - `basic`（可选，对象）

      通过 `enabled` 标志控制是否启用基本同步规则。

## 响应码

- `200`：连接器功能已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例更新 ID 为 `my-connector` 的连接器的功能字段：

```json
PUT _connector/my-connector/_features
{
  "features": {
    "document_level_security": {
      "enabled": true
    },
    "incremental_sync": {
      "enabled": true
    },
    "sync_rules": {
      "advanced": {
        "enabled": false
      },
      "basic": {
        "enabled": true
      }
    }
  }
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```

此端点支持功能字段的部分更新。例如，要仅更新 `document_level_security` 功能，可以发送以下请求：

```json
PUT _connector/my-connector/_features
{
  "features": {
    "document_level_security": {
      "enabled": true
    }
  }
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-features-api.html)
