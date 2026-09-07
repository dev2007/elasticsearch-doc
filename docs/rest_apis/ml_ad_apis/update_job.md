# 更新异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

更新异常检测作业的某些属性。

## 请求

```bash
POST _ml/anomaly_detectors/<job_id>/_update
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。

## 请求体

作业创建后可以更新以下属性：

- `allow_lazy_open`

  （布尔值）高级配置选项。指定此作业是否可以在没有足够的机器学习节点容量立即分配到节点时打开。默认为 `false`；如果无法立即找到有容量运行作业的机器学习节点，打开异常检测作业 API 返回错误。这也受集群范围的 `xpack.ml.max_lazy_ml_nodes` 设置限制。如果设置为 `true`，打开异常检测作业 API 不会返回错误，作业在打开状态等待，直到有足够的机器学习节点容量可用。

  如果更新时作业处于打开状态，必须停止数据源、关闭作业，然后重新打开作业并重启数据源才能使更改生效。

- `analysis_limits`

  （可选，对象）可应用于在内存中保存数学模型所需资源的限制。这些限制是近似的，可按作业设置。它们不控制其他进程使用的内存，例如 Elasticsearch Java 进程。

  只有在作业关闭时才能更新 `analysis_limits`。

  `analysis_limits` 的属性：

  - `model_memory_limit`

    （长整数或字符串）分析处理所需的最大近似内存资源量。一旦接近此限制，数据修剪变得更加积极。超过此限制后，不对新实体进行建模。对于 6.1 及更高版本创建的作业，默认为 1024mb。如果 `xpack.ml.max_model_memory_limit` 设置值大于 0 且小于 1024mb，则使用该值。如果未设置 `xpack.ml.max_model_memory_limit`，但设置了 `xpack.ml.use_auto_machine_memory_percent`，则默认 `model_memory_limit` 将设置为集群中可分配的最大大小，上限为 1024mb。

    如果指定数字而非字符串，单位假定为 MiB。建议指定字符串以保持清晰。如果指定 `b` 或 `kb` 字节单位且数字不等同于整数兆字节，则向下取整到最接近的 MiB。最小有效值为 1 MiB。

    你无法将 `model_memory_limit` 值降低到低于当前使用量。要确定当前使用量，请参阅获取异常检测作业统计 API 中的 `model_bytes` 值。

    如果 `model_size_stats` 对象中的 `memory_status` 属性值为 `hard_limit`，表示无法处理某些数据。你可能需要以增加的 `model_memory_limit` 重新运行作业。

- `background_persist_interval`

  （时间单位）高级配置选项。模型每次定期持久化之间的时间。默认为 3 到 4 小时之间的随机值，以避免所有作业在同一时间持久化。最小允许值为 1 小时。

    对于非常大的模型（数 GB），持久化可能需要 10-20 分钟，因此不要将 `background_persist_interval` 值设置得太低。

    如果更新时作业处于打开状态，必须停止数据源、关闭作业，然后重新打开作业并重启数据源才能使更改生效。

- `custom_settings`

  （对象）高级配置选项。包含有关作业的自定义元数据。例如，可以包含自定义 URL 信息，如[向机器学习结果添加自定义 URL](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-configuring_urls.html)中所示。

- `daily_model_snapshot_retention_after_days`

  （长整数）高级配置选项，影响此作业旧模型快照的自动移除。指定一个时间段（天），之后每天仅保留第一个快照。此时间段相对于此作业最新快照的时间戳。有效值范围为 0 到 `model_snapshot_retention_days`。对于新作业，默认为 1。对于 7.8.0 之前版本创建的作业，默认值匹配 `model_snapshot_retention_days`。

- `description`

  （字符串）作业的描述。

- `detectors`

  （数组）检测器更新对象数组。

  `detectors` 的属性：

  - `custom_rules`

    （数组）自定义规则对象数组，使你能够自定义检测器的操作方式。例如，规则可以向检测器指示在哪些条件下应跳过结果。Kibana 将自定义规则称为作业规则。有关更多示例，请参阅[使用自定义规则自定义检测器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-custom-rules.html)。

    `custom_rules` 的属性：

    - `actions`

      （数组）规则适用时触发的操作集合。如果指定多个操作，所有操作的效果合并。可用操作包括：

      - `skip_result`：不创建结果。这是默认值。除非同时指定 `skip_model_update`，模型将照常更新。
      - `skip_model_update`：该系列的值不会用于更新模型。除非同时指定 `skip_result`，结果将照常创建。
      - `force_time_shift`：此操作将异常检测器内部的时间偏移指定量。例如，可用于快速适应事先已知的夏令时事件。此操作需要 `params` 对象中的 `force_time_shift` 参数。

    - `params`

      （对象）自定义规则操作数组中定义的操作的参数对象集合。可用参数（取决于指定的操作）包括：`force_time_shift`。

      `params` 的属性：

      - `force_time_shift`（对象）设置 `time_shift_amount` 为你想要偏移时间的有符号秒数。

    - `conditions`

      （数组）规则适用时的数字条件可选数组。规则必须具有非空范围或至少一个条件。多个条件通过逻辑 AND 组合。

      `conditions` 的属性：

      - `applies_to`（字符串）指定条件应用的结果属性。可用选项：`actual`、`typical`、`diff_from_typical`、`time`。如果检测器使用 `lat_long`、`metric`、`rare` 或 `freq_rare` 函数，只能指定应用于 `time` 的条件。
      - `operator`（字符串）指定条件运算符。可用选项：`gt`、`gte`、`lt`、`lte`。
      - `value`（双精度浮点数）使用运算符与 `applies_to` 字段比较的值。

    - `scope`

      （对象）规则适用的系列范围可选对象。规则必须具有非空范围或至少一个条件。默认包含所有系列。允许对 `by_field_name`、`over_field_name` 或 `partition_field_name` 中指定的字段进行范围限定。

      `scope` 的属性：

      - `filter_id`（字符串）要使用的过滤器 ID。
      - `filter_type`（字符串）`include`（规则适用于过滤器中的值）或 `exclude`（规则适用于不在过滤器中的值）。默认为 `include`。

  - `description`

    （字符串）检测器的描述。例如 `Low event rate`。

  - `detector_index`

    （整数）检测器的唯一标识符，基于 `analysis_config` 中检测器的顺序，从零开始。

    如果要更新特定检测器，必须使用此标识符。但无法更改检测器的 `detector_index` 值。

- `groups`

  （字符串数组）作业组列表。一个作业可以不属于任何组或属于多个组。

- `model_plot_config`

  （对象）此高级配置选项将模型信息与结果一起存储。它提供异常检测的更详细视图。

  如果启用模型绘图，可能会给系统性能增加相当大的开销；对于具有许多实体的作业不可行。

  模型绘图提供模型及其边界的简化指示性视图。它不显示多元相关性或多模态数据等复杂特征。因此，可能偶尔报告在模型绘图中看不到的异常。

  可以在创建作业时配置模型绘图，也可以稍后更新。如果遇到性能问题，必须禁用它。

  `model_plot_config` 的属性：

  - `annotations_enabled`（布尔值）如果为 `true`，为每个正在分析的实体计算和存储模型变更注释。默认启用。
  - `enabled`（布尔值）如果为 `true`，为每个正在分析的实体计算和存储模型边界。默认不启用。
  - `terms`（字符串）将数据收集限制为此逗号分隔的分区或 by 字段值列表。如果未指定 terms 或为空字符串，不应用过滤。不支持通配符。使用单一指标查看器时只能查看指定的 terms。

- `model_prune_window`

  （时间单位）高级配置选项。影响在给定时间内未更新的模型的修剪。值必须设置为 `bucket_span` 的倍数。如果设置太低，可能会从模型中移除重要信息。通常设置为 30d 或更长。如果未设置，仅在模型内存状态达到软限制或硬限制时才进行模型修剪。对于 8.1 及更高版本创建的作业，默认值为 30d 或 20 倍 `bucket_span` 中的较大者。

- `model_snapshot_retention_days`

  （长整数）高级配置选项，影响此作业旧模型快照的自动移除。指定快照保留的最长时间段（天）。此时间段相对于此作业最新快照的时间戳。默认为 10，意味着比最新快照旧十天的快照将被删除。

- `per_partition_categorization`

  （对象）与分类如何与分区字段交互相关的设置。

  `per_partition_categorization` 的属性：

  - `enabled`（布尔值）要启用此设置，还必须在每个使用关键字 `mlcategory` 的检测器中将 `partition_field_name` 属性设置为相同的值。否则，作业创建失败。
  - `stop_on_warn`（布尔值）只有在启用按分区分类时才能设置为 `true`。如果为 `true`，分类和后续异常检测将在分类状态变为 warn 的分区停止。

- `renormalization_window_days`

  （长整数）高级配置选项。随着新数据的出现，应用分数调整的时间段。默认为 30 天或 100 个桶跨度中的较大者。

    如果更新时作业处于打开状态，必须停止数据源、关闭作业，然后重新打开作业并重启数据源才能使更改生效。

- `results_retention_days`

  （长整数）高级配置选项。结果保留的时间段（天）。年龄相对于最新桶结果的时间戳计算。如果此属性具有非 null 值，每天 00:30（服务器时间），比最新桶结果旧指定天数的 结果将从 Elasticsearch 中删除。默认为 null，表示保留所有结果。系统生成的注释也算作保留结果；它们在相同天数后删除。用户添加的注释永久保留。

## 示例

```json
POST _ml/anomaly_detectors/low_request_rate/_update
{
  "description":"An updated job",
  "detectors": {
    "detector_index": 0,
    "description": "An updated detector description"
  },
  "groups": ["kibana_sample_data","kibana_sample_web_logs"],
  "model_plot_config": {
    "enabled": true
  },
  "renormalization_window_days": 30,
  "background_persist_interval": "2h",
  "model_snapshot_retention_days": 7,
  "results_retention_days": 60
}
```

异常检测作业更新后，你收到作业配置信息的摘要，包括更新的属性值。例如：

```json
{
  "job_id" : "low_request_rate",
  "job_type" : "anomaly_detector",
  "job_version" : "8.4.0",
  "create_time" : 1656105950893,
  "finished_time" : 1656105965744,
  "model_snapshot_id" : "1656105964",
  "custom_settings" : {
    "created_by" : "ml-module-sample",
    "custom_urls" : [
      {
        "url_name" : "Raw data",
        "url_value" : "discover#/?_g=(time:(from:'$earliest$',mode:absolute,to:'$latest$'))&_a=(index:'90943e30-9a47-11e8-b64d-95841ca0b247')"
      },
      {
        "url_name" : "Data dashboard",
        "url_value" : "dashboards#/view/edf84fe0-e1a0-11e7-b6d5-4dc382ef7f5b?_g=(time:(from:'$earliest$',mode:absolute,to:'$latest$'))&_a=(filters:!(),query:(language:kuery,query:''))"
      }
    ]
  },
  "groups" : [
    "kibana_sample_data",
    "kibana_sample_web_logs"
  ],
  "description" : "An updated job",
  "analysis_config" : {
    "bucket_span" : "1h",
    "summary_count_field_name" : "doc_count",
    "detectors" : [
      {
        "detector_description" : "An updated detector description",
        "function" : "low_count",
        "detector_index" : 0
      }
    ],
    "influencers" : [ ],
    "model_prune_window" : "30d"
  },
  "analysis_limits" : {
    "model_memory_limit" : "11mb",
    "categorization_examples_limit" : 4
  },
  "data_description" : {
    "time_field" : "timestamp",
    "time_format" : "epoch_ms"
  },
  "model_plot_config" : {
    "enabled" : true,
    "annotations_enabled" : true
  },
  "renormalization_window_days" : 30,
  "background_persist_interval" : "2h",
  "model_snapshot_retention_days" : 7,
  "daily_model_snapshot_retention_after_days" : 1,
  "results_retention_days" : 60,
  "results_index_name" : "custom-low_request_rate",
  "allow_lazy_open" : false
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-update-job.html)
