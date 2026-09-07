# 获取总体桶 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索汇总多个异常检测作业桶结果的总体桶结果。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/results/overall_buckets
```

```bash
GET _ml/anomaly_detectors/<job_id>,<job_id>/results/overall_buckets
```

```bash
GET _ml/anomaly_detectors/_all/results/overall_buckets
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

默认情况下，总体桶的跨度等于指定异常检测作业中最大的桶跨度。要覆盖此行为，请使用可选的 `bucket_span` 参数。有关桶概念的更多信息，请参阅[桶](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/usage.html#buckets)。

`overall_score` 的计算方法是结合总体桶跨度内所有桶的分数。首先，计算总体桶中每个异常检测作业的最大 `anomaly_score`。然后，取这些分数中前 `top_n` 个的平均值作为 `overall_score`。这意味着你可以微调 `overall_score`，使其对同时检测到异常的作业数量更敏感或更不敏感。例如，如果将 `top_n` 设置为 1，`overall_score` 是总体桶中的最大桶分数。或者，如果将 `top_n` 设置为作业数量，只有当所有作业在该总体桶中检测到异常时，`overall_score` 才会很高。如果你设置 `bucket_span` 参数（大于其默认值），`overall_score` 是跨度等于作业最大桶跨度的总体桶中的最大 `overall_score`。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。可以是作业标识符、组名称、逗号分隔的作业或组列表，或通配符表达式。

  你可以通过使用 `_all` 或将 `*` 指定为作业标识符来汇总所有异常检测作业的桶结果。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空作业数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `bucket_span`

  （可选，字符串）总体桶的跨度。必须大于或等于指定异常检测作业中最大的桶跨度，这也是默认值。

- `end`

  （可选，字符串）返回时间戳早于此时间的总体桶。默认为 -1，表示未设置，结果不限于特定时间戳。

- `exclude_interim`

  （可选，布尔值）如果为 `true`，输出排除临时总体桶。如果总体桶间隔内的任何作业桶是临时的，则总体桶为临时。默认为 `false`，即包含临时结果。

- `overall_score`

  （可选，双精度浮点数）返回总体分数大于或等于此值的总体桶。默认为 0.0。

- `start`

  （可选，字符串）返回时间戳晚于此时间的总体桶。默认为 -1，表示未设置，结果不限于特定时间戳。

- `top_n`

  （可选，整数）用于 `overall_score` 计算的顶级异常检测作业桶分数数量。默认为 1。

## 请求体

你也可以在请求体中指定查询参数（如 `allow_no_match` 和 `bucket_span`）。

## 响应体

API 返回总体桶对象数组，每个对象具有以下属性：

- `bucket_span`

  （数字）桶的长度（秒）。匹配具有最大桶跨度的作业。

- `is_interim`

  （布尔值）如果为 `true`，这是临时结果。即结果是基于部分输入数据计算的。

- `jobs`

  （数组）包含每个 `job_id` 的 `max_anomaly_score` 的对象数组。

- `overall_score`

  （数字）每个作业最大桶 `anomaly_score` 的前 `top_n` 平均值。

- `result_type`

  （字符串）内部使用。此值始终设置为 `overall_bucket`。

- `timestamp`

  （日期）计算这些结果的桶的开始时间。

## 示例

```json
GET _ml/anomaly_detectors/job-*/results/overall_buckets
{
  "overall_score": 80,
  "start": "1403532000000"
}
```

在此示例中，API 返回匹配指定分数和时间约束的单个结果。由于未指定 `top_n` 时默认为 1，`overall_score` 是最大作业分数：

```json
{
  "count": 1,
  "overall_buckets": [
    {
      "timestamp" : 1403532000000,
      "bucket_span" : 3600,
      "overall_score" : 80.0,
      "jobs" : [
        {
          "job_id" : "job-1",
          "max_anomaly_score" : 30.0
        },
        {
          "job_id" : "job-2",
          "max_anomaly_score" : 10.0
        },
        {
          "job_id" : "job-3",
          "max_anomaly_score" : 80.0
        }
      ],
      "is_interim" : false,
      "result_type" : "overall_bucket"
    }
  ]
}
```

以下示例类似，但这次 `top_n` 设置为 2：

```json
GET _ml/anomaly_detectors/job-*/results/overall_buckets
{
  "top_n": 2,
  "overall_score": 50.0,
  "start": "1403532000000"
}
```

注意 `overall_score` 现在是前 2 个作业分数的平均值：

```json
{
  "count": 1,
  "overall_buckets": [
    {
      "timestamp" : 1403532000000,
      "bucket_span" : 3600,
      "overall_score" : 55.0,
      "jobs" : [
        {
          "job_id" : "job-1",
          "max_anomaly_score" : 30.0
        },
        {
          "job_id" : "job-2",
          "max_anomaly_score" : 10.0
        },
        {
          "job_id" : "job-3",
          "max_anomaly_score" : 80.0
        }
      ],
      "is_interim" : false,
      "result_type" : "overall_bucket"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-overall-buckets.html)
