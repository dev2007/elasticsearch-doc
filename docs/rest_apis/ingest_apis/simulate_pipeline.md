# 模拟管道 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

对一组提供的文档执行摄取管道。

## 请求

```bash
POST /_ingest/pipeline/<pipeline>/_simulate
```

```bash
GET /_ingest/pipeline/<pipeline>/_simulate
```

```bash
POST /_ingest/pipeline/_simulate
```

```bash
GET /_ingest/pipeline/_simulate
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `read_pipeline`、`manage_pipeline`、`manage_ingest_pipelines` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

模拟管道 API 对请求体中提供的一组文档执行特定管道。

你可以指定一个现有管道对提供的文档执行，或者在请求体中提供管道定义。

## 路径参数

- `<pipeline>`

  （必需*，字符串）要测试的管道。如果未在请求体中指定管道，则此参数为必需。

## 查询参数

- `verbose`

  （可选，布尔值）如果为 `true`，响应包含已执行管道中每个处理器的输出数据。

## 请求体

- `pipeline`

  （必需*，对象）要测试的管道。如果未指定 `<pipeline>` 请求路径参数，则此参数为必需。如果同时指定了此参数和请求路径参数，API 仅使用请求路径参数。

  `pipeline` 的属性：

  - `description`

    （可选，字符串）摄取管道的描述。

  - `on_failure`

    （可选，处理器对象数组）处理器失败后立即运行的处理器。

    每个处理器都支持处理器级别的 `on_failure` 值。如果没有 `on_failure` 值的处理器失败，Elasticsearch 将使用此管道级别的参数作为后备。此参数中的处理器按指定顺序依次运行。Elasticsearch 不会尝试运行管道的剩余处理器。

  - `processors`

    （必需，处理器对象数组）用于在索引前对文档执行转换的处理器。处理器按指定顺序依次运行。

  - `version`

    （可选，整数）外部系统用于跟踪摄取管道的版本号。

  - `_meta`

    （可选，对象）有关摄取管道的可选元数据。可包含任何内容。此映射不由 Elasticsearch 自动生成。

  - `deprecated`

    （可选，布尔值）将此摄取管道标记为已弃用。当已弃用的摄取管道在创建或更新非弃用索引模板时被引用为默认或最终管道，Elasticsearch 将发出弃用警告。

- `docs`

  （必需，对象数组）要在管道中测试的示例文档。

  `docs` 对象的属性：

  - `_id`

    （可选，字符串）文档的唯一标识符。此 ID 在 `_index` 内必须唯一。

  - `_index`

    （可选，字符串）包含文档的索引名称。

  - `_routing`

    （可选，字符串）用于将文档发送到特定主分片的值。请参阅 `_routing` 字段。

  - `_source`

    （必需，对象）文档的 JSON 正文。

## 示例

### 将管道指定为路径参数

```json
POST /_ingest/pipeline/my-pipeline-id/_simulate
{
  "docs": [
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "foo": "bar"
      }
    },
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "foo": "rab"
      }
    }
  ]
}
```

API 返回以下响应：

```json
{
   "docs": [
      {
         "doc": {
            "_id": "id",
            "_index": "index",
            "_version": "-3",
            "_source": {
               "field2": "_value",
               "foo": "bar"
            },
            "_ingest": {
               "timestamp": "2017-05-04T22:30:03.187Z"
            }
         }
      },
      {
         "doc": {
            "_id": "id",
            "_index": "index",
            "_version": "-3",
            "_source": {
               "field2": "_value",
               "foo": "rab"
            },
            "_ingest": {
               "timestamp": "2017-05-04T22:30:03.188Z"
            }
         }
      }
   ]
}
```

### 在请求体中指定管道

```json
POST /_ingest/pipeline/_simulate
{
  "pipeline" :
  {
    "description": "_description",
    "processors": [
      {
        "set" : {
          "field" : "field2",
          "value" : "_value"
        }
      }
    ]
  },
  "docs": [
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "foo": "bar"
      }
    },
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "foo": "rab"
      }
    }
  ]
}
```

API 返回以下响应：

```json
{
   "docs": [
      {
         "doc": {
            "_id": "id",
            "_index": "index",
            "_version": "-3",
            "_source": {
               "field2": "_value",
               "foo": "bar"
            },
            "_ingest": {
               "timestamp": "2017-05-04T22:30:03.187Z"
            }
         }
      },
      {
         "doc": {
            "_id": "id",
            "_index": "index",
            "_version": "-3",
            "_source": {
               "field2": "_value",
               "foo": "rab"
            },
            "_ingest": {
               "timestamp": "2017-05-04T22:30:03.188Z"
            }
         }
      }
   ]
}
```

### 查看详细结果

你可以使用模拟管道 API 查看每个处理器在文档通过管道时如何影响摄取文档。要查看模拟请求中每个处理器的中间结果，可以在请求中添加 `verbose` 参数。

```json
POST /_ingest/pipeline/_simulate?verbose=true
{
  "pipeline" :
  {
    "description": "_description",
    "processors": [
      {
        "set" : {
          "field" : "field2",
          "value" : "_value2"
        }
      },
      {
        "set" : {
          "field" : "field3",
          "value" : "_value3"
        }
      }
    ]
  },
  "docs": [
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "foo": "bar"
      }
    },
    {
      "_index": "index",
      "_id": "id",
      "_source": {
        "foo": "rab"
      }
    }
  ]
}
```

API 返回以下响应：

```json
{
  "docs" : [
    {
      "processor_results" : [
        {
          "processor_type" : "set",
          "status" : "success",
          "doc" : {
            "_index" : "index",
            "_id" : "id",
            "_version": "-3",
            "_source" : {
              "field2" : "_value2",
              "foo" : "bar"
            },
            "_ingest" : {
              "pipeline" : "_simulate_pipeline",
              "timestamp" : "2020-07-30T01:21:24.251836Z"
            }
          }
        },
        {
          "processor_type" : "set",
          "status" : "success",
          "doc" : {
            "_index" : "index",
            "_id" : "id",
            "_version": "-3",
            "_source" : {
              "field3" : "_value3",
              "field2" : "_value2",
              "foo" : "bar"
            },
            "_ingest" : {
              "pipeline" : "_simulate_pipeline",
              "timestamp" : "2020-07-30T01:21:24.251836Z"
            }
          }
        }
      ]
    },
    {
      "processor_results" : [
        {
          "processor_type" : "set",
          "status" : "success",
          "doc" : {
            "_index" : "index",
            "_id" : "id",
            "_version": "-3",
            "_source" : {
              "field2" : "_value2",
              "foo" : "rab"
            },
            "_ingest" : {
              "pipeline" : "_simulate_pipeline",
              "timestamp" : "2020-07-30T01:21:24.251863Z"
            }
          }
        },
        {
          "processor_type" : "set",
          "status" : "success",
          "doc" : {
            "_index" : "index",
            "_id" : "id",
            "_version": "-3",
            "_source" : {
              "field3" : "_value3",
              "field2" : "_value2",
              "foo" : "rab"
            },
            "_ingest" : {
              "pipeline" : "_simulate_pipeline",
              "timestamp" : "2020-07-30T01:21:24.251863Z"
            }
          }
        }
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/simulate-pipeline-api.html)
