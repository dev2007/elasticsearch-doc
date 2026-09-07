# 创建预测 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

通过使用时间序列的历史行为来预测其未来行为。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_forecast
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

你可以基于异常检测作业创建预测作业来推断未来行为。有关更多信息，请参阅[预测未来](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-forecast.html)和[预测限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-forecast-limitations.html)。

你可以使用[删除预测 API](./delete_forecast) 删除预测。

- 预测不支持执行群体分析的作业；如果你尝试为配置中包含 `over_field_name` 属性的作业创建预测，将会发生错误。
- 创建预测时作业必须处于打开状态。否则，将发生错误。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `duration`

  （可选，时间单位）表示预测未来多长时间的时间段。例如，`30d` 对应 30 天。默认值为 1 天。预测从最后处理的记录开始。

- `expires_in`

  （可选，时间单位）预测结果的保留时间。预测过期后，结果将被删除。默认值为 14 天。如果设置为 0，预测永不过期且不自动删除。

- `max_model_memory`

  （可选，字节值）预测可使用的最大内存。如果预测需要使用超过提供的内存量，将会溢出到磁盘。默认为 20mb，最大为 500mb，最小为 1mb。如果设置为作业配置内存限制的 40% 或以上，将自动降低到该值以下。

## 请求体

你也可以在请求体中指定查询参数（如 `duration` 和 `expires_in`）。

## 示例

```json
POST _ml/anomaly_detectors/low_request_rate/_forecast
{
  "duration": "10d"
}
```

预测创建后，你收到以下结果：

```json
{
  "acknowledged": true,
  "forecast_id": "wkCWa2IB2lF8nSE_TzZo"
}
```

随后你可以在 Kibana 的单一指标查看器中查看预测。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-forecast.html)
