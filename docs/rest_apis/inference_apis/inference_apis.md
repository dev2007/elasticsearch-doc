# 推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

推理 API 使你能够使用特定服务，例如内置机器学习模型（ELSER、E5）、通过 Eland 上传的模型、Cohere、OpenAI、Azure、Google AI Studio 或 Hugging Face。对于内置模型和通过 Eland 上传的模型，推理 API 提供了一种使用和管理训练模型的替代方式。但是，如果你不打算使用推理 API 来使用这些模型，或者你想使用非 NLP 模型，请使用[机器学习训练模型 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-apis.html)。

推理 API 使你能够创建推理端点，并与不同服务（如 Amazon Bedrock、Anthropic、Azure AI Studio、Cohere、Google AI、Mistral、OpenAI 或 HuggingFace）的机器学习模型集成。使用以下 API 来管理推理模型并执行推理：

- [删除推理 API](./delete_inference)
- [获取推理 API](./get_inference)
- [执行推理 API](./perform_inference)
- [创建推理 API](./create_inference)
- [流式推理 API](./stream_inference)
- [聊天补全推理 API](./chat_completion_inference)
- [更新推理 API](./update_inference)

推理端点使你能够使用相应的机器学习模型而无需手动部署，并在摄取时通过语义文本将其应用于你的数据。

从你的服务中选择一个模型，或使用 ELSER——Elastic 训练的检索模型——然后通过创建推理 API 创建推理端点。现在使用语义文本对你的数据执行语义搜索。

## 自适应分配

自适应分配允许推理服务根据当前负载动态调整模型分配数量。

启用自适应分配时：

- 当负载增加时，分配数量自动扩展。
- 当负载减少时，分配数量缩减至最小 0，以节省资源。

有关自适应分配和资源的更多信息，请参阅[训练模型自动缩放文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/automatically-scale-machine-learning.html)。

## 默认推理端点

你的 Elasticsearch 部署包含预配置的推理端点，使得在定义 `semantic_text` 字段或使用推理处理器时更容易使用。以下列表包含按 `inference_id` 列出的默认推理端点：

- `.elser-2-elasticsearch`：使用 ELSER 内置训练模型执行 `sparse_embedding` 任务（推荐用于英文文本）。`model_id` 为 `.elser_model_2_linux-x86_64`。
- `.multilingual-e5-small-elasticsearch`：使用 E5 内置训练模型执行 `text_embedding` 任务（推荐用于非英文文本）。`model_id` 为 `.e5_model_2_linux-x86_64`。

在 `semantic_text` 字段定义中或创建推理处理器时使用端点的 `inference_id`。API 调用将自动下载并部署模型，这可能需要几分钟时间。默认推理端点已启用自适应分配。对于这些模型，最小分配数为 0。如果没有使用该端点的推理活动，分配数将在 15 分钟后自动缩减为 0。

## 配置分块

推理端点对一次可处理的文本量有限制，这由模型的输入容量决定。分块是将输入文本拆分为不超过这些限制的片段的过程。它发生在将文档摄取到 `semantic_text` 字段时。分块还有助于生成人类易于理解的片段。在搜索结果中返回长文档不如提供最相关的文本片段有用。

每个分块将包含文本子段落和从中生成的相应嵌入。

默认情况下，文档被拆分为句子并分组为最多 250 词的段落，句子重叠为 1，以便每个分块与前一个分块共享一个句子。重叠确保了连续性，并防止输入文本中的关键上下文信息因硬断开而丢失。

Elasticsearch 使用 ICU4J 库检测分块的词和句子边界。词边界通过遵循一系列规则来识别，而不仅仅是空白字符的存在。对于使用空格的书写语言（如中文或日文），使用字典查找来检测词边界。

### 分块策略

分块有两种策略：`sentence` 和 `word`。

`sentence` 策略在句子边界处拆分输入文本。每个分块包含一个或多个完整句子，确保句子级别的上下文完整性得以保留，除非某个句子导致分块超过 `max_chunk_size` 的词数，在这种情况下它将被拆分到多个分块中。`sentence_overlap` 选项定义从前一个分块中包含到当前分块中的句子数量，值为 0 或 1。

`word` 策略在单个词处拆分输入文本，直到达到 `max_chunk_size` 限制。`overlap` 选项是从前一个分块中包含到当前分块中的词数。

默认分块策略为 `sentence`。

在 8.16 之前创建的推理端点的默认分块策略为 `word`。

### 配置分块行为的示例

以下示例创建一个使用 `elasticsearch` 服务的推理端点，默认部署 ELSER 模型，并配置分块行为。

```json
PUT _inference/sparse_embedding/small_chunk_size
{
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1
  },
  "chunking_settings": {
    "strategy": "sentence",
    "max_chunk_size": 100,
    "sentence_overlap": 0
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/inference-apis.html)
