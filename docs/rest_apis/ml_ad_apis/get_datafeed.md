# 获取数据源 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [机器学习异常检测 API](https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-ml-ad)。

:::::

检索数据源的配置信息。

## 请求

```bash
GET _ml/datafeeds/<feed_id>
```

```bash
GET _ml/datafeeds/<feed_id>,<feed_id>
```

```bash
GET _ml/datafeeds/
```

```bash
GET _ml/datafeeds/_all
```

## 前置条件

- 需要 `monitor_ml` [集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)。此权限包含在 `machine_learning_user` 内置角色中。

## 描述

此 API 最多返回 10000 个数据源。

## 路径参数

- `<feed_id>`

  （可选，字符串）数据源的标识符。可以是数据源标识符或通配符表达式。

  你可以通过使用逗号分隔的数据源列表或通配符表达式在单个 API 请求中获取多个数据源的信息。你可以通过使用 `_all`、将 `*` 指定为数据源标识符，或省略标识符来获取所有数据源的信息。

## 查询参数

- `allow_no_match`

  （可选，布尔值）指定当请求出现以下情况时的行为：

  - 包含通配符表达式且没有匹配的数据源。
  - 包含 `_all` 字符串或不包含标识符且没有匹配项。
  - 包含通配符表达式且只有部分匹配。

  默认值为 `true`，当没有匹配项时返回空数据源数组，有部分匹配时返回结果的子集。如果此参数为 `false`，当没有匹配项或只有部分匹配时，请求返回 404 状态码。

- `exclude_generated`

  （可选，布尔值）指示是否在检索时从配置中移除某些字段。这使配置处于可接受的格式，便于检索后添加到另一个集群。默认为 `false`。

## 响应体

API 返回数据源资源数组。有关完整的属性列表，请参阅[创建数据源 API](./put_datafeed)。

## 响应码

- 404（缺少资源）：如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例检索名为 `datafeed-high_sum_total_sales` 的数据源的配置信息：

```bash
GET _ml/datafeeds/datafeed-high_sum_total_sales
```

API 返回以下结果：

```json
{
  "count" : 1,
  "datafeeds" : [
    {
      "datafeed_id" : "datafeed-high_sum_total_sales",
      "job_id" : "high_sum_total_sales",
      "authorization" : {
        "roles" : [
          "superuser"
        ]
      },
      "query_delay" : "93169ms",
      "chunking_config" : {
        "mode" : "auto"
      },
      "indices_options" : {
        "expand_wildcards" : [
          "open"
        ],
        "ignore_unavailable" : false,
        "allow_no_indices" : true,
        "ignore_throttled" : true
      },
      "query" : {
        "bool" : {
          "filter" : [
            {
              "term" : {
                "event.dataset" : "sample_ecommerce"
              }
            }
          ]
        }
      },
      "indices" : [
        "kibana_sample_data_ecommerce"
      ],
      "scroll_size" : 1000,
      "delayed_data_check_config" : {
        "enabled" : true
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ml-get-datafeed.html)
