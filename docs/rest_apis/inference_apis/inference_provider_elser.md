# ELSER 推理集成

:::::warning 已弃用

`elser` 服务在 8.16 中已弃用，将在未来的版本中移除。请改用 [Elasticsearch 推理集成](./inference_provider_elasticsearch)，并在 `service_settings` 中包含 `model_id`。

:::::

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `elser` 服务执行推理任务。你也可以通过 Elasticsearch 推理集成来部署 ELSER。

- 你的 Elasticsearch 部署包含预配置的 ELSER 推理端点，只有在需要自定义设置时才需要通过 API 创建端点。
- 如果 ELSER 模型尚未下载，API 请求将自动下载并部署该模型。

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

  - `sparse_embedding`

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `elser`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `elser` 服务。

  - `adaptive_allocations`

    （可选，对象）自适应分配配置对象。启用后，模型的分配数量将根据当前负载自动设置。当负载较高时，自动创建新的模型分配（如果设置了 `max_number_of_allocations`，则不超过该值）。当负载较低时，自动移除模型分配（如果设置了 `min_number_of_allocations`，则不低于该值）。如果启用了 `adaptive_allocations`，请勿手动设置分配数量。

    - `enabled`

      （可选，布尔值）如果为 `true`，启用自适应分配。默认为 `false`。

    - `max_number_of_allocations`

      （可选，整数）指定扩展到的最大分配数量。如果设置，必须大于或等于 `min_number_of_allocations`。

    - `min_number_of_allocations`

      （可选，整数）指定缩减到的最小分配数量。如果设置，必须大于或等于 0。如果未定义，部署将缩减至 0。

  - `num_allocations`

    （必需，整数）此模型在机器学习节点上分配的总数。增加此值通常会提高吞吐量。如果启用了 `adaptive_allocations`，请勿设置此值，因为它会自动设置。

  - `num_threads`

    （必需，整数）设置每个模型分配在推理期间使用的线程数。这通常会提高每个推理请求的速度。推理过程是计算密集型过程；`threads_per_allocations` 不得超过每个节点可用分配处理器的数量。必须是 2 的幂。最大允许值为 32。

## 带自适应分配的 ELSER 服务示例

启用自适应分配后，模型的分配数量将根据当前负载自动设置。

有关如何优化 ELSER 端点的更多信息，请参阅模型文档中的 ELSER 推荐部分。有关模型自动缩放的更多信息，请参阅训练模型自动缩放页面。

以下示例展示如何创建名为 `my-elser-model` 的推理端点来执行稀疏嵌入任务，并配置自适应分配。

以下 API 请求将在 ELSER 模型尚未下载时自动下载，然后部署该模型。

```json
PUT _inference/sparse_embedding/my-elser-model
{
  "service": "elser",
  "service_settings": {
    "adaptive_allocations": {
      "enabled": true,
      "min_number_of_allocations": 3,
      "max_number_of_allocations": 10
    },
    "num_threads": 1
  }
}
```

## 不带自适应分配的 ELSER 服务示例

以下示例展示如何创建名为 `my-elser-model` 的推理端点来执行稀疏嵌入任务。有关更多信息，请参阅 ELSER 模型文档。

如果要优化 ELSER 端点用于摄取，将线程数设置为 1（`"num_threads": 1`）。如果要优化 ELSER 端点用于搜索，将线程数设置为大于 1。

以下 API 请求将在 ELSER 模型尚未下载时自动下载，然后部署该模型。

```json
PUT _inference/sparse_embedding/my-elser-model
{
  "service": "elser",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1
  }
}
```

示例响应：

```json
{
  "inference_id": "my-elser-model",
  "task_type": "sparse_embedding",
  "service": "elser",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1
  },
  "task_settings": {}
}
```

:::note

使用 Kibana 控制台时，你可能会在响应中看到 502 bad gateway 错误。此错误通常只是反映了超时，而模型仍在后台下载。你可以在机器学习 UI 中检查下载进度。如果使用 Python 客户端，可以将 timeout 参数设置为更高的值。

:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-elser.html)
