# Google AI Studio 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `googleaistudio` 服务执行推理任务。

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

  - `completion`
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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `googleaistudio`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `googleaistudio` 服务。

  - `api_key`

    （必需，字符串）Google Gemini API 的有效 API 密钥。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。你可以在 [Gemini API 模型](https://ai.google.dev/gemini-api/docs/models/gemini)中找到支持的模型。

  - `rate_limit`

    （可选，对象）默认情况下，`googleaistudio` 服务将每分钟允许的请求数设置为 360。这有助于减少 Google AI Studio 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

## Google AI Studio 服务示例

以下示例展示如何创建名为 `google_ai_studio_completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/google_ai_studio_completion
{
    "service": "googleaistudio",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "<model_id>"
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-google-ai-studio.html)
