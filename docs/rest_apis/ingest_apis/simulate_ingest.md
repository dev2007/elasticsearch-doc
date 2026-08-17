# 模拟摄取 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [摄取 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ingest)。

:::::

对一组提供的文档执行摄取管道，可选择使用替代管道定义。此 API 用于故障排除或管道开发，因为它不会将任何数据实际索引到 Elasticsearch 中。

## 请求

```bash
POST /_ingest/_simulate
```

```bash
GET /_ingest/_simulate
```

```bash
POST /_ingest/<target>/_simulate
```

```bash
GET /_ingest/<target>/_simulate
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有 `index` 或 `create_index` [权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能使用此 API。

## 描述

模拟摄取 API 模拟将数据摄取到索引中的过程。它针对请求体中提供的一组文档执行该索引的默认管道和最终管道。如果管道包含 reroute 处理器，它会跟随该 reroute 处理器到新索引，并执行该索引的管道，方式与非模拟摄取相同。不会将任何数据索引到 Elasticsearch 中。相反，返回转换后的文档，以及已执行的管道列表和如果不是模拟时文档将被索引到的索引名称。转换后的文档会根据适用于该索引的映射进行验证，任何验证错误都会在结果中报告。

此 API 与模拟管道 API 的区别在于，模拟管道 API 指定单个管道并仅运行该管道。模拟管道 API 更适合开发单个管道，而模拟摄取 API 更适合故障排除摄取到索引时应用的各种管道之间的交互。

默认情况下，使用系统中当前的管道定义。但是，你可以在请求体中提供替代管道定义。这些将用于替代系统中已有的管道定义。这可用于替换现有管道定义或创建新定义。管道替代仅在此请求中使用。

## 路径参数

- `<target>`

  （可选，字符串）模拟摄取的目标索引。可以通过在每个文档上指定索引来覆盖。如果在请求路径中提供 `<target>`，则用于任何未显式指定索引参数的文档。

## 查询参数

- `pipeline`

  （可选，字符串）用作默认管道的管道。可用于覆盖被摄取索引的默认管道。

## 请求体

- `docs`

  （必需，对象数组）要在管道中测试的示例文档。

  `docs` 对象的属性：

  - `_id`

    （可选，字符串）文档的唯一标识符。

  - `_index`

    （可选，字符串）文档将被摄取到的索引名称。

  - `_source`

    （必需，对象）文档的 JSON 正文。

- `pipeline_substitutions`

  （可选，字符串到对象的映射）管道 ID 到替代管道定义对象的映射。

  管道定义对象的属性：

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

- `component_template_substitutions`

  （可选，字符串到对象的映射）组件模板名称到替代组件模板定义对象的映射。

  组件模板定义对象的属性：

  - `template`

    （必需，对象）要应用的模板，可选择性包含 mappings、settings 或 aliases 配置。

    `template` 的属性：

    - `aliases`（可选，对象）要添加的别名。

    - `mappings`（可选，映射对象）索引中字段的映射。

    - `settings`（可选，索引设置对象）索引的配置选项。

  - `version`

    （可选，整数）用于外部管理组件模板的版本号。

  - `allow_auto_create`

    （可选，布尔值）覆盖 `action.auto_create_index` 集群设置的值。

  - `_meta`

    （可选，对象）有关组件模板的可选用户元数据。

  - `deprecated`

    （可选，布尔值）将此组件模板标记为已弃用。

- `index_template_substitutions`

  （可选，字符串到对象的映射）索引模板名称到替代索引模板定义对象的映射。

  索引模板定义对象的属性：

  - `composed_of`

    （可选，字符串数组）组件模板名称的有序列表。组件模板按指定顺序合并，最后指定的组件模板具有最高优先级。

  - `data_stream`

    （可选，对象）如果包含此对象，模板用于创建数据流及其后备索引。

  - `index_patterns`

    （必需，字符串数组）通配符（`*`）表达式数组，用于在创建期间匹配数据流和索引的名称。

  - `_meta`

    （可选，对象）有关索引模板的可选用户元数据。

  - `priority`

    （可选，整数）创建新数据流或索引时确定索引模板优先级的优先级。

  - `template`

    （可选，对象）要应用的模板。可选择性包含 aliases、mappings 或 settings 配置。

  - `version`

    （可选，整数）用于外部管理索引模板的版本号。

  - `deprecated`

    （可选，布尔值）将此索引模板标记为已弃用。

- `mapping_addition`

  （可选，映射对象）在验证过程中合并到索引映射中的映射定义。仅在此请求期间使用。

## 示例

### 使用现有管道定义

在此示例中，索引 `my-index` 有一个名为 `my-pipeline` 的默认管道和一个名为 `my-final-pipeline` 的最终管道。由于两个文档都被摄取到 `my-index` 中，因此使用系统中已有的管道定义执行两个管道。

```json
POST /_ingest/_simulate
{
  "docs": [
    {
      "_index": "my-index",
      "_id": "123",
      "_source": {
        "foo": "bar"
      }
    },
    {
      "_index": "my-index",
      "_id": "456",
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
            "_id": "123",
            "_index": "my-index",
            "_version": -3,
            "_source": {
               "field1": "value1",
               "field2": "value2",
               "foo": "bar"
            },
            "executed_pipelines": [
               "my-pipeline",
               "my-final-pipeline"
            ]
         }
      },
      {
         "doc": {
            "_id": "456",
            "_index": "my-index",
            "_version": -3,
            "_source": {
               "field1": "value1",
               "field2": "value2",
               "foo": "rab"
            },
            "executed_pipelines": [
               "my-pipeline",
               "my-final-pipeline"
            ]
         }
      }
   ]
}
```

### 在请求体中指定管道替代

在此示例中，索引 `my-index` 有一个名为 `my-pipeline` 的默认管道和一个名为 `my-final-pipeline` 的最终管道。但在 `pipeline_substitutions` 中提供了 `my-pipeline` 的替代定义。替代的 `my-pipeline` 将用于替代系统中的 `my-pipeline`，然后执行系统中已定义的 `my-final-pipeline`。

```json
POST /_ingest/_simulate
{
  "docs": [
    {
      "_index": "my-index",
      "_id": "123",
      "_source": {
        "foo": "bar"
      }
    },
    {
      "_index": "my-index",
      "_id": "456",
      "_source": {
        "foo": "rab"
      }
    }
  ],
  "pipeline_substitutions": {
    "my-pipeline": {
      "processors": [
        {
          "uppercase": {
            "field": "foo"
          }
        }
      ]
    }
  }
}
```

API 返回以下响应：

```json
{
   "docs": [
      {
         "doc": {
            "_id": "123",
            "_index": "my-index",
            "_version": -3,
            "_source": {
               "field2": "value2",
               "foo": "BAR"
            },
            "executed_pipelines": [
               "my-pipeline",
               "my-final-pipeline"
            ]
         }
      },
      {
         "doc": {
            "_id": "456",
            "_index": "my-index",
            "_version": -3,
            "_source": {
               "field2": "value2",
               "foo": "RAB"
            },
            "executed_pipelines": [
               "my-pipeline",
               "my-final-pipeline"
            ]
         }
      }
   ]
}
```

### 在请求体中指定组件模板替代

在此示例中，假设索引 `my-index` 具有严格映射，仅定义了 `foo` keyword 字段。假设该字段映射来自名为 `my-mappings-template` 的组件模板。我们想要测试添加一个新字段 `bar`。因此在 `component_template_substitutions` 中提供了 `my-mappings-template` 的替代定义。替代的 `my-mappings-template` 将用于替代 `my-index` 的现有映射和系统中的 `my-mappings-template`。

```json
POST /_ingest/_simulate
{
  "docs": [
    {
      "_index": "my-index",
      "_id": "123",
      "_source": {
        "foo": "foo"
      }
    },
    {
      "_index": "my-index",
      "_id": "456",
      "_source": {
        "bar": "rab"
      }
    }
  ],
  "component_template_substitutions": {
    "my-mappings_template": {
      "template": {
        "mappings": {
          "dynamic": "strict",
          "properties": {
            "foo": {
              "type": "keyword"
            },
            "bar": {
              "type": "keyword"
            }
          }
        }
      }
    }
  }
}
```

API 返回以下响应：

```json
{
   "docs": [
      {
         "doc": {
            "_id": "123",
            "_index": "my-index",
            "_version": -3,
            "_source": {
               "foo": "foo"
            },
            "executed_pipelines": []
         }
      },
      {
         "doc": {
            "_id": "456",
            "_index": "my-index",
            "_version": -3,
            "_source": {
               "bar": "rab"
            },
            "executed_pipelines": []
         }
      }
   ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/simulate-ingest-api.html)
