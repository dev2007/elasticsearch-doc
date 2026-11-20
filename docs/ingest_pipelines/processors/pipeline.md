# Pipeline 处理器

执行另一个 pipeline。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `name` | 是 | - | 要执行的 pipeline 名称。支持模板片段。 |
| `ignore_missing_pipeline` | 否 | `false` | 是否忽略缺失的 pipeline 而不是失败。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

当前 pipeline 的名称可以通过 `_ingest.pipeline` 摄取元数据键访问。

## 嵌套 pipeline 示例

使用该处理器嵌套 pipeline 的示例如下。

定义内部 pipeline：

```json
PUT _ingest/pipeline/pipelineA
{
  "description" : "inner pipeline",
  "processors" : [
    {
      "set" : {
        "field": "inner_pipeline_set",
        "value": "inner"
      }
    }
  ]
}
```

定义引用内部 pipeline 的外部 pipeline：

```json
PUT _ingest/pipeline/pipelineB
{
  "description" : "outer pipeline",
  "processors" : [
    {
      "pipeline" : {
        "name": "pipelineA"
      }
    },
    {
      "set" : {
        "field": "outer_pipeline_set",
        "value": "outer"
      }
    }
  ]
}
```

在应用外部 pipeline 的同时索引文档，将看到内部 pipeline 从外部 pipeline 中被执行：

```json
PUT /my-index-000001/_doc/1?pipeline=pipelineB
{
  "field": "value"
}
```

索引请求的响应：

```json
{
  "_index": "my-index-000001",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 66,
  "_primary_term": 1
}
```

最终索引的文档：

```json
{
  "field": "value",
  "inner_pipeline_set": "inner",
  "outer_pipeline_set": "outer"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/pipeline-processor.html)
