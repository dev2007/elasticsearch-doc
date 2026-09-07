# 获取异常检测作业统计 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索异常检测作业的使用信息。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/_stats
```

```bash
GET _ml/anomaly_detectors/<job_id>,<job_id>/_stats
```

```bash
GET _ml/anomaly_detectors/_stats
```

```bash
GET _ml/anomaly_detectors/_all/_stats
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

此 API 最多返回 10000 个作业。

## 路径参数

- `<job_id>`

  （可选，字符串）异常检测作业的标识符。可以是作业标识符、组名称或通配符表达式。

  你可以通过使用组名称、逗号分隔的作业列表或通配符表达式在单个 API 请求中获取多个异常检测作业的统计信息。你可以通过使用 `_all`、将 `*` 指定为作业标识符，或省略标识符来获取所有异常检测作业的统计信息。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空作业数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

## 响应体

API 返回有关作业操作进展的以下信息：

- `assignment_explanation`

  （字符串）仅对于打开的异常检测作业，包含与选择运行作业的节点相关的消息。

- `data_counts`

  （对象）描述作业输入量和相关错误计数的对象。`data_counts` 值在作业生命周期内是累积的。如果回滚模型快照或删除旧结果，作业计数不会重置。

  `data_counts` 的属性：

  - `bucket_count`（长整数）作业产生的桶结果数量。
  - `earliest_record_timestamp`（日期）最早输入文档的时间戳。
  - `empty_bucket_count`（长整数）不包含任何数据的桶数量。如果数据包含许多空桶，考虑增大 `bucket_span` 或使用对数据间隙容忍的函数，如 `mean`、`non_null_sum` 或 `non_zero_count`。
  - `input_bytes`（长整数）推送到异常检测作业的输入数据字节数。
  - `input_field_count`（长整数）推送到异常检测作业的输入文档中的字段总数。此计数包括分析中未使用的字段。
  - `input_record_count`（长整数）推送到异常检测作业的输入文档数量。
  - `invalid_date_count`（长整数）缺少日期字段或日期无法解析的输入文档数量。
  - `job_id`（字符串）异常检测作业的标识符。
  - `last_data_time`（日期）根据服务器时间，数据最后一次被分析的时间戳。
  - `latest_empty_bucket_timestamp`（日期）最后一个不包含数据的桶的时间戳。
  - `latest_record_timestamp`（日期）最新输入文档的时间戳。
  - `latest_sparse_bucket_timestamp`（日期）最后一个被认为是稀疏的桶的时间戳。
  - `log_time`（日期）根据服务器时间的 `data_counts` 时间戳。
  - `missing_field_count`（长整数）缺少异常检测作业配置要分析的字段的输入文档数量。缺少字段的输入文档仍会被处理。`processed_record_count` 的值包含此计数。
  - `out_of_order_timestamp_count`（长整数）时间戳早于当前异常检测桶开始时间减去延迟窗口的输入文档数量。仅在使用推送数据 API 时适用。
  - `processed_field_count`（长整数）已由异常检测作业处理的所有文档中的字段总数。只有检测器配置对象中指定的字段才计入此计数。
  - `processed_record_count`（长整数）已由异常检测作业处理的输入文档数量。此值包括缺少字段的文档。如果使用数据源且搜索查询中有聚合，`processed_record_count` 是处理的聚合结果数量，而非 Elasticsearch 文档数量。
  - `sparse_bucket_count`（长整数）与预期数据点数量相比包含较少数据点的桶数量。

- `deleting`

  （布尔值）指示删除作业的过程正在进行但尚未完成。仅在为 `true` 时报告。

