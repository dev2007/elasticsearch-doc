# 聊天补全推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [聊天补全推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-inference-chat-completion)。

:::::

流式传输聊天补全响应。

## 请求

```bash
POST /_inference/<inference_id>/_stream
```

```bash
POST /_inference/chat_completion/<inference_id>/_stream
```

## 前置条件

- 需要 `monitor_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 和 `inference_user` 角色授予此权限）。
- 你必须使用支持流式传输的客户端。

## 描述

聊天补全推理 API 通过增量交付答案来实现聊天补全任务的实时响应，从而减少计算期间的响应时间。它仅适用于 `openai` 和 `elastic` 推理服务的 `chat_completion` 任务类型。

- `chat_completion` 任务类型仅在 `_stream` API 中可用，且仅支持流式传输。
- 聊天补全推理 API 和流式推理 API 在响应结构和功能上有所不同。聊天补全推理 API 通过更多字段和函数调用支持提供更全面的自定义选项。如果你使用 `openai` 服务或 `elastic` 服务，请使用聊天补全推理 API。

## 路径参数

- `<inference_id>`

  （必需，字符串）推理端点的唯一标识符。

- `<task_type>`

  （可选，字符串）模型执行的推理任务类型。如果包含，必须设置为 `chat_completion`。

## 请求体

- `messages`

  （必需，对象数组）表示对话的对象列表。请求通常应仅添加来自用户的新消息（角色为 `user`）。其他消息角色（`assistant`、`system` 或 `tool`）通常应仅从先前补全请求的响应中复制，以便 `messages` 数组在对话过程中逐步构建。

  **助手消息**

  - `content`

    （除非指定了 `tool_calls`，否则为必需，字符串或对象数组）消息的内容。

    字符串表示形式：

    ```json
    {
        "content": "Some string"
    }
    ```

    对象表示形式：

    ```json
    {
        "content": [
            {
                "text": "Some text",
                "type": "text"
            }
        ]
    }
    ```

    - 字符串表示形式：（必需，字符串）文本内容。
    - 对象表示形式：
      - `text`：（必需，字符串）文本内容。
      - `type`：（必需，字符串）必须设置为 `text`。

  - `role`

    （必需，字符串）消息作者的角色。对于此类型的消息，应设置为 `assistant`。

  - `tool_calls`

    （可选，对象数组）模型生成的工具调用。

    ```json
    {
        "tool_calls": [
            {
                "id": "call_KcAjWtAww20AihPHphUh46Gd",
                "type": "function",
                "function": {
                    "name": "get_current_weather",
                    "arguments": "{\"location\":\"Boston, MA\"}"
                }
            }
        ]
    }
    ```

    - `id`：（必需，字符串）工具调用的标识符。
    - `type`：（必需，字符串）工具调用的类型。必须设置为 `function`。
    - `function`：（必需，对象）模型调用的函数。
      - `name`：（必需，字符串）要调用的函数名称。
      - `arguments`：（必需，字符串）调用函数的参数，以 JSON 格式表示。

  **系统消息**

  - `content`

    （必需，字符串或对象数组）消息的内容。格式同助手消息的 `content`。

  - `role`

    （必需，字符串）消息作者的角色。对于此类型的消息，应设置为 `system`。

  **工具消息**

  - `content`

    （必需，字符串或对象数组）消息的内容。格式同助手消息的 `content`。

  - `role`

    （必需，字符串）消息作者的角色。对于此类型的消息，应设置为 `tool`。

  - `tool_call_id`

    （必需，字符串）此消息所响应的工具调用。

  **用户消息**

  - `content`

    （必需，字符串或对象数组）消息的内容。格式同助手消息的 `content`。

  - `role`

    （必需，字符串）消息作者的角色。对于此类型的消息，应设置为 `user`。

- `model`

  （可选，字符串）要使用的模型 ID。默认情况下，模型 ID 设置为创建推理端点时包含的值。

- `max_completion_tokens`

  （可选，整数）补全请求可生成的 token 数量的上限。

- `stop`

  （可选，字符串数组）用于控制模型何时停止生成额外 token 的字符串序列。

- `temperature`

  （可选，浮点数）要使用的采样温度。

- `tools`

  （可选，对象数组）模型可以调用的工具列表。

  - `type`

    （必需，字符串）工具类型，必须设置为 `function`。

  - `function`

    （必需，对象）函数定义。

    - `description`

      （可选，字符串）函数功能的描述。模型使用此描述来选择何时以及如何调用函数。

    - `name`

      （必需，字符串）函数名称。

    - `parameters`

      （可选，对象）函数接受的参数。应格式化为 JSON 对象。

    - `strict`

      （可选，布尔值）生成函数调用时是否启用模式遵循。

- `tool_choice`

  （可选，字符串或对象）控制模型调用哪个工具。

  - 字符串表示形式：`auto`、`none` 或 `required` 之一。`auto` 允许模型在调用工具和生成消息之间选择。`none` 使模型不调用任何工具。`required` 强制模型调用一个或多个工具。
  - 对象表示形式：
    - `type`：（必需，字符串）工具类型。必须设置为 `function`。
    - `function`：（必需，对象）
      - `name`：（必需，字符串）要调用的函数名称。

- `top_p`

  （可选，浮点数）核采样，温度采样的替代方案。

## 示例

以下示例通过流式传输对示例问题执行聊天补全。

```json
POST _inference/chat_completion/openai-completion/_stream
{
    "model": "gpt-4o",
    "messages": [
        {
            "role": "user",
            "content": "What is Elastic?"
        }
    ]
}
```

以下示例使用带有 `tool_calls` 的助手消息执行聊天补全。

```json
POST _inference/chat_completion/openai-completion/_stream
{
    "messages": [
        {
            "role": "assistant",
            "content": "Let's find out what the weather is",
            "tool_calls": [ 
                {
                    "id": "call_KcAjWtAww20AihPHphUh46Gd",
                    "type": "function",
                    "function": {
                        "name": "get_current_weather",
                        "arguments": "{\"location\":\"Boston, MA\"}"
                    }
                }
            ]
        },
        { 
            "role": "tool",
            "content": "The weather is cold",
            "tool_call_id": "call_KcAjWtAww20AihPHphUh46Gd"
        }
    ]
}
```

1. 每个工具调用都需要一个对应的工具消息。
2. 对应的工具消息。

以下示例使用带有 `tools` 和 `tool_choice` 的用户消息执行聊天补全。

```json
POST _inference/chat_completion/openai-completion/_stream
{
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What's the price of a scarf?"
                }
            ]
        }
    ],
    "tools": [
        {
            "type": "function",
            "function": {
                "name": "get_current_price",
                "description": "Get the current price of a item",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "item": {
                            "id": "123"
                        }
                    }
                }
            }
        }
    ],
    "tool_choice": {
        "type": "function",
        "function": {
            "name": "get_current_price"
        }
    }
}
```

向 OpenAI 服务发出请求时，API 返回以下响应：

```
event: message
data: {"chat_completion":{"id":"chatcmpl-Ae0TWsy2VPnSfBbv5UztnSdYUMFP3","choices":[{"delta":{"content":"","role":"assistant"},"index":0}],"model":"gpt-4o-2024-08-06","object":"chat.completion.chunk"}}

event: message
data: {"chat_completion":{"id":"chatcmpl-Ae0TWsy2VPnSfBbv5UztnSdYUMFP3","choices":[{"delta":{"content":Elastic"},"index":0}],"model":"gpt-4o-2024-08-06","object":"chat.completion.chunk"}}

event: message
data: {"chat_completion":{"id":"chatcmpl-Ae0TWsy2VPnSfBbv5UztnSdYUMFP3","choices":[{"delta":{"content":" is"},"index":0}],"model":"gpt-4o-2024-08-06","object":"chat.completion.chunk"}}

(...)

event: message
data: {"chat_completion":{"id":"chatcmpl-Ae0TWsy2VPnSfBbv5UztnSdYUMFP3","choices":[],"model":"gpt-4o-2024-08-06","object":"chat.completion.chunk","usage":{"completion_tokens":28,"prompt_tokens":16,"total_tokens":44}}} 

event: message
data: [DONE]
```

流的最后一个对象消息包含 token 使用信息。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/chat-completion-inference-api.html)
