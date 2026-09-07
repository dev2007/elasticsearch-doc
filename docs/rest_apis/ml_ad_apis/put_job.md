# 创建异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

实例化异常检测作业。

## 请求

```bash
PUT _ml/anomaly_detectors/<job_id>
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。
- 如果包含 `datafeed_config`，你还必须对源索引拥有读取索引权限。

## 描述

- 你必须使用 Kibana 或此 API 来创建异常检测作业。不要使用 Elasticsearch 索引 API 直接将作业放入 `.ml-config` 索引。如果启用了 Elasticsearch 安全功能，不要给予用户 `.ml-config` 索引的写入权限。
- 如果包含 `datafeed_config` 且启用了 Elasticsearch 安全功能，数据源会记住创建它的用户在创建时拥有的角色，并使用这些角色运行查询。如果提供辅助授权头，则使用这些凭据。

## 路径参数

- `<job_id>`

  （必需，字符串）异常检测作业的标识符。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 请求体

- `allow_lazy_open`

  （可选，布尔值）高级配置选项。指定此作业是否可以在没有足够的机器学习节点容量立即分配到节点时打开。默认为 `false`；如果无法立即找到有容量运行作业的机器学习节点，打开异常检测作业 API 返回错误。这也受集群范围的 `xpack.ml.max_lazy_ml_nodes` 设置限制。如果设置为 `true`，打开异常检测作业 API 不会返回错误，作业在打开状态等待，直到有足够的机器学习节点容量可用。

- `analysis_config`

  （必需，对象）分析配置，指定如何分析数据。创建作业后，不能更改分析配置；所有属性仅供参考。

  `analysis_config` 的属性：

  - `bucket_span`

    （时间单位）分析聚合的时间间隔大小，通常在 5m 到 1h 之间。此值应为整天数或等于一天中整桶数。如果异常检测作业使用带聚合的数据源，此值还必须能被日期直方图聚合的间隔整除。默认为 5m。有关更多信息，请参阅桶跨度。

  - `categorization_analyzer`

    （对象或字符串）如果指定了 `categorization_field_name`，你还可以定义用于解释分类字段的分析器。此属性不能与 `categorization_filters` 同时使用。有关更多信息，请参阅日志消息分类。

    如果为字符串，必须引用内置分析器或由其他插件添加的分析器。如果为对象，则有以下属性：

    - `char_filter`（字符过滤器数组）一个或多个字符过滤器。可选。
    - `tokenizer`（字符串或对象）字符过滤器应用后使用的分词器的名称或定义。如果 `categorization_analyzer` 指定为对象，则此属性为必需。机器学习提供了名为 `ml_standard` 的分词器。
    - `filter`（令牌过滤器数组）一个或多个令牌过滤器。可选。

  - `categorization_field_name`

    （字符串）如果指定此属性，指定字段的值将被分类。生成的类别必须在检测器中通过将 `by_field_name`、`over_field_name` 或 `partition_field_name` 设置为关键字 `mlcategory` 来使用。

  - `categorization_filters`

    （字符串数组）如果指定了 `categorization_field_name`，你还可以定义可选过滤器。此属性期望正则表达式数组，用于从分类字段值中过滤掉匹配的序列。此属性不能与 `categorization_analyzer` 同时使用。

  - `detectors`

    （数组）检测器配置对象数组。检测器配置对象指定作业分析哪些数据字段，以及使用哪些分析函数。可以为作业指定多个检测器。

    `detectors` 的属性：

    - `by_field_name`（字符串）用于拆分数据的字段。用于分析拆分相对于其自身历史的情况。
    - `custom_rules`（数组）自定义规则对象数组，使你能够自定义检测器的操作方式。
      - `actions`（数组）规则适用时触发的操作集合。可用操作：`skip_result`、`skip_model_update`、`force_time_shift`。
      - `params`（对象）自定义规则操作中定义的操作的参数对象。
      - `conditions`（数组）规则适用时的数字条件可选数组。多个条件通过逻辑 AND 组合。
        - `applies_to`（字符串）指定条件应用的结果属性。可用选项：`actual`、`typical`、`diff_from_typical`、`time`。
        - `operator`（字符串）指定条件运算符。可用选项：`gt`、`gte`、`lt`、`lte`。
        - `value`（双精度浮点数）使用运算符与 `applies_to` 字段比较的值。
      - `scope`（对象）规则适用的系列范围。默认包含所有系列。
        - `filter_id`（字符串）要使用的过滤器 ID。
        - `filter_type`（字符串）`include` 或 `exclude`。默认为 `include`。
    - `detector_description`（字符串）检测器的描述。
    - `detector_index`（整数）检测器的唯一标识符，基于 `analysis_config` 中检测器的顺序，从零开始。
    - `exclude_frequent`（字符串）包含以下值之一：`all`、`none`、`by`、`over`。如果设置，频繁实体被排除在影响异常结果之外。
    - `field_name`（字符串）检测器在函数中使用的字段。如果使用事件率函数（如 `count` 或 `rare`），不要指定此字段。
    - `function`（字符串）使用的分析函数。例如 `count`、`rare`、`mean`、`min`、`max`、`sum`。
    - `over_field_name`（字符串）用于拆分数据的字段。用于分析拆分相对于所有拆分历史的情况。用于在所有拆分的总体中查找异常值。
    - `partition_field_name`（字符串）用于分段分析的字段。使用此属性时，每个值都有完全独立的基线。
    - `use_null`（布尔值）定义当 `by` 或 `partition` 字段没有值时是否使用新系列作为 null 系列。默认为 `false`。

  - `influencers`

    （字符串数组）影响因素字段名称的逗号分隔列表。通常是检测器配置中使用的 `by`、`over` 或 `partition` 字段。

  - `latency`

    （时间单位）期望数据乱序到达的窗口大小。默认为 0（无延迟）。如果指定非零值，必须大于或等于一秒。仅在使用推送数据 API 发送数据时适用。

  - `model_prune_window`

    （可选，时间单位）高级配置选项。影响在给定时间内未更新的模型的修剪。值必须设置为 `bucket_span` 的倍数。如果未设置，仅在模型内存状态达到软限制或硬限制时才进行模型修剪。对于 8.1 及更高版本创建的作业，默认值为 30d 或 20 倍 `bucket_span` 中的较大者。

  - `multivariate_by_fields`

    （布尔值）保留供内部使用。如果设置为 `true`，分析将自动查找给定 `by` 字段值之间指标的相关性，并在这些相关性不再成立时报告异常。要使用此属性，还必须在检测器中指定 `by_field_name`。

  - `per_partition_categorization`

    （可选，对象）与分类如何与分区字段交互相关的设置。

    - `enabled`（布尔值）要启用此设置，还必须在每个使用关键字 `mlcategory` 的检测器中将 `partition_field_name` 属性设置为相同的值。
    - `stop_on_warn`（布尔值）如果为 `true`，分类和后续异常检测将在分类状态变为 warn 的分区停止。

  - `summary_count_field_name`

    （字符串）如果指定此属性，输入到作业的数据预期为预汇总数据。此属性值是包含已汇总原始数据点计数的字段名称。不能与 metric 函数一起使用。

- `analysis_limits`

  （可选，对象）可应用于在内存中保存数学模型所需资源的限制。这些限制是近似的，可按作业设置。

  `analysis_limits` 的属性：

  - `categorization_examples_limit`

    （长整数）每个类别在内存和结果数据存储中存储的最大示例数。默认为 4。仅适用于使用分类的分析。

  - `model_memory_limit`

    （长整数或字符串）分析处理所需的最大近似内存资源量。一旦接近此限制，数据修剪变得更加积极。超过此限制后，不对新实体进行建模。对于 6.1 及更高版本创建的作业，默认为 1024mb。建议指定字符串以保持清晰。如果指定数字，单位假定为 MiB。最小有效值为 1 MiB。

- `background_persist_interval`

  （可选，时间单位）高级配置选项。模型每次定期持久化之间的时间。默认为 3 到 4 小时之间的随机值。最小允许值为 1 小时。

- `custom_settings`

  （可选，对象）高级配置选项。包含有关作业的自定义元数据。

- `daily_model_snapshot_retention_after_days`

  （可选，长整数）高级配置选项，影响此作业旧模型快照的自动移除。指定一个时间段（天），之后每天仅保留第一个快照。有效值范围为 0 到 `model_snapshot_retention_days`。对于新作业，默认为 1。

- `data_description`

  （必需，对象）数据描述定义了使用推送数据 API 发送数据时输入数据的格式。使用数据源时，只需设置 `time_field`，其余属性自动设置。

  `data_description` 的属性：

  - `format`（字符串）目前仅支持 `xcontent` 格式，这是默认值。
  - `time_field`（字符串）包含时间戳的字段名称。默认为 `time`。
  - `time_format`（字符串）时间格式，可以是 `epoch`、`epoch_ms` 或自定义模式。默认为 `epoch`。自定义模式必须遵循 Java DateTimeFormatter 类。

- `datafeed_config`

  （可选，对象）数据源，从 Elasticsearch 检索数据供作业分析。每个异常检测作业只能关联一个数据源。

  `datafeed_config` 的属性：

  - `aggregations`（可选，对象）如果设置，数据源执行聚合搜索。聚合支持有限，应仅用于低基数数据。
  - `chunking_config`（可选，对象）分块配置控制时间块大小的计算方式。
    - `mode`（字符串）可用模式：`auto`（默认）、`manual`、`off`。
    - `time_span`（时间单位）每次搜索查询的时间跨度。仅在 `mode` 为 `manual` 时适用。
  - `datafeed_id`（可选，字符串）唯一标识数据源的数字字符串。默认与异常检测作业 ID 相同。
  - `delayed_data_check_config`（可选，对象）指定数据源是否检查缺失数据及窗口大小。
    - `check_window`（时间单位）搜索延迟数据的时间窗口。默认为 null。
    - `enabled`（布尔值）指定数据源是否定期检查延迟数据。默认为 `true`。
  - `frequency`（可选，时间单位）数据源实时运行时进行计划查询的间隔。默认为桶跨度（短桶跨度）或桶跨度的合理部分（长桶跨度）。
  - `indices`（必需，数组）索引名称数组。支持通配符。
  - `indices_options`（可选，对象）指定搜索期间使用的索引扩展选项。
  - `max_empty_searches`（可选，整数）如果实时数据源从未见过任何数据，它将在此次实时搜索返回无文档后自动停止并关闭关联作业。
  - `query`（可选，对象）Elasticsearch 查询领域特定语言（DSL）。默认为 `{"match_all": {"boost": 1}}`。
  - `query_delay`（可选，时间单位）数据查询落后实时时间的秒数。默认在 60s 和 120s 之间随机选择。
  - `runtime_mappings`（可选，对象）为数据源搜索指定运行时字段。
  - `script_fields`（可选，对象）指定评估自定义表达式并将脚本字段返回给数据源的脚本。
  - `scroll_size`（可选，无符号整数）数据源不使用聚合时 Elasticsearch 搜索中使用的 size 参数。默认为 1000。最大值为 `index.max_result_window`（默认 10000）。

- `description`

  （可选，字符串）作业的描述。

- `groups`

  （可选，字符串数组）作业组列表。一个作业可以不属于任何组或属于多个组。

- `model_plot_config`

  （可选，对象）此高级配置选项将模型信息与结果一起存储。它提供异常检测的更详细视图。

  `model_plot_config` 的属性：

  - `annotations_enabled`（布尔值）如果为 `true`，启用为每个正在分析的实体计算和存储模型变更注释。默认启用。
  - `enabled`（布尔值）如果为 `true`，启用为每个正在分析的实体计算和存储模型边界。默认不启用。
  - `terms`（字符串）将数据收集限制为此逗号分隔的分区或 by 字段值列表。不支持通配符。

- `model_snapshot_retention_days`

  （可选，长整数）高级配置选项，影响此作业旧模型快照的自动移除。指定快照保留的最长时间段（天）。默认为 10。

- `renormalization_window_days`

  （可选，长整数）高级配置选项。随着新数据的出现，应用分数调整的时间段。默认为 30 天或 100 个桶跨度中的较大者。

- `results_index_name`

  （可选，字符串）影响机器学习结果索引名称的文本字符串。默认为 `shared`，生成名为 `.ml-anomalies-shared` 的索引。

- `results_retention_days`

  （可选，长整数）高级配置选项。结果保留的时间段（天）。默认为 null，表示保留所有结果。

## 示例

以下示例创建异常检测作业和数据源：

```json
PUT _ml/anomaly_detectors/test-job1?pretty
{
  "analysis_config": {
    "bucket_span": "15m",
    "detectors": [
      {
        "detector_description": "Sum of bytes",
        "function": "sum",
        "field_name": "bytes"
      }
    ]
  },
  "data_description": {
    "time_field": "timestamp",
    "time_format": "epoch_ms"
  },
  "analysis_limits": {
    "model_memory_limit": "11MB"
  },
  "model_plot_config": {
    "enabled": true,
    "annotations_enabled": true
  },
  "results_index_name": "test-job1",
  "datafeed_config": {
    "indices": [
      "kibana_sample_data_logs"
    ],
    "query": {
      "bool": {
        "must": [
          {
            "match_all": {}
          }
        ]
      }
    },
    "runtime_mappings": {
      "hour_of_day": {
        "type": "long",
        "script": {
          "source": "emit(doc['timestamp'].value.getHour());"
        }
      }
    },
    "datafeed_id": "datafeed-test-job1"
  }
}
```

API 返回以下结果：

```json
{
  "job_id": "test-job1",
  "job_type": "anomaly_detector",
  "job_version": "8.4.0",
  "create_time": 1656087283340,
  "datafeed_config": {
    "datafeed_id": "datafeed-test-job1",
    "job_id": "test-job1",
    "authorization": {
      "roles": [
        "superuser"
      ]
    },
    "query_delay": "61499ms",
    "chunking_config": {
      "mode": "auto"
    },
    "indices_options": {
      "expand_wildcards": [
        "open"
      ],
      "ignore_unavailable": false,
      "allow_no_indices": true,
      "ignore_throttled": true
    },
    "query": {
      "bool": {
        "must": [
          {
            "match_all": {}
          }
        ]
      }
    },
    "indices": [
      "kibana_sample_data_logs"
    ],
    "scroll_size": 1000,
    "delayed_data_check_config": {
      "enabled": true
    },
    "runtime_mappings": {
      "hour_of_day": {
        "type": "long",
        "script": {
          "source": "emit(doc['timestamp'].value.getHour());"
        }
      }
    }
  },
  "analysis_config": {
    "bucket_span": "15m",
    "detectors": [
      {
        "detector_description": "Sum of bytes",
        "function": "sum",
        "field_name": "bytes",
        "detector_index": 0
      }
    ],
    "influencers": [],
    "model_prune_window": "30d"
  },
  "analysis_limits": {
    "model_memory_limit": "11mb",
    "categorization_examples_limit": 4
  },
  "data_description": {
    "time_field": "timestamp",
    "time_format": "epoch_ms"
  },
  "model_plot_config": {
    "enabled": true,
    "annotations_enabled": true
  },
  "model_snapshot_retention_days": 10,
  "daily_model_snapshot_retention_after_days": 1,
  "results_index_name": "custom-test-job1",
  "allow_lazy_open": false
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-put-job.html)
