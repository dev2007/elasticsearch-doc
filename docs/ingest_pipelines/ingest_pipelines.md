# 摄取管道

摄取管道（ingest pipeline）让你能够在索引之前对数据执行常见的转换。例如，你可以使用管道来移除字段、从文本中提取值以及丰富数据。

管道由一系列可配置的任务（称为处理器）组成。每个处理器按顺序运行，对传入的文档执行特定的更改。在所有处理器运行完毕后，Elasticsearch 会将转换后的文档添加到你的数据流或索引。

你可以使用 Kibana 的 Ingest Pipelines 功能或摄取 API 来创建和管理摄取管道。Elasticsearch 将管道存储在集群状态中。

## 前置条件

- 具有 `ingest` 节点角色的节点负责管道处理。要使用摄取管道，你的集群必须至少有一个具有 `ingest` 角色的节点。对于繁重的摄取负载，我们推荐创建专用的摄取节点。
- 如果启用了 Elasticsearch 安全功能，你必须拥有 `manage_pipeline` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)才能管理摄取管道。要使用 Kibana 的 Ingest Pipelines 功能，你还需要 `cluster:monitor/nodes/info` 集群权限。
- 包含 enrich 处理器的管道需要额外的设置。参阅[丰富你的数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/enrich.html)。

## 创建和管理管道

在 Kibana 中，打开主菜单并点击 Stack Management > Ingest Pipelines。在列表视图中，你可以：

- 查看管道列表并深入了解详情
- 编辑或克隆现有的管道
- 删除管道

要创建管道，点击 Create pipeline > New pipeline。示例教程参阅[示例：解析日志](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/example-parse-logs-in-the-common-log-format.html)。

New pipeline from CSV 选项让你可以使用 CSV 创建一个将自定义数据映射到 Elastic Common Schema (ECS) 的摄取管道。将自定义数据映射到 ECS 可以让数据更易于搜索，并让你能够复用其他数据集的可视化。开始使用请参阅[将自定义数据映射到 ECS](https://www.elastic.co/guide/en/kibana/current/rabbitmq-logstash-tutorial.html)。

你还可以使用[摄取 API](/rest_apis/ingest_apis/ingest_apis) 来创建和管理管道。以下创建管道 API 请求创建了一个包含两个 set 处理器和一个 lowercase 处理器的管道。这些处理器按指定的顺序依次运行。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "description": "My optional pipeline description",
  "processors": [
    {
      "set": {
        "description": "My optional processor description",
        "field": "my-long-field",
        "value": 10
      }
    },
    {
      "set": {
        "description": "Set 'my-boolean-field' to true",
        "field": "my-boolean-field",
        "value": true
      }
    },
    {
      "lowercase": {
        "field": "my-keyword-field"
      }
    }
  ]
}
```

## 管理管道版本

创建或更新管道时，你可以指定一个可选的版本整数。你可以将此版本号与 `if_version` 参数配合使用来有条件地更新管道。指定 `if_version` 参数时，成功的更新会使管道的版本递增。

```bash
PUT _ingest/pipeline/my-pipeline-id
{
  "version": 1,
  "processors": [ ... ]
}
```

::::tip 注意
要使用 API 取消版本号，请在不指定 version 参数的情况下替换或更新管道。
::::

## 测试管道

在生产环境中使用管道之前，我们推荐你使用示例文档对其进行测试。在 Kibana 中创建或编辑管道时，点击 Add documents。在 Documents 选项卡中，提供示例文档并点击 Run the pipeline。

你也可以使用[模拟管道 API](/rest_apis/ingest_apis/simulate_pipeline) 来测试管道。你可以在请求路径中指定已配置的管道。例如，以下请求测试 `my-pipeline`。

```bash
POST _ingest/pipeline/my-pipeline/_simulate
{
  "docs": [
    {
      "_source": {
        "my-keyword-field": "FOO"
      }
    },
    {
      "_source": {
        "my-keyword-field": "BAR"
      }
    }
  ]
}
```

你也可以在请求体中指定管道及其处理器。

```bash
POST _ingest/pipeline/_simulate
{
  "pipeline": {
    "processors": [
      {
        "lowercase": {
          "field": "my-keyword-field"
        }
      }
    ]
  },
  "docs": [
    {
      "_source": {
        "my-keyword-field": "FOO"
      }
    },
    {
      "_source": {
        "my-keyword-field": "BAR"
      }
    }
  ]
}
```

API 返回转换后的文档：

```json
{
  "docs": [
    {
      "doc": {
        "_index": "_index",
        "_id": "_id",
        "_version": "-3",
        "_source": {
          "my-keyword-field": "foo"
        },
        "_ingest": {
          "timestamp": "2099-03-07T11:04:03.000Z"
        }
      }
    },
    {
      "doc": {
        "_index": "_index",
        "_id": "_id",
        "_version": "-3",
        "_source": {
          "my-keyword-field": "bar"
        },
        "_ingest": {
          "timestamp": "2099-03-07T11:04:04.000Z"
        }
      }
    }
  ]
}
```

## 将管道添加到索引请求

使用 `pipeline` 查询参数将管道应用到单个或批量索引请求中的文档。

```bash
POST my-data-stream/_doc?pipeline=my-pipeline
{
  "@timestamp": "2099-03-07T11:04:05.000Z",
  "my-keyword-field": "foo"
}

