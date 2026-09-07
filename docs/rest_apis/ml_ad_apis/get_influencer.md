# 获取影响因素 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索一个或多个影响因素的异常检测作业结果。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/results/influencers
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

影响因素是对异常有贡献或应为此负责的实体。只有当作业配置中指定了 `influencer_field_name` 时，才会提供影响因素结果。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `desc`

  （可选，布尔值）如果为 `true`，结果按降序排列。默认为 `false`。

- `end`

  （可选，字符串）返回时间戳早于此时间的影响因素。默认为 -1，表示未设置，结果不限于特定时间戳。

- `exclude_interim`

  （可选，布尔值）如果为 `true`，输出排除临时结果。默认为 `false`，即包含临时结果。

- `from`

  （可选，整数）跳过指定数量的影响因素。默认为 0。

- `influencer_score`

  （可选，双精度浮点数）返回异常分数大于或等于此值的影响因素。默认为 0.0。

- `size`

  （可选，整数）指定获取的影响因素的最大数量。默认为 100。

- `sort`

  （可选，字符串）指定请求影响因素的排序字段。默认情况下，影响因素按 `influencer_score` 值排序。

- `start`

  （可选，字符串）返回时间戳晚于此时间的影响因素。默认为 -1，表示未设置，结果不限于特定时间戳。

## 请求体

你也可以在请求体中指定查询参数；但 `from` 和 `size` 例外，请改用 `page`：

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的影响因素。默认为 0。

  - `size`

    （可选，整数）指定获取的影响因素的最大数量。默认为 100。

## 响应体

API 返回影响因素对象数组，每个对象具有以下属性：

- `bucket_span`

  （数字）桶的长度（秒）。此值与作业中指定的 `bucket_span` 匹配。

- `influencer_score`

  （数字）0-100 之间的标准化分数，基于桶中该影响因素在所有检测器上聚合的概率。与 `initial_influencer_score` 不同，此值会随着新数据的分析通过重新标准化过程更新。

- `influencer_field_name`

  （字符串）影响因素的字段名称。

- `influencer_field_value`

  （字符串）影响、贡献于或应对异常负责的实体。

- `initial_influencer_score`

  （数字）0-100 之间的标准化分数，基于影响因素在所有检测器上聚合的概率。这是在处理桶时计算的初始值。

- `is_interim`

  （布尔值）如果为 `true`，这是临时结果。即结果是基于部分输入数据计算的。

- `job_id`

  （字符串）异常检测作业的标识符。

- `probability`

  （数字）影响因素具有此行为的概率，范围为 0 到 1。例如：`0.0000109783`。此值可保持超过 300 位小数的高精度，因此 `influencer_score` 提供作为人类可读的友好解释。

- `result_type`

  （字符串）内部使用。此值始终设置为 `influencer`。

- `timestamp`

  （日期）计算这些结果的桶的开始时间。

此外，还会添加额外的影响因素属性，具体取决于正在分析的字段。例如，如果正在分析 `user_name` 作为影响因素，则会在结果文档中添加 `user_name` 字段。此信息使你能够更轻松地过滤异常结果。

## 示例

```json
GET _ml/anomaly_detectors/high_sum_total_sales/results/influencers
{
  "sort": "influencer_score",
  "desc": true
}
```

在此示例中，API 返回按影响因素分数降序排列的以下信息：

```json
{
  "count": 189,
  "influencers": [
    {
      "job_id": "high_sum_total_sales",
      "result_type": "influencer",
      "influencer_field_name": "customer_full_name.keyword",
      "influencer_field_value": "Wagdi Shaw",
      "customer_full_name.keyword": "Wagdi Shaw",
      "influencer_score": 99.02493,
      "initial_influencer_score": 94.67233079580171,
      "probability": 1.4784807245686567E-10,
      "bucket_span": 3600,
      "is_interim": false,
      "timestamp": 1574661600000
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-influencer.html)
