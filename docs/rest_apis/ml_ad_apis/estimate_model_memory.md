# 估算模型内存 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

估算异常检测作业模型的内存使用量。估算基于作业的分析配置详情和它引用的字段的基数估计。

## 请求

```bash
POST _ml/anomaly_detectors/_estimate_model_memory
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 请求体

- `analysis_config`

  （必需，对象）有关可以在此 API 请求体的 `analysis_config` 组件中指定的属性列表，请参阅 `analysis_config`。

- `max_bucket_cardinality`

  （必需*，对象）在作业分析数据的时间段内，影响因素字段在单个桶中观察到的最高基数估计。要获得准确的估算结果，必须为所有影响因素字段提供值。为未列为影响因素的字段提供值对估算没有影响。

  *如果没有影响因素，可以从请求中省略此参数。

- `overall_cardinality`

  （必需*，对象）在作业分析数据的时间段内，字段观察到的基数估计。要获得准确的估算结果，必须为任何检测器的 `by_field_name`、`over_field_name` 和 `partition_field_name` 中引用的字段提供值。为其他字段提供值对估算没有影响。

  *如果没有检测器包含 `by_field_name`、`over_field_name` 或 `partition_field_name`，可以从请求中省略此参数。

## 示例

```json
POST _ml/anomaly_detectors/_estimate_model_memory
{
  "analysis_config": {
    "bucket_span": "5m",
    "detectors": [
      {
        "function": "sum",
        "field_name": "bytes",
        "by_field_name": "status",
        "partition_field_name": "app"
      }
    ],
    "influencers": [ "source_ip", "dest_ip" ]
  },
  "overall_cardinality": {
    "status": 10,
    "app": 50
  },
  "max_bucket_cardinality": {
    "source_ip": 300,
    "dest_ip": 30
  }
}
```

估算返回以下结果：

```json
{
  "model_memory_estimate": "21mb"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-estimate-model-memory.html)
