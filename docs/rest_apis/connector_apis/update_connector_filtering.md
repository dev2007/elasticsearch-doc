# 更新连接器过滤 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新连接器的草稿过滤配置，并将草稿验证状态标记为已编辑。草稿过滤在运行中的 Elastic 连接器服务验证后激活。

`filtering` 属性用于为连接器配置同步规则（基本和高级）。在[同步规则](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors.html)中了解更多信息。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_filtering
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。
- 草稿过滤在运行中的 Elastic 连接器服务验证后激活，`draft.validation.state` 必须为 `valid`。
- 如果验证尝试后 `draft.validation.state` 等于 `invalid`，请检查 `draft.validation.errors` 并修复任何问题。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `rules`（可选，对象数组）

  基本同步规则数组，每个规则具有以下子属性：

  - `id`（必需，字符串）

    规则的唯一标识符。

  - `policy`（必需，字符串）

    指定策略，如 `include` 或 `exclude`。

  - `field`（必需，字符串）

    此规则适用的文档字段。

  - `rule`（必需，字符串）

    规则类型，如 `regex`、`starts_with`、`ends_with`、`contains`、`equals`、`<`、`>` 等。

  - `value`（必需，字符串）

    与规则配合使用以匹配文档字段内容的值。

  - `order`（必需，数字）

    规则应用的顺序。第一个匹配的规则将应用其策略。

  - `created_at`（可选，日期时间）

    规则添加时的时间戳。默认为当前 UTC 时间戳。

  - `updated_at`（可选，日期时间）

    规则上次编辑时的时间戳。默认为当前 UTC 时间戳。

- `advanced_snippet`（可选，对象）

  用于查询时的高级过滤，具有以下子属性：

  - `value`（必需，对象或数组）

    传递给连接器用于高级过滤的 JSON 对象/数组。

  - `created_at`（可选，日期时间）

    此 JSON 对象创建时的时间戳。默认为当前 UTC 时间戳。

  - `updated_at`（可选，日期时间）

    此 JSON 对象上次编辑时的时间戳。默认为当前 UTC 时间戳。

## 响应码

- `200`：连接器草稿过滤已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

### 示例 1：更新基本同步规则

以下示例更新 ID 为 `my-g-drive-connector` 的 Google Drive 连接器的草稿基本同步规则。所有 `.txt` 扩展名的 Google Drive 文件将被跳过：

```json
PUT _connector/my-g-drive-connector/_filtering
{
    "rules": [
         {
            "field": "file_extension",
            "id": "exclude-txt-files",
            "order": 0,
            "policy": "exclude",
            "rule": "equals",
            "value": "txt"
        },
        {
            "field": "_",
            "id": "DEFAULT",
            "order": 1,
            "policy": "include",
            "rule": "regex",
            "value": ".*"
        }
    ]
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```

### 示例 2：更新高级同步规则

以下示例更新 ID 为 `my-sql-connector` 的 MySQL 连接器的草稿高级同步规则。高级同步规则特定于每种连接器类型。请参阅支持高级同步规则的连接器参考文档以获取语法和示例。

```json
PUT _connector/my-sql-connector/_filtering
{
    "advanced_snippet": {
        "value": [{
            "tables": [
                "users",
                "orders"
            ],
            "query": "SELECT users.id AS id, orders.order_id AS order_id FROM users JOIN orders ON users.id = orders.user_id"
        }]
    }
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```

:::note 注意
你也可以在单个请求中同时更新草稿 `rules` 和 `advanced_snippet`。
:::

草稿更新后，其验证状态将设置为 `edited`。连接器服务随后将验证规则，并将验证状态报告为 `invalid` 或 `valid`。如果状态为 `valid`，草稿过滤将由运行中的 Elastic 连接器服务激活。


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-filtering-api.html)
