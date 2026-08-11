# 流式推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-inference)。

:::::

流式传输补全响应。

## 请求

```bash
POST /_inference/<inference_id>/_stream
```

```bash
POST /_inference/<task_type>/<inference_id>/_stream
```

## 前置条件

- 需要 `monitor_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 和 `inference_user` 角色授予此权限）。
- 你必须使用支持流式传输的客户端。

## 描述

流式推理 API 通过增量交付答案来实现补全任务的实时响应，从而减少计算期间的响应时间。它仅适用于 `completion` 和 `chat_completion` 任务类型。

流式推理 API 和[聊天补全推理 API](./chat_completion_inference) 在响应结构和功能上有所不同。聊天补全推理 API 通过更多字段和函数调用支持提供更全面的自定义选项。如果你使用 `openai` 服务或 `elastic` 服务，请使用聊天补全推理 API。

有关如何使用 `chat_completion` 任务类型的更多信息，请参阅聊天补全文档。

## 路径参数

- `<inference_id>`

  （必需，字符串）推理端点的唯一标识符。

- `<task_type>`

  （可选，字符串）模型执行的推理任务类型。

## 请求体

- `input`

  （必需，字符串或字符串数组）你要对其执行推理任务的文本。`input` 可以是单个字符串或数组。

  `completion` 任务类型的推理端点目前仅支持单个字符串作为输入。

## 示例

以下示例通过流式传输对示例问题执行补全。

```json
POST _inference/completion/openai-completion/_stream
{
  "input": "What is Elastic?"
}
```

API 返回以下响应：

```
event: message
data: {
  "completion":[{
    "delta":"Elastic"
  }]
}

event: message
data: {
  "completion":[{
    "delta":" is"
    },
    {
    "delta":" a"
    }
  ]
}

event: message
data: {
  "completion":[{
    "delta":" software"
  },
  {
    "delta":" company"
  }]
}

(...)
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/stream-inference-api.html)
