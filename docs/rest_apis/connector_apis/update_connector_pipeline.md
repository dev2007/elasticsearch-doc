# 更新连接器管道 API

:::warning 警告
此功能处于测试版（beta），可能会发生变化。其设计和代码不如正式发布（GA）功能成熟，按"原样"提供，不附带任何保证。测试版功能不受正式 GA 功能的支持 SLA 约束。
:::

::::info 新版 API 参考

有关最新的 API 详情，请参阅[连接器 API](/rest_apis/connector_apis/connector_apis)。

::::

更新连接器的管道配置。

创建新连接器时，接入管道的配置将使用默认设置填充。

要开始使用连接器 API，请查看[我们的教程](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/es-connectors-tutorial-api.html)。

## 请求

```json
PUT _connector/<connector_id>/_pipeline
```

## 前置条件

- 要使用自托管连接器同步数据，你需要在自己的基础设施上部署 Elastic 连接器服务。对于 Elastic 托管连接器，此服务在 Elastic Cloud 上自动运行。
- `connector_id` 参数应引用一个现有的连接器。

## 路径参数

- `<connector_id>`（必需，字符串）

  连接器的唯一标识符。

## 请求体

- `pipeline`（必需，对象）

  连接器的管道配置。管道决定数据在引入 Elasticsearch 期间的处理方式。

  管道配置必须包含以下属性：

  - `extract_binary_content`（必需，布尔值）

    指示在引入期间是否提取二进制内容的标志。

  - `name`（必需，字符串）

    接入管道的名称。

  - `reduce_whitespace`（必需，布尔值）

    指示是否减少引入内容中多余空格的标志。

  - `run_ml_inference`（必需，布尔值）

    指示是否对引入内容运行机器学习推理的标志。

## 响应码

- `200`：连接器管道字段已成功更新。
- `400`：未提供 `connector_id` 或请求负载格式不正确。
- `404`（缺少资源）：找不到匹配 `connector_id` 的连接器。

## 示例

以下示例更新 ID 为 `my-connector` 的连接器的 `pipeline` 属性：

```json
PUT _connector/my-connector/_pipeline
{
    "pipeline": {
        "extract_binary_content": true,
        "name": "my-connector-pipeline",
        "reduce_whitespace": true,
        "run_ml_inference": true
    }
}
```

API 返回以下结果：

```json
{
    "result": "updated"
}
```


> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-connector-pipeline-api.html)
