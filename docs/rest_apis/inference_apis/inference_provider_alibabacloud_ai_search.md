# 阿里云 AI Search 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `alibabacloud-ai-search` 服务执行推理任务。

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
  - `sparse_embedding`
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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `alibabacloud-ai-search`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `alibabacloud-ai-search` 服务。

  - `api_key`

    （必需，字符串）阿里云 AI Search API 的有效 API 密钥。

  - `service_id`

    （必需，字符串）用于推理任务的模型服务名称。

    `completion` 任务可用的 `service_id`：

    - `ops-qwen-turbo`
    - `qwen-turbo`
    - `qwen-plus`
    - `qwen-max`
    - `qwen-max-longcontext`

    有关支持的补全 `service_id`，请参阅[文档](https://www.alibabacloud.com/help/en/model-studio/developer-reference/use-qwen-by-calling-api)。

    `rerank` 任务可用的 `service_id`：

    - `ops-bge-reranker-larger`

    有关支持的重排序 `service_id`，请参阅[文档](https://www.alibabacloud.com/help/en/model-studio/developer-reference/rerank)。

    `sparse_embedding` 任务可用的 `service_id`：

    - `ops-text-sparse-embedding-001`

    有关支持的稀疏嵌入 `service_id`，请参阅[文档](https://www.alibabacloud.com/help/en/model-studio/developer-reference/api-reference-of-text-sparse-embedding)。

    `text_embedding` 任务可用的 `service_id`：

    - `ops-text-embedding-001`
    - `ops-text-embedding-zh-001`
    - `ops-text-embedding-en-001`
    - `ops-text-embedding-002`

    有关支持的文本嵌入 `service_id`，请参阅[文档](https://www.alibabacloud.com/help/en/model-studio/developer-reference/text-embedding-synchronous-api)。

  - `host`

    （必需，字符串）用于推理任务的主机地址。你可以在文档的 API 密钥部分找到主机地址。

  - `workspace`

    （必需，字符串）用于推理任务的工作空间名称。

  - `rate_limit`

    （可选，对象）默认情况下，`alibabacloud-ai-search` 服务将每分钟允许的请求数设置为 1000。这有助于减少阿里云 AI Search 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`text_embedding` 任务类型的 `task_settings`**

  - `input_type`

    （可选，字符串）指定传递给模型的输入类型。有效值为：

    - `ingest`：用于将文档嵌入存储在向量数据库中。
    - `search`：用于存储针对向量数据库运行的搜索查询的嵌入，以查找相关文档。

  **`sparse_embedding` 任务类型的 `task_settings`**

  - `input_type`

    （可选，字符串）指定传递给模型的输入类型。有效值为：

    - `ingest`：用于将文档嵌入存储在向量数据库中。
    - `search`：用于存储针对向量数据库运行的搜索查询的嵌入，以查找相关文档。

  - `return_token`

    （可选，布尔值）如果为 `true`，响应中将返回 token 名称。默认为 `false`，即响应中仅返回 token ID。

## 阿里云 AI Search 服务示例

以下示例展示如何创建名为 `alibabacloud_ai_search_completion` 的推理端点来执行补全任务。

```json
PUT _inference/completion/alibabacloud_ai_search_completion
{
    "service": "alibabacloud-ai-search",
    "service_settings": {
        "host" : "default-j01.platform-cn-shanghai.opensearch.aliyuncs.com",
        "api_key": "{{API_KEY}}",
        "service_id": "ops-qwen-turbo",
        "workspace" : "default"
    }
}
```

以下示例展示如何创建名为 `alibabacloud_ai_search_rerank` 的推理端点来执行重排序任务。

```json
PUT _inference/rerank/alibabacloud_ai_search_rerank
{
    "service": "alibabacloud-ai-search",
    "service_settings": {
        "api_key": "<api_key>",
        "service_id": "ops-bge-reranker-larger",
        "host": "default-j01.platform-cn-shanghai.opensearch.aliyuncs.com",
        "workspace": "default"
    }
}
```

以下示例展示如何创建名为 `alibabacloud_ai_search_sparse` 的推理端点来执行稀疏嵌入任务。

```json
PUT _inference/sparse_embedding/alibabacloud_ai_search_sparse
{
    "service": "alibabacloud-ai-search",
    "service_settings": {
        "api_key": "<api_key>",
        "service_id": "ops-text-sparse-embedding-001",
        "host": "default-j01.platform-cn-shanghai.opensearch.aliyuncs.com",
        "workspace": "default"
    }
}
```

以下示例展示如何创建名为 `alibabacloud_ai_search_embeddings` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/alibabacloud_ai_search_embeddings
{
    "service": "alibabacloud-ai-search",
    "service_settings": {
        "api_key": "<api_key>",
        "service_id": "ops-text-embedding-001",
        "host": "default-j01.platform-cn-shanghai.opensearch.aliyuncs.com",
        "workspace": "default"
    }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-alibabacloud-ai-search.html)