PUT my-data-stream/_bulk?pipeline=my-pipeline
{ "create":{ } }
{ "@timestamp": "2099-03-07T11:04:06.000Z", "my-keyword-field": "foo" }
{ "create":{ } }
{ "@timestamp": "2099-03-07T11:04:07.000Z", "my-keyword-field": "bar" }
```

你还可以将 `pipeline` 参数与 [update by query](/rest_apis/document_apis/update_by_query) 或 [reindex](/rest_apis/document_apis/reindex) API 配合使用。

```bash
POST my-data-stream/_update_by_query?pipeline=my-pipeline

POST _reindex
{
  "source": {
    "index": "my-data-stream"
  },
  "dest": {
    "index": "my-new-data-stream",
    "op_type": "create",
    "pipeline": "my-pipeline"
  }
}
```

## 设置默认管道

使用 `index.default_pipeline` [索引设置](/index_modules#索引设置)设置默认管道。如果没有指定 `pipeline` 参数，Elasticsearch 会将此管道应用到索引请求。

## 设置最终管道

使用 `index.final_pipeline` 索引设置设置最终管道。即使未指定请求管道或默认管道，Elasticsearch 也会在此管道之后应用该管道。

## Beats 的管道

要将摄取管道添加到 Elastic Beat，请在 `<BEAT_NAME>.yml` 的 `output.elasticsearch` 下指定 `pipeline` 参数。例如，对于 Filebeat，你需要在 `filebeat.yml` 中指定 `pipeline`。

```yaml
output.elasticsearch:
  hosts: ["localhost:9200"]
  pipeline: my-pipeline
