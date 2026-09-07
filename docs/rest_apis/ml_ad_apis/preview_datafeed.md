# 预览数据源 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

预览数据源。

## 请求

```bash
GET _ml/datafeeds/<datafeed_id>/_preview
```

```bash
POST _ml/datafeeds/<datafeed_id>/_preview
```

```bash
GET _ml/datafeeds/_preview
```

```bash
POST _ml/datafeeds/_preview
```

## 前置条件

- 需要以下权限：
  - 集群：`manage_ml`（`machine_learning_admin` 内置角色授予此权限）— [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)
  - 数据源中配置的源索引：读取[权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

预览数据源 API 返回数据源搜索结果的第一"页"。你可以预览现有数据源，或在 API 中提供数据源和异常检测作业的配置详情。预览显示将传递给异常检测引擎的数据结构。

当启用了 Elasticsearch 安全功能时，数据源查询使用调用预览数据源 API 的用户的凭据进行预览。当数据源启动时，它使用最后创建或更新它的用户的角色运行查询。如果两组角色不同，预览可能无法准确反映数据源启动时返回的内容。为避免此类问题，创建或更新数据源的同一用户应预览它以确保返回预期数据。或者，使用辅助授权头提供凭据。

## 路径参数

- `<datafeed_id>`

  （可选，字符串）唯一标识数据源的数字字符串。此标识符可以包含小写字母数字字符（a-z 和 0-9）、短横线和下划线。必须以字母数字字符开头和结尾。

  如果将 `<datafeed_id>` 作为路径参数提供，则不能在请求体中提供数据源或异常检测作业的配置详情。

## 查询参数

- `end`

  （可选，字符串）数据源预览的结束时间。由于仅返回结果的第一页，预览可能不会到达提供值的末尾。时间可以使用以下格式之一指定：

  - 带毫秒的 ISO 8601 格式，例如 `2017-01-22T06:00:00.000Z`
  - 不带毫秒的 ISO 8601 格式，例如 `2017-01-22T06:00:00+00:00`
  - 自纪元以来的毫秒数，例如 `1485061200000`

  使用 ISO 8601 格式的日期时间参数必须包含时区标识符，其中 `Z` 被接受为 UTC 时间的缩写。

  当期望使用 URL 时（例如在浏览器中），时区标识符中使用的 `+` 必须编码为 `%2B`。

  此值不包含在内。

- `start`

  （可选，字符串）数据源预览的开始时间，可以使用与 `end` 参数相同的格式指定。此值包含在内。

  如果不提供 `start` 或 `end` 参数，数据源预览将搜索整个数据时间范围，但排除冷或冻结数据层中的数据。

## 请求体

- `datafeed_config`

  （可选，对象）要预览的数据源定义。有关有效定义，请参阅[创建数据源 API](./put_datafeed)。

- `job_config`

  （可选，对象）与数据源关联的异常检测作业的配置详情。如果 `datafeed_config` 对象不包含引用现有异常检测作业的 `job_id`，则必须提供此 `job_config` 对象。如果同时包含 `job_id` 和 `job_config`，则使用后者信息。除非同时提供 `datafeed_config` 对象，否则无法指定 `job_config` 对象。有关有效定义，请参阅[创建异常检测作业 API](./put_job)。

## 示例

以下示例提供现有数据源的 ID：

```bash
GET _ml/datafeeds/datafeed-high_sum_total_sales/_preview
```

此示例返回的数据如下：

```json
[
  {
    "order_date" : 1574294659000,
    "category.keyword" : "Men's Clothing",
    "customer_full_name.keyword" : "Sultan Al Benson",
    "taxful_total_price" : 35.96875
  },
  {
    "order_date" : 1574294918000,
    "category.keyword" : [
      "Women's Accessories",
      "Women's Clothing"
    ],
    "customer_full_name.keyword" : "Pia Webb",
    "taxful_total_price" : 83.0
  },
  {
    "order_date" : 1574295782000,
    "category.keyword" : [
      "Women's Accessories",
      "Women's Shoes"
    ],
    "customer_full_name.keyword" : "Brigitte Graham",
    "taxful_total_price" : 72.0
  }
]
```

以下示例在 API 中提供数据源和异常检测作业的配置详情：

```json
POST _ml/datafeeds/_preview
{
  "datafeed_config": {
    "indices" : [
      "kibana_sample_data_ecommerce"
    ],
    "query" : {
      "bool" : {
        "filter" : [
          {
            "term" : {
              "_index" : "kibana_sample_data_ecommerce"
            }
          }
        ]
      }
    },
    "scroll_size" : 1000
  },
  "job_config": {
    "description" : "Find customers spending an unusually high amount in an hour",
    "analysis_config" : {
      "bucket_span" : "1h",
      "detectors" : [
        {
          "detector_description" : "High total sales",
          "function" : "high_sum",
          "field_name" : "taxful_total_price",
          "over_field_name" : "customer_full_name.keyword"
        }
      ],
      "influencers" : [
        "customer_full_name.keyword",
        "category.keyword"
      ]
    },
    "analysis_limits" : {
      "model_memory_limit" : "10mb"
    },
    "data_description" : {
      "time_field" : "order_date",
      "time_format" : "epoch_ms"
    }
  }
}
```

此示例返回的数据如下：

```json
[
  {
    "order_date" : 1574294659000,
    "category.keyword" : "Men's Clothing",
    "customer_full_name.keyword" : "Sultan Al Benson",
    "taxful_total_price" : 35.96875
  },
  {
    "order_date" : 1574294918000,
    "category.keyword" : [
      "Women's Accessories",
      "Women's Clothing"
    ],
    "customer_full_name.keyword" : "Pia Webb",
    "taxful_total_price" : 83.0
  },
  {
    "order_date" : 1574295782000,
    "category.keyword" : [
      "Women's Accessories",
      "Women's Shoes"
    ],
    "customer_full_name.keyword" : "Brigitte Graham",
    "taxful_total_price" : 72.0
  }
]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-preview-datafeed.html)
