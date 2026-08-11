# 创建推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点以执行推理任务。

## 请求

```bash
PUT /_inference/<task_type>/<inference_id>
```

## 前置条件

- 需要 `manage_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 角色授予此权限）。

## 路径参数

- `<inference_id>`

  （必需，字符串）推理端点的唯一标识符。

- `<task_type>`

  （必需，字符串）模型执行的推理任务类型。

  可用的任务类型请参阅下方的集成列表。

## 描述

创建推理 API 使你能够创建推理端点并配置机器学习模型以执行特定的推理任务。

- 创建推理端点时，如果关联的机器学习模型尚未运行，则会自动部署。
- 创建端点后，请等待模型部署完成后再使用。你可以使用获取训练模型统计信息 API 验证部署状态。在响应中，查找 `"state": "fully_allocated"` 并确保 `"allocation_count"` 与 `"target_allocation_count"` 匹配。
- 除非必要，否则避免为同一模型创建多个端点，因为每个端点会消耗大量资源。

以下集成可通过推理 API 使用。你可以在集成名称旁边找到可用的任务类型。点击链接查看集成的配置详情：

- [AlibabaCloud AI Search](./inference_provider_alibabacloud_ai_search)（补全、重排序、稀疏嵌入、文本嵌入）
- [Amazon Bedrock](./inference_provider_amazon_bedrock)（补全、文本嵌入）
- [Anthropic](./inference_provider_anthropic)（补全）
- [Azure AI Studio](./inference_provider_azure_ai_studio)（补全、文本嵌入）
- [Azure OpenAI](./inference_provider_azure_openai)（补全、文本嵌入）
- [Cohere](./inference_provider_cohere)（补全、重排序、文本嵌入）
- [Elasticsearch](./inference_provider_elasticsearch)（重排序、稀疏嵌入、文本嵌入 — 此服务用于内置模型和通过 Eland 上传的模型）
- [ELSER](./inference_provider_elser)（稀疏嵌入）
- [Google AI Studio](./inference_provider_google_ai_studio)（补全、文本嵌入）
- [Google Vertex AI](./inference_provider_google_vertex_ai)（重排序、文本嵌入）
- [Hugging Face](./inference_provider_hugging_face)（文本嵌入）
- [Mistral](./inference_provider_mistral)（文本嵌入）
- [OpenAI](./inference_provider_openai)（聊天补全、补全、文本嵌入）
- [VoyageAI](./inference_provider_voyageai)（文本嵌入、重排序）
- [Watsonx 推理集成](./inference_provider_watsonx_ai)（文本嵌入、重排序）
- [JinaAI](./inference_provider_jinaai)（文本嵌入、重排序）

Elasticsearch 和 ELSER 服务在 Elasticsearch 集群中的机器学习节点上运行。其余集成连接到外部服务。

## 自适应分配

自适应分配允许推理端点根据当前负载动态调整模型分配数量。

启用自适应分配时：

- 当负载增加时，分配数量自动扩展。
- 当负载减少时，分配数量缩减至最小 0，以节省资源。

有关自适应分配和资源的更多信息，请参阅[训练模型自动缩放文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/automatically-scale-machine-learning.html)。

## 请求体

- `service`

  （必需，字符串）要使用的服务的类型。

- `service_settings`

  （必需，对象）特定于指定 `<service>` 的配置。这些设置因服务而异，请参阅上方集成列表中各服务的配置详情。

  常见的 `service_settings` 包括：

  - `api_key`：（可选，字符串）外部服务的 API 密钥。
  - `model_id`：（可选，字符串）要使用的模型标识符。
  - `num_allocations`：（可选，整数）在机器学习节点上为模型分配的数量。仅适用于 Elasticsearch 和 ELSER 服务。
  - `num_threads`：（可选，整数）每个分配使用的推理处理器数量。仅适用于 Elasticsearch 和 ELSER 服务。

- `adaptive_allocations`

  （可选，对象）自适应分配的配置。启用后，模型分配数量将根据当前负载自动调整。

  `adaptive_allocations` 的属性：

  - `enabled`

    （必需，布尔值）如果为 `true`，启用自适应分配。

  - `min_number_of_allocations`

    （可选，整数）自适应分配将缩减到的最小分配数量。必须大于或等于 0。如果为 0，当没有推理活动时，分配将缩减为零。

  - `max_number_of_allocations`

    （可选，整数）自适应分配将扩展到的最大分配数量。

- `chunking_settings`

  （可选，对象）分块配置。有关分块的更多信息，请参阅[配置分块](./inference_apis#配置分块)。

  `chunking_settings` 的属性：

  - `strategy`

    （必需，字符串）分块策略。可选值为 `sentence` 或 `word`。

  - `max_chunk_size`

    （必需，整数）每个分块的最大词数。

  - `sentence_overlap`

    （可选，整数）从前一个分块中包含到当前分块中的句子数量。仅适用于 `sentence` 策略。值为 0 或 1。

  - `overlap`

    （可选，整数）从前一个分块中包含到当前分块中的词数。仅适用于 `word` 策略。

## 示例

### ELSER 示例

以下示例创建一个使用 ELSER 模型执行稀疏嵌入任务的推理端点：

```json
PUT _inference/sparse_embedding/my-elser-model
{
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1,
    "model_id": ".elser_model_2"
  }
}
```

API 返回以下响应：

```json
{
  "inference_id": "my-elser-model",
  "task_type": "sparse_embedding",
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1,
    "model_id": ".elser_model_2"
  }
}
```

### OpenAI 示例

以下示例创建一个使用 OpenAI 服务执行文本嵌入任务的推理端点：

```json
PUT _inference/text_embedding/openai-embeddings
{
  "service": "openai",
  "service_settings": {
    "api_key": "<api_key>",
    "model_id": "text-embedding-3-small"
  }
}
```

### Cohere 示例

以下示例创建一个使用 Cohere 服务执行重排序任务的推理端点：

```json
PUT _inference/rerank/cohere-rerank
{
  "service": "cohere",
  "service_settings": {
    "api_key": "<api_key>",
    "model_id": "rerank-english-v3.0"
  }
}
```

### 带自适应分配和分块设置的示例

以下示例创建一个使用 ELSER 模型的推理端点，并配置自适应分配和分块设置：

```json
PUT _inference/sparse_embedding/my-elser-model
{
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1,
    "model_id": ".elser_model_2"
  },
  "adaptive_allocations": {
    "enabled": true,
    "min_number_of_allocations": 0,
    "max_number_of_allocations": 10
  },
  "chunking_settings": {
    "strategy": "sentence",
    "max_chunk_size": 250,
    "sentence_overlap": 1
  }
}
```

有关各服务的详细配置，请参阅上方集成列表中对应的服务文档。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-inference-api.html)
