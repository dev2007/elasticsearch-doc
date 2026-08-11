# VoyageAI 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `voyageai` 服务执行推理任务。

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

  - `text_embedding`
  - `rerank`

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `voyageai`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `voyageai` 服务。

  - `dimensions`

    （可选，整数）生成的输出嵌入的维度数。此设置对应 VoyageAI 文档中的 `output_dimension`。仅适用于 `text_embedding` 任务类型。

  - `embedding_type`

    （可选，字符串）返回的嵌入数据类型。此设置对应 VoyageAI 文档中的 `output_dtype`。可选值为 `float`、`int8`、`bit`。`int8` 是 VoyageAI 文档中 `byte` 的同义词。`bit` 是 VoyageAI 文档中 `binary` 的同义词。仅适用于 `text_embedding` 任务类型。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。有关可用的文本嵌入和重排序模型，请参阅 VoyageAI 文档。

  - `rate_limit`

    （可选，对象）此设置有助于减少 VoyageAI 返回的速率限制错误。`voyageai` 服务根据任务类型设置每分钟允许的默认请求数。对于 `text_embedding` 和 `rerank`，均设置为 2000。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`text_embedding` 任务类型的 `task_settings`**

  - `input_type`

    （可选，字符串）输入文本的类型。可选值为：`ingest`（对应 VoyageAI 文档中的 `document`）、`search`（对应 VoyageAI 文档中的 `query`）。

  - `truncation`

    （可选，布尔值）是否截断输入文本以适应上下文长度。默认为 `false`。

  **`rerank` 任务类型的 `task_settings`**

  - `return_documents`

    （可选，布尔值）是否在响应中返回源文档。默认为 `false`。

  - `top_k`

    （可选，整数）返回的最相关文档数量。如果未指定，将返回所有文档的重排序结果。

  - `truncation`

    （可选，布尔值）是否截断输入文本以适应上下文长度。默认为 `false`。

## VoyageAI 服务示例

以下示例展示如何创建名为 `voyageai-embeddings` 的推理端点来执行文本嵌入任务。该端点生成的嵌入将具有 512 个维度。

```json
PUT _inference/text_embedding/voyageai-embeddings
{
    "service": "voyageai",
    "service_settings": {
        "model_id": "voyage-3-large",
        "dimensions": 512
    }
}
```

以下示例展示如何创建名为 `voyageai-rerank` 的推理端点来执行重排序任务。

```json
PUT _inference/rerank/voyageai-rerank
{
    "service": "voyageai",
    "service_settings": {
        "model_id": "rerank-2"
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-voyageai.html)
