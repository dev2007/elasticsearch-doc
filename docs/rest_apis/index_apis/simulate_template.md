# 模拟索引模板 API

返回将由特定[索引模板](/index_templates/index_templates)应用的索引配置。

```bash
POST /_index_template/_simulate/template_1
```

## 请求

`POST /_index_template/_simulate/<index-template>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。

## 路径参数

- `<index-template>`

（可选，字符串）待模拟的索引模板名字。为了在将模板配置添加到集群之前测试模板配置，请省略此参数并在请求体中指定模板配置。

## 查询参数

- `create`

（可选，布尔值）如果为 `true`，则仅当没有与相同索引模式匹配的现有模板时，才会使用请求体中传递的模板。如果为 `false`，模拟将使用具有最高优先级的模板。请注意，无论哪种情况，模板都不会永久添加或更新；它仅用于模拟。默认为 `false`。

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `data_stream`

  （可选，对象）如果包含此对象，则模板用于创建数据流及其备份索引。支持空对象。
  
  数据流需要与 `data_stream` 对象匹配的索引模板。请参见[创建索引模板](/rest_apis/index_apis/create_or_update_index_template)。

  - `data_stream` 属性

    - `hidden`

      （可选，布尔值）如果为 `true`，数据流是[隐藏的](/rest_apis/api_convention/multi_target_syntax#隐藏数据流和索引)。默认为 `false`。

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

            （可选，布尔值）如果为 `true`，别名是[隐藏的](/rest_apis/api_conventions/multi-target_syntax#隐藏数据流和索引)。默认为 `false`。别名所有的索引必须有相同的 `is_hidden` 值。

          - `is_write_index`

            （可选，布尔值）如果为 `true`，索引是别名的[写索引](/rest_apis/index_apis/aliases#写索引)。默认为 `false`。

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

## 响应体

- `overlapping`
  
  （数组）被指定模板取代的任何模板。
  
  - `overlapping` 属性

    - `name`

      （字符串）被取代模板的名字

    - `index_patterns`

      （数组）被取代模板将会应用的索引模式。

- `template`

  （对象）将应用于索引的设置、映射和别名。

  - `template` 属性

    - `aliases`

      （必需，对象）索引的别名。如果索引模板包含 `data_stream`，则不支持此参数。

      - `aliases` 对象属性

        - `<alias>`

          （必需，对象）键值是别名名称。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

          对象体包含别名的选项。支持一个空对象。

          - `<alias>` 属性

          - `filter`

          （可选，查询 DSL 对象）用于限制别名查询时可以访问的文档。

          - `index_routing`

          （可选，字符串）用于将索引操作路由到特定分片的值。如果指定，这将覆盖索引操作的路由值。

          - `is_hidden`

          （可选，布尔值）如果为 `true`，别名是[隐藏的](/rest_apis/api_conventions/multi-target_syntax#隐藏数据流和索引)。默认为 `false`。别名所有的索引必须有相同的 `is_hidden` 值。

          - `is_write_index`

          （可选，布尔值）如果为 `true`，索引是别名的[写索引](/rest_apis/index_apis/aliases#写索引)。默认为 `false`。

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

      如果不应用映射，响应中将会忽略。

    - `settings`

      (可选，[索引设置对象](/index_modules#索引设置))索引的配置选项。参阅[索引设置](/index_modules#索引设置)。

## 示例

### 模拟已有模板

以下示例创建并模拟一个组合模板：

```bash
PUT /_component_template/ct1
{
  "template": {
    "settings": {
      "index.number_of_shards": 2
    }
  }
}

PUT /_component_template/ct2
{
  "template": {
    "settings": {
      "index.number_of_replicas": 0
    },
    "mappings": {
      "properties": {
        "@timestamp": {
          "type": "date"
        }
      }
    }
  }
}

PUT /_index_template/final-template
{
  "index_patterns": ["my-index-*"],
  "composed_of": ["ct1", "ct2"],
  "priority": 5
}

POST /_index_template/_simulate/final-template
```

1. `PUT /_component_template/ct1`：创建一个组合模板（`ct1`），设置分片为 2。
2. `PUT /_component_template/ct2`：创建一个组合模板（`ct2`），设置复本为 0，并定义一个映射。
3. `PUT /_index_template/final-template`：创建一个索引模板（`final-template`），用于组合模板。
4. `POST /_index_template/_simulate/final-template`：展示应用于 `final-template` 的配置。

响应显示 `final-template` 应用的索引设置、映射和别名：

```bash
{
  "template" : {
    "settings" : {
      "index" : {
        "number_of_shards" : "2",  
        "number_of_replicas" : "0"
      }
    },
    "mappings" : {
      "properties" : {
        "@timestamp" : {
          "type" : "date"
        }
      }
    },
    "aliases" : { }
  },
  "overlapping" : [ ]
}
```

1. `"number_of_shards" : "2"`：来自 `ct1` 的分片数量
2. `"number_of_replicas" : "0"`：来自 `ct2` 的复本数量
3. `"mappings"`：来自 `ct1` 的映射

### 模拟任意模板配置

要在将模板添加到集群之前查看模板将应用哪些设置，可以在请求正文中传递模板配置。如果指定的模板的优先级高于现有模板，则该模板将用于模拟。

```bash
POST /_index_template/_simulate
{
  "index_patterns": ["my-index-*"],
  "composed_of": ["ct2"],
  "priority": 10,
  "template": {
    "settings": {
      "index.number_of_replicas": 1
    }
  }
}
```

响应显示优先级较低的任何重叠模板。

```bash
{
  "template" : {
    "settings" : {
      "index" : {
        "number_of_replicas" : "1"
      }
    },
    "mappings" : {
      "properties" : {
        "@timestamp" : {
          "type" : "date"
        }
      }
    },
    "aliases" : { }
  },
  "overlapping" : [
    {
      "name" : "final-template",
      "index_patterns" : [
        "my-index-*"
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-simulate-template.html)