```

## Fleet 和 Elastic Agent 的管道

Elastic Agent 集成自带默认的摄取管道，可在索引之前对数据进行预处理和丰富。Fleet 使用包含 `pipeline` 索引设置的[索引模板](/index_templates/index_templates)来应用这些管道。Elasticsearch 根据流的命名方案将这些模板与你的 Fleet 数据流进行匹配。

每个默认的集成管道都会调用一个不存在的、无版本的 `@custom` 摄取管道。如果不做修改，此管道调用不会对你的数据产生任何影响。但是，你可以修改此调用，为集成创建在升级后仍然保留的自定义管道。参阅[教程：使用自定义摄取管道转换数据](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/tutorial-transform-data-with-custom-ingest-pipelines.html)了解更多信息。

Fleet 没有为 Custom logs 集成提供默认的摄取管道，但你可以使用索引模板或自定义配置为此集成指定管道。

### 选项 1：索引模板

1. 创建并测试你的摄取管道。将管道命名为 `logs-<dataset-name>-default`。这更便于跟踪你的集成的管道。

   例如，以下请求为 `my_app` 数据集创建了一个管道。该管道的名称为 `logs-my_app-default`。

   ```bash
   PUT _ingest/pipeline/logs-my_app-default
   {
     "description": "Pipeline for `my_app` dataset",
     "processors": [ ... ]
   }
   ```

2. 创建一个在 `index.default_pipeline` 或 `index.final_pipeline` 索引设置中包含你的管道的索引模板。确保该模板启用了数据流。模板的索引模式应匹配 `logs-<dataset-name>-*`。

   你可以使用 Kibana 的 Index Management 功能或[创建索引模板 API](/rest_apis/index_apis/create_or_update_index_template) 创建此模板。

   例如，以下请求创建了一个匹配 `logs-my_app-*` 的模板。该模板使用一个包含 `index.default_pipeline` 索引设置的组件模板。

   ```bash
   # 创建用于索引设置的组件模板
   PUT _component_template/logs-my_app-settings
   {
     "template": {
       "settings": {
         "index.default_pipeline": "logs-my_app-default",
         "index.lifecycle.name": "logs"
       }
     }
   }

   # 创建匹配 `logs-my_app-*` 的索引模板
   PUT _index_template/logs-my_app-template
   {
     "index_patterns": ["logs-my_app-*"],
     "data_stream": { },
     "priority": 500,
     "composed_of": ["logs-my_app-settings", "logs-my_app-mappings"]
   }
   ```

3. 在 Fleet 中添加或编辑你的 Custom logs 集成时，点击 Configure integration > Custom log file > Advanced options。

4. 在 Dataset name 中，指定数据集的名称。Fleet 会将该集成的新数据添加到生成的 `logs-<dataset-name>-default` 数据流。

   例如，如果你的数据集名称为 `my_app`，Fleet 会将新数据添加到 `logs-my_app-default` 数据流。

5. 使用[翻转 API](/rest_apis/index_apis/rollover_index) 翻转你的数据流。这确保 Elasticsearch 将索引模板及其管道设置应用到该集成的任何新数据。

   ```bash
   POST logs-my_app-default/_rollover/
   ```

### 选项 2：自定义配置

1. 创建并测试你的摄取管道。将管道命名为 `logs-<dataset-name>-default`。这更便于跟踪你的集成的管道。

   例如，以下请求为 `my_app` 数据集创建了一个管道。该管道的名称为 `logs-my_app-default`。

   ```bash
   PUT _ingest/pipeline/logs-my_app-default
   {
     "description": "Pipeline for `my_app` dataset",
     "processors": [ ... ]
   }
   ```

2. 在 Fleet 中添加或编辑你的 Custom logs 集成时，点击 Configure integration > Custom log file > Advanced options。

3. 在 Dataset name 中，指定数据集的名称。Fleet 会将该集成的新数据添加到生成的 `logs-<dataset-name>-default` 数据流。

   例如，如果你的数据集名称为 `my_app`，Fleet 会将新数据添加到 `logs-my_app-default` 数据流。

4. 在 Custom Configurations 中，在 `pipeline` 策略设置中指定你的管道。

::::info Elastic Agent 独立运行
如果你独立运行 Elastic Agent，你可以使用包含 `index.default_pipeline` 或 `index.final_pipeline` 索引设置的索引模板来应用管道。或者，你可以在 `elastic-agent.yml` 配置中指定 `pipeline` 策略设置。参阅[安装独立 Elastic Agent](https://www.elastic.co/guide/en/fleet/current/elastic-agent-standalone-install.html)。
::::

## 搜索索引的管道

当你为搜索用例创建 Elasticsearch 索引时（例如使用网络爬虫或连接器），这些索引会自动配置特定的摄取管道。这些处理器有助于为搜索优化你的内容。更多信息参阅[搜索中的摄取管道](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ingest-pipelines-in-search.html)。

## 在处理器中访问源字段

处理器对传入文档的源字段拥有读写权限。要访问处理器中的字段键，请使用其字段名。以下 set 处理器访问 `my-long-field`。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "field": "my-long-field",
        "value": 10
      }
    }
  ]
}
```

你也可以在前面加上 `_source` 前缀。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "field": "_source.my-long-field",
        "value": 10
      }
    }
  ]
}
```

使用点号表示法访问对象字段。

如果文档包含 flattened 对象，请先使用 `dot_expander` 处理器展开它们。其他摄取处理器无法访问 flattened 对象。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "dot_expander": {
        "description": "Expand 'my-object-field.my-property'",
        "field": "my-object-field.my-property"
      }
    },
    {
      "set": {
        "description": "Set 'my-object-field.my-property' to 10",
        "field": "my-object-field.my-property",
        "value": 10
      }
    }
  ]
}
```

一些处理器参数支持 Mustache 模板片段。要访问模板片段中的字段值，请将字段名用三个大括号括起来：`{{{field-name}}}`。你可以使用模板片段来动态设置字段名。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "description": "Set dynamic '<service>' field to 'code' value",
        "field": "{{{service}}}",
        "value": "{{{code}}}"
      }
    }
  ]
}
```

## 在处理器中访问元数据字段

处理器可以按名称访问以下元数据字段：

- `_index`
- `_id`
- `_routing`
- `_dynamic_templates`

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "description": "Set '_routing' to 'geoip.country_iso_code' value",
        "field": "_routing",
        "value": "{{{geoip.country_iso_code}}}"
      }
    }
  ]
}
```

