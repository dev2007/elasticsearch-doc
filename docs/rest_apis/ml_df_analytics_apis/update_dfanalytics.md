# 更新数据帧分析作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

更新一个已存在的数据帧分析作业。

## 请求

```bash
POST _ml/data_frame/analytics/<data_frame_analytics_id>/_update
```

## 前置条件

- 需要以下权限：
  - 集群：`manage_ml`（`machine_learning_admin` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 源索引：`read`、`view_index_metadata` — [权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)
  - 目标索引：`read`、`create_index`、`manage` 和 `index`

- 数据帧分析作业会记住更新它的用户在更新时拥有的角色。当你启动作业时，它使用这些角色执行分析。如果提供了辅助授权头，则使用这些凭据。

## 描述

此 API 更新一个已存在的数据帧分析作业，该作业对源索引执行分析并将结果存储在目标索引中。

## 路径参数

- `<data_frame_analytics_id>`

  （必需，字符串）数据帧分析作业的标识符。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 请求体

- `allow_lazy_start`

  （可选，布尔值）指定此作业是否可以在没有足够的机器学习节点容量立即分配到节点时启动。默认为 `false`；如果无法立即找到有容量运行作业的机器学习节点，API 返回错误。这也受集群范围的 `xpack.ml.max_lazy_ml_nodes` 设置限制。如果设置为 `true`，API 不会返回错误，作业在启动状态等待，直到有足够的机器学习节点容量可用。

- `description`

  （可选，字符串）作业的描述。

- `max_num_threads`

  （可选，整数）分析使用的最大线程数。默认为 1。使用更多线程可能会减少完成分析所需时间，但会使用更多 CPU。注意，进程可能使用额外线程执行分析本身以外的操作功能。

- `_meta`

  （可选，对象）高级配置选项。包含有关作业的自定义元数据。例如，可以包含自定义 URL 信息。

- `model_memory_limit`

  （可选，字符串）分析处理允许的最大近似内存资源量。数据帧分析作业的默认值为 1gb。如果设置了 `xpack.ml.max_model_memory_limit`，当尝试创建 `model_memory_limit` 值大于该设置值的作业时会发生错误。有关更多信息，请参阅[机器学习设置](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-settings.html)。

## 示例

以下示例展示如何更新已存在的数据帧分析配置的模型内存限制：

```json
POST _ml/data_frame/analytics/loganalytics/_update
{
  "model_memory_limit": "200mb"
}
```

作业更新后，响应包含其配置和更新后的值。例如：

```json
{
  "id" : "loganalytics",
  "create_time" : 1656364565517,
  "version" : "8.4.0",
  "authorization" : {
    "roles" : [
      "superuser"
    ]
  },
  "description" : "Outlier detection on log data",
  "source" : {
    "index" : [
      "logdata"
    ],
    "query" : {
      "match_all" : { }
    }
  },
  "dest" : {
    "index" : "logdata_out",
    "results_field" : "ml"
  },
  "analysis" : {
    "outlier_detection" : {
      "compute_feature_influence" : true,
      "outlier_fraction" : 0.05,
      "standardization_enabled" : true
    }
  },
  "model_memory_limit" : "200mb",
  "allow_lazy_start" : false,
  "max_num_threads" : 1
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-dfanalytics.html)
