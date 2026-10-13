# 获取转换 API

检索转换的配置信息。

```txt
GET _transform/<transform_id>
GET _transform/<transform_id>,<transform_id>
GET _transform/
GET _transform/_all
GET _transform/*
```

## 前置条件

- 需要 `monitor_transform` 集群权限。该权限包含在内置角色 `transform_user` 中。

## 描述

你可以使用逗号分隔的标识符列表或通配符表达式，在单个 API 请求中获取多个转换的信息。可以使用 `_all`、将 `<transform_id>` 指定为 `*` 或省略 `<transform_id>` 来获取所有转换的信息。

## 路径参数

`<transform_id>`

（可选，字符串）转换的标识符。可以是转换标识符或通配符表达式。如果未指定，此 API 将返回所有转换的信息。

## 查询参数

`allow_no_match`

（可选，布尔值）指定当请求出现以下情况时的处理方式：包含通配符表达式但没有匹配的转换；包含 `_all` 或未指定标识符且没有匹配项；包含通配符表达式但只有部分匹配。默认为 `true`：当没有匹配项时返回空的 `transforms` 数组，对于部分匹配则返回结果的子集。如果为 `false`，则当没有匹配项或只有部分匹配时返回 **404** 状态码。

`exclude_generated`

（可选，布尔值）默认为 `false`。排除创建转换时自动添加的字段。这使配置处于可接受的格式，以便检索后添加到另一个集群。

`from`

（可选，整数）默认为 `0`。跳过指定数量的转换。

`size`

（可选，整数）默认为 `100`。指定要获取的转换的最大数量。

## 响应体

此 API 返回一个转换资源数组，**按 `id` 值升序排序**。有关属性的完整列表，参见创建转换 API。

本页明确记录的字段包括：

- `create_time`：转换创建的时间，例如 `1576094542936`。仅供参考；无法更改。
- `version`：创建转换时的转换配置版本号。从 Elasticsearch 8.10.0 开始，使用一个新的版本号来跟踪转换插件中的配置和状态更改；该版本与产品版本解耦并独立递增。`version` 值表示这个新版本号。

## 响应码

- `404`（缺少资源）— 如果 `allow_no_match` 为 `false`，此状态码表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例最多检索 10 个转换：

```txt
GET _transform?size=10
```

以下示例检索 `ecommerce_transform1` 的配置：

```txt
GET _transform/ecommerce_transform1
```

API 返回以下响应：

```json
{
  "count": 1,
  "transforms": [
    {
      "id": "ecommerce_transform1",
      "authorization": {
        "roles": [ "superuser" ]
      },
      "version": "8.4.0",
      "create_time": 1656023416565,
      "source": {
        "index": [ "kibana_sample_data_ecommerce" ],
        "query": {
          "term": {
            "geoip.continent_name": {
              "value": "Asia"
            }
          }
        }
      },
      "dest": {
        "index": "kibana_sample_data_ecommerce_transform1",
        "pipeline": "add_timestamp_pipeline"
      },
      "frequency": "5m",
      "sync": {
        "time": {
          "field": "order_date",
          "delay": "60s"
        }
      },
      "pivot": {
        "group_by": {
          "customer_id": {
            "terms": {
              "field": "customer_id"
            }
          }
        },
        "aggregations": {
          "max_price": {
            "max": {
              "field": "taxful_total_price"
            }
          }
        }
      },
      "description": "Maximum priced ecommerce data by customer_id in Asia",
      "settings": {},
      "retention_policy": {
        "time": {
          "field": "order_date",
          "max_age": "30d"
        }
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-transform.html)
