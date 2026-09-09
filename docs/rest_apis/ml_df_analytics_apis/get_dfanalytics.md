# 获取数据帧分析作业信息 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习数据帧分析 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-dfa)。

:::::

检索数据帧分析作业的配置信息。

## 请求

```bash
GET _ml/data_frame/analytics/<data_frame_analytics_id>
```

```bash
GET _ml/data_frame/analytics/<data_frame_analytics_id>,<data_frame_analytics_id>
```

```bash
GET _ml/data_frame/analytics/
```

```bash
GET _ml/data_frame/analytics/_all
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

你可以通过使用逗号分隔的数据帧分析作业列表或通配符表达式在单个 API 请求中获取多个数据帧分析作业的信息。

## 路径参数

- `<data_frame_analytics_id>`

  （可选，字符串）数据帧分析作业的标识符。如果不指定此选项，API 返回前一百个数据帧分析作业的信息。

  你可以通过使用 `_all`、将 `*` 指定为 `<data_frame_analytics_id>`，或省略 `<data_frame_analytics_id>` 来获取所有数据帧分析作业的信息。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的数据帧分析作业。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空 `data_frame_analytics` 数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `exclude_generated`

  （可选，布尔值）指示是否在检索时从配置中移除某些字段。这使配置处于可接受的格式，便于检索后添加到另一个集群。默认为 `false`。

- `from`

  （可选，整数）跳过指定数量的数据帧分析作业。默认为 0。

- `size`

  （可选，整数）指定获取的数据帧分析作业的最大数量。默认为 100。

## 响应体

- `data_frame_analytics`

  （数组）数据帧分析作业资源数组，按 `id` 值升序排列。

  数据帧分析作业资源的属性：

  - `analysis`

    （对象）对源执行的分析类型。有关有效分析配置，请参阅[创建数据帧分析作业 API](./put_dfanalytics)。

  - `analyzed_fields`

    （对象）包含 `includes` 和/或 `excludes` 模式，用于选择分析中包含的字段。

    `analyzed_fields` 的属性：

    - `excludes`（可选，数组）定义从分析中排除的字段的字符串数组。
    - `includes`（可选，数组）定义分析中包含的字段的字符串数组。

  - `authorization`

    （对象）作业运行查询时使用的安全权限。如果在最近一次更新作业时禁用了 Elastic Stack 安全功能，则省略此属性。

    `authorization` 的属性：

    - `api_key`（对象）如果最近一次更新作业时使用了 API 密钥，其名称和标识符会列在响应中。
      - `id`（字符串）API 密钥的标识符。
      - `name`（字符串）API 密钥的名称。
    - `roles`（字符串数组）如果最近一次更新作业时使用了用户 ID，其更新时的角色列在响应中。
    - `service_account`（字符串）如果最近一次更新作业时使用了服务账户，账户名列在响应中。

  - `dest`

    （对象）分析的目标配置。

    `dest` 的属性：

    - `index`（字符串）存储数据帧分析作业结果的目标索引。
    - `results_field`（字符串）存储分析结果的字段名称。默认为 `ml`。

  - `id`

    （字符串）数据帧分析作业的唯一标识符。

  - `model_memory_limit`

    （字符串）为数据帧分析作业设置的 `model_memory_limit`。

  - `source`

    （对象）分析数据的来源配置。包含 `index` 参数，可选择包含 `query` 和 `_source`。

    `source` 的属性：

    - `index`（数组）执行分析的索引。可以是单个索引或索引模式，也可以是索引或模式的数组。
    - `query`（对象）为数据帧分析作业指定的查询。Elasticsearch 查询领域特定语言（DSL）。此值对应于 Elasticsearch 搜索 POST 请求体中的查询对象。默认为 `{"match_all": {}}`。
    - `_source`（对象）包含指定的 `includes` 和/或 `excludes` 模式，用于选择目标中存在的字段。排除的字段不能包含在分析中。

      `_source` 的属性：

      - `excludes`（数组）定义从目标中排除的字段的字符串数组。
      - `includes`（数组）定义目标中包含的字段的字符串数组。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例获取 `loganalytics` 数据帧分析作业的配置信息：

```bash
GET _ml/data_frame/analytics/loganalytics
```

API 返回以下结果：

```json
{
  "count" : 1,
  "data_frame_analytics" : [
    {
      "id" : "loganalytics",
      "create_time" : 1656364565517,
      "version" : "8.4.0",
      "authorization" : {
        "roles" : [
          "superuser"
        ]
      },
      "description" : "Outlier detection on log data",
      "source" : {
        "index" : [
          "logdata"
        ],
        "query" : {
          "match_all" : { }
        }
      },
      "dest" : {
        "index" : "logdata_out",
        "results_field" : "ml"
      },
      "analysis" : {
        "outlier_detection" : {
          "compute_feature_influence" : true,
          "outlier_fraction" : 0.05,
          "standardization_enabled" : true
        }
      },
      "model_memory_limit" : "1gb",
      "allow_lazy_start" : false,
      "max_num_threads" : 1
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-dfanalytics.html)
