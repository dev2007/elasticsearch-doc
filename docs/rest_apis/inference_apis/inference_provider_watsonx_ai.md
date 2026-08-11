# Watsonx 推理集成

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

创建推理端点，使用 `watsonxai` 服务执行推理任务。

你需要 IBM Cloud® Databases for Elasticsearch 部署才能使用 `watsonxai` 推理服务。你可以通过 IBM 目录、Cloud Databases CLI 插件、Cloud Databases API 或 Terraform 进行配置。

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

- `service`

  （必需，字符串）指定任务类型支持的服务类型。本例中为 `watsonxai`。

- `service_settings`

  （必需，对象）用于安装推理模型的设置。

  这些设置特定于 `watsonxai` 服务。

  - `api_key`

    （必需，字符串）Watsonx 账户的有效 API 密钥。你可以在 API 密钥页面上找到你的 Watsonx API 密钥或创建新密钥。

    你只需在创建推理模型时提供一次 API 密钥。获取推理 API 不会检索你的 API 密钥。创建推理模型后，无法更改关联的 API 密钥。如果要使用不同的 API 密钥，请删除推理模型并使用相同的名称和更新后的 API 密钥重新创建。

  - `api_version`

    （必需，字符串）版本参数，采用 `YYYY-MM-DD` 格式的版本日期。有关有效的版本数据参数，请参阅[文档](https://cloud.ibm.com/apidocs/watsonx-ai)。

  - `model_id`

    （必需，字符串）用于推理任务的模型名称。有关可用的文本嵌入模型，请参阅 Watsonx 文档中的 IBM Embedding Models 部分。

  - `url`

    （必需，字符串）用于请求的 URL 端点。

  - `project_id`

    （必需，字符串）用于推理任务的项目名称。

  - `rate_limit`

    （可选，对象）默认情况下，`watsonxai` 服务将每分钟允许的请求数设置为 120。这有助于减少 Watsonx 返回的速率限制错误。要修改此设置，请在服务设置中设置此对象的 `requests_per_minute`：

    ```json
    "rate_limit": {
        "requests_per_minute": <<number_of_requests>>
    }
    ```

- `task_settings`

  （可选，对象）配置推理任务的设置。这些设置特定于你指定的 `<task_type>`。

  **`rerank` 任务类型的 `task_settings`**

  - `truncate_input_tokens`

    （可选，整数）指定截断前每个输入文档的最大 token 数量。

  - `return_documents`

    （可选，布尔值）指定是否在结果中返回文档文本。

  - `top_n`

    （可选，整数）返回的最相关文档数量。默认为输入文档的数量。

## Watsonx 服务示例

以下示例展示如何创建名为 `watsonx-embeddings` 的推理端点来执行文本嵌入任务。

```json
PUT _inference/text_embedding/watsonx-embeddings
{
    "service": "watsonxai",
    "service_settings": {
        "api_key": "<api_key>", 
        "url": "<url>", 
        "model_id": "ibm/slate-30m-english-rtrvr",
        "project_id": "<project_id>", 
        "api_version": "2024-03-14" 
    }
}
```

1. 有效的 Watsonx API 密钥。你可以在账户的 API 密钥页面上找到。
2. 你在 Watsonx 上创建的推理端点 URL。
3. 你的 IBM Cloud 项目 ID。
4. 有效的 API 版本参数。你可以在[此处](https://cloud.ibm.com/apidocs/watsonx-ai)找到有效的版本数据参数。

以下示例展示如何创建名为 `watsonx-rerank` 的推理端点来执行重排序任务。

```json
PUT _inference/rerank/watsonx-rerank
{
    "service": "watsonxai",
    "service_settings": {
        "api_key": "<api_key>", 
        "url": "<url>", 
        "model_id": "cross-encoder/ms-marco-minilm-l-12-v2",
        "project_id": "<project_id>", 
        "api_version": "2024-05-02" 
    },
    "task_settings": {
        "truncate_input_tokens": 50, 
        "return_documents": true, 
        "top_n": 3 
    }
}
```

1. 有效的 Watsonx API 密钥。你可以在账户的 API 密钥页面上找到。
2. 你在 Watsonx 上创建的推理端点 URL。
3. 你的 IBM Cloud 项目 ID。
4. 有效的 API 版本参数。
5. 截断前每个文档的最大 token 数量。
6. 是否在结果中返回文档文本。
7. 返回的前 N 个相关文档数量。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/infer-service-watsonx-ai.html)
