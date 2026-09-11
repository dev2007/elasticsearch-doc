# 获取训练模型统计 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

检索训练模型的使用信息。

## 请求

```bash
GET _ml/trained_models/_stats
```

```bash
GET _ml/trained_models/_all/_stats
```

```bash
GET _ml/trained_models/<model_id_or_deployment_id>/_stats
```

```bash
GET _ml/trained_models/<model_id_or_deployment_id>,<model_id_2_or_deployment_id_2>/_stats
```

```bash
GET _ml/trained_models/<model_id_pattern*_or_deployment_id_pattern*>,<model_id_2_or_deployment_id_2>/_stats
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

你可以通过使用逗号分隔的模型 ID、部署 ID 或通配符表达式在单个 API 请求中获取多个训练模型或训练模型部署的使用信息。

## 路径参数

- `<model_id_or_deployment_id>`

  （可选，字符串）模型或部署的唯一标识符。如果模型有多个部署，且某个部署的 ID 与模型 ID 匹配，则模型 ID 优先；返回该模型所有部署的结果。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的模型。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `from`

  （可选，整数）跳过指定数量的模型。默认为 0。

- `size`

  （可选，整数）指定获取的模型的最大数量。默认为 100。

## 响应体

- `count`

  （整数）匹配请求 ID 模式的训练模型统计总数。可能大于 `trained_model_stats` 数组中的项目数，因为数组大小受 `size` 参数限制。

- `trained_model_stats`

  （数组）训练模型统计数组，按 `model_id` 值升序排列。

  训练模型统计的属性：

  - `deployment_stats`

    （列表）如果提供的 `model_id` 值之一已部署，则为部署统计信息的集合。

    部署统计的属性：

    - `allocation_status`（对象）给定部署配置的详细分配状态。
      - `allocation_count`（整数）当前模型分配到的节点数量。
      - `cache_size`（字节值）每个节点上模型的推理缓存大小（JVM 堆外部内存）。
      - `state`（字符串）与节点相关的详细分配状态。可能值：`starting`、`started`、`fully_allocated`。
      - `target_allocation_count`（整数）模型分配的期望节点数量。
    - `deployment_id`（字符串）模型部署的唯一标识符。
    - `error_count`（整数）部署中所有节点的 `error_count` 总和。
    - `inference_count`（整数）部署中所有节点的 `inference_count` 总和。
    - `model_id`（字符串）训练模型的唯一标识符。
    - `nodes`（对象数组）当前分配了模型的每个节点的部署统计。

      节点统计的属性：

      - `average_inference_time_ms`（双精度浮点数）此节点上每次推理调用的平均完成时间。
      - `average_inference_time_ms_excluding_cache_hits`（双精度浮点数）排除缓存命中后的平均推理时间，准确衡量模型评估时间。
      - `average_inference_time_ms_last_minute`（双精度浮点数）最后一分钟内每次推理调用的平均完成时间。
      - `error_count`（整数）评估训练模型时的错误数量。
      - `inference_cache_hit_count`（整数）从此节点缓存中提供服务的推理调用总数。
      - `inference_cache_hit_count_last_minute`（整数）最后一分钟内从此节点缓存中提供服务的推理调用数量。
      - `inference_count`（整数）此节点上对此模型的推理调用总数。
      - `last_access`（长整数）此节点上模型最后一次推理调用的纪元时间戳。
      - `node`（对象）节点信息。属性：`attributes`、`ephemeral_id`、`id`、`name`、`transport_address`。
      - `number_of_allocations`（整数）分配到此节点的分配数量。
      - `number_of_pending_requests`（整数）排队等待处理的推理请求数量。
      - `peak_throughput_per_minute`（整数）1 分钟内处理的峰值请求数。
      - `routing_state`（对象）此分配的当前路由状态和原因。属性：`reason`（字符串，通常仅在 `routing_state` 为 `failed` 时填充）、`routing_state`（字符串，可能值：`starting`、`started`、`stopping`、`stopped`、`failed`）。
      - `rejected_execution_count`（整数）因队列已满而未处理的推理请求数量。
      - `start_time`（长整数）分配开始的纪元时间戳。
      - `threads_per_allocation`（整数）推理期间每次分配的线程数。
      - `timeout_count`（整数）处理前超时的推理请求数量。
      - `throughput_last_minute`（整数）最后一分钟内处理的请求数。

    - `number_of_allocations`（整数）训练模型部署的请求分配数量。
    - `peak_throughput_per_minute`（整数）部署中所有节点 1 分钟内处理的峰值请求数。
    - `priority`（字符串）部署优先级。
    - `rejected_execution_count`（整数）部署中所有节点的 `rejected_execution_count` 总和。
    - `reason`（字符串）当前部署状态的原因。通常仅在模型未部署到节点时填充。
    - `start_time`（长整数）部署开始的纪元时间戳。
    - `state`（字符串）部署的整体状态。可能值：`starting`、`started`、`stopping`。
    - `threads_per_allocation`（整数）推理过程使用的每次分配线程数。
    - `timeout_count`（整数）部署中所有节点的 `timeout_count` 总和。
    - `queue_capacity`（整数）在拒绝新请求前可排队的推理请求数量。

  - `inference_stats`

    （对象）推理统计字段的集合。

    `inference_stats` 的属性：

    - `missing_all_fields_count`（整数）所有训练特征都缺失的推理调用次数。
    - `inference_count`（整数）模型被调用进行推理的总次数（跨所有推理上下文，包括所有管道）。
    - `cache_miss_count`（整数）模型为推理加载但未从缓存检索的次数。如果此值接近 `inference_count`，则缓存未被适当使用。
    - `failure_count`（整数）使用模型进行推理时的失败次数。
    - `timestamp`（时间单位）统计最后更新的时间。

  - `ingest`

    （对象）跨所有节点模型摄取统计的集合。值为各节点统计的总和。格式与节点统计中的摄取部分匹配。

  - `model_id`

    （字符串）训练模型的唯一标识符。

  - `model_size_stats`

    （对象）模型大小统计字段的集合。

    `model_size_stats` 的属性：

    - `model_size_bytes`（整数）模型的大小（字节）。仅适用于 PyTorch 模型。
    - `required_native_memory_bytes`（整数）加载模型所需的内存量（字节）。

  - `pipeline_count`

    （整数）当前引用模型的摄取管道数量。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例获取所有训练模型的使用信息：

```bash
GET _ml/trained_models/_stats
```

API 返回以下结果：

```json
{
  "count": 2,
  "trained_model_stats": [
    {
      "model_id": "flight-delay-prediction-1574775339910",
      "pipeline_count": 0,
      "inference_stats": {
        "failure_count": 0,
        "inference_count": 4,
        "cache_miss_count": 3,
        "missing_all_fields_count": 0,
        "timestamp": 1592399986979
      }
    },
    {
      "model_id": "regression-job-one-1574775307356",
      "pipeline_count": 1,
      "inference_stats": {
        "failure_count": 0,
        "inference_count": 178,
        "cache_miss_count": 3,
        "missing_all_fields_count": 0,
        "timestamp": 1592399986979
      },
      "ingest": {
        "total": {
          "count": 178,
          "time_in_millis": 8,
          "current": 0,
          "failed": 0
        },
        "pipelines": {
          "flight-delay": {
            "count": 178,
            "time_in_millis": 8,
            "current": 0,
            "failed": 0,
            "processors": [
              {
                "inference": {
                  "type": "inference",
                  "stats": {
                    "count": 178,
                    "time_in_millis": 7,
                    "current": 0,
                    "failed": 0
                  }
                }
              }
            ]
          }
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-trained-models-stats.html)
