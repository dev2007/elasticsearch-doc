# 更新连接器调度 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新连接器的调度配置。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_scheduling
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `scheduling`（必需，对象）

  连接器的调度配置。此配置决定连接器同步操作的频率。

  调度配置包含以下属性，每个属性表示为一个 `ScheduleConfig` 对象。如果 `scheduling` 对象不包含所有调度类型，则仅更新提供的类型；其他类型保持不变。

  - `access_control`（可选，`ScheduleConfig` 对象）

    定义连接器访问控制设置的同步调度。

  - `full`（可选，`ScheduleConfig` 对象）

    定义完整内容同步的调度。

  - `incremental`（可选，`ScheduleConfig` 对象）

    定义增量内容同步的调度。

  每个 `ScheduleConfig` 对象包含以下子属性：

  - `enabled`（必需，布尔值）

    启用或禁用调度的标志。

  - `interval`（必需，字符串）

    表示同步调度的 CRON 表达式。此表达式定义同步操作应执行的频率。必须以有效的 CRON 格式提供。

## 响应码

- `200`：连接器调度字段已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例更新 ID 为 `my-connector` 的连接器的调度属性：

```json
PUT _connector/my-connector/_scheduling
{
    "scheduling": {
        "access_control": {
            "enabled": true,
            "interval": "0 10 0 * * ?"
        },
        "full": {
            "enabled": true,
            "interval": "0 20 0 * * ?"
        },
        "incremental": {
            "enabled": false,
            "interval": "0 30 0 * * ?"
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

以下示例仅更新完整同步调度，其他调度类型保持不变：

```json
PUT _connector/my-connector/_scheduling
{
    "scheduling": {
        "full": {
            "enabled": true,
            "interval": "0 10 0 * * ?"
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


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-scheduling-api.html)
