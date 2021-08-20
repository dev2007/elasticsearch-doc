# 模板索引 API

!> 此功能是实验性的，在将来的版本中可能会完全更改或删除。Elastic 将尽最大努力解决任何问题，但实验性功能不受官方 GA 功能支持 SLA 的约束。

从已有的[索引模板](/index_tempates/index_templates)中返回可能应用于指定索引的索引配置。

```bash
POST /_index_template/_simulate_index/my-index-000001
```

## 请求

`POST /_index_template/_simulate_index/<index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你使用此 API 必须有 `manage_index_templates` 或 `manage` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=集群权限)。

## 路径参数

- `<index>`
（必需，字符串）待模拟的索引名字

## 查询参数

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 响应体

- `overlapping`
  
  （数组）也与索引匹配的任意模板，但会被更高优先级模板取代。如果没有重叠（overlapping）模板，则响应包含空数组。
  
  - `overlapping` 属性

    - `name`

      （字符串）被取代模板的名字

    - `index_patterns`

      （数组）被取代模板将会应用的索引模式。

- `template`

  （对象）将应用于索引的设置、映射和别名。

  - `template` 属性

    - `aliases`

      （对象）索引的别名。如果索引模板包含 `data_stream`，则不支持此参数。

      - `<alias>`

        （必需，对象）键值是别名名称。对象体包含别名的选项。

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

      如果不应用映射，响应中将会忽略。

    - `settings`

      (可选，[索引设置对象](/index_modules/index_modules?id=索引设置))索引的配置选项。参阅[索引设置](/index_modules/index_modules?id=索引设置)。

      如果不应用设置，响应将包含一个空对象。

## 示例

以下示例显示了现有模板将应用于 `my-index-000001` 的配置。

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

POST /_index_template/_simulate_index/my-index-000001
```

1. `PUT /_component_template/ct1`：创建一个组件模板（`ct1`），设置分片数为 2。
2. `PUT /_component_template/ct2`：创建第二个组件模板（`ct2`），设置分片数为 0，并定义映射。
3. `PUT /_index_template/final-template`：使用模板组件创建索引模板（`final-template`）。
4. `POST /_index_template/_simulate_index/my-index-000001`：展示将应用于 `my-index-000001` 的配置。

响应展示被 `final-template` 应用的索引设置、映射和别名：

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
  "overlapping" : [
    {
      "name" : "template_1",
      "index_patterns" : [
        "my-index-*"
      ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-simulate-index.html)
