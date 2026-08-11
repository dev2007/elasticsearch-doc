# Anthropic 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `anthropic` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `anthropic`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `anthropic` 服务。

  - `api_key`

    （必需，字符串）Anthropic API 的有效 API 密钥。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。你可以在 [Anthropic 模型](https://docs.anthropic.com/en/docs/about-claude/models)中找到支持的模型。

  - `rate_limit`

    （可选，对象）默认情况下，`anthropic` 服务将每分钟允许的请求数设置为 50。这有助于减少 Anthropic 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

- `task_settings`

  （必需，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`completion` 任务类型的 `task_settings`**

  - `max_tokens`

    （必需，整数）停止前要生成的最大 token 数量。

  - `temperature`

    （可选，浮点数）注入到响应中的随机性程度。

    有关支持的范围的更多详情，请参阅 [Anthropic messages API](https://docs.anthropic.com/en/api/messages)。

  - `top_k`

    （可选，整数）指定仅从每个后续 token 的前 K 个选项中采样。

    仅推荐用于高级用例。通常你只需要使用 `temperature`。

    有关更多详情，请参阅 [Anthropic messages API](https://docs.anthropic.com/en/api/messages)。

  - `top_p`

    （可选，浮点数）指定使用 Anthropic 的核采样。

    在核采样中，Anthropic 按概率递减顺序计算所有选项的累积分布，并在达到 `top_p` 指定的概率值时截断。你应该修改 `temperature` 或 `top_p`，但不要同时修改两者。

    仅推荐用于高级用例。通常你只需要使用 `temperature`。

    有关更多详情，请参阅 [Anthropic messages API](https://docs.anthropic.com/en/api/messages)。

## Anthropic 服务示例

以下示例展示如何创建名为 `anthropic_completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/anthropic_completion
{
    "service": "anthropic",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "<model_id>"
    },
    "task_settings": {
        "max_tokens": 1024
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-anthropic.html)
