# 创建或更新组件模板 API

创建或更新组件模板。组件模板是构造[索引模板](/index_templates/index_templates)的构建块，用于指定索引[映射](/mapping/mapping)、[设置](/index_modules)和[别名](/aliases)。

```bash
PUT _component_template/template_1
{
  "template": {
    "settings": {
      "number_of_shards": 1
    },
    "mappings": {
      "_source": {
        "enabled": false
      },
      "properties": {
        "host_name": {
          "type": "keyword"
        },
        "created_at": {
          "type": "date",
          "format": "EEE MMM dd HH:mm:ss Z yyyy"
        }
      }
    }
  }
}
```

## 请求

`PUT /_component_template/<component-template>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。

## 描述

索引模板可以由多个组件模板组成。要使用组件模板，请在索引模板的 `composed_of` 列表中指定它。组件模板仅作为匹配索引模板的一部分应用于新数据流和索引。

直接在索引模板或[创建索引](/rest_apis/index_apis/create_index)请求中指定设置和映射，将覆盖组件模板中指定的任何设置或映射。

组件模板仅在创建索引期间使用。对于数据流，包括创建数据流和创建流的备份索引。对组件模板的更改不会影响现有索引，包括流的备份索引。

## 组件模板中的备注

你可以在索引模板中使用 C 风格的 /* */ 块注释。除了在大括号之前，你可以在请求体任何地方包含注释。

## 路径参数

- `<component-template>`

（必需，字符串）待创建的组件模板名字

> Elasticsearch 包含以下内置的组件模板：
> - logs-mappings
> - logs-settings
> - metrics-mappings
> - metrics-settings
> - synthetics-mapping
> - synthetics-settings
> 
> [Elastic 代理](https://www.elastic.co/guide/en/fleet/7.14/fleet-overview.html) 使用这些模板为其数据流配置备份索引。如果使用 Elastic 代理，并希望覆盖其中一个模板，请将替换模板的版本设置为高于当前版本。
> 
> 如果你不使用 Elastic 代理，又想禁用内置的组件和索引模板，通过[集群更新设置 API](/rest_apis/cluster_apis/cluster_update_settings.html)设置 `stack.templates.enabled` 为 `false`。

## 查询参数

- `create`

（可选，布尔值）如果为 `true`，请求不会覆盖或更新已有组件模板。默认为 `false`。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `template`

  （必需，对象）将应用的模板，可包括映射（`mappings`）、设置（`settings`）或别名（`aliases`）配置。

  - `template` 属性
    - `aliases`

      （可选，对象）索引的别名。如果索引模板包含数据流(`data_stream`)，此参数不支持。
      - `aliases` 对象属性
        - `<alias>`

          （必需，对象）键为别名名字。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。
          对象体包含别名的选项。支持空对象。
          - `<alias>` 属性
            - `filter`

              （可选，[查询 DSL 对象](/query_dsl/query_dsl)）用于限制别名查询时可以访问的文档。
            - `index_routing`

              （可选，字符串）用于将索引操作路由到特定分片的值。如果指定，这将覆盖索引操作的路由值。
            - `is_hidden`

              （可选，布尔值）如果为 `true`，别名是[隐藏的](/rest_apis/api_conventions/multi-target_syntax#隐藏数据流和索引)。默认为 `false`。别名所有的索引必须有相同的 `is_hidden` 值。
            - `is_write_index`

              （可选，布尔值）如果为 `true`，索引是别名的[写索引](/rest_apis/index_apis/aliases#写索引)。默认为`false`。
            - `routing`

              （可选，字符串）用于将索引和搜索操作路由到特定分片的值。
            - `search_routing`

              （可选，字符串）用于将搜索操作路由到特定分片的值。如果指定，这将覆盖搜索操作的 `routing` 值。
    - `mappings`

      （可选，[映射对象](/mapping/mapping)）索引中字段的映射。如果指定，此映射可以包括：
      - 字段名字
      - [字段数据类型](/mapping/filed_data_types/filed_data_types)
      - [映射参数](/mapping/mapping_parameters/mapping_parameters)

      参阅[映射](/mapping/mapping)。
    - `settings`
      （可选，[索引设置对象](/index_modules#索引设置)）索引配置选项。参阅[索引设置](/index_modules#索引设置)。
- `version`

  （可选，整数）用于显式管理组件模板的版本号。Elasticsearch 不会自动生成或增加此数字。

- `allow_auto_create`

  （可选，布尔值）此设置覆盖了集群设置中的 [`action.auto_create_index`](/rest_apis/document_apis/esindex#自动创建数据流和索引) 的值。如果在模板中设置为 `true`，即使通过 `actions.auto_create_index` 禁用了自动创建索引，索引也能通过这个模板自动创建。如果设置为 `false`，匹配模板的索引或数据流必须被显示创建，且可能永远不会被自动创建。

- `_meta`

  （可选，对象）可选的有关组件模板的用户元数据。可以有任何内容。Elasticsearch 不会自动生成此内容。

## 示例

### 带索引别名的组件模板

你可以在组件模板中包含[索引别名](/aliases)。

```bash
PUT _component_template/template_1
{
  "template": {
    "settings" : {
        "number_of_shards" : 1
    },
    "aliases" : {
        "alias1" : {},
        "alias2" : {
            "filter" : {
                "term" : {"user.id" : "kimchy" }
            },
            "routing" : "shard-1"
        },
        "{index}-alias" : {}
    }
  }
}
```

- `"{index}-alias" : {}`： 在别名中的 `{index}` 占位符，会在索引创建时应用模板时，替换为真实的索引名字。

### 应用组件模板

不能直接将组件模板应用于数据流或索引。若要应用，组件模板必须包含在索引模板的 `composed_of` 列表中。参阅[索引模板](/index_templates/index_templates)。

### 组件模板版本控制

可以使用 `version` 参数向组件模板添加版本号。外部系统可以使用这些版本号来简化模板管理。

`version` 参数是可选的，Elasticsearch 不会自动生成或使用它。

若要取消设置 `version`，请在不指定模板的情况下替换模板。

```bash
PUT /_component_template/template_1
{
  "template": {
    "settings" : {
        "number_of_shards" : 1
    }
  },
  "version": 123
}
```

为了检查 `version`，你可以使用[获取组件模板 API](/rest_apis/index_apis/get_component_template)。

### 组件模板元数据

你可以使用 `_meta` 参数向组件模板添加任意元数据。此用户定义的对象存储在集群状态，因此最好保持其简短。

`_meta` 参数是可选的，Elasticsearch 不会自动生成或使用它。

要取消设置 `_meta`，请在不指定模板的情况下替换模板。

```bash
PUT /_component_template/template_1
{
  "template": {
    "settings" : {
        "number_of_shards" : 1
    }
  },
  "_meta": {
    "description": "set number of shards to one",
    "serialization": {
      "class": "MyComponentTemplate",
      "id": 10
    }
  }
}
```

为了检查 `_meta`，你可以使用[获取组件模板 API](/rest_apis/index_apis/get_component_template)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-component-template.html)
