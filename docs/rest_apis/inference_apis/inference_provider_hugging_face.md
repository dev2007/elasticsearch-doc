# Hugging Face 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `hugging_face` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `hugging_face`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `hugging_face` 服务。

  - `api_key`

    （必需，字符串）Hugging Face 账户的有效访问令牌。你可以在设置页面上找到你的 Hugging Face 访问令牌或创建新令牌。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `url`

    （必需，字符串）用于请求的 URL 端点。

  - `rate_limit`

    （可选，对象）默认情况下，`hugging_face` 服务将每分钟允许的请求数设置为 3000。这有助于减少 Hugging Face 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

## Hugging Face 服务示例

以下示例展示如何创建名为 `hugging-face-embeddings` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/hugging-face-embeddings
{
  "service": "hugging_face",
  "service_settings": {
    "api_key": "<access_token>", 
    "url": "<url_endpoint>" 
  }
}
```

1. 有效的 Hugging Face 访问令牌。你可以在账户的设置页面上找到。
2. 你在 Hugging Face 上创建的推理端点 URL。

在 Hugging Face 端点页面上创建新的推理端点以获取端点 URL。在新建端点页面上选择你要使用的模型——例如 `intfloat/e5-small-v2`——然后在高级配置部分下选择 Sentence Embeddings 任务。创建端点后，等待端点初始化完成后复制 URL。

Hugging Face 服务推荐模型列表：

- `all-MiniLM-L6-v2`
- `all-MiniLM-L12-v2`
- `all-mpnet-base-v2`
- `e5-base-v2`
- `e5-small-v2`
- `multilingual-e5-base`
- `multilingual-e5-small`

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-hugging-face.html)
