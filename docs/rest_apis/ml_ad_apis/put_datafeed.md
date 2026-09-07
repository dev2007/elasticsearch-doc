# 创建数据源 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

实例化一个数据源。

## 请求

```bash
PUT _ml/datafeeds/<feed_id>
```

## 前置条件

- 创建数据源之前必须先创建异常检测作业。
- 需要以下权限：
  - 集群：`manage_ml`（`machine_learning_admin` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 数据源中配置的源索引：读取索引[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

数据源从 Elasticsearch 检索数据供异常检测作业分析。每个异常检测作业只能关联一个数据源。

数据源包含以定义间隔（频率）运行的查询。如果你担心数据延迟，可以在每个间隔添加延迟（`query_delay`）。请参阅[处理延迟数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/_delayed-data-detection.html)。

- 你必须使用 Kibana、此 API 或创建异常检测作业 API 来创建数据源。不要使用 Elasticsearch 索引 API 直接将数据源放入 `.ml-config` 索引。如果启用了 Elasticsearch 安全功能，不要给予用户 `.ml-config` 索引的写入权限。
- 如果启用了 Elasticsearch 安全功能，数据源会记住创建它的用户在创建时拥有的角色，并使用这些角色运行查询。如果提供辅助授权头，则使用这些凭据。

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

  （必需，数组）索引名称数组。支持通配符。例如：`["it_ops_metrics", "server*"]`。

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

- `job_id`

  （必需，字符串）异常检测作业的标识符。

- `max_empty_searches`

  （可选，整数）如果实时数据源从未见过任何数据（包括任何初始训练期间），它将在此次实时搜索返回无文档后自动停止并关闭关联作业。换句话说，它将在 `frequency` × `max_empty_searches` 的实时操作后停止。如果未设置，无结束时间且看不到数据的数据源将保持启动状态，直到显式停止。默认不设置此属性。

- `query`

  （可选，对象）Elasticsearch 查询领域特定语言（DSL）。此值对应于 Elasticsearch 搜索 POST 请求体中的查询对象。Elasticsearch 支持的所有选项都可以使用，因为此对象原样传递给 Elasticsearch。默认情况下，此属性具有以下值：`{"match_all": {"boost": 1}}`。

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

以下示例为异常检测作业（`test-job`）创建数据源：

```json
PUT _ml/datafeeds/datafeed-test-job?pretty
{
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
  "job_id": "test-job"
}
```

数据源创建后，你收到以下结果：

```json
{
  "datafeed_id" : "datafeed-test-job",
  "job_id" : "test-job",
  "authorization" : {
    "roles" : [
      "superuser"
    ]
  },
  "query_delay" : "91820ms",
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
    "bool" : {
      "must" : [
        {
          "match_all" : { }
        }
      ]
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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-put-datafeed.html)
