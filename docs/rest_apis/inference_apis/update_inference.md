# 更新推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

更新推理端点。

## 请求

```bash
PUT _inference/<inference_id>/_update
```

```bash
PUT _inference/<task_type>/<inference_id>/_update
```

## 前置条件

- 需要 `manage_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 角色授予此权限）。
- 需要已存在的推理端点，该端点通过创建推理 API 创建。

## 描述

更新推理 API 使你能够更新现有推理端点的 `task_settings`、密钥和/或 `num_allocations`。

要使用更新 API，你可以修改 `task_settings`、密钥（在 `service_settings` 内）或 `num_allocations`，具体取决于你创建的特定端点服务和任务类型。要查看可更新的 `task_settings`、密钥的字段名称（特定于每个服务）以及 `num_allocations` 适用的服务（仅适用于 `elasticsearch` 服务），请参阅以下通过推理 API 可用的服务列表。你可以在服务名称旁边找到可用的任务类型。点击链接查看服务配置详情：

- [AlibabaCloud AI Search](./inference_provider_alibabacloud_ai_search)（补全、重排序、稀疏嵌入、文本嵌入）
- [Amazon Bedrock](./inference_provider_amazon_bedrock)（补全、文本嵌入）
- [Anthropic](./inference_provider_anthropic)（补全）
- [Azure AI Studio](./inference_provider_azure_ai_studio)（补全、文本嵌入）
- [Azure OpenAI](./inference_provider_azure_openai)（补全、文本嵌入）
- [Cohere](./inference_provider_cohere)（补全、重排序、文本嵌入）
- [Elasticsearch](./inference_provider_elasticsearch)（重排序、稀疏嵌入、文本嵌入 — 此服务用于内置模型和通过 Eland 上传的模型）
- [ELSER](./inference_provider_elser)（稀疏嵌入）
- [Google AI Studio](./inference_provider_google_ai_studio)（补全、文本嵌入）
- [Google Vertex AI](./inference_provider_google_vertex_ai)（重排序、文本嵌入）
- [Hugging Face](./inference_provider_hugging_face)（文本嵌入）
- [Mistral](./inference_provider_mistral)（文本嵌入）
- [OpenAI](./inference_provider_openai)（补全、文本嵌入）

## 路径参数

- `<inference_id>`

  （必需，字符串）推理端点的唯一标识符。

- `<task_type>`

  （可选，字符串）模型执行的推理任务类型。有关可用的任务类型，请参阅 API 描述部分中的服务列表。

## 示例

以下示例展示如何更新名为 `my-inference-endpoint` 的推理端点的 API 密钥：

```json
PUT _inference/my-inference-endpoint/_update
{
  "service_settings": {
    "api_key": "<API_KEY>"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-inference-api.html)
