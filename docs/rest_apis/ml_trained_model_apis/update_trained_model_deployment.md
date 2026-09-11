# 更新训练模型部署 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习训练模型 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-trained-models)。

:::::

更新训练模型部署的某些属性。

## 请求

```bash
POST _ml/trained_models/<deployment_id>/deployment/_update
```

## 前置条件

- 需要 `manage_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_admin` 内置角色中。

## 描述

你可以更新 `assignment_state` 为 `started` 的训练模型部署。你可以启用自适应分配以根据进程的实际资源需求自动增减模型分配数量，或者手动增减模型部署的分配数量。

## 路径参数

- `<deployment_id>`

  （必需，字符串）模型部署的唯一标识符。

## 请求体

- `adaptive_allocations`

  （可选，对象）自适应分配配置对象。如果启用，模型分配数量根据进程获得的当前负载设置。当负载高时，自动创建新的模型分配（如果设置了 `max_number_of_allocations` 则不超过该值）。当负载低时，自动移除模型分配（如果设置了 `min_number_of_allocations` 则不低于该值）。如果启用了 `adaptive_allocations`，请勿手动设置分配数量。

  `adaptive_allocations` 的属性：

  - `enabled`（可选，布尔值）如果为 `true`，启用自适应分配。默认为 `false`。
  - `max_number_of_allocations`（可选，整数）指定扩展到的最大分配数量。如果设置，必须大于或等于 `min_number_of_allocations`。
  - `min_number_of_allocations`（可选，整数）指定缩减到的最小分配数量。如果设置，必须大于或等于 0。如果未定义，部署缩减至 0。

- `number_of_allocations`

  （可选，整数）模型在机器学习节点上分配的总数。增加此值通常会提高吞吐量。如果启用了 `adaptive_allocations`，请勿设置此值，因为它会自动设置。

## 示例

以下示例将 `elastic__distilbert-base-uncased-finetuned-conll03-english` 训练模型的部署更新为 4 个分配：

```json
POST _ml/trained_models/elastic__distilbert-base-uncased-finetuned-conll03-english/deployment/_update
{
  "number_of_allocations": 4
}
```

API 返回以下结果：

```json
{
    "assignment": {
        "task_parameters": {
            "model_id": "elastic__distilbert-base-uncased-finetuned-conll03-english",
            "model_bytes": 265632637,
            "threads_per_allocation" : 1,
            "number_of_allocations" : 4,
            "queue_capacity" : 1024
        },
        "routing_table": {
            "uckeG3R8TLe2MMNBQ6AGrw": {
                "current_allocations": 1,
                "target_allocations": 4,
                "routing_state": "started",
                "reason": ""
            }
        },
        "assignment_state": "started",
        "start_time": "2022-11-02T11:50:34.766591Z"
    }
}
```

以下示例为 `elastic__distilbert-base-uncased-finetuned-conll03-english` 训练模型的部署启用自适应分配，最小分配数为 3，最大分配数为 10：

```json
POST _ml/trained_models/elastic__distilbert-base-uncased-finetuned-conll03-english/deployment/_update
{
  "adaptive_allocations": {
    "enabled": true,
    "min_number_of_allocations": 3,
    "max_number_of_allocations": 10
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-trained-model-deployment.html)
