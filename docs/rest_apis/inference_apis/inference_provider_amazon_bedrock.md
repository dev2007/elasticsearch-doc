# Amazon Bedrock 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `amazonbedrock` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `amazonbedrock`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `amazonbedrock` 服务。

  - `access_key`

    （必需，字符串）拥有使用 Amazon Bedrock 权限和访问模型进行推理请求的有效 AWS 访问密钥。

  - `secret_key`

    （必需，字符串）与 `access_key` 配对的有效 AWS 秘密密钥。有关创建或管理访问密钥和秘密密钥的信息，请参阅 AWS 文档中的[管理 IAM 用户的访问密钥](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)。

    你只需在创建推理模型时提供一次访问密钥和秘密密钥。获取推理 API 不会检索你的访问密钥或秘密密钥。创建推理模型后，无法更改关联的密钥对。如果要使用不同的访问密钥和秘密密钥对，请删除推理模型并使用相同的名称和更新后的密钥重新创建。

  - `provider`

    （必需，字符串）部署的模型提供商。请注意，某些提供商可能仅支持特定的任务类型。支持的提供商包括：

    - `amazontitan` — 适用于 `text_embedding` 和 `completion` 任务类型
    - `anthropic` — 仅适用于 `completion` 任务类型
    - `ai21labs` — 仅适用于 `completion` 任务类型
    - `cohere` — 适用于 `text_embedding` 和 `completion` 任务类型
    - `meta` — 仅适用于 `completion` 任务类型
    - `mistral` — 仅适用于 `completion` 任务类型

  - `model`

    （必需，字符串）基础模型 ID 或基于基础模型的自定义模型的 ARN。基础模型 ID 可在 [Amazon Bedrock 模型 ID 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html)中找到。请注意，模型 ID 必须适用于所选的提供商，且你的 IAM 用户必须有权限访问该模型。

  - `region`

    （必需，字符串）模型或 ARN 部署的区域。每个模型的可用区域列表可在 [按 AWS 区域的模型支持文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-support-by-region.html)中找到。

  - `rate_limit`

    （可选，对象）默认情况下，`amazonbedrock` 服务将每分钟允许的请求数设置为 240。这有助于减少 Amazon Bedrock 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`completion` 任务类型的 `task_settings`**

  - `max_new_tokens`

    （可选，整数）设置要生成的输出 token 的最大数量。默认为 64。

  - `temperature`

    （可选，浮点数）介于 0.0 和 1.0 之间的数字，控制结果的表观创造性。温度为 0.0 时模型最具确定性，温度为 1.0 时最随机。如果指定了 `top_p` 或 `top_k`，则不应使用此参数。

  - `top_p`

    （可选，浮点数）温度的替代方案。介于 0.0 到 1.0 之间的数字，用于消除低概率 token。Top-p 使用核采样选择总似然不超过某个值的顶部 token，确保多样性和连贯性。如果指定了 `temperature`，则不应使用此参数。

  - `top_k`

    （可选，浮点数）仅适用于 `anthropic`、`cohere` 和 `mistral` 提供商。温度的替代方案。将采样限制为最可能的前 K 个词，平衡连贯性和可变性。如果指定了 `temperature`，则不应使用此参数。

## Amazon Bedrock 服务示例

以下示例展示如何创建名为 `amazon_bedrock_embeddings` 的推理端点来执行文本嵌入任务。

从 Amazon Bedrock 基础模型中选择你有权访问的聊天补全和嵌入模型。

```json
PUT _inference/text_embedding/amazon_bedrock_embeddings
{
    "service": "amazonbedrock",
    "service_settings": {
        "access_key": "<aws_access_key>",
        "secret_key": "<aws_secret_key>",
        "region": "us-east-1",
        "provider": "amazontitan",
        "model": "amazon.titan-embed-text-v2:0"
    }
}
```

以下示例展示如何创建名为 `amazon_bedrock_completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/amazon_bedrock_completion
{
    "service": "amazonbedrock",
    "service_settings": {
        "access_key": "<aws_access_key>",
        "secret_key": "<aws_secret_key>",
        "region": "us-east-1",
        "provider": "amazontitan",
        "model": "amazon.titan-text-premier-v1:0"
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-amazon-bedrock.html)
