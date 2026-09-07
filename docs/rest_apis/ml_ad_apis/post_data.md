# 向作业推送数据 API

:::::warning 已弃用

在 7.11.0 中已弃用。

直接向异常检测作业推送数据已弃用，在未来的主要版本中将需要使用数据源。

:::::

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

向异常检测作业发送数据以进行分析。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_data
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

作业必须处于打开状态才能接收和处理数据。

发送到作业的数据必须使用 JSON 格式。可以发送多个 JSON 文档，可以相邻无分隔符或以空格分隔。换行分隔的 JSON（NDJSON）是一种可能的空格分隔格式，为此 Content-Type 头应设置为 `application/x-ndjson`。

上传大小受 Elasticsearch HTTP 接收缓冲区大小限制（默认 100 Mb）。如果数据较大，请将其拆分为多个块并按时间顺序依次上传。在实时运行时，通常建议执行多次小量上传，而不是排队数据以上传更大的文件。

上传数据时，请检查作业数据计数以了解进度。以下文档将不会被处理：

- 不按时间顺序排列且超出延迟窗口的文档
- 时间戳无效的记录

对于每个作业，一次只能从单个连接接收数据。目前无法使用通配符或逗号分隔列表向多个作业推送数据。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `reset_start`

  （可选，字符串）指定桶重置范围的开始。

- `reset_end`

  （可选，字符串）指定桶重置范围的结束。

## 请求体

包含要分析的数据的一个或多个 JSON 文档序列。文档之间仅允许使用空白字符。

## 示例

以下示例从 `it_ops_new_kpi.json` 文件向 `it_ops_new_kpi` 作业推送数据：

```bash
curl -s -H "Content-type: application/json" -X POST http://localhost:9200/_ml/anomaly_detectors/it_ops_new_kpi/_data --data-binary @it_ops_new_kpi.json
```

数据发送后，你收到有关作业运行进度的信息。例如：

```json
{
  "job_id": "it_ops_new_kpi",
  "processed_record_count": 21435,
  "processed_field_count": 64305,
  "input_bytes": 2589063,
  "input_field_count": 85740,
  "invalid_date_count": 0,
  "missing_field_count": 0,
  "out_of_order_timestamp_count": 0,
  "empty_bucket_count": 16,
  "sparse_bucket_count": 0,
  "bucket_count": 2165,
  "earliest_record_timestamp": 1454020569000,
  "latest_record_timestamp": 1455318669000,
  "last_data_time": 1491952300658,
  "latest_empty_bucket_timestamp": 1454541600000,
  "input_record_count": 21435
}
```

有关这些属性的更多信息，请参阅获取异常检测作业统计 API 的响应体。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-post-data.html)