使用 Mustache 模板片段访问元数据字段值。例如，`{{{_routing}}}` 会检索文档的路由值。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "description": "Use geo_point dynamic template for address field",
        "field": "_dynamic_templates",
        "value": {
          "address": "geo_point"
        }
      }
    }
  ]
}
```

上面的 set 处理器告诉 ES，如果 `address` 字段尚未在索引的映射中定义，则对 `address` 字段使用名为 `geo_point` 的动态模板。如果 `address` 字段的动态模板已在批量请求中定义，此处理器会覆盖它，但对批量请求中定义的其他动态模板没有影响。

如果你自动生成文档 ID，则不能在处理器中使用 `{{{_id}}}`。Elasticsearch 在摄取之后才分配自动生成的 `_id` 值。

## 在处理器中访问摄取元数据

摄取处理器可以使用 `_ingest` 键来添加和访问摄取元数据。

与源字段和元数据字段不同，Elasticsearch 默认不索引摄取元数据字段。Elasticsearch 也允许以 `_ingest` 键开头的源字段。如果你的数据包含这样的源字段，请使用 `_source._ingest` 来访问它们。

管道默认只创建 `_ingest.timestamp` 摄取元数据字段。此字段包含 Elasticsearch 收到文档索引请求时的时间戳。要索引 `_ingest.timestamp` 或其他摄取元数据字段，请使用 set 处理器。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "description": "Index the ingest timestamp as 'event.ingested'",
        "field": "event.ingested",
        "value": "{{{_ingest.timestamp}}}"
      }
    }
  ]
}
```

## 处理管道失败

管道的处理器按顺序运行。默认情况下，当其中某个处理器失败或遇到错误时，管道处理会停止。

要忽略处理器失败并继续运行管道的其余处理器，请将 `ignore_failure` 设置为 `true`。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "rename": {
        "description": "Rename 'provider' to 'cloud.provider'",
        "field": "provider",
        "target_field": "cloud.provider",
        "ignore_failure": true
      }
    }
  ]
}
```

使用 `on_failure` 参数指定在处理器失败后立即运行的一系列处理器。如果指定了 `on_failure`，Elasticsearch 之后会运行管道的其余处理器，即使 `on_failure` 配置为空。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "rename": {
        "description": "Rename 'provider' to 'cloud.provider'",
        "field": "provider",
        "target_field": "cloud.provider",
        "on_failure": [
          {
            "set": {
              "description": "Set 'error.message'",
              "field": "error.message",
              "value": "Field 'provider' does not exist. Cannot rename to 'cloud.provider'",
              "override": false
            }
          }
        ]
      }
    }
  ]
}
```

