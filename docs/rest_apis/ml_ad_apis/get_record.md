# 获取记录 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索异常检测作业的异常记录。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>/results/records
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

记录包含详细的分析结果。它们描述了根据检测器配置在输入数据中识别出的异常活动。

根据输入数据的特征和大小，可能会有许多异常记录。实际上，记录数量往往太多而无法手动处理。因此，机器学习功能将异常记录进行复杂的聚合为桶。

记录结果的数量取决于每个桶中发现的异常数量，这与建模的时间序列数量和检测器数量有关。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 查询参数

- `desc`

  （可选，布尔值）如果为 `true`，结果按降序排列。默认为 `false`。

- `end`

  （可选，字符串）返回时间戳早于此时间的记录。默认为 -1，表示未设置，结果不限于特定时间戳。

- `exclude_interim`

  （可选，布尔值）如果为 `true`，输出排除临时结果。默认为 `false`，即包含临时结果。

- `from`

  （可选，整数）跳过指定数量的记录。默认为 0。

- `record_score`

  （可选，双精度浮点数）返回异常分数大于或等于此值的记录。默认为 0.0。

- `size`

  （可选，整数）指定获取的记录的最大数量。默认为 100。

- `sort`

  （可选，字符串）指定请求记录的排序字段。默认情况下，记录按 `record_score` 值排序。

- `start`

  （可选，字符串）返回时间戳晚于此时间的记录。默认为 -1，表示未设置，结果不限于特定时间戳。

## 请求体

你也可以在请求体中指定查询参数；但 `from` 和 `size` 例外，请改用 `page`：

- `page`

  （可选，对象）

  `page` 的属性：

  - `from`

    （可选，整数）跳过指定数量的记录。默认为 0。

  - `size`

    （可选，整数）指定获取的记录的最大数量。默认为 100。

## 响应体

API 返回记录对象数组，每个对象具有以下属性：

- `actual`

  （数组）桶的实际值。

- `anomaly_score_explanation`

  （对象）当存在时，提供有关影响初始异常分数的因素的信息。

  `anomaly_score_explanation` 的属性：

  - `anomaly_characteristics_impact`（可选，整数）检测到的异常相对于历史平均值的持续时间和幅度的影响。
  - `anomaly_length`（可选，整数）检测到的异常的长度（桶数量）。
  - `anomaly_type`（可选，字符串）检测到的异常类型：`spike`（突增）或 `dip`（突降）。
  - `high_variance_penalty`（可选，布尔值）指示对具有大置信区间的桶减少异常分数。如果桶具有大置信区间，分数会减少。
  - `incomplete_bucket_penalty`（可选，布尔值）如果桶包含的样本少于预期，分数会减少。
  - `lower_confidence_bound`（可选，双精度浮点数）95% 置信区间的下界。
  - `multimodal_distribution`（可选，布尔值）指示桶值的概率分布是否有多个模态。当存在多个模态时，典型值可能不是最可能的值。
  - `multi_bucket_impact`（可选，整数）过去 12 个桶中实际值与典型值之间偏差的影响。
  - `single_bucket_impact`（可选，整数）当前桶中实际值与典型值之间偏差的影响。
  - `typical_value`（可选，双精度浮点数）此桶的典型（期望）值。
  - `upper_confidence_bound`（可选，双精度浮点数）95% 置信区间的上界。

- `bucket_span`

  （数字）桶的长度（秒）。此值与作业中指定的 `bucket_span` 匹配。

- `by_field_name`

  （字符串）用于拆分数据的字段。用于分析拆分相对于其自身历史的情况，以在拆分上下文中查找异常值。

- `by_field_value`

  （字符串）`by_field_name` 的值。

