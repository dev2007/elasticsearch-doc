# 创建或更新 Logstash 管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [Logstash API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-logstash)。

:::::

此 API 创建或更新用于 Logstash 集中管理的 Logstash 管道。

## 请求

```bash
PUT _logstash/pipeline/<pipeline_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_logstash_pipelines` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

创建 Logstash 管道。如果指定的管道已存在，则替换该管道。

## 路径参数

- `<pipeline_id>`

  （必需，字符串）管道的标识符。必须以字母或下划线开头，只能包含字母、下划线、短横线和数字。

## 请求体

- `description`

  （可选，字符串）管道的描述。此描述不被 Elasticsearch 或 Logstash 使用。

- `last_modified`

  （必需，字符串）管道最后更新的日期。必须采用 `yyyy-MM-dd'T'HH:mm:ss.SSSZZ` strict_date_time 格式。

- `pipeline`

  （必需，字符串）管道的配置。有关支持的语法，请参阅 [Logstash 配置文档](https://www.elastic.co/guide/en/logstash/8.18/configuration.html)。

- `pipeline_metadata`

  （必需，对象）有关管道的可选元数据。可包含任何内容。此元数据不由 Elasticsearch 或 Logstash 生成或使用。

- `pipeline_settings`

  （必需，对象）管道的设置。仅支持点表示法的扁平键。有关支持的设置，请参阅 [Logstash 设置文档](https://www.elastic.co/guide/en/logstash/8.18/logstash-settings-file.html)。

- `username`

  （必需，字符串）最后更新管道的用户。

## 示例

以下示例创建名为 `my_pipeline` 的新管道：

```json
PUT _logstash/pipeline/my_pipeline
{
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
```

如果请求成功，你将收到带有适当状态码的空响应。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/logstash-api-put-pipeline.html)
