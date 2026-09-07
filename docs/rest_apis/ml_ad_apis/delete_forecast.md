# 删除预测 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

从机器学习作业中删除预测。

## 请求

```bash
DELETE _ml/anomaly_detectors/<job_id>/_forecast
```

```bash
DELETE _ml/anomaly_detectors/<job_id>/_forecast/<forecast_id>
```

```bash
DELETE _ml/anomaly_detectors/<job_id>/_forecast/_all
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

默认情况下，预测保留 14 天。你可以通过创建预测 API 中的 `expires_in` 参数指定不同的保留期。删除预测 API 使你能够在预测过期前删除一个或多个预测。

删除作业时，其关联的预测也会被删除。

有关更多信息，请参阅[预测未来](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-forecast.html)。

## 路径参数

- `<forecast_id>`

  （可选，字符串）预测标识符的逗号分隔列表。如果不指定此可选参数，或指定 `_all` 或 `*`，API 将删除作业中的所有预测。

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `allow_no_forecasts`

  （可选，布尔值）指定当没有预测时是否发生错误。特别是，如果此参数设置为 `false` 且作业没有关联的预测，尝试删除所有预测时返回错误。默认为 `true`。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）指定等待删除操作完成的时间。当此时间段过去时，API 失败并返回错误。默认为 30s。

## 示例

```bash
DELETE _ml/anomaly_detectors/total-requests/_forecast/_all
```

如果请求未遇到错误，你收到以下结果：

```json
{
  "acknowledged": true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-delete-forecast.html)
