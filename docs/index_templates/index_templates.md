# 索引模板

*此主题描述 Elasticsearch 7.8 中引入的可组合索引模板。有关索引模板之前的工作方式，参阅[旧版模板文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/indices-templates-v1.html)。*

**索引模板**是一种告诉 Elasticsearch 在创建索引时如何配置索引的方式。对于[数据流](/data_streams/data_streams)，索引模板会在创建流的支持索引时对其进行配置。模板在索引创建之前进行配置。当索引创建时——无论是手动创建还是通过索引文档创建——模板设置都会作为创建索引的基础。

模板有两种类型：**索引模板**和**组件模板**。组件模板是可重用的构建块，用于配置映射、设置和别名。虽然你可以使用组件模板来构建索引模板，但组件模板不会直接应用于一组索引。索引模板既可以包含一组组件模板，也可以直接指定设置、映射和别名。

索引模板适用以下条件：

- 可组合模板的优先级高于旧版模板。如果没有可组合模板匹配给定的索引，旧版模板仍可能匹配并被应用。
- 如果创建索引时带有[创建索引请求](/rest_apis/index_apis/create_index)中的显式设置，且该索引同时匹配某个索引模板，则创建索引请求中的设置优先于索引模板及其组件模板中指定的设置。
- 索引模板本身中指定的设置优先于其组件模板中的设置。
- 如果新的数据流或索引匹配多个索引模板，则使用优先级最高的索引模板。

## 避免索引模式冲突

Elasticsearch 内置了以下索引模式的索引模板，每个模板的优先级均为 100：

- `logs-*-`
- `metrics-*-`
- `synthetics-*-`
- `profiling-`
- `security_solution-*-`

Elastic Agent 使用这些模板来创建数据流。Fleet 集成创建的索引模板使用类似的、可能重叠的索引模式，其优先级最高可达 200。

如果你使用 Fleet 或 Elastic Agent，请将你自己的索引模板优先级设置为低于 100，以免覆盖这些模板。否则，为避免意外应用这些模板，请执行以下一项或多项操作：

- 要禁用所有内置索引和组件模板，请使用[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings) 将 `stack.templates.enabled` 设置为 `false`。但请注意，不推荐这样做——详见[该设置的文档](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/misc-settings.html)以了解更多信息。
- 使用不重叠的索引模式。
- 为具有重叠模式的模板分配高于 500 的优先级。例如，如果你不使用 Fleet 或 Elastic Agent，并且想为 `logs-*` 索引模式创建模板，请将模板的优先级设为 500。这可确保你的模板被应用，而不是内置的 `logs-*-` 模板。
- 为避免与内置及 Fleet 管理的索引模板发生命名冲突，请避免在自己的索引模板名称中使用 `@`。

## 创建索引模板

使用[创建或更新索引模板 API](/rest_apis/index_apis/create_or_update_index_template) 和[创建或更新组件模板 API](/rest_apis/index_apis/create_or_update_component_template) 来创建和更新索引模板。你也可以在 Kibana 的 [Stack Management](https://www.elastic.co/guide/en/kibana/current/index-management.html) 中管理索引模板。

以下请求创建了两个组件模板。

```bash
PUT _component_template/component_template1
{
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}

PUT _component_template/runtime_component_template
{
  "template": {
    "mappings": {
      "runtime": {
        "day_of_week": {
          "type": "keyword",
          "script": {
            "source": "emit(doc['@timestamp'].value.dayOfWeekEnum.getDisplayName(TextStyle.FULL, Locale.ENGLISH))"
          }
        }
      }
    }
  }
}
```

此组件模板在新建索引匹配模板时，向映射添加一个名为 `day_of_week` 的[运行时字段](/mapping/runtime)。

以下请求创建一个由这些组件模板组成的索引模板。

```bash
PUT _index_template/template_1
{
  "index_patterns": ["te*", "bar*"],
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": true
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        },
        "created_at": {
          "type": "date"
        }
      }
    },
    "aliases": {
      "mydata": { }
    }
  },
  "priority": 500,
  "composed_of": ["component_template1", "runtime_component_template"],
  "version": 3,
  "_meta": {
    "description": "my custom"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-templates.html)
