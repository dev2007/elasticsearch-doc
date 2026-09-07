# 刷新作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

强制作业处理所有缓冲数据。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_flush
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

刷新作业 API 仅适用于使用推送数据 API 发送数据进行分析的情况。根据缓冲区的内容，它可能还会计算新的结果。

刷新和关闭操作类似，但如果你预期会发送更多数据进行分析，刷新更高效。刷新时，作业保持打开状态，可以继续分析数据。关闭操作还会修剪模型状态并持久化到磁盘，且作业必须重新打开才能继续分析数据。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `advance_time`

  （可选，字符串）指定推进到特定时间值。结果将被生成，模型将根据指定时间间隔的数据进行更新。

- `calc_interim`

  （可选，布尔值）如果为 `true`，计算最近桶或延迟期内所有桶的临时结果。

- `end`

  （可选，字符串）与 `calc_interim` 和 `start` 结合使用时，指定计算临时结果的桶范围。

- `skip_time`

  （可选，字符串）指定跳到特定时间值。不生成结果，模型不根据指定时间间隔的数据进行更新。

- `start`

  （可选，字符串）与 `calc_interim` 结合使用时，指定计算临时结果的桶范围。

## 请求体

你也可以在请求体中指定查询参数（如 `advance_time` 和 `calc_interim`）。

## 示例

```json
POST _ml/anomaly_detectors/low_request_rate/_flush
{
  "calc_interim": true
}
```

操作成功后，你收到以下结果：

```json
{
  "flushed": true,
  "last_finalized_bucket_end": 1455234900000
}
```

`last_finalized_bucket_end` 提供最后一个已处理桶结束的时间戳（自纪元以来的毫秒数）。

如果要将作业刷新到特定时间戳，可以使用 `advance_time` 或 `skip_time` 参数。例如，要推进到 2018 年 1 月 1 日 GMT 时间上午 11 点：

```json
POST _ml/anomaly_detectors/total-requests/_flush
{
  "advance_time": "1514804400000"
}
```

操作成功后，你收到以下结果：

```json
{
  "flushed": true,
  "last_finalized_bucket_end": 1514804400000
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-flush-job.html)