- `forecasts_stats`

  （对象）提供有关属于此作业的预测的统计信息的对象。如果没有预测，则省略某些统计信息。

  `forecasts_stats` 的属性：

  - `forecasted_jobs`（长整数）值为 0 表示此作业没有预测。值为 1 表示至少存在一个预测。
  - `memory_bytes`（对象）与此作业相关的预测的平均、最小、最大和总内存使用量（字节）。如果没有预测，省略此属性。
  - `records`（对象）与此作业相关的预测写入的 `model_forecast` 文档的平均、最小、最大和总数量。如果没有预测，省略此属性。
  - `processing_time_ms`（对象）与此作业相关的预测的平均、最小、最大和总运行时间（毫秒）。如果没有预测，省略此属性。
  - `status`（对象）按状态分组的预测计数。例如：`{"finished": 2, "started": 1}`。如果没有预测，省略此属性。
  - `total`（长整数）作业当前可用的单个预测数量。

- `job_id`

  （字符串）异常检测作业的标识符。

- `model_size_stats`

  （对象）提供有关模型大小和内容的信息的对象。

  `model_size_stats` 的属性：

  - `assignment_memory_basis`（字符串）指示在何处查找用于决定作业运行位置的内存需求。可能值：`model_memory_limit`、`current_model_bytes`、`peak_model_bytes`。
  - `bucket_allocation_failures_count`（长整数）由于模型内存不足而未处理传入数据中新实体的桶数量。
  - `categorized_doc_count`（长整数）已分类字段的文档数量。
  - `categorization_status`（字符串）作业分类的状态。可能值：`ok`（分类表现良好或未使用）、`warn`（分类检测到不适合分类的类别分布）。
  - `dead_category_count`（长整数）由于另一个类别的定义使其成为超集而永远不会再次分配的类别数量。
  - `failed_category_count`（长整数）分类想要创建新类别但因作业达到 `model_memory_limit` 而无法创建的次数。
  - `frequent_category_count`（长整数）匹配超过 1% 已分类文档的类别数量。
  - `job_id`（字符串）异常检测作业的标识符。
  - `log_time`（日期）根据服务器时间的 `model_size_stats` 时间戳。
  - `memory_status`（字符串）数学模型的状态。可能值：`ok`（模型保持低于配置值）、`soft_limit`（模型使用了超过 60% 的配置内存限制）、`hard_limit`（模型使用的空间超过配置的内存限制）。
  - `model_bytes`（长整数）模型使用的内存字节数。
  - `model_bytes_exceeded`（长整数）上次分配失败时超过内存使用上限的字节数。
  - `model_bytes_memory_limit`（长整数）模型内存使用的上限。
  - `peak_model_bytes`（长整数）模型曾经使用的峰值内存字节数。
  - `rare_category_count`（长整数）仅匹配一个已分类文档的类别数量。
  - `result_type`（字符串）内部使用。
  - `total_by_field_count`（长整数）模型分析的 by 字段值数量。
  - `total_category_count`（长整数）分类创建的类别数量。
  - `total_over_field_count`（长整数）模型分析的 over 字段值数量。
  - `total_partition_field_count`（长整数）模型分析的分区字段值数量。
  - `timestamp`（日期）收集模型统计信息的最后记录的时间戳。

- `node`

  （对象）包含运行作业的节点的属性。此信息仅适用于打开的作业。

  `node` 的属性：

  - `attributes`（对象）列出节点属性，如 `ml.machine_memory` 或 `ml.max_open_jobs` 设置。
  - `ephemeral_id`（字符串）节点的临时 ID。
  - `id`（字符串）节点的唯一标识符。
  - `name`（字符串）节点名称。
  - `transport_address`（字符串）接受传输 HTTP 连接的主机和端口。

- `open_time`

  （字符串）仅对于打开的作业，作业已打开的持续时间。

- `state`

  （字符串）异常检测作业的状态。可能值：

  - `closed`：作业已成功完成并持久化了模型状态。
  - `closing`：作业关闭操作正在进行中且尚未完成。
  - `failed`：作业由于错误未成功完成。
  - `opened`：作业可以接收和处理数据。
  - `opening`：作业打开操作正在进行中且尚未完成。

