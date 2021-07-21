# 创建或更新索引模板 API

创建或更新一个索引模板。索引模板定义了可以自动用于新索引的[设置](/index_modules/index_modules?id=索引设置)、[映射](/mapping/mapping)和[别名](/rest_apis/index_apis/aliases)。

```bash
PUT /_index_template/template_1
{
  "index_patterns" : ["te*"],
  "priority" : 1,
  "template": {
    "settings" : {
      "number_of_shards" : 2
    }
  }
}
```

## 请求

`PUT /_index_template/<index-template>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)。

## 描述

Elasticsearch 基于通配符模式来匹配索引名字，将模板应用于相应的新索引。

索引模板通过数据流或索引创建时应用。对数据流而言，当数据流的备份索引创建时，这些设置和映射会被应用。在[创建索引]((/rest_apis/index_apis/create_index)请求中指定的设置和映射会重载索引模板中指定的任意设置或映射。

修改索引模板不会影响已有的索引，包括数据流已有的备份索引。

### 索引模板中的注释

你可以在索引模板中使用 C 风格的 /* */ 块注释。除了在大括号之前，你可以在请求体任何地方包含注释。

## 路径参数

- `<index-template>`

（必需，字符串）待创建索引模板名字。

## 查询参数

- `create`

（可选，布尔值）如果为 `true`，此请求不会替代或更新已有的索引模板。默认为 `false`。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `composed_of`

（可选，字符串数组）一个组件模板名称的有序列表。组件模板按指定的顺序合并，这意味着最后指定的组件模板具有最高的优先级。参阅[组合多个组件模板](/rest_apis/index_apis/create_or_update_index_template?id=组合别名、映射和设置)查看示例。

- `data_stream`

  （可选，对象）如果这个对象被包含了，那么这个模板将会用于创建数据流和他们的备份索引。支持一个空对象。

  数据流必须有 `data_stream` 对象来匹配索引模板。参阅[创建索引模板](/data_streams/set_up_a_data_stream/set_up_a_data_stream?id=第-3-步.创建索引模板)。

  - `data_stream` 属性  
    - `hidden`

    （可选，字符串）如果为 `true`，数据流是[隐藏的](/rest_apis/api_conventions/multi-target_syntax?id=隐藏数据流和索引)。默认为 `false`。
- `index_patterns`

  （必需的，字符串数组）用于在创建时匹配数据流和索引名字的通配符（*）表达式数组。

  Elasticsearch 包含几个内置的索引模板。为了避免这些模板的命名冲突，参阅[避免索引模式冲突](/index_templates/index_templates)。

- `_meta`

  （可选，对象）关于索引模板的可选用户元数据。可以有任意内容。Elasticsearch 不会自动生成此信息。

- `priority`

  （可选，整数）用于在创建新数据流或索引时确定索引模板的优先级。具有最高优先级的索引模板先被选择。如果未指定优先级，则将模板视为优先级为 0（最低优先级）。Elasticsearch 不会自动生成此值。

- `template`

  （可选，对象）要应用的模板。它可以选择包括别名、映射或设置配置。

  - `template` 属性

    - `aliases`

      （可选，对象）索引的别名。如果索引模板包含了 `data_stream`，此参数不被支持。

      - `aliases` 对象属性

        - `<alias>`

        （必需，对象）键值是别名名称。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

        对象体包含别名的选项。支持空对象。

        - `<alias>` 属性

          - `filter`

            （可选，查询 DSL 对象）用于限制别名查询时可以访问的文档。

          - `index_routing`

            （可选，字符串）用于将索引操作路由到特定分片的值。如果指定，这将覆盖索引操作的路由值。

          - `is_hidden`

            （可选，布尔值）如果为 `true`，别名是[隐藏的](/rest_apis/api_conventions/multi-target_syntax?id=隐藏数据流和索引)。默认为 `false`。别名所有的索引必须有相同的 `is_hidden` 值。

          - `is_write_index`

            （可选，布尔值）如果为 `true`，索引是别名的[写索引](/rest_apis/index_apis/aliases?id=写索引)。默认为 `false`。

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

- `version`

  （可选，整数）用于外部管理索引模板的版本号。Elasticsearch 不会自动生成此值。

## 示例

### 带索引别名的索引模板

你可以在索引模板中包含[索引别名](/rest_apis/index_apis/bulk_index_alias)。

```bash
PUT _index_template/template_1
{
  "index_patterns" : ["te*"],
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

- `"{index}-alias" : {}`：在索引创建期间，别名中的 `{index}` 占位符将替换为模板应用到的实际索引名称。

### 多匹配模拟

如果多个索引模板与新索引或数据流的名称匹配，则使用具有最高优先级的模板。例如：

```bash
PUT /_index_template/template_1
{
  "index_patterns" : ["t*"],
  "priority" : 0,
  "template": {
    "settings" : {
      "number_of_shards" : 1,
      "number_of_replicas": 0
    },
    "mappings" : {
      "_source" : { "enabled" : false }
    }
  }
}

PUT /_index_template/template_2
{
  "index_patterns" : ["te*"],
  "priority" : 1,
  "template": {
    "settings" : {
      "number_of_shards" : 2
    },
    "mappings" : {
      "_source" : { "enabled" : true }
    }
  }
}
```

对于以 `te*` 开头的索引，将启用 `_source`，索引将有两个主分片和一个副本，因为只会应用 `template_2`。

?> 不允许有相同优先级且索引模式重合的多个模板，且在尝试创建一个模板，而它与现有索引模板匹配具有相同优先级时，将引发错误。

### 模板版本

可以使用 `version` 参数向索引模板添加版本号。外部系统可以使用这些版本号来简化模板管理。

`version` 参数是可选的，Elasticsearch 不自动生成也不使用。

若要取消设置 `version`，请在不指定它的情况下替换模板。

```bash
PUT /_index_template/template_1
{
  "index_patterns" : ["foo", "bar"],
  "priority" : 0,
  "template": {
    "settings" : {
        "number_of_shards" : 1
    }
  },
  "version": 123
}
```

为了检查 `version`，你可以使用[获取索引模板](/rest_apis/index_apis/get_index_template) API。

### 模板元数据

你可以使用 `_meta` 参数向索引模板添加任意元数据。这个用户定义的对象存储在集群状态下，因此最好保持它内容简短。

`_meta` 参数是可选的，Elasticsearch 不自动生成也不使用。

若要取消设置 `_meta`，请在不指定它的情况下替换模板。

```bash
PUT /_index_template/template_1
{
  "index_patterns": ["foo", "bar"],
  "template": {
    "settings" : {
        "number_of_shards" : 3
    }
  },
  "_meta": {
    "description": "set number of shards to three",
    "serialization": {
      "class": "MyIndexTemplate",
      "id": 17
    }
  }
}
```

为了检查 `_meta`，你可以使用[获取索引模板](/rest_apis/index_apis/get_index_template) API。

### 数据流定义

要对数据流使用索引模板，该模板必须包含 `data_stream` 对象。

```bash
PUT /_index_template/template_1
{
  "index_patterns": ["logs-*"],
  "data_stream": { }
}
```

参阅[创建索引模板](/data_streams/set_up_a_data_stream/set_up_a_data_stream?id=第-3-步.创建索引模板)。

### 合并别名、映射和设置

当在索引模板的 `composed_of` 字段中指定多个组件模板时，它们将按指定的顺序合并，这意味着后面的组件模板覆盖早期的组件模板。下一步将合并父索引模板中的任何映射、设置或别名。最后，将合并索引请求本身的任何配置。

在本例中，两个组件模板的顺序会更改索引的分片数：

```bash
PUT /_component_template/template_with_2_shards
{
  "template": {
    "settings": {
      "index.number_of_shards": 2
    }
  }
}

PUT /_component_template/template_with_3_shards
{
  "template": {
    "settings": {
      "index.number_of_shards": 3
    }
  }
}

PUT /_index_template/template_1
{
  "index_patterns": ["t*"],
  "composed_of": ["template_with_2_shards", "template_with_3_shards"]
}
```

在这种情况下，匹配 `t*` 的索引将有三个主分片。如果组合模板的顺序颠倒，索引将有两个主分片。

映射定义递归合并，这意味着以后的映射组件可以引入新的字段映射并更新映射配置。如果一个字段映射已经包含在早期组件中，那么它的定义将被后面的组件完全覆盖。

这种递归合并策略不仅适用于字段映射，还适用于根选项，如 `dynamic_templates` 和 `meta`。如果早期组件包含 `dynamic_templates` 块，则默认情况下，新的 `dynamic_templates` 条目将附加到末尾。如果已经存在具有相同键的条目，则该条目将被新定义覆盖。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-put-template.html)