嵌套 `on_failure` 处理器列表以实现嵌套的错误处理。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "rename": {
        "description": "Rename 'provider' to 'cloud.provider'",
        "field": "provider",
        "target_field": "cloud.provider",
        "on_failure": [
          {
            "set": {
              "description": "Set 'error.message'",
              "field": "error.message",
              "value": "Field 'provider' does not exist. Cannot rename to 'cloud.provider'",
              "override": false,
              "on_failure": [
                {
                  "set": {
                    "description": "Set 'error.message.multi'",
                    "field": "error.message.multi",
                    "value": "Document encountered multiple ingest errors",
                    "override": true
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
```

你也可以为管道指定 `on_failure`。如果一个没有 `on_failure` 值的处理器失败，Elasticsearch 会将此管道级参数作为回退。Elasticsearch 不会尝试运行管道的其余处理器。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [ ... ],
  "on_failure": [
    {
      "set": {
        "description": "Index document to 'failed-<index>'",
        "field": "_index",
        "value": "failed-{{{ _index }}}"
      }
    }
  ]
}
```

关于管道失败的额外信息可能存在于文档元数据字段 `on_failure_message`、`on_failure_processor_type`、`on_failure_processor_tag` 和 `on_failure_pipeline` 中。这些字段只能在 `on_failure` 块内部访问。

以下示例使用这些元数据字段在文档中记录管道失败的信息。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [ ... ],
  "on_failure": [
    {
      "set": {
        "description": "Record error information",
        "field": "error_information",
        "value": "Processor {{ _ingest.on_failure_processor_type }} with tag {{ _ingest.on_failure_processor_tag }} in pipeline {{ _ingest.on_failure_pipeline }} failed with message {{ _ingest.on_failure_message }}"
      }
    }
  ]
}
```

## 有条件地运行处理器

每个处理器都支持一个可选的 `if` 条件，以 Painless 脚本编写。如果提供了 `if` 条件，则只有在该条件为 true 时处理器才会运行。

`if` 条件脚本运行在 Painless 的摄取处理器上下文中。在 `if` 条件中，`ctx` 值是只读的。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "drop": {
        "description": "Drop documents with 'network.name' of 'Guest'",
        "if": "ctx?.network?.name == 'Guest'"
      }
    }
  ]
}
```

如果启用了 `script.painless.regex.enabled` 集群设置，你可以在 `if` 条件脚本中使用正则表达式。支持的语法参阅 Painless 正则表达式。

如果可以的话，请避免使用正则表达式。开销大的正则表达式会降低索引速度。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "set": {
        "description": "If 'url.scheme' is 'http', set 'url.insecure' to true",
        "if": "ctx.url?.scheme =~ /^http[^s]/",
        "field": "url.insecure",
        "value": true
      }
    }
  ]
}
```

你必须将 `if` 条件指定为单行上的有效 JSON。不过，你可以使用 Kibana 控制台的三引号语法来编写和调试较大的脚本。

如果可以的话，请避免使用复杂或开销大的 `if` 条件脚本。开销大的条件脚本会降低索引速度。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "drop": {
        "description": "Drop documents that don't contain 'prod' tag",
        "if": """
            Collection tags = ctx.tags;
            if(tags != null){
              for (String tag : tags) {
                if (tag.toLowerCase().contains('prod')) {
                  return false;
                }
              }
            }
            return true;
        """
      }
    }
  ]
}
```

你还可以将存储脚本指定为 `if` 条件。

```bash
PUT _scripts/my-prod-tag-script
{
  "script": {
    "lang": "painless",
    "source": """
      Collection tags = ctx.tags;
      if(tags != null){
        for (String tag : tags) {
          if (tag.toLowerCase().contains('prod')) {
            return false;
          }
        }
      }
      return true;
    """
  }
}

PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "drop": {
        "description": "Drop documents that don't contain 'prod' tag",
        "if": { "id": "my-prod-tag-script" }
      }
    }
  ]
}
```

传入文档通常包含对象字段。如果处理器脚本尝试访问其父对象不存在的字段，Elasticsearch 会返回 NullPointerException。为避免这些异常，请使用空安全运算符（如 `?.`），并将脚本编写为空安全的。

例如，`ctx.network?.name.equalsIgnoreCase('Guest')` 不是空安全的。`ctx.network?.name` 可能返回 null。将脚本重写为 `'Guest'.equalsIgnoreCase(ctx.network?.name)`，这是空安全的，因为 `Guest` 始终非空。

如果无法将脚本重写为空安全的，请包含一个显式的 null 检查。

```bash
PUT _ingest/pipeline/my-pipeline
{
  "processors": [
    {
      "drop": {
        "description": "Drop documents that contain 'network.name' of 'Guest'",
        "if": "ctx.network?.name != null && ctx.network.name.contains('Guest')"
      }
    }
  ]
}
```

## 有条件地应用管道

将 `if` 条件与 pipeline 处理器组合，根据你的条件将其他管道应用于文档。你可以将此管道用作索引模板中的默认管道，用于配置多个数据流或索引。

```bash
PUT _ingest/pipeline/one-pipeline-to-rule-them-all
{
  "processors": [
    {
      "pipeline": {
        "description": "If 'service.name' is 'apache_httpd', use 'httpd_pipeline'",
        "if": "ctx.service?.name == 'apache_httpd'",
        "name": "httpd_pipeline"
      }
    },
    {
      "pipeline": {
        "description": "If 'service.name' is 'syslog', use 'syslog_pipeline'",
        "if": "ctx.service?.name == 'syslog'",
        "name": "syslog_pipeline"
      }
    },
    {
      "fail": {
        "description": "If 'service.name' is not 'apache_httpd' or 'syslog', return a failure message",
        "if": "ctx.service?.name != 'apache_httpd' && ctx.service?.name != 'syslog'",
        "message": "This pipeline requires service.name to be either `syslog` or `apache_httpd`"
      }
    }
  ]
}
```

## 获取管道使用统计信息

使用[节点统计 API](/rest_apis/cluster_apis/nodes_stats) 获取全局和每个管道的摄取统计信息。使用这些统计信息可以确定哪些管道运行最频繁或处理耗时最多。

```bash
GET _nodes/stats/ingest?filter_path=nodes.*.ingest
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ingest.html)
