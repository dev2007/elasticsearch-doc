# 创建或更新管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

创建或更新摄取管道。使用此 API 所做的更改立即生效。

## 请求

```bash
PUT /_ingest/pipeline/<pipeline>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_pipeline`、`manage_ingest_pipelines` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 路径参数

- `<pipeline>`

  （必需，字符串）要创建或更新的摄取管道的 ID。

  为避免与内置和 Fleet 管理的摄取管道发生命名冲突，请勿在你自己的摄取管道名称中使用 `@`。例外情况是 `*@custom` 摄取管道，它允许你安全地向受管理的管道添加自定义管道。另请参阅 [Fleet 和 Elastic Agent 的管道](https://www.elastic.co/guide/en/fleet/8.18/data-streams-pipelines.html)。

## 查询参数

- `if_version`

  （可选，整数）仅当管道具有此版本时才执行操作。如果指定且更新成功，管道的版本号将递增。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待主节点的时间。如果主节点在超时到期前不可用，请求将失败并返回错误。默认为 30s。也可以设置为 -1，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时到期前未收到响应，集群元数据更新仍然生效，但响应将指示未完全确认。默认为 30s。也可以设置为 -1，表示请求永不超时。

## 请求体

- `description`

  （可选，字符串）摄取管道的描述。

- `on_failure`

  （可选，处理器对象数组）处理器失败后立即运行的处理器。

  每个处理器都支持处理器级别的 `on_failure` 值。如果没有 `on_failure` 值的处理器失败，Elasticsearch 将使用此管道级别的参数作为后备。此参数中的处理器按指定顺序依次运行。Elasticsearch 不会尝试运行管道的剩余处理器。

- `processors`

  （必需，处理器对象数组）用于在索引前对文档执行转换的处理器。处理器按指定顺序依次运行。

- `version`

  （可选，整数）外部系统用于跟踪摄取管道的版本号。

  有关 `version` 属性的使用方式，请参阅上方的 `if_version` 参数。

- `_meta`

  （可选，对象）有关摄取管道的可选元数据。可包含任何内容。此映射不由 Elasticsearch 自动生成。

- `deprecated`

  （可选，布尔值）将此摄取管道标记为已弃用。当已弃用的摄取管道在创建或更新非弃用索引模板时被引用为默认或最终管道，Elasticsearch 将发出弃用警告。

## 示例

### 管道元数据

你可以使用 `_meta` 参数向管道添加任意元数据。此用户定义的对象存储在集群状态中，因此最好保持简短。

`_meta` 参数是可选的，不由 Elasticsearch 自动生成或使用。

要取消设置 `_meta`，请在替换管道时不指定它。

```json
PUT /_ingest/pipeline/my-pipeline-id
{
  "description" : "My optional pipeline description",
  "processors" : [
    {
      "set" : {
        "description" : "My optional processor description",
        "field": "my-keyword-field",
        "value": "foo"
      }
    }
  ],
  "_meta": {
    "reason": "set my-keyword-field to foo",
    "serialization": {
      "class": "MyPipeline",
      "id": 10
    }
  }
}
```

要检查 `_meta`，请使用获取管道 API。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-pipeline-api.html)
