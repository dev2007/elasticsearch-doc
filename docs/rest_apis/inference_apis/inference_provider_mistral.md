# Mistral 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `mistral` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `mistral`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `mistral` 服务。

  - `api_key`

    （必需，字符串）Mistral 账户的有效 API 密钥。你可以在 API 密钥页面上找到你的 Mistral API 密钥或创建新密钥。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `model`

    （必需，字符串）用于推理任务的模型名称。有关可用的文本嵌入模型，请参阅 [Mistral 模型文档](https://docs.mistral.ai/guides/embeddings/)。

  - `max_input_tokens`

    （可选，整数）允许你指定分块发生前每个输入的最大 token 数量。

  - `rate_limit`

    （可选，对象）默认情况下，`mistral` 服务将每分钟允许的请求数设置为 240。这有助于减少 Mistral API 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

## Mistral 服务示例

以下示例展示如何创建名为 `mistral-embeddings-test` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/mistral-embeddings-test
{
  "service": "mistral",
  "service_settings": {
    "api_key": "<api_key>",
    "model": "mistral-embed"
  }
}
```

该模型必须是可在 [Mistral 模型文档](https://docs.mistral.ai/guides/embeddings/)中找到的文本嵌入模型的 ID。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-mistral.html)
