# OpenAI 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `openai` 服务或 OpenAI 兼容 API 执行推理任务。

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

  - `chat_completion`
  - `completion`
  - `text_embedding`

  `chat_completion` 任务类型仅支持流式传输，且仅通过 `_stream` API 可用。

  有关如何使用 `chat_completion` 任务类型的更多信息，请参阅[聊天补全文档](./chat_completion_inference)。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `openai`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `openai` 服务。

  - `api_key`

    （必需，字符串）OpenAI 账户的有效 API 密钥。你可以在 OpenAI 账户的 API 密钥部分找到你的 API 密钥。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `dimensions`

    （可选，整数）生成的输出嵌入的维度数。仅在 text-embedding-3 及更高版本的模型中支持。如果未设置，则使用 OpenAI 为该模型定义的默认值。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。有关可用的文本嵌入模型，请参阅 [OpenAI 文档](https://platform.openai.com/docs/guides/embeddings)。

  - `organization_id`

    （可选，字符串）你的组织的唯一标识符。你可以在 OpenAI 账户的 Settings > Organizations 中找到组织 ID。

  - `url`

    （可选，字符串）用于请求的 URL 端点。可用于测试目的。默认为 `https://api.openai.com/v1/embeddings`。

  - `rate_limit`

    （可选，对象）`openai` 服务根据任务类型设置不同的每分钟默认请求数。对于 `text_embedding` 为 3000，对于 `completion` 为 500。这有助于减少 OpenAI 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

    有关 OpenAI 速率限制的更多信息，请参阅你的账户限制页面。

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`completion` 任务类型的 `task_settings`**

  - `user`

    （可选，字符串）指定发出请求的用户，可用于滥用检测。

  **`text_embedding` 任务类型的 `task_settings`**

  - `user`

    （可选，字符串）指定发出请求的用户，可用于滥用检测。

## OpenAI 服务示例

以下示例展示如何创建名为 `openai-embeddings` 的推理端点来执行文本嵌入任务。该端点生成的嵌入将具有 128 个维度。

```json
PUT _inference/text_embedding/openai-embeddings
{
    "service": "openai",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "text-embedding-3-small",
        "dimensions": 128
    }
}
```

以下示例展示如何创建名为 `openai-completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/openai-completion
{
    "service": "openai",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "gpt-3.5-turbo"
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-openai.html)
