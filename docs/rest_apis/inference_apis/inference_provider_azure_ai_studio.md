# Azure AI Studio 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `azureaistudio` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `azureaistudio`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `azureaistudio` 服务。

  - `api_key`

    （必需，字符串）Azure AI Studio 模型部署的有效 API 密钥。此密钥可以在 Azure AI Studio 账户管理部分的部署概览页面上找到。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `target`

    （必需，字符串）Azure AI Studio 模型部署的目标 URL。可以在 Azure AI Studio 账户管理部分的部署概览页面上找到。

  - `provider`

    （必需，字符串）部署的模型提供商。请注意，某些提供商可能仅支持特定的任务类型。支持的提供商包括：

    - `cohere` — 适用于 `text_embedding` 和 `completion` 任务类型
    - `databricks` — 仅适用于 `completion` 任务类型
    - `meta` — 仅适用于 `completion` 任务类型
    - `microsoft_phi` — 仅适用于 `completion` 任务类型
    - `mistral` — 仅适用于 `completion` 任务类型
    - `openai` — 适用于 `text_embedding` 和 `completion` 任务类型

  - `endpoint_type`

    （必需，字符串）`token` 或 `realtime` 之一。指定模型部署中使用的端点类型。Azure AI Studio 部署中有两种可用的端点类型。"按量付费"端点按 token 计费。对于这些端点，你必须将 `endpoint_type` 指定为 `token`。对于按使用小时计费的"实时"端点，指定为 `realtime`。

  - `rate_limit`

    （可选，对象）默认情况下，`azureaistudio` 服务将每分钟允许的请求数设置为 240。这有助于减少 Azure AI Studio 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`completion` 任务类型的 `task_settings`**

  - `do_sample`

    （可选，浮点数）指示推理过程是否执行采样。除非指定了 `temperature` 或 `top_p`，否则无效。

  - `max_new_tokens`

    （可选，整数）为要生成的输出 token 的最大数量提供提示。默认为 64。

  - `temperature`

    （可选，浮点数）介于 0.0 到 2.0 之间的数字，指定要使用的采样温度，控制生成补全的表观创造性。如果指定了 `top_p`，则不应使用此参数。

  - `top_p`

    （可选，浮点数）介于 0.0 到 2.0 之间的数字，是 `temperature` 的替代值，使模型考虑具有核采样概率的 token 结果。如果指定了 `temperature`，则不应使用此参数。

  **`text_embedding` 任务类型的 `task_settings`**

  - `user`

    （可选，字符串）指定发出请求的用户，可用于滥用检测。

## Azure AI Studio 服务示例

以下示例展示如何创建名为 `azure_ai_studio_embeddings` 的推理端点来执行文本嵌入任务。请注意，此处未指定模型，因为模型已通过 Azure AI Studio 部署定义。

可从 Azure AI Studio 模型浏览器中选择嵌入模型列表。

```json
PUT _inference/text_embedding/azure_ai_studio_embeddings
{
    "service": "azureaistudio",
    "service_settings": {
        "api_key": "<api_key>",
        "target": "<target_uri>",
        "provider": "<model_provider>",
        "endpoint_type": "<endpoint_type>"
    }
}
```

以下示例展示如何创建名为 `azure_ai_studio_completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/azure_ai_studio_completion
{
    "service": "azureaistudio",
    "service_settings": {
        "api_key": "<api_key>",
        "target": "<target_uri>",
        "provider": "<model_provider>",
        "endpoint_type": "<endpoint_type>"
    }
}
```

可从 Azure AI Studio 模型浏览器中选择聊天补全模型列表。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-azure-ai-studio.html)
