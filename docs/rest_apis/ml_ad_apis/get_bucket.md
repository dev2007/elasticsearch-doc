# 获取桶 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索一个或多个桶的异常检测作业结果。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/results/buckets
```

```bash
GET _ml/anomaly_detectors/<job_id>/results/buckets/<timestamp>
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

获取桶 API 按时间顺序呈现记录，按桶分组。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

- `<timestamp>`

  （可选，字符串）单个桶结果的时间戳。如果不指定此参数，API 返回所有桶的信息。

## 查询参数

- `anomaly_score`

  （可选，双精度浮点数）返回异常分数大于或等于此值的桶。默认为 0.0。

- `desc`

  （可选，布尔值）如果为 `true`，桶按降序排列。默认为 `false`。

- `end`

  （可选，字符串）返回时间戳早于此时间的桶。默认为 -1，表示未设置，结果不限于特定时间戳。

- `exclude_interim`

  （可选，布尔值）如果为 `true`，输出排除临时结果。默认为 `false`，即包含临时结果。

- `expand`

  （可选，布尔值）如果为 `true`，输出包含异常记录。默认为 `false`。

- `from`

  （可选，整数）跳过指定数量的桶。默认为 0。

- `size`

  （可选，整数）指定获取的桶的最大数量。默认为 100。

- `sort`

  （可选，字符串）指定请求桶的排序字段。默认情况下，桶按 timestamp 字段排序。

- `start`

  （可选，字符串）返回时间戳晚于此时间的桶。默认为 -1，表示未设置，结果不限于特定时间戳。

## 请求体

你也可以在请求体中指定查询参数；但 `from` 和 `size` 例外，请改用 `page`：

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的桶。默认为 0。

  - `size`

    （可选，整数）指定获取的桶的最大数量。默认为 100。

## 响应体

API 返回桶对象数组，每个对象具有以下属性：

- `anomaly_score`

  （数字）所有桶影响因素的最大异常分数（0-100 之间）。这是作业的整体、速率限制分数。桶中的所有异常记录都贡献到此分数。随着新数据的分析，此值可能会更新。

- `bucket_influencers`

  （数组）桶影响因素对象的数组。

  `bucket_influencers` 的属性：

  - `anomaly_score`（数字）每个桶影响因素计算的 0-100 之间的标准化分数。随着新数据的分析，此分数可能会更新。
  - `bucket_span`（数字）桶的长度（秒）。此值与作业中指定的 `bucket_span` 匹配。
  - `influencer_field_name`（字符串）影响因素的字段名称。
  - `initial_anomaly_score`（数字）每个桶影响因素的 0-100 之间的分数。此分数是在处理桶时计算的初始值。
  - `is_interim`（布尔值）如果为 `true`，这是临时结果。即结果是基于部分输入数据计算的。
  - `job_id`（字符串）异常检测作业的标识符。
  - `probability`（数字）桶具有此行为的概率，范围为 0 到 1。此值可保持超过 300 位小数的高精度，因此提供 `anomaly_score` 作为人类可读的友好解释。
  - `raw_anomaly_score`（数字）内部使用。
  - `result_type`（字符串）内部使用。此值始终设置为 `bucket_influencer`。
  - `timestamp`（日期）计算这些结果的桶的开始时间。

- `bucket_span`

  （数字）桶的长度（秒）。此值与作业中指定的 `bucket_span` 匹配。

- `event_count`

  （数字）在此桶中处理的输入数据记录数。

- `initial_anomaly_score`

  （数字）所有桶影响因素的最大异常分数。这是在处理桶时计算的初始值。

- `is_interim`

  （布尔值）如果为 `true`，这是临时结果。即结果是基于部分输入数据计算的。

- `job_id`

  （字符串）异常检测作业的标识符。

- `processing_time_ms`

  （数字）分析桶内容并计算结果所花费的时间（毫秒）。

- `result_type`

  （字符串）内部使用。此值始终设置为 `bucket`。

- `timestamp`

  （日期）桶的开始时间。此时间戳唯一标识该桶。

  恰好在桶时间戳发生的事件包含在桶的结果中。

## 示例

```json
GET _ml/anomaly_detectors/low_request_rate/results/buckets
{
  "anomaly_score": 80,
  "start": "1454530200001"
}
```

在此示例中，API 返回匹配指定分数和时间约束的单个结果：

```json
{
  "count": 1,
  "buckets": [
    {
      "job_id": "low_request_rate",
      "timestamp": 1578398400000,
      "anomaly_score": 91.58505459594764,
      "bucket_span": 3600,
      "initial_anomaly_score": 91.58505459594764,
      "event_count": 0,
      "is_interim": false,
      "bucket_influencers": [
        {
          "job_id": "low_request_rate",
          "result_type": "bucket_influencer",
          "influencer_field_name": "bucket_time",
          "initial_anomaly_score": 91.58505459594764,
          "anomaly_score": 91.58505459594764,
          "raw_anomaly_score": 0.5758246639716365,
          "probability": 1.7340849573442696E-4,
          "timestamp": 1578398400000,
          "bucket_span": 3600,
          "is_interim": false
        }
      ],
      "processing_time_ms": 0,
      "result_type": "bucket"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-bucket.html)
