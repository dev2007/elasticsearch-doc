# 执行推理 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [执行推理 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-inference-inference)。

:::::

使用推理端点对输入文本执行推理任务。

## 请求

```bash
POST /_inference/<inference_id>
```

```bash
POST /_inference/<task_type>/<inference_id>
```

## 前置条件

- 需要 `monitor_inference` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)（内置的 `inference_admin` 和 `inference_user` 角色授予此权限）。

## 描述

执行推理 API 使你能够使用机器学习模型对你作为输入提供的数据执行特定任务。API 返回包含任务结果的响应。你使用的推理端点可以执行在通过创建推理 API 创建端点时定义的一种特定任务。

## 路径参数

- `<inference_id>`

  （必需，字符串）推理端点的唯一标识符。

- `<task_type>`

  （可选，字符串）模型执行的推理任务类型。

## 查询参数

- `timeout`

  （可选，超时时间）控制等待推理完成的时间。默认为 30 秒。

## 请求体

- `input`

  （必需，字符串或字符串数组）你要对其执行推理任务的文本。`input` 可以是单个字符串或数组。

  `completion` 任务类型的推理端点目前仅支持单个字符串作为输入。

- `query`

  （必需，字符串）仅用于重排序（rerank）推理端点。搜索查询文本。

- `task_settings`

  （可选，对象）单个推理请求的任务设置。这些设置特定于你指定的 `<task_type>`，并覆盖初始化服务时指定的任务设置。

## 示例

### 补全示例

以下示例对示例问题执行补全。

```json
POST _inference/completion/openai_chat_completions
{
  "input": "What is Elastic?"
}
```

API 返回以下响应：

```json
{
  "completion": [
    {
      "result": "Elastic is a company that provides a range of software solutions for search, logging, security, and analytics. Their flagship product is Elasticsearch, an open-source, distributed search engine that allows users to search, analyze, and visualize large volumes of data in real-time. Elastic also offers products such as Kibana, a data visualization tool, and Logstash, a log management and pipeline tool, as well as various other tools and solutions for data analysis and management."
    }
  ]
}
```

### 重排序示例

以下示例对示例输入执行重排序。

```json
POST _inference/rerank/cohere_rerank
{
  "input": ["luke", "like", "leia", "chewy","r2d2", "star", "wars"],
  "query": "star wars main character"
}
```

API 返回以下响应：

```json
{
  "rerank": [
    {
      "index": "2",
      "relevance_score": "0.011597361",
      "text": "leia"
    },
    {
      "index": "0",
      "relevance_score": "0.006338922",
      "text": "luke"
    },
    {
      "index": "5",
      "relevance_score": "0.0016166499",
      "text": "star"
    },
    {
      "index": "4",
      "relevance_score": "0.0011695103",
      "text": "r2d2"
    },
    {
      "index": "1",
      "relevance_score": "5.614787E-4",
      "text": "like"
    },
    {
      "index": "6",
      "relevance_score": "3.7850367E-4",
      "text": "wars"
    },
    {
      "index": "3",
      "relevance_score": "1.2508839E-5",
      "text": "chewy"
    }
  ]
}
```

### 稀疏嵌入示例

以下示例对示例句子执行稀疏嵌入。

```json
POST _inference/sparse_embedding/my-elser-model
{
  "input": "The sky above the port was the color of television tuned to a dead channel."
}
```

API 返回以下响应：

```json
{
  "sparse_embedding": [
    {
      "port": 2.1259406,
      "sky": 1.7073475,
      "color": 1.6922266,
      "dead": 1.6247464,
      "television": 1.3525393,
      "above": 1.2425821,
      "tuned": 1.1440028,
      "colors": 1.1218185,
      "tv": 1.0111054,
      "ports": 1.0067928,
      "poem": 1.0042328,
      "channel": 0.99471164,
      "tune": 0.96235967,
      "scene": 0.9020516,
      (...)
    },
    (...)
  ]
}
```

### 文本嵌入示例

以下示例使用 Cohere 集成对示例句子执行文本嵌入。

```json
POST _inference/text_embedding/my-cohere-endpoint
{
  "input": "The sky above the port was the color of television tuned to a dead channel.",
  "task_settings": {
    "input_type": "ingest"
  }
}
```

API 返回以下响应：

```json
{
  "text_embedding": [
    {
      "embedding": [
        {
          0.018569946,
          -0.036895752,
          0.01486969,
          -0.0045204163,
          -0.04385376,
          0.0075950623,
          0.04260254,
          -0.004005432,
          0.007865906,
          0.030792236,
          -0.050476074,
          0.011795044,
          -0.011642456,
          -0.010070801,
          (...)
        },
        (...)
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/post-inference-api.html)
