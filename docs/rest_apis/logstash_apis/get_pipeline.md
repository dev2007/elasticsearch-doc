# 获取 Logstash 管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [Logstash API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-logstash)。

:::::

此 API 检索用于 Logstash 集中管理的管道。

## 请求

```bash
GET _logstash/pipeline
```

```bash
GET _logstash/pipeline/<pipeline_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_logstash_pipelines` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

检索一个或多个 Logstash 管道。

## 路径参数

- `<pipeline_id>`

  （可选，字符串）管道标识符的逗号分隔列表。

## 示例

以下示例检索名为 `my_pipeline` 的管道：

```bash
GET _logstash/pipeline/my_pipeline
```

如果请求成功，响应体包含管道定义：

```json
{
  "my_pipeline": {
    "description": "Sample pipeline for illustration purposes",
    "last_modified": "2021-01-02T02:50:51.250Z",
    "pipeline_metadata": {
      "type": "logstash_pipeline",
      "version": "1"
    },
    "username": "elastic",
    "pipeline": "input {}\n filter { grok {} }\n output {}",
    "pipeline_settings": {
      "pipeline.workers": 1,
      "pipeline.batch.size": 125,
      "pipeline.batch.delay": 50,
      "queue.type": "memory",
      "queue.max_bytes": "1gb",
      "queue.checkpoint.writes": 1024
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/logstash-api-get-pipeline.html)
