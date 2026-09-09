# 获取数据帧分析作业统计 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

检索数据帧分析作业的使用信息。

## 请求

```bash
GET _ml/data_frame/analytics/<data_frame_analytics_id>/_stats
```

```bash
GET _ml/data_frame/analytics/<data_frame_analytics_id>,<data_frame_analytics_id>/_stats
```

```bash
GET _ml/data_frame/analytics/_stats
```

```bash
GET _ml/data_frame/analytics/_all/_stats
```

```bash
GET _ml/data_frame/analytics/*/_stats
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 路径参数

- `<data_frame_analytics_id>`

  （可选，字符串）数据帧分析作业的标识符。如果不指定此选项，API 返回前一百个数据帧分析作业的信息。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的数据帧分析作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空 `data_frame_analytics` 数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `from`

  （可选，整数）跳过指定数量的数据帧分析作业。默认为 0。

- `size`

  （可选，整数）指定获取的数据帧分析作业的最大数量。默认为 100。

- `verbose`

  （可选，布尔值）定义统计响应是否详细。默认为 `false`。

## 响应体

- `data_frame_analytics`

  （数组）包含数据帧分析作业使用信息的对象数组，按 `id` 值升序排列。

  数据帧分析作业使用资源对象的属性：

  - `assignment_explanation`

    （字符串）对于运行中的作业，包含与选择运行作业的节点相关的消息。

  - `analysis_stats`

    （对象）包含分析作业信息的对象。

    `analysis_stats` 的属性：

    - `classification_stats`

      （对象）包含分类分析作业信息的对象。

      `classification_stats` 的属性：

      - `hyperparameters`（对象）包含分类分析作业参数的对象。包含与[创建数据帧分析作业 API](./put_dfanalytics) 中分类参数相同的超参数（`alpha`、`class_assignment_objective`、`downsample_factor`、`eta`、`eta_growth_rate_per_tree`、`feature_bag_fraction`、`gamma`、`lambda`、`max_optimization_rounds_per_hyperparameter`、`max_trees`、`soft_tree_depth_limit`、`soft_tree_depth_tolerance`），以及额外的 `max_attempts_to_add_tree`、`num_folds`、`num_splits_per_feature` 参数。
      - `iteration`（整数）分析的迭代次数。
      - `timestamp`（日期）统计报告的时间戳（自纪元以来的毫秒数）。
      - `timing_stats`（对象）包含数据帧分析作业时间统计的对象。
        - `elapsed_time`（整数）分析的运行时间（毫秒）。
        - `iteration_time`（整数）分析最新迭代的运行时间（毫秒）。
      - `validation_loss`（对象）包含验证损失信息的对象。
        - `fold_values`（数组）森林生长过程中每棵添加的决策树的验证损失值。
        - `loss_type`（字符串）损失指标的类型。例如 `binomial_logistic`。

    - `outlier_detection_stats`

      （对象）包含离群点检测作业信息的对象。

      `outlier_detection_stats` 的属性：

      - `parameters`（对象）用户指定或算法启发式确定的作业参数列表。包含与[创建数据帧分析作业 API](./put_dfanalytics) 中离群点检测参数相同的参数（`compute_feature_influence`、`feature_influence_threshold`、`method`、`n_neighbors`、`outlier_fraction`、`standardization_enabled`）。
      - `timestamp`（日期）统计报告的时间戳（自纪元以来的毫秒数）。
      - `timing_stats`（对象）包含数据帧分析作业时间统计的对象。
        - `elapsed_time`（整数）分析的运行时间（毫秒）。

    - `regression_stats`

      （对象）包含回归分析作业信息的对象。

      `regression_stats` 的属性：

      - `hyperparameters`（对象）包含回归分析作业参数的对象。包含与[创建数据帧分析作业 API](./put_dfanalytics) 中回归参数相同的超参数（`alpha`、`downsample_factor`、`eta`、`eta_growth_rate_per_tree`、`feature_bag_fraction`、`gamma`、`lambda`、`max_optimization_rounds_per_hyperparameter`、`max_trees`、`soft_tree_depth_limit`、`soft_tree_depth_tolerance`），以及额外的 `max_attempts_to_add_tree`、`num_folds`、`num_splits_per_feature` 参数。
      - `iteration`（整数）分析的迭代次数。
      - `timestamp`（日期）统计报告的时间戳（自纪元以来的毫秒数）。
      - `timing_stats`（对象）包含数据帧分析作业时间统计的对象。
        - `elapsed_time`（整数）分析的运行时间（毫秒）。
        - `iteration_time`（整数）分析最新迭代的运行时间（毫秒）。
      - `validation_loss`（对象）包含验证损失信息的对象。
        - `fold_values`（数组）森林生长过程中每棵添加的决策树的验证损失值。
        - `loss_type`（字符串）损失指标的类型。例如 `binomial_logistic`。

  - `data_counts`

    （对象）提供跳过、用于训练或可用于测试的文档数量的对象。

    `data_counts` 的属性：

    - `skipped_docs_count`（整数）分析期间跳过的文档数量，因为它们包含分析不支持的值。
    - `test_docs_count`（整数）未用于训练模型且可用于测试的文档数量。
    - `training_docs_count`（整数）用于训练模型的文档数量。

  - `id`

    （字符串）数据帧分析作业的唯一标识符。

  - `memory_usage`

    （可选，对象）描述分析内存使用的对象。仅在作业启动并报告内存使用后出现。

    `memory_usage` 的属性：

    - `memory_reestimate_bytes`（长整数）当状态为 `hard_limit` 时存在，是作业所需内存的新估计。
    - `peak_usage_bytes`（长整数）内存使用的最高峰值字节数。
    - `status`（字符串）内存使用状态。可能值：`ok`（使用低于限制）、`hard_limit`（使用超过配置的内存限制）。
    - `timestamp`（日期）内存使用计算的时间戳。

  - `node`

    （对象）包含运行作业的节点的属性。此信息仅适用于运行中的作业。

    `node` 的属性：

    - `attributes`（对象）列出节点属性，如 `ml.machine_memory` 或 `ml.max_open_jobs` 设置。
    - `ephemeral_id`（字符串）节点的临时 ID。
    - `id`（字符串）节点的唯一标识符。
    - `name`（字符串）节点名称。
    - `transport_address`（字符串）接受传输 HTTP 连接的主机和端口。

  - `progress`

    （数组）按阶段的数据帧分析作业进度报告。

    `progress` 对象的属性：

    - `phase`（字符串）定义数据帧分析作业的阶段。可能阶段：

      - `reindexing`
      - `loading_data`
      - `computing_outliers`（仅离群点检测）
      - `feature_selection`（仅回归和分类）
      - `coarse_parameter_search`（仅回归和分类）
      - `fine_tuning_parameters`（仅回归和分类）
      - `final_training`（仅回归和分类）
      - `writing_results`
      - `inference`（仅回归和分类）

      要了解不同阶段的更多信息，请参阅[数据帧分析作业的工作原理](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/df-analytics-batch.html)。

    - `progress_percent`（整数）数据帧分析作业的进度百分比。

  - `state`

    （字符串）数据帧分析作业的状态。可能值：`failed`、`started`、`starting`、`stopping`、`stopped`。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例获取 `weblog-outliers` 离群点检测数据帧分析作业的使用信息：

```bash
GET _ml/data_frame/analytics/weblog-outliers/_stats
```

API 返回以下结果：

```json
{
  "count" : 1,
  "data_frame_analytics" : [
    {
      "id" : "weblog-outliers",
      "state" : "stopped",
      "progress" : [
        {
          "phase" : "reindexing",
          "progress_percent" : 100
        },
        {
          "phase" : "loading_data",
          "progress_percent" : 100
        },
        {
          "phase" : "computing_outliers",
          "progress_percent" : 100
        },
        {
          "phase" : "writing_results",
          "progress_percent" : 100
        }
      ],
      "data_counts" : {
        "training_docs_count" : 1001,
        "test_docs_count" : 0,
        "skipped_docs_count" : 0
      },
      "memory_usage" : {
        "timestamp" : 1626264770206,
        "peak_usage_bytes" : 328011,
        "status" : "ok"
      },
      "analysis_stats" : {
        "outlier_detection_stats" : {
          "timestamp" : 1626264770206,
          "parameters" : {
            "n_neighbors" : 0,
            "method" : "ensemble",
            "compute_feature_influence" : true,
            "feature_influence_threshold" : 0.1,
            "outlier_fraction" : 0.05,
            "standardization_enabled" : true
          },
          "timing_stats" : {
            "elapsed_time" : 32
          }
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-dfanalytics-stats.html)
