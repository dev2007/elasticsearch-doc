# JinaAI 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `jinaai` 服务执行推理任务。

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
  - `rerank`

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

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `jinaai`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `jinaai` 服务。

  - `api_key`

    （必需，字符串）JinaAI 账户的有效 API 密钥。你可以在 [https://jina.ai/embeddings/](https://jina.ai/embeddings/) 上找到。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `rate_limit`

    （可选，对象）`jinaai` 服务对所有任务类型的默认速率限制为每分钟 2000 次请求。你可以使用服务设置中的 `requests_per_minute` 修改此设置：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

    有关 JinaAI 速率限制的更多信息，请参阅 [https://jina.ai/contact-sales/#rate-limit](https://jina.ai/contact-sales/#rate-limit)。

  **`rerank` 任务类型的 `service_settings`**

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。有关可用的重排序兼容模型，请参阅 [https://jina.ai/reranker](https://jina.ai/reranker)。

  **`text_embedding` 任务类型的 `service_settings`**

  - `model_id`

    （可选，字符串）用于推理任务的模型名称。有关可用的文本嵌入模型，请参阅 [https://jina.ai/embeddings/](https://jina.ai/embeddings/)。

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

  - `task`

    （可选，字符串）指定传递给模型的任务。有效值为：

    - `classification`：用于通过文本分类器传递的嵌入。
    - `clustering`：用于通过聚类算法运行的嵌入。
    - `ingest`：用于将文档嵌入存储在向量数据库中。
    - `search`：用于存储针对向量数据库运行的搜索查询的嵌入，以查找相关文档。

## JinaAI 服务示例

以下示例展示如何使用 JinaAI 服务创建文本嵌入和重排序任务的推理端点，并在搜索请求中使用它们。

首先，创建嵌入服务：

```json
PUT _inference/text_embedding/jinaai-embeddings
{
    "service": "jinaai",
    "service_settings": {
        "model_id": "jina-embeddings-v3",
        "api_key": "<api_key>"
    }
}
```

然后，创建重排序服务：

```json
PUT _inference/rerank/jinaai-rerank
{
    "service": "jinaai",
    "service_settings": {
        "api_key": "<api_key>",
        "model_id": "jina-reranker-v2-base-multilingual"
    },
    "task_settings": {
        "top_n": 10,
        "return_documents": true
    }
}
```

现在可以创建一个索引，使用 `jinaai-embeddings` 服务来索引文档：

```json
PUT jinaai-index
{
  "mappings": {
    "properties": {
      "content": {
        "type": "semantic_text",
        "inference_id": "jinaai-embeddings"
      }
    }
  }
}
```

批量索引文档：

```bash
PUT jinaai-index/_bulk
{ "index" : { "_index" : "jinaai-index", "_id" : "1" } }
{"content": "Sarah Johnson is a talented marine biologist working at the Oceanographic Institute. Her groundbreaking research on coral reef ecosystems has garnered international attention and numerous accolades."}
{ "index" : { "_index" : "jinaai-index", "_id" : "2" } }
{"content": "She spends months at a time diving in remote locations, meticulously documenting the intricate relationships between various marine species."}
{ "index" : { "_index" : "jinaai-index", "_id" : "3" } }
{"content": "Her dedication to preserving these delicate underwater environments has inspired a new generation of conservationists."}
```

索引创建后，可以使用和不使用重排序服务进行搜索。

不使用重排序的语义搜索：

```json
GET jinaai-index/_search
{
  "query": {
    "semantic": {
      "field": "content",
      "query": "who inspired taking care of the sea?"
    }
  }
}
```

使用重排序的语义搜索：

```json
POST jinaai-index/_search
{
  "retriever": {
    "text_similarity_reranker": {
      "retriever": {
        "standard": {
          "query": {
            "semantic": {
              "field": "content",
              "query": "who inspired taking care of the sea?"
            }
          }
        }
      },
      "field": "content",
      "rank_window_size": 100,
      "inference_id": "jinaai-rerank",
      "inference_text": "who inspired taking care of the sea?"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-jinaai.html)
