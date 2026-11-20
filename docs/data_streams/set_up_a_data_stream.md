# 设置数据流

要设置数据流，请按以下步骤操作：

1. [创建索引生命周期策略](#创建索引生命周期策略)
2. [创建组件模板](#创建组件模板)
3. [创建索引模板](#创建索引模板)
4. [创建数据流](#创建数据流)
5. [保护数据流的安全](#保护数据流的安全)

你也可以[将索引别名转换为数据流](#转换索引别名为数据流)。

如果你使用 Fleet、Elastic Agent 或 Logstash，请跳过本教程。它们都会为你设置数据流。

对于 Fleet 和 Elastic Agent，参阅[数据流文档](https://www.elastic.co/guide/en/starting/current/ingest-data.html#ingest-data-elastic-agent)。对于 Logstash，参阅 elasticsearch 输出插件的[数据流设置](https://www.elastic.co/guide/en/logstash/current/ecs-data-streams.html)。

## 创建索引生命周期策略

虽然是可选的，但我们推荐使用 ILM 自动管理数据流的支持索引。ILM 需要一个索引生命周期策略。

要在 Kibana 中创建索引生命周期策略，打开主菜单，进入 Stack Management > Index Lifecycle Policies。点击 Create policy。

你也可以使用 [put lifecycle API](/rest_apis/index_lifecycle_management_api/put_lifecycle)。

```bash
PUT _ilm/policy/my-lifecycle-policy
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_primary_shard_size": "50gb"
          }
        }
      },
      "warm": {
        "min_age": "30d",
        "actions": {
          "shrink": {
            "number_of_shards": 1
          },
          "forcemerge": {
            "max_num_segments": 1
          }
        }
      },
      "cold": {
        "min_age": "60d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "found-snapshots"
          }
        }
      },
      "frozen": {
        "min_age": "90d",
        "actions": {
          "searchable_snapshot": {
            "snapshot_repository": "found-snapshots"
          }
        }
      },
      "delete": {
        "min_age": "735d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

## 创建组件模板

数据流需要一个匹配的索引模板。在大多数情况下，你可以使用一个或多个组件模板来组合此索引模板。你通常使用单独的组件模板来存放映射和索引设置，这样可以在多个索引模板中复用这些组件模板。

创建组件模板时，请包含：

- `@timestamp` 字段的 `date` 或 `date_nanos` 映射。如果不指定映射，Elasticsearch 会将 `@timestamp` 映射为使用默认选项的 `date` 字段。
- `index.lifecycle.name` 索引设置中的生命周期策略。

映射字段时请使用 Elastic Common Schema (ECS)。ECS 字段默认与多个 Elastic Stack 特性集成。

如果不确定如何映射字段，可以使用[运行时字段](/mapping/runtime)在搜索时从非结构化内容中提取字段。例如，你可以将日志消息索引到 wildcard 字段，然后在搜索期间从此字段中提取 IP 地址和其他数据。

要在 Kibana 中创建组件模板，打开主菜单，进入 Stack Management > Index Management。在 Index Templates 视图中，点击 Create component template。

你也可以使用[创建组件模板 API](/rest_apis/index_apis/create_or_update_component_template)。

```bash
# 创建用于映射的组件模板
PUT _component_template/my-mappings
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date",
          "format": "date_optional_time||epoch_millis"
        },
        "message": {
          "type": "wildcard"
        }
      }
    }
  },
  "_meta": {
    "description": "Mappings for @timestamp and message fields",
    "my-custom-meta-field": "More arbitrary metadata"
  }
}

# 创建用于索引设置的组件模板
PUT _component_template/my-settings
{
  "template": {
    "settings": {
      "index.lifecycle.name": "my-lifecycle-policy"
    }
  },
  "_meta": {
    "description": "Settings for ILM",
    "my-custom-meta-field": "More arbitrary metadata"
  }
}
```

## 创建索引模板

使用你的组件模板来创建索引模板。请指定：

- 一个或多个匹配数据流名称的索引模式。我们推荐使用我们的[数据流命名方案](https://www.elastic.co/guide/en/ecs/current/ecs-data-stream-naming-scheme.html)。
- 将模板设置为启用数据流。
- 任何包含你的映射和索引设置的组件模板。
- 高于 200 的优先级，以避免与内置模板冲突。参阅[避免索引模式冲突](/index_templates/index_templates#避免索引模式冲突)。

要在 Kibana 中创建索引模板，打开主菜单，进入 Stack Management > Index Management。在 Index Templates 视图中，点击 Create template。

你也可以使用[创建索引模板 API](/rest_apis/index_apis/create_or_update_index_template)。包含 `data_stream` 对象以启用数据流。

```bash
PUT _index_template/my-index-template
{
  "index_patterns": ["my-data-stream*"],
  "data_stream": { },
  "composed_of": [ "my-mappings", "my-settings" ],
  "priority": 500,
  "_meta": {
    "description": "Template for my time series data",
    "my-custom-meta-field": "More arbitrary metadata"
  }
}
```

## 创建数据流

索引请求会将文档添加到数据流。这些请求必须使用 `create` 的 [`op_type`](/rest_apis/document_apis/docs_index#docs-index-api-op_type)。文档必须包含 `@timestamp` 字段。

要自动创建数据流，请提交一个以流名称为目标的索引请求。此名称必须匹配你某个索引模板的索引模式。

```bash
PUT my-data-stream/_bulk
{ "create":{ } }
{ "@timestamp": "2099-05-06T16:21:15.000Z", "message": "192.0.2.42 - - [06/May/2099:16:21:15 +0000] \"GET /images/bg.jpg HTTP/1.0\" 200 24736" }
{ "create":{ } }
{ "@timestamp": "2099-05-06T16:25:42.000Z", "message": "192.0.2.255 - - [06/May/2099:16:25:42 +0000] \"GET /favicon.ico HTTP/1.0\" 200 3638" }

POST my-data-stream/_doc
{
  "@timestamp": "2099-05-06T16:21:15.000Z",
  "message": "192.0.2.42 - - [06/May/2099:16:21:15 +0000] \"GET /images/bg.jpg HTTP/1.0\" 200 24736"
}
```

你也可以使用[创建数据流 API](/rest_apis/data_stream_apis/create_data_stream) 手动创建流。流的名称仍然必须匹配你某个模板的索引模式。

```bash
PUT _data_stream/my-data-stream
```

## 保护数据流的安全

使用[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)控制对数据流的访问。授予数据流的权限同样会授予其支持索引。

例如，参阅[数据流权限](/secure_the_elastic_statck/user_authorization/security_privileges#数据流权限)。

## 转换索引别名为数据流

在 Elasticsearch 7.9 之前，你通常使用带写索引的索引别名来管理时间序列数据。数据流取代了此功能，需要更少的维护，并自动与数据层集成。

要将带写索引的索引别名转换为同名数据流，请使用[迁移数据流 API](/rest_apis/data_stream_apis/migrate_to_data_stream)。转换期间，别名的索引成为流的隐藏支持索引。别名的写索引成为流的写索引。流仍然需要一个启用数据流的匹配索引模板。

```bash
POST _data_stream/_migrate/my-time-series-data
```

## 获取数据流的信息

要在 Kibana 中获取数据流的信息，打开主菜单，进入 Stack Management > Index Management。在 Data Streams 视图中，点击数据流的名称。

你也可以使用[获取数据流 API](/rest_apis/data_stream_apis/get_data_stream)。

```bash
GET _data_stream/my-data-stream
```

## 删除数据流

要在 Kibana 中删除数据流及其支持索引，打开主菜单，进入 Stack Management > Index Management。在 Data Streams 视图中，点击垃圾桶图标。只有当你拥有该数据流的 `delete_index` 安全权限时，才会显示该图标。

你也可以使用[删除数据流 API](/rest_apis/data_stream_apis/delete_data_stream)。

```bash
DELETE _data_stream/my-data-stream
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/set-up-a-data-stream.html)
