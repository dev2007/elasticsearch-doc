# Google Vertex AI 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `googlevertexai` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `googlevertexai`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `googlevertexai` 服务。

  - `service_account_json`

    （必需，字符串）Google Vertex AI API 的有效 JSON 格式服务账户。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。你可以在[文本嵌入 API](https://cloud.google.com/vertex-ai/generative-ai/docs/embeddings/get-text-embeddings)中找到支持的模型。

  - `location`

    （必需，字符串）用于推理任务的位置名称。你可以在 [Vertex AI 上的生成式 AI 位置](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/locations)中找到支持的位置。

  - `project_id`

    （必需，字符串）用于推理任务的项目名称。

  - `rate_limit`

    （可选，对象）默认情况下，`googlevertexai` 服务将每分钟允许的请求数设置为 30000。这有助于减少 Google Vertex AI 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

    有关 Google Vertex AI 速率限制的更多信息，请参阅 Google Vertex AI 配额文档。

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`rerank` 任务类型的 `task_settings`**

  - `top_n`

    （可选，布尔值）指定返回的前 N 个文档的数量。

  **`text_embedding` 任务类型的 `task_settings`**

  - `auto_truncate`

    （可选，布尔值）指定 API 是否自动截断超过最大 token 长度的输入。

## Google Vertex AI 服务示例

以下示例展示如何创建名为 `google_vertex_ai_embeddings` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/google_vertex_ai_embeddings
{
    "service": "googlevertexai",
    "service_settings": {
        "service_account_json": "<service_account_json>",
        "model_id": "<model_id>",
        "location": "<location>",
        "project_id": "<project_id>"
    }
}
```

以下示例展示如何创建名为 `google_vertex_ai_rerank` 的推理端点来执行重排序任务。

```json
PUT _inference/rerank/google_vertex_ai_rerank
{
    "service": "googlevertexai",
    "service_settings": {
        "service_account_json": "<service_account_json>",
        "project_id": "<project_id>"
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-google-vertex-ai.html)
