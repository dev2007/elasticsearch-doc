# 获取管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

返回一个或多个摄取管道的信息。此 API 返回管道的本地引用。

## 请求

```bash
GET /_ingest/pipeline/<pipeline>
```

```bash
GET /_ingest/pipeline
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `read_pipeline`、`manage_pipeline`、`manage_ingest_pipelines` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<pipeline>`

  （可选，字符串）要检索的管道 ID 的逗号分隔列表。支持通配符（`*`）表达式。

  要获取所有摄取管道，省略此参数或使用 `*`。

## 查询参数

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 示例

以下示例检索 `my-pipeline-id` 管道的信息：

```bash
GET /_ingest/pipeline/my-pipeline-id
```

API 返回以下响应：

```json
{
  "my-pipeline-id" : {
    "description" : "describe pipeline",
    "version" : 123,
    "processors" : [
      {
        "set" : {
          "field" : "foo",
          "value" : "bar"
        }
      }
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-pipeline-api.html)
