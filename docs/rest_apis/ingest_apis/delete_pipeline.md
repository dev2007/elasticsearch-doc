# 删除管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

删除一个或多个已存在的摄取管道。

## 请求

```bash
DELETE /_ingest/pipeline/<pipeline>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_pipeline`、`manage_ingest_pipelines` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<pipeline>`

  （必需，字符串）用于限制请求的管道 ID 或通配符表达式。

  要删除集群中的所有摄取管道，使用 `*` 值。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

### 删除特定摄取管道

```bash
DELETE /_ingest/pipeline/pipeline-one
```

### 使用通配符表达式删除摄取管道

```bash
DELETE /_ingest/pipeline/pipeline-*
```

### 删除所有摄取管道

```bash
DELETE /_ingest/pipeline/*
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-pipeline-api.html)
