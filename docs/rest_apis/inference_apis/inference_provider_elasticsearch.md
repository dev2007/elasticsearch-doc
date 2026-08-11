# Elasticsearch 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `elasticsearch` 服务执行推理任务。

- 你的 Elasticsearch 部署包含预配置的 ELSER 和 E5 推理端点，只有在需要自定义设置时才需要通过 API 创建端点。
- 如果通过 `elasticsearch` 服务使用 ELSER 或 E5 模型，API 请求将在模型尚未下载时自动下载并部署模型。

## 请求

```bash
PUT /_inference/<task_type>/<inference_id>
```

## 路径参数

- `<inference_id>`

  （必需，字符串）推理端点的唯一标识符。

- `<task_type>`

  （必需，字符串）模型执行的推理任务类型。

  可用的任务类型：

  - `rerank`
  - `sparse_embedding`
  - `text_embedding`

## 请求体

- `chunking_settings`

  （可选，对象）分块配置对象。有关分块的更多信息，请参阅[配置分块](./inference_apis#配置分块)。

  - `max_chunk_size`

    （可选，整数）指定每个分块的最大词数。默认为 250。此值不能超过 300，且不能低于 20（`sentence` 策略）或 10（`word` 策略）。

  - `overlap`

    （可选，整数）仅适用于 `word` 分块策略。指定分块之间重叠的词数。默认为 100。此值不能超过 `max_chunk_size` 的一半。

  - `sentence_overlap`

    （可选，整数）仅适用于 `sentence` 分块策略。指定分块之间重叠的句子数。值为 0 或 1。默认为 1。

  - `strategy`

    （可选，字符串）指定分块策略。可选值为 `sentence` 或 `word`。

- `service`

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `elasticsearch`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `elasticsearch` 服务。

  - `deployment_id`

    （可选，字符串）现有训练模型部署的 `deployment_id`。使用 `deployment_id` 时，`model_id` 为可选。

  - `adaptive_allocations`

    （可选，对象）自适应分配配置对象。启用后，模型的分配数量将根据当前负载自动设置。当负载较高时，自动创建新的模型分配（如果设置了 `max_number_of_allocations`，则不超过该值）。当负载较低时，自动移除模型分配（如果设置了 `min_number_of_allocations`，则不低于该值）。如果启用了 `adaptive_allocations`，请勿手动设置分配数量。

    - `enabled`

      （可选，布尔值）如果为 `true`，启用自适应分配。默认为 `false`。

    - `max_number_of_allocations`

      （可选，整数）指定扩展到的最大分配数量。如果设置，必须大于或等于 `min_number_of_allocations`。

    - `min_number_of_allocations`

      （可选，整数）指定缩减到的最小分配数量。如果设置，必须大于或等于 0。如果未定义，部署将缩减至 0。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。可以是内置模型的 ID（例如 `.multilingual-e5-small` 用于 E5），也可以是通过 Eland 上传的文本嵌入模型。

  - `num_allocations`

    （必需，整数）此模型在机器学习节点上分配的总数。增加此值通常会提高吞吐量。如果启用了 `adaptive_allocations`，请勿设置此值，因为它会自动设置。

  - `num_threads`

    （必需，整数）设置每个模型分配在推理期间使用的线程数。这通常会提高每个推理请求的速度。推理过程是计算密集型过程；`threads_per_allocations` 不得超过每个节点可用分配处理器的数量。必须是 2 的幂。最大允许值为 32。

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`rerank` 任务类型的 `task_settings`**

  - `return_documents`

    （可选，布尔值）返回文档而不仅是索引。默认为 `true`。

## 通过 Elasticsearch 服务使用 ELSER

以下示例展示如何创建名为 `my-elser-model` 的推理端点来执行稀疏嵌入任务。

以下 API 请求将在 ELSER 模型尚未下载时自动下载，然后部署该模型。

```json
PUT _inference/sparse_embedding/my-elser-model
{
  "service": "elasticsearch",
  "service_settings": {
    "adaptive_allocations": { 
      "enabled": true,
      "min_number_of_allocations": 1,
      "max_number_of_allocations": 4
    },
    "num_threads": 1,
    "model_id": ".elser_model_2" 
  }
}
```

1. 将启用自适应分配，最小分配数为 1，最大分配数为 10。
2. `model_id` 必须是内置 ELSER 模型之一的 ID。有效值为 `.elser_model_2` 和 `.elser_model_2_linux-x86_64`。有关更多详情，请参阅 ELSER 模型文档。

## 通过 Elasticsearch 服务使用 Elastic Rerank

以下示例展示如何使用内置的 Elastic Rerank 交叉编码器模型创建名为 `my-elastic-rerank` 的推理端点来执行重排序任务。

以下 API 请求将在 Elastic Rerank 模型尚未下载时自动下载，然后部署该模型。部署后，该模型可用于 `text_similarity_reranker` 检索器的语义重排序。

```json
PUT _inference/rerank/my-elastic-rerank
{
  "service": "elasticsearch",
  "service_settings": {
    "model_id": ".rerank-v1", 
    "num_threads": 1,
    "adaptive_allocations": { 
      "enabled": true,
      "min_number_of_allocations": 1,
      "max_number_of_allocations": 4
    }
  }
}
```

1. `model_id` 必须是内置 Elastic Rerank 模型的 ID：`.rerank-v1`。
2. 将启用自适应分配，最小分配数为 1，最大分配数为 10。

## 通过 Elasticsearch 服务使用 E5

以下示例展示如何创建名为 `my-e5-model` 的推理端点来执行文本嵌入任务。

以下 API 请求将在 E5 模型尚未下载时自动下载，然后部署该模型。

```json
PUT _inference/text_embedding/my-e5-model
{
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1,
    "model_id": ".multilingual-e5-small" 
  }
}
```

1. `model_id` 必须是内置 E5 模型之一的 ID。有效值为 `.multilingual-e5-small` 和 `.multilingual-e5-small_linux-x86_64`。有关更多详情，请参阅 E5 模型文档。

:::note

使用 Kibana 控制台时，你可能会在响应中看到 502 bad gateway 错误。此错误通常只是反映了超时，而模型仍在后台下载。你可以在机器学习 UI 中检查下载进度。如果使用 Python 客户端，可以将 timeout 参数设置为更高的值。

:::

## 通过 Elasticsearch 服务使用 Eland 上传的模型

以下示例展示如何创建名为 `my-msmarco-minilm-model` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/my-msmarco-minilm-model 
{
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1,
    "model_id": "msmarco-MiniLM-L12-cos-v5" 
  }
}
```

1. 为推理端点提供唯一标识符。`inference_id` 必须唯一，且不得与 `model_id` 匹配。
2. `model_id` 必须是通过 Eland 已上传的文本嵌入模型的 ID。

## 为 E5 配置自适应分配

以下示例展示如何创建名为 `my-e5-model` 的推理端点来执行文本嵌入任务，并配置自适应分配。

以下 API 请求将在 E5 模型尚未下载时自动下载，然后部署该模型。

```json
PUT _inference/text_embedding/my-e5-model
{
  "service": "elasticsearch",
  "service_settings": {
    "adaptive_allocations": {
      "enabled": true,
      "min_number_of_allocations": 3,
      "max_number_of_allocations": 10
    },
    "num_threads": 1,
    "model_id": ".multilingual-e5-small"
  }
}
```

## 使用现有模型部署

以下示例展示如何在创建推理端点时使用已存在的模型部署。

```json
PUT _inference/sparse_embedding/use_existing_deployment
{
  "service": "elasticsearch",
  "service_settings": {
    "deployment_id": ".elser_model_2" 
  }
}
```

1. 已存在模型部署的 `deployment_id`。

API 响应包含 `model_id` 以及模型部署的线程和分配设置：

```json
{
  "inference_id": "use_existing_deployment",
  "task_type": "sparse_embedding",
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 2,
    "num_threads": 1,
    "model_id": ".elser_model_2",
    "deployment_id": ".elser_model_2"
  },
  "chunking_settings": {
    "strategy": "sentence",
    "max_chunk_size": 250,
    "sentence_overlap": 1
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-elasticsearch.html)
