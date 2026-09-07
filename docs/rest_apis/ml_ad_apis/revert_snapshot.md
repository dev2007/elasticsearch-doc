# 回滚模型快照 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

回滚到特定快照。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/model_snapshots/<snapshot_id>/_revert
```

## 前置条件

- 回滚到保存的快照之前，必须先关闭作业。
- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

机器学习功能对异常输入反应迅速，学习数据中的新行为。高度异常的输入会增加模型的方差，同时系统学习这是行为的新阶跃变化还是一次性事件。当已知此异常输入为一次性事件时，将模型状态重置到此事件之前的时间可能是合适的。例如，你可能考虑在黑色星期五或关键系统故障后回滚到保存的快照。

回滚到快照不会更改异常检测作业的 `data_counts` 值，这些值不会恢复到早期状态。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<snapshot_id>`

  （必需，字符串）模型快照的标识符。

  你可以将 `empty` 指定为 `<snapshot_id>`。回滚到空快照意味着异常检测作业在启动时从头开始学习新模型。

## 查询参数

- `delete_intervening_results`

  （可选，布尔值）如果为 `true`，删除最新结果与回滚快照时间之间的时间段内的结果。它还重置模型以接受此时间段的记录。默认为 `false`。

  如果在回滚快照时选择不删除中间结果，作业将不接受早于当前时间的输入数据。如果要重新发送数据，请删除中间结果。

## 请求体

你也可以在请求体中指定 `delete_intervening_results` 查询参数。

## 示例

```json
POST _ml/anomaly_detectors/low_request_rate/model_snapshots/1637092688/_revert
{
  "delete_intervening_results": true
}
```

操作完成后，你收到以下结果：

```json
{
  "model" : {
    "job_id" : "low_request_rate",
    "min_version" : "7.11.0",
    "timestamp" : 1637092688000,
    "description" : "State persisted due to job close at 2021-11-16T19:58:08+0000",
    "snapshot_id" : "1637092688",
    "snapshot_doc_count" : 1,
    "model_size_stats" : {
      "job_id" : "low_request_rate",
      "result_type" : "model_size_stats",
      "model_bytes" : 45200,
      "peak_model_bytes" : 101552,
      "model_bytes_exceeded" : 0,
      "model_bytes_memory_limit" : 11534336,
      "total_by_field_count" : 3,
      "total_over_field_count" : 0,
      "total_partition_field_count" : 2,
      "bucket_allocation_failures_count" : 0,
      "memory_status" : "ok",
      "assignment_memory_basis" : "current_model_bytes",
      "categorized_doc_count" : 0,
      "total_category_count" : 0,
      "frequent_category_count" : 0,
      "rare_category_count" : 0,
      "dead_category_count" : 0,
      "failed_category_count" : 0,
      "categorization_status" : "ok",
      "log_time" : 1637092688530,
      "timestamp" : 1641495600000
    },
    "latest_record_time_stamp" : 1641502169000,
    "latest_result_time_stamp" : 1641495600000,
    "retain" : false
  }
}
```

有关这些属性的描述，请参阅[获取模型快照 API](./get_snapshot)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-revert-snapshot.html)
