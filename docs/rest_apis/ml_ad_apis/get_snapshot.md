# 获取模型快照 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索有关模型快照的信息。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/model_snapshots
```

```bash
GET _ml/anomaly_detectors/<job_id>/model_snapshots/<snapshot_id>
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<snapshot_id>`

  （可选，字符串）模型快照的标识符。

  你可以通过使用逗号分隔的列表或通配符表达式获取多个快照的信息。你可以通过使用 `_all`、将 `*` 指定为快照 ID，或省略快照 ID 来获取所有快照的信息。

## 查询参数

- `desc`

  （可选，布尔值）如果为 `true`，结果按降序排列。默认为 `false`。

- `end`

  （可选，日期）返回时间戳早于此时间的快照。默认为未设置，表示结果不限于特定时间戳。

- `from`

  （可选，整数）跳过指定数量的快照。默认为 0。

- `size`

  （可选，整数）指定获取的快照的最大数量。默认为 100。

- `sort`

  （可选，字符串）指定请求快照的排序字段。默认情况下，快照按 timestamp 字段排序。

- `start`

  （可选，字符串）返回时间戳晚于此时间的快照。默认为未设置，表示结果不限于特定时间戳。

## 请求体

你也可以在请求体中指定查询参数；但 `from` 和 `size` 例外，请改用 `page`：

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的快照。默认为 0。

  - `size`

    （可选，整数）指定获取的快照的最大数量。默认为 100。

## 响应体

API 返回模型快照对象数组，每个对象具有以下属性：

- `description`

  （字符串）作业的可选描述。

- `job_id`

  （字符串）唯一标识创建快照的作业的数字字符串。

- `latest_record_time_stamp`

  （日期）最新处理记录的时间戳。

- `latest_result_time_stamp`

  （日期）最新桶结果的时间戳。

- `min_version`

  （字符串）恢复模型快照所需的最低机器学习配置版本号。

  从 Elasticsearch 8.10.0 开始，使用新的版本号来跟踪机器学习插件中的配置和状态变更。此新版本号与产品版本解耦，将独立递增。`min_version` 值表示新的版本号。

- `model_size_stats`

  （对象）描述模型的摘要信息。

  `model_size_stats` 的属性：

  - `assignment_memory_basis`（字符串）指示在何处查找用于决定作业运行位置的内存需求。可能值：`model_memory_limit`、`current_model_bytes`、`peak_model_bytes`。
  - `bucket_allocation_failures_count`（长整数）由于内存限制未处理传入数据中新实体的桶数量。
  - `categorized_doc_count`（长整数）已分类字段的文档数量。
  - `categorization_status`（字符串）作业分类的状态。可能值：`ok`、`warn`。
  - `dead_category_count`（长整数）由于另一个类别的定义使其成为超集而永远不会再次分配的类别数量。
  - `failed_category_count`（长整数）分类想要创建新类别但因作业达到 `model_memory_limit` 而无法创建的次数。
  - `frequent_category_count`（长整数）匹配超过 1% 已分类文档的类别数量。
  - `job_id`（字符串）异常检测作业的标识符。
  - `log_time`（日期）根据服务器时间的 `model_size_stats` 记录时间戳。
  - `memory_status`（字符串）内存相对于 `model_memory_limit` 的状态。可能值：`hard_limit`、`ok`、`soft_limit`。
  - `model_bytes`（长整数）此分析所需的内存资源的近似值。
  - `model_bytes_exceeded`（长整数）上次分配失败时超过内存使用上限的字节数。
  - `model_bytes_memory_limit`（长整数）内存使用的上限。
  - `peak_model_bytes`（长整数）模型内存使用的最高记录值。
  - `rare_category_count`（长整数）仅匹配一个已分类文档的类别数量。
  - `result_type`（字符串）内部使用。此值始终为 `model_size_stats`。
  - `timestamp`（日期）根据数据桶时间戳的 `model_size_stats` 记录时间戳。
  - `total_by_field_count`（长整数）已分析的 by 字段值数量。
  - `total_category_count`（长整数）分类创建的类别数量。
  - `total_over_field_count`（长整数）已分析的 over 字段值数量。
  - `total_partition_field_count`（长整数）已分析的分区字段值数量。

- `retain`

  （布尔值）如果为 `true`，此快照在自动清理早于 `model_snapshot_retention_days` 的快照时不会被删除。但是，删除作业时此快照仍会被删除。默认为 `false`。

- `snapshot_id`

  （字符串）唯一标识模型快照的数字字符串。例如：`"1491852978"`。

- `snapshot_doc_count`

  （长整数）仅供内部使用。

- `timestamp`

  （日期）快照的创建时间戳。

## 示例

```json
GET _ml/anomaly_detectors/high_sum_total_sales/model_snapshots
{
  "start": "1575402236000"
}
```

在此示例中，API 返回单个结果：

```json
{
  "count": 1,
  "model_snapshots": [
    {
      "job_id": "high_sum_total_sales",
      "min_version": "6.4.0",
      "timestamp": 1575402237000,
      "description": "State persisted due to job close at 2019-12-03T19:43:57+0000",
      "snapshot_id": "1575402237",
      "snapshot_doc_count": 1,
      "model_size_stats": {
        "job_id": "high_sum_total_sales",
        "result_type": "model_size_stats",
        "model_bytes": 1638816,
        "model_bytes_exceeded": 0,
        "model_bytes_memory_limit": 10485760,
        "total_by_field_count": 3,
        "total_over_field_count": 3320,
        "total_partition_field_count": 2,
        "bucket_allocation_failures_count": 0,
        "memory_status": "ok",
        "categorized_doc_count": 0,
        "total_category_count": 0,
        "frequent_category_count": 0,
        "rare_category_count": 0,
        "dead_category_count": 0,
        "categorization_status": "ok",
        "log_time": 1575402237000,
        "timestamp": 1576965600000
      },
      "latest_record_time_stamp": 1576971072000,
      "latest_result_time_stamp": 1576965600000,
      "retain": false
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-snapshot.html)
