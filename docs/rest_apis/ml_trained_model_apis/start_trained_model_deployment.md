# 启动训练模型部署 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

启动一个新的训练模型部署。

## 请求

```bash
POST _ml/trained_models/<model_id>/deployment/_start
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

目前仅支持部署 PyTorch 模型。部署后，模型可由摄取管道中的推理处理器使用，或直接在推理训练模型 API 中使用。

模型可以通过使用部署 ID 多次部署。部署 ID 必须唯一，且不应与任何其他部署 ID 或模型 ID 匹配，除非它与正在部署的模型的 ID 相同。如果未设置 `deployment_id`，则默认为 `model_id`。

你可以启用自适应分配，根据进程的实际资源需求自动增减模型分配数量。

手动缩放推理性能可通过设置 `number_of_allocations` 和 `threads_per_allocation` 参数实现。

增加 `threads_per_allocation` 意味着在节点上处理推理请求时使用更多线程。这可以提高某些模型的推理速度，也可能提高吞吐量。

增加 `number_of_allocations` 意味着使用更多线程并行处理多个推理请求，从而提高吞吐量。每个模型分配使用 `threads_per_allocation` 定义的线程数。

模型分配分布在机器学习节点上。分配到同一节点的所有分配共享内存中的同一模型副本。为避免对性能有害的线程过度订阅，模型分配的分布方式使使用的总线程数不超过节点分配的处理器数。

## 路径参数

- `<model_id>`

  （必需，字符串）训练模型的唯一标识符。

## 查询参数

- `deployment_id`

  （可选，字符串）模型部署的唯一标识符。默认为 `model_id`。

- `timeout`

  （可选，时间值）控制等待模型部署的时间。默认为 30 秒。

- `wait_for`

  （可选，字符串）指定返回前等待的分配状态。默认为 `started`。值 `starting` 表示部署正在启动但尚未在任何节点上。值 `started` 表示模型已在至少一个节点上启动。值 `fully_allocated` 表示部署已在所有有效节点上启动。

## 请求体

- `adaptive_allocations`

  （可选，对象）自适应分配配置对象。如果启用，模型分配数量根据进程获得的当前负载设置。当负载高时，自动创建新的模型分配（如果设置了 `max_number_of_allocations` 则不超过该值）。当负载低时，自动移除模型分配（如果设置了 `min_number_of_allocations` 则不低于该值）。如果启用了 `adaptive_allocations`，请勿手动设置分配数量。

  `adaptive_allocations` 的属性：

  - `enabled`（可选，布尔值）如果为 `true`，启用自适应分配。默认为 `false`。
  - `max_number_of_allocations`（可选，整数）指定扩展到的最大分配数量。如果设置，必须大于或等于 `min_number_of_allocations`。
  - `min_number_of_allocations`（可选，整数）指定缩减到的最小分配数量。如果设置，必须大于或等于 0。如果未定义，部署缩减至 0。

- `cache_size`

  （可选，字节值）模型在每个节点上的推理缓存大小（JVM 堆外部内存）。在 Serverless 中，缓存默认禁用。否则，默认值为获取训练模型统计 API 中 `model_size_bytes` 字段报告的模型大小。要禁用缓存，可提供 `0b`。

- `number_of_allocations`

  （可选，整数）模型在机器学习节点上分配的总数。增加此值通常会提高吞吐量。默认为 1。如果启用了 `adaptive_allocations`，请勿设置此值，因为它会自动设置。

- `priority`

  （可选，字符串）部署的优先级。默认值为 `normal`。有两种优先级设置：

  - `normal`：用于生产中的部署。部署分配分布方式使节点处理器不过度订阅。
  - `low`：用于测试模型功能。这些部署不应被发送大量输入。部署要求具有单个分配且仅一个线程。低优先级部署可能被分配到已利用所有处理器的节点，但 CPU 优先级低于普通部署。低优先级部署可能被取消分配以满足普通优先级部署的更多分配。

  大量使用低优先级部署可能影响普通优先级部署的性能。

- `queue_capacity`

  （可选，整数）控制一次允许排队的推理请求数量。集群中每个可分配模型的机器学习节点都有此大小的队列；当请求数超过总值时，新请求被拒绝并返回 429 错误。默认为 10000。最大允许值为 100000。

- `threads_per_allocation`

  （可选，整数）设置每次模型分配在推理期间使用的线程数。这通常会提高每次推理请求的速度。推理过程是计算密集型过程；`threads_per_allocations` 不得超过每个节点可用的分配处理器数。默认为 1。必须是 2 的幂。最大允许值为 32。

## 示例

以下示例为 `elastic__distilbert-base-uncased-finetuned-conll03-english` 训练模型启动新部署：

```bash
POST _ml/trained_models/elastic__distilbert-base-uncased-finetuned-conll03-english/deployment/_start?wait_for=started&timeout=1m
```

API 返回以下结果：

```json
{
    "assignment": {
        "task_parameters": {
            "model_id": "elastic__distilbert-base-uncased-finetuned-conll03-english",
            "model_bytes": 265632637,
            "threads_per_allocation" : 1,
            "number_of_allocations" : 1,
            "queue_capacity" : 10000,
            "priority": "normal"
        },
        "routing_table": {
            "uckeG3R8TLe2MMNBQ6AGrw": {
                "routing_state": "started",
                "reason": ""
            }
        },
        "assignment_state": "started",
        "start_time": "2022-11-02T11:50:34.766591Z"
    }
}
```

### 使用部署 ID

以下示例为 `my_model` 训练模型启动 ID 为 `my_model_for_ingest` 的新部署。部署 ID 可在推理 API 调用或推理处理器中使用：

```bash
POST _ml/trained_models/my_model/deployment/_start?deployment_id=my_model_for_ingest
```

`my_model` 训练模型可以使用不同的 ID 再次部署：

```bash
POST _ml/trained_models/my_model/deployment/_start?deployment_id=my_model_for_search
```

### 设置自适应分配

以下示例为 `my_model` 训练模型启动 ID 为 `my_model_for_search` 的新部署，并启用自适应分配，最小分配数为 3，最大分配数为 10：

```json
POST _ml/trained_models/my_model/deployment/_start?deployment_id=my_model_for_search
{
  "adaptive_allocations": {
    "enabled": true,
    "min_number_of_allocations": 3,
    "max_number_of_allocations": 10
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/start-trained-model-deployment.html)
