# 获取推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [获取推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-inference-get)。

:::::

检索推理端点信息。

## 请求

```bash
GET /_inference
```

```bash
GET /_inference/_all
```

```bash
GET /_inference/<inference_id>
```

```bash
GET /_inference/<task_type>/_all
```

```bash
GET /_inference/<task_type>/<inference_id>
```

## 前置条件

- 需要 `monitor_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 和 `inference_user` 角色授予此权限）。

## 描述

你可以通过单个 API 请求获取以下信息：

- 通过提供任务类型和推理 ID，获取单个推理端点的信息。
- 通过提供任务类型和通配符表达式，获取某个任务类型的所有推理端点。
- 通过使用通配符表达式，获取所有推理端点。

## 路径参数

- `<inference_id>`

  （可选，字符串）推理端点的唯一标识符。

- `<task_type>`

  （可选，字符串）模型执行的推理任务类型。

## 示例

以下 API 调用检索可以执行 `sparse_embedding` 任务的 `my-elser-model` 推理模型的信息。

```bash
GET _inference/sparse_embedding/my-elser-model
```

API 返回以下响应：

```json
{
  "inference_id": "my-elser-model",
  "task_type": "sparse_embedding",
  "service": "elasticsearch",
  "service_settings": {
    "num_allocations": 1,
    "num_threads": 1,
    "model_id": ".elser_model_2"
  },
  "chunking_settings": {
    "strategy": "sentence",
    "max_chunk_size": 250,
    "sentence_overlap": 1
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-inference-api.html)