- `causes`

  （数组）对于群体分析，必须在检测器中指定 over 字段。此属性包含异常记录的异常原因数组，这些原因是在 over 字段中识别到的。如果不存在 over 字段，则不出现此字段。此子资源包含 `over_field_name` 最异常的记录。出于可扩展性原因，最多返回 10 个最重要的异常原因。作为核心分析建模的一部分，这些低级别异常记录会聚合为其父级 over 字段记录。causes 资源包含与记录资源类似的元素，即 `actual`、`typical`、`geo_results.actual_point`、`geo_results.typical_point`、`*_field_name` 和 `*_field_value`。概率和分数不适用于 causes。

- `detector_index`

  （数字）检测器的唯一标识符。

- `field_name`

  （字符串）某些函数需要操作的字段，例如 `sum()`。对于这些函数，此值是要分析的字段名称。

- `function`

  （字符串）发生异常的函数，如检测器配置中指定。例如 `max`。

- `function_description`

  （字符串）发生异常的函数的描述，如检测器配置中指定。

- `geo_results`

  （可选，对象）如果检测器函数为 `lat_long`，此对象包含实际值和典型值的纬度和经度的逗号分隔字符串。

  `geo_results` 的属性：

  - `actual_point`（字符串）桶的实际值，格式化为 geo_point。
  - `typical_point`（字符串）桶的典型值，格式化为 geo_point。

- `influencers`

  （数组）如果在检测器配置中指定了影响因素，此数组包含对异常有贡献或应为此负责的影响因素。

- `initial_record_score`

  （数字）0-100 之间的标准化分数，基于此记录异常的概率。这是在处理桶时计算的初始值。

- `is_interim`

  （布尔值）如果为 `true`，这是临时结果。即结果是基于部分输入数据计算的。

- `job_id`

  （字符串）异常检测作业的标识符。

- `multi_bucket_impact`

  （数字）指示异常是多桶还是单桶的程度。值在 -5.0 到 +5.0 的范围内，-5.0 表示异常纯粹是单桶的，+5.0 表示异常纯粹是多桶的。

- `over_field_name`

  （字符串）用于拆分数据的字段。用于分析拆分相对于所有拆分历史的情况，以在所有拆分的总体中查找异常值。有关更多信息，请参阅[执行群体分析](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-accessing-anomaly-results.html#performing-population-analysis)。

- `over_field_value`

  （字符串）`over_field_name` 的值。

- `partition_field_name`

  （字符串）用于分段分析的字段。使用此属性时，每个值都有完全独立的基线。

- `partition_field_value`

  （字符串）`partition_field_name` 的值。

- `probability`

  （数字）单个异常发生的概率，范围为 0 到 1。例如：`0.0000772031`。此值可保持超过 300 位小数的高精度，因此 `record_score` 提供作为人类可读的友好解释。

- `record_score`

  （数字）0-100 之间的标准化分数，基于此记录异常的概率。与 `initial_record_score` 不同，此值会随着新数据的分析通过重新标准化过程更新。

- `result_type`

  （字符串）内部使用。此值始终设置为 `record`。

- `timestamp`

  （日期）计算这些结果的桶的开始时间。

- `typical`

  （数组）根据分析建模的桶的典型值。

此外，还会添加额外的记录属性，具体取决于正在分析的字段。例如，如果正在分析 `hostname` 作为 by 字段，则会在结果文档中添加 `hostname` 字段。此信息使你能够更轻松地过滤异常结果。

## 示例

```json
GET _ml/anomaly_detectors/low_request_rate/results/records
{
  "sort": "record_score",
  "desc": true,
  "start": "1454944100000"
}
```

API 返回以下结果：

```json
{
  "count" : 4,
  "records" : [
    {
      "job_id" : "low_request_rate",
      "result_type" : "record",
      "probability" : 1.3882308899968812E-4,
      "multi_bucket_impact" : -5.0,
      "record_score" : 94.98554565630553,
      "initial_record_score" : 94.98554565630553,
      "bucket_span" : 3600,
      "detector_index" : 0,
      "is_interim" : false,
      "timestamp" : 1577793600000,
      "function" : "low_count",
      "function_description" : "count",
      "typical" : [
        28.254208230188834
      ],
      "actual" : [
        0.0
      ]
    },
  ...
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-record.html)
