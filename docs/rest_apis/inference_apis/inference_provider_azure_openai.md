# Azure OpenAI 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `azureopenai` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `azureopenai`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `azureopenai` 服务。

  - `api_key` 或 `entra_id`

    （必需，字符串）你必须提供 API 密钥或 Entra ID。如果不提供任何一个，或同时提供两者，创建模型时将收到错误。有关这些身份验证类型的更多信息，请参阅 [Azure OpenAI 身份验证文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `resource_name`

    （必需，字符串）你的 Azure OpenAI 资源名称。可以在 Azure 门户中你订阅的资源列表中找到。

  - `deployment_id`

    （必需，字符串）已部署模型的部署名称。可以通过与你订阅关联的 Azure OpenAI Studio 门户找到你的 Azure OpenAI 部署。

  - `api_version`

    （必需，字符串）要使用的 Azure API 版本 ID。我们建议使用最新支持的非预览版本。

  - `rate_limit`

    （可选，对象）`azureopenai` 服务根据任务类型设置不同的每分钟默认请求数。对于 `text_embedding` 为 1440，对于 `completion` 为 120。这有助于减少 Azure 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

    有关 Azure 速率限制的更多信息，请参阅[配额限制文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/quotas-limits)和[如何更改配额](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/quota)。

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`completion` 任务类型的 `task_settings`**

  - `user`

    （可选，字符串）指定发出请求的用户，可用于滥用检测。

  **`text_embedding` 任务类型的 `task_settings`**

  - `user`

    （可选，字符串）指定发出请求的用户，可用于滥用检测。

## Azure OpenAI 服务示例

以下示例展示如何创建名为 `azure_openai_embeddings` 的推理端点来执行文本嵌入任务。请注意，此处未指定模型，因为模型已通过 Azure OpenAI 部署定义。

可在 [Azure 模型文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models)中找到你可以在部署中选择的嵌入模型列表。

```json
PUT _inference/text_embedding/azure_openai_embeddings
{
    "service": "azureopenai",
    "service_settings": {
        "api_key": "<api_key>",
        "resource_name": "<resource_name>",
        "deployment_id": "<deployment_id>",
        "api_version": "2024-02-01"
    }
}
```

以下示例展示如何创建名为 `azure_openai_completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/azure_openai_completion
{
    "service": "azureopenai",
    "service_settings": {
        "api_key": "<api_key>",
        "resource_name": "<resource_name>",
        "deployment_id": "<deployment_id>",
        "api_version": "2024-02-01"
    }
}
```

可在以下位置找到你可以在 Azure OpenAI 部署中选择的聊天补全模型列表：

- [GPT-4 和 GPT-4 Turbo 模型](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models)
- [GPT-3.5](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models)

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-azure-openai.html)
