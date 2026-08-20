# 删除 Logstash 管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [Logstash API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-logstash)。

:::::

此 API 删除用于 Logstash 集中管理的管道。

## 请求

```bash
DELETE _logstash/pipeline/<pipeline_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_logstash_pipelines` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

删除 Logstash 管道。

## 路径参数

- `<pipeline_id>`

  （必需，字符串）管道的标识符。

## 示例

以下示例删除名为 `my_pipeline` 的管道：

```bash
DELETE _logstash/pipeline/my_pipeline
```

如果请求成功，你将收到带有适当状态码的空响应。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/logstash-api-delete-pipeline.html)
