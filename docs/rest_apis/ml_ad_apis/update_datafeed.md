# 更新数据源 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

更新数据源的某些属性。

## 请求

```bash
POST _ml/datafeeds/<feed_id>/_update
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

只有在数据源停止时才能更新数据源属性。但是，可以停止数据源、更新其中一个属性并重新启动它，而无需关闭关联的作业。

当启用了 Elasticsearch 安全功能时，数据源会记住更新它的用户在更新时拥有的角色，并使用这些角色运行查询。如果提供了辅助授权头，则使用这些凭据。

## 路径参数

- `<feed_id>`

  （必需，字符串）唯一标识数据源的数字字符串。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

## 查询参数

- `allow_no_indices`

  （可选，布尔值）如果为 `true`，不解析为具体索引的通配符索引表达式将被忽略。这包括 `_all` 字符串或未指定索引时。默认为 `true`。

- `expand_wildcards`

  （可选，字符串）通配符模式可以匹配的索引类型。如果请求可以目标定位数据流，此参数决定通配符表达式是否匹配隐藏数据流。支持逗号分隔值，如 `open,hidden`。有效值为：

  - `all`：匹配任何数据流或索引，包括隐藏的。
  - `open`：匹配打开的非隐藏索引。也匹配任何非隐藏数据流。
  - `closed`：匹配关闭的非隐藏索引。也匹配任何非隐藏数据流。数据流不能关闭。
  - `hidden`：匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或两者组合使用。
  - `none`：不接受通配符模式。

  默认为 `open`。

- `ignore_throttled`

  （可选，布尔值）如果为 `true`，冻结的具体、扩展或别名索引将被忽略。默认为 `true`。

  在 7.16.0 中已弃用。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，不可用的索引（缺失或关闭）将被忽略。默认为 `false`。

## 请求体

数据源创建后可以更新以下属性：

- `aggregations`

  （可选，对象）如果设置，数据源执行聚合搜索。聚合支持有限，应仅用于低基数数据。有关更多信息，请参阅[聚合数据以提高性能](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-aggregations.html)。

- `chunking_config`

  （可选，对象）数据源可能需要搜索很长时间段（几个月或几年）。此搜索被分割为时间块，以确保对 Elasticsearch 的负载得到管理。分块配置控制这些时间块大小的计算方式，是高级配置选项。

  `chunking_config` 的属性：

  - `mode`

    （字符串）三种可用模式：

    - `auto`：块大小动态计算。这是不使用聚合的数据源的默认和推荐值。
    - `manual`：根据指定的 `time_span` 应用分块。当数据源使用聚合时使用此模式。
    - `off`：不应用分块。

  - `time_span`

    （时间单位）每次搜索查询的时间跨度。此设置仅在 `mode` 设置为 `manual` 时适用。例如：`3h`。

- `delayed_data_check_config`

  （可选，对象）指定数据源是否检查缺失数据及窗口大小。例如：`{"enabled": true, "check_window": "1h"}`。

  数据源可以选择性地搜索已经读取过的索引，以确定是否随后添加了数据。如果发现缺失数据，这表明 `query_delay` 选项设置过低，数据在数据源经过该时刻后才被索引。请参阅[处理延迟数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/_delayed-data-detection.html)。

  此检查仅在实时数据源上运行。

  `delayed_data_check_config` 的属性：

  - `check_window`

    （时间单位）搜索延迟数据的时间窗口。此时间窗口以最新已完成桶结束。默认为 null，导致在实时数据源运行时计算适当的 `check_window`。默认 `check_window` 跨度计算基于 2h 或 8 倍桶跨度中的较大者。

  - `enabled`

    （布尔值）指定数据源是否定期检查延迟数据。默认为 `true`。

- `frequency`

  （可选，时间单位）数据源实时运行时进行计划查询的间隔。默认值为桶跨度（短桶跨度）或桶跨度的合理部分（长桶跨度）。例如：`150s`。当频率短于桶跨度时，最后一个（部分）桶的临时结果被写入，然后最终被完整桶结果覆盖。如果数据源使用聚合，此值必须能被日期直方图聚合的间隔整除。

- `indices`

  （可选，数组）索引名称数组。支持通配符。例如：`["it_ops_metrics", "server*"]`。

  如果任何索引在远程集群中，则主节点和机器学习节点需要具有 `remote_cluster_client` 角色。

- `indices_options`

  （可选，对象）指定搜索期间使用的索引扩展选项。

  例如：

  ```json
  {
     "expand_wildcards": ["all"],
     "ignore_unavailable": true,
     "allow_no_indices": "false",
     "ignore_throttled": true
  }
  ```

  有关这些选项的更多信息，请参阅[多目标语法](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/multi-index.html)。

- `max_empty_searches`

  （可选，整数）如果实时数据源从未见过任何数据（包括任何初始训练期间），它将在此次实时搜索返回无文档后自动停止并关闭关联作业。换句话说，它将在 `frequency` × `max_empty_searches` 的实时操作后停止。如果未设置，无结束时间且看不到数据的数据源将保持启动状态，直到显式停止。默认不设置此属性。

  特殊值 -1 取消此设置。

- `query`

  （可选，对象）Elasticsearch 查询领域特定语言（DSL）。此值对应于 Elasticsearch 搜索 POST 请求体中的查询对象。Elasticsearch 支持的所有选项都可以使用，因为此对象原样传递给 Elasticsearch。默认情况下，此属性具有以下值：`{"match_all": {"boost": 1}}`。

  如果更改查询，分析的数据也会更改。因此，所需的学习时间可能很长，结果的可理解性不可预测。如果要对源数据进行重大更改，建议克隆它并创建包含修改的第二个作业。让两者并行运行，当对另一个作业的结果满意时关闭其中一个。

- `query_delay`

  （可选，时间单位）数据查询落后实时时间的秒数。例如，如果上午 10:04 的数据可能要到上午 10:06 才能在 Elasticsearch 中搜索到，请将此属性设置为 120 秒。默认值在 60s 和 120s 之间随机选择。当同一节点上有多个作业运行时，此随机性可提高查询性能。有关更多信息，请参阅[处理延迟数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/_delayed-data-detection.html)。

- `runtime_mappings`

  （可选，对象）为数据源搜索指定运行时字段。

  例如：

  ```json
  {
    "day_of_week": {
      "type": "keyword",
      "script": {
        "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH))"
      }
    }
  }
  ```

- `script_fields`

  （可选，对象）指定评估自定义表达式并将脚本字段返回给数据源的脚本。作业中的检测器配置对象可以包含使用这些脚本字段的函数。有关更多信息，请参阅[使用脚本字段转换数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-configuring-transform.html)和[脚本字段](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-fields.html#script-fields)。

- `scroll_size`

  （可选，无符号整数）数据源不使用聚合时 Elasticsearch 搜索中使用的 size 参数。默认为 1000。最大值为 `index.max_result_window`，默认为 10000。

## 示例

```json
POST _ml/datafeeds/datafeed-test-job/_update
{
  "query": {
    "term": {
      "geo.src": "US"
    }
  }
}
```

数据源更新后，你收到包含更新值的完整数据源配置：

```json
{
  "datafeed_id" : "datafeed-test-job",
  "job_id" : "test-job",
  "authorization" : {
    "roles" : [
      "superuser"
    ]
  },
  "query_delay" : "64489ms",
  "chunking_config" : {
    "mode" : "auto"
  },
  "indices_options" : {
    "expand_wildcards" : [
      "open"
    ],
    "ignore_unavailable" : false,
    "allow_no_indices" : true,
    "ignore_throttled" : true
  },
  "query" : {
    "term" : {
      "geo.src" : "US"
    }
  },
  "indices" : [
    "kibana_sample_data_logs"
  ],
  "scroll_size" : 1000,
  "delayed_data_check_config" : {
    "enabled" : true
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-update-datafeed.html)
