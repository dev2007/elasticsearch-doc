# 获取异常检测作业 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索异常检测作业的配置信息。

## 请求

```bash
GET _ml/anomaly_detectors/<job_id>
```

```bash
GET _ml/anomaly_detectors/<job_id>,<job_id>
```

```bash
GET _ml/anomaly_detectors/
```

```bash
GET _ml/anomaly_detectors/_all
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

此 API 最多返回 10000 个作业。

## 路径参数

- `<job_id>`

  （可选，字符串）异常检测作业的标识符。可以是作业标识符、组名称或通配符表达式。

  你可以通过使用组名称、逗号分隔的作业列表或通配符表达式在单个 API 请求中获取多个异常检测作业的信息。你可以通过使用 `_all`、将 `*` 指定为作业标识符，或省略标识符来获取所有异常检测作业的信息。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空作业数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `exclude_generated`

  （可选，布尔值）指示是否在检索时从配置中移除某些字段。这使配置处于可接受的格式，便于检索后添加到另一个集群。默认为 `false`。

## 响应体

API 返回异常检测作业资源数组。有关完整的属性列表，请参阅[创建异常检测作业 API](./put_job)。

- `blocked`

  （对象）当存在时，表示作业上正在执行阻止其打开的任务。

  `blocked` 的属性：

  - `reason`（字符串）作业被阻止的原因。值可以是 `delete`、`reset`、`revert`。每个值表示对应的操作正在执行。
  - `task_id`（字符串）阻止操作的 ID。你可以使用任务管理 API 监控进度。

- `create_time`

  （字符串）作业创建的时间。此属性仅供参考，无法更改其值。

- `datafeed_config`

  （对象）为当前异常检测作业配置的数据源。

  `datafeed_config` 的属性：

  - `authorization`（可选，对象）数据源运行查询时使用的安全权限。如果在最近一次更新数据源时禁用了 Elastic Stack 安全功能，则省略此属性。
    - `api_key`（对象）如果最近一次更新数据源时使用了 API 密钥，其名称和标识符会列在响应中。
      - `id`（字符串）API 密钥的标识符。
      - `name`（字符串）API 密钥的名称。
    - `roles`（字符串数组）如果最近一次更新数据源时使用了用户 ID，其更新时的角色列在响应中。
    - `service_account`（字符串）如果最近一次更新数据源时使用了服务账户，账户名列在响应中。

  其他数据源属性请参阅[创建数据源 API](./put_datafeed)。

- `finished_time`

  （字符串）如果作业已关闭或失败，这是作业完成的时间，否则为 null。此属性仅供参考，无法更改其值。

- `job_type`

  （字符串）保留供将来使用，当前设置为 `anomaly_detector`。

- `job_version`

  （字符串）创建作业时的机器学习配置版本号。

  从 Elasticsearch 8.10.0 开始，使用新的版本号来跟踪机器学习插件中的配置和状态变更。此新版本号与产品版本解耦，将独立递增。`job_version` 值表示新的版本号。

- `model_snapshot_id`

  （字符串）唯一标识模型快照的数字字符串。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例检索名为 `high_sum_total_sales` 的异常检测作业的配置信息：

```bash
GET _ml/anomaly_detectors/high_sum_total_sales
```

API 返回以下结果：

```json
{
  "count": 1,
  "jobs": [
    {
      "job_id": "high_sum_total_sales",
      "job_type": "anomaly_detector",
      "job_version": "8.4.0",
      "create_time": 1655852735889,
      "finished_time": 1655852745980,
      "model_snapshot_id": "1575402237",
      "custom_settings": {
        "created_by": "ml-module-sample"
      },
      "datafeed_config": {
        "datafeed_id": "datafeed-high_sum_total_sales",
        "job_id": "high_sum_total_sales",
        "authorization": {
          "roles": [
            "superuser"
          ]
        },
        "query_delay": "93169ms",
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
            "filter": [
              {
                "term": {
                  "event.dataset": "sample_ecommerce"
                }
              }
            ]
          }
        },
        "indices": [
          "kibana_sample_data_ecommerce"
        ],
        "scroll_size": 1000,
        "delayed_data_check_config": {
          "enabled": true
        }
      },
      "groups": [
        "kibana_sample_data",
        "kibana_sample_ecommerce"
      ],
      "description": "Find customers spending an unusually high amount in an hour",
      "analysis_config": {
        "bucket_span": "1h",
        "detectors": [
          {
            "detector_description": "High total sales",
            "function": "high_sum",
            "field_name": "taxful_total_price",
            "over_field_name": "customer_full_name.keyword",
            "detector_index": 0
          }
        ],
        "influencers": [
          "customer_full_name.keyword",
          "category.keyword"
        ],
        "model_prune_window": "30d"
      },
      "analysis_limits": {
        "model_memory_limit": "13mb",
        "categorization_examples_limit": 4
      },
      "data_description": {
        "time_field": "order_date",
        "time_format": "epoch_ms"
      },
      "model_plot_config": {
        "enabled": true,
        "annotations_enabled": true
      },
      "model_snapshot_retention_days": 10,
      "daily_model_snapshot_retention_after_days": 1,
      "results_index_name": "shared",
      "allow_lazy_open": false
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-job.html)
