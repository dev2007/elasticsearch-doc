# Cohere 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `cohere` 服务执行推理任务。

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `cohere`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `cohere` 服务。

  - `api_key`

    （必需，字符串）Cohere 账户的有效 API 密钥。你可以在 API 密钥设置页面上找到或创建新的 Cohere API 密钥。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `rate_limit`

    （可选，对象）默认情况下，`cohere` 服务将每分钟允许的请求数设置为 10000。此值对所有任务类型相同。这有助于减少 Cohere 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

    有关 Cohere 速率限制的更多信息，请参阅 Cohere 的生产密钥文档。

  **`completion` 任务类型的 `service_settings`**

  - `model_id`

    （可选，字符串）用于推理任务的模型名称。有关可用的补全模型，请参阅 [Cohere 文档](https://docs.cohere.com/docs/models)。

  **`rerank` 任务类型的 `service_settings`**

  - `model_id`

    （可选，字符串）用于推理任务的模型名称。有关可用的重排序模型，请参阅 [Cohere 文档](https://docs.cohere.com/docs/reranking-guide)。

  **`text_embedding` 任务类型的 `service_settings`**

  - `embedding_type`

    （可选，字符串）指定要返回的嵌入类型。默认为 `float`。有效值为：

    - `byte`：用于有符号 int8 嵌入（`int8` 的同义词）。
    - `float`：用于默认的浮点嵌入。
    - `int8`：用于有符号 int8 嵌入。

  - `model_id`

    （可选，字符串）用于推理任务的模型名称。有关可用的文本嵌入模型，请参阅 [Cohere 文档](https://docs.cohere.com/docs/embed-v3)。`text_embedding` 的默认值为 `embed-english-v2.0`。

  - `similarity`

    （可选，字符串）相似度度量。可选值为 `cosine`、`dot_product`、`l2_norm`。默认值根据 `embedding_type` 确定（float → `dot_product`，int8/byte → `cosine`）。

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`rerank` 任务类型的 `task_settings`**

  - `return_documents`

    （可选，布尔值）指定是否在结果中返回文档文本。

  - `top_n`

    （可选，整数）返回的最相关文档数量，默认为文档的数量。如果此推理端点用于 `text_similarity_reranker` 检索器查询且设置了 `top_n`，则它必须大于或等于查询中的 `rank_window_size`。

  **`text_embedding` 任务类型的 `task_settings`**

  - `input_type`

    （可选，字符串）指定传递给模型的输入类型。有效值为：

    - `classification`：用于通过文本分类器传递的嵌入。
    - `clustering`：用于通过聚类算法运行的嵌入。
    - `ingest`：用于将文档嵌入存储在向量数据库中。
    - `search`：用于存储针对向量数据库运行的搜索查询的嵌入，以查找相关文档。

    使用 v3 及更高版本的嵌入模型时，`input_type` 字段为必需。

  - `truncate`

    （可选，字符串）指定 API 如何处理超过最大 token 长度的输入。默认为 `END`。有效值为：

    - `NONE`：当输入超过最大输入 token 长度时返回错误。
    - `START`：当输入超过最大输入 token 长度时，丢弃输入的开头部分。
    - `END`：当输入超过最大输入 token 长度时，丢弃输入的结尾部分。

## Cohere 服务示例

以下示例展示如何创建名为 `cohere-embeddings` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/cohere-embeddings
{
    "service": "cohere",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "embed-english-light-v3.0",
        "embedding_type": "byte"
    }
}
```

以下示例展示如何创建名为 `cohere-rerank` 的推理端点来执行重排序任务。

```json
PUT _inference/rerank/cohere-rerank
{
    "service": "cohere",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "rerank-english-v3.0"
    },
    "task_settings": {
        "top_n": 10,
        "return_documents": true
    }
}
```

更多示例请参阅 [Cohere 文档](https://docs.cohere.com/docs)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-cohere.html)
