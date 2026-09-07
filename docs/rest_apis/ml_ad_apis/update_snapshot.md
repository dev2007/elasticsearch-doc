# 更新模型快照 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

更新快照的某些属性。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/model_snapshots/<snapshot_id>/_update
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<snapshot_id>`

  （必需，字符串）模型快照的标识符。

## 请求体

模型快照创建后可以更新以下属性：

- `description`

  （可选，字符串）模型快照的描述。

- `retain`

  （可选，布尔值）如果为 `true`，此快照在自动清理早于 `model_snapshot_retention_days` 的快照时不会被删除。但是，删除作业时此快照仍会被删除。默认为 `false`。

## 示例

```json
POST _ml/anomaly_detectors/it_ops_new_logs/model_snapshots/1491852978/_update
{
  "description": "Snapshot 1",
  "retain": true
}
```

快照更新后，你收到以下结果：

```json
{
  "acknowledged": true,
  "model": {
    "job_id": "it_ops_new_logs",
    "timestamp": 1491852978000,
    "description": "Snapshot 1",
    "snapshot_id": "1491852978",
    "snapshot_doc_count": 1,
    "model_size_stats": {
      "job_id": "it_ops_new_logs",
      "result_type": "model_size_stats",
      "model_bytes": 269946,
      "model_bytes_exceeded": 0,
      "model_bytes_memory_limit": 10485760,
      "total_by_field_count": 2,
      "total_over_field_count": 0,
      "total_partition_field_count": 0,
      "bucket_allocation_failures_count": 0,
      "memory_status": "ok",
      "categorized_doc_count": 0,
      "total_category_count": 0,
      "frequent_category_count": 0,
      "rare_category_count": 0,
      "dead_category_count": 0,
      "categorization_status": "ok",
      "log_time": 1491852978000,
      "timestamp": 1491852978000
    },
    "latest_record_time_stamp": 1491852978000,
    "latest_result_time_stamp": 1491852978000,
    "retain": true
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-update-snapshot.html)