- `timing_stats`

  （对象）提供有关此作业计时方面的统计信息的对象。

  `timing_stats` 的属性：

  - `average_bucket_processing_time_ms`（双精度浮点数）所有桶处理时间的平均值（毫秒）。
  - `bucket_count`（长整数）已处理的桶数量。
  - `exponential_average_bucket_processing_time_ms`（双精度浮点数）所有桶处理时间的指数移动平均值（毫秒）。
  - `exponential_average_bucket_processing_time_per_hour_ms`（双精度浮点数）在 1 小时时间窗口内计算的桶处理时间的指数加权移动平均值（毫秒）。
  - `job_id`（字符串）异常检测作业的标识符。
  - `maximum_bucket_processing_time_ms`（双精度浮点数）所有桶处理时间的最大值（毫秒）。
  - `minimum_bucket_processing_time_ms`（双精度浮点数）所有桶处理时间的最小值（毫秒）。
  - `total_bucket_processing_time_ms`（双精度浮点数）所有桶处理时间的总和（毫秒）。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

```bash
GET _ml/anomaly_detectors/low_request_rate/_stats
```

API 返回以下结果：

```json
{
  "count": 1,
  "jobs": [
    {
      "job_id": "low_request_rate",
      "data_counts": {
        "job_id": "low_request_rate",
        "processed_record_count": 1216,
        "processed_field_count": 1216,
        "input_bytes": 51678,
        "input_field_count": 1216,
        "invalid_date_count": 0,
        "missing_field_count": 0,
        "out_of_order_timestamp_count": 0,
        "empty_bucket_count": 242,
        "sparse_bucket_count": 0,
        "bucket_count": 1457,
        "earliest_record_timestamp": 1575172659612,
        "latest_record_timestamp": 1580417369440,
        "last_data_time": 1576017595046,
        "latest_empty_bucket_timestamp": 1580356800000,
        "input_record_count": 1216
      },
      "model_size_stats": {
        "job_id": "low_request_rate",
        "result_type": "model_size_stats",
        "model_bytes": 41480,
        "model_bytes_exceeded": 0,
        "model_bytes_memory_limit": 10485760,
        "total_by_field_count": 3,
        "total_over_field_count": 0,
        "total_partition_field_count": 2,
        "bucket_allocation_failures_count": 0,
        "memory_status": "ok",
        "categorized_doc_count": 0,
        "total_category_count": 0,
        "frequent_category_count": 0,
        "rare_category_count": 0,
        "dead_category_count": 0,
        "failed_category_count": 0,
        "categorization_status": "ok",
        "log_time": 1576017596000,
        "timestamp": 1580410800000
      },
      "forecasts_stats": {
        "total": 1,
        "forecasted_jobs": 1,
        "memory_bytes": {
          "total": 9179.0,
          "min": 9179.0,
          "avg": 9179.0,
          "max": 9179.0
        },
        "records": {
          "total": 168.0,
          "min": 168.0,
          "avg": 168.0,
          "max": 168.0
        },
        "processing_time_ms": {
          "total": 40.0,
          "min": 40.0,
          "avg": 40.0,
          "max": 40.0
        },
        "status": {
          "finished": 1
        }
      },
      "state": "opened",
      "node": {
        "id": "7bmMXyWCRs-TuPfGJJ_yMw",
        "name": "node-0",
        "ephemeral_id": "hoXMLZB0RWKfR9UPPUCxXX",
        "transport_address": "127.0.0.1:9300",
        "attributes": {
          "ml.machine_memory": "17179869184",
          "xpack.installed": "true",
          "ml.max_open_jobs": "512"
        }
      },
      "assignment_explanation": "",
      "open_time": "13s",
      "timing_stats": {
        "job_id": "low_request_rate",
        "bucket_count": 1457,
        "total_bucket_processing_time_ms": 1094.000000000001,
        "minimum_bucket_processing_time_ms": 0.0,
        "maximum_bucket_processing_time_ms": 48.0,
        "average_bucket_processing_time_ms": 0.75085792724777,
        "exponential_average_bucket_processing_time_ms": 0.5571716855800993,
        "exponential_average_bucket_processing_time_per_hour_ms": 15.0
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-job-stats.html)
