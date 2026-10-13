# 预览转换 API

预览一个转换 — 生成使用相同配置运行创建转换 API 时会得到的结果的预览。

```txt
GET _transform/<transform_id>/_preview
POST _transform/<transform_id>/_preview
GET _transform/_preview
POST _transform/_preview
```

## 前置条件

- **集群权限**：`manage_transform`（由内置角色 `transform_admin` 授予）。
- **源索引权限**：`read`、`view_index_metadata`。

## 描述

- 最多返回 **100 个结果**。
- 计算基于源索引中的**所有当前数据**。
- 还会生成目标索引的**映射和设置**列表（在转换启动时目标索引不存在的情况下使用）。
- 限制可能导致不佳的映射；变通方法：在启动转换之前，先创建具有首选映射的目标索引或索引模板。
- 你必须选择 `latest` **或** `pivot` 之一 — 不能在单个转换中同时使用两者。

:::important 重要

预览使用调用者的凭据；而已启动的转换使用最后创建/更新它的用户的角色。为避免不匹配，创建/更新转换的同一用户应进行预览，或者使用辅助授权请求头。

:::

## 路径参数

`<transform_id>`

（可选，字符串）要预览的转换的 ID。如果作为路径参数提供，则不能在请求体中提供转换配置详细信息。

## 查询参数

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 **30s**。等待响应的期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 请求体

`description`

（可选，字符串）转换的自由文本描述。

`dest`

（可选，对象）转换的目标，包含：

- `index`（可选，字符串）目标索引。对于 **pivot** 转换，会尽可能从源字段推断映射 — 如果需要替代映射，请预先使用创建索引 API。对于 **latest** 转换，**绝不会**推断映射 — 如果不希望使用动态映射，请预先使用创建索引 API。
- `pipeline`（可选，字符串）摄取管道的唯一标识符。

`frequency`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）持续运行时检查源索引更改的时间间隔。最小值为 **1s**，最大值为 **1h**，默认为 **1m**。

`latest`

（部分情况下必需，对象）通过为每个唯一键查找最新文档来转换数据，包含：

- `sort`（必需，字符串）用于标识最新文档的日期字段。
- `unique_key`（必需，字符串数组）用于对数据进行分组的一个或多个字段。

`pivot`

（部分情况下必需，对象）通过聚合并分组数据来转换数据，包含：

- `aggregations`（别名 `aggs`，必需，对象）定义如何聚合分组的数据。支持的聚合包括：Average、Boxplot、Bucket script、Bucket selector、Cardinality、Extended Stats、Filter、Geo bounds、Geo centroid、Geo line、Cartesian bounds、Cartesian centroid、Max、Median absolute deviation、Min、Missing、Percentiles、Range、Rare Terms、Scripted metric、Stats、Sum、Terms、Top Metrics、Value count、Weighted average。
- `group_by`（必需，对象）定义如何对数据进行分组。每个 pivot 可以有多个分组。支持的分组包括：Date histogram、Geotile Grid、Histogram、Terms。分组属性可以选择性地包含 `missing_bucket` — 如果为 `true`，则 `group_by` 字段中没有值的文档也会被包含在内。默认为 `false`。

`retention_policy`

（可选，对象）定义保留策略；满足条件的数据会从目标索引中删除。

`time`（必需，对象）— 使用时间字段；如果 `time.field` 存在且包含早于 `max.age` 的数据，则这些数据会被删除：

- `field`（必需，字符串）用于计算文档年龄的已存在的日期字段。
- `max_age`（必需，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）文档的最大保留时间；超过该时间的文档会从目标索引中移除。

`source`

（必需，对象）转换的数据来源，包含：

- `index`（必需，字符串或字符串数组）源索引 — 可以是单个索引、索引模式（例如 `"my-index-*"`）、索引数组（例如 `["my-index-000001", "my-index-000002"]`）或索引模式数组（例如 `["my-index-*", "my-other-index-*"]`）。对于远程索引，使用 `"remote_name:index_name"`。如果有任何索引位于远程集群中，则主节点和至少一个转换节点必须具有 `remote_cluster_client` 节点角色。
- `query`（可选，对象）检索源数据子集的查询子句（Query DSL）。
- `runtime_mappings`（可选，对象）转换可使用的搜索时运行时字段的定义。所有数据节点（包括远程节点）必须为 **7.12 或更高版本**。

`sync`

（可选，对象）定义持续运行的属性。

`time`（可选，对象）— 使用时间字段来同步源索引和目标索引：

- `delay`（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）当前时间与最新输入数据时间之间的延迟。默认为 **60s**。
- `field`（可选，字符串）用于标识源中新文档的日期字段。

`settings`

（可选，对象）可选的转换设置，包含：

- `align_checkpoints`（可选，布尔值）对检查点范围进行性能优化（当日期直方图是分组源时，与日期直方图间隔对齐），从而减少文档更新。默认为 `true`。
- `dates_as_epoch_millis`（可选，布尔值）如果为 `true`，则日期输出为自纪元以来的毫秒数而非 ISO 字符串。`epoch_millis` 是 **7.11** 之前创建的转换的默认值。默认为 `false`。
- `deduce_mappings`（可选，布尔值）是否从配置中推断目标索引映射。默认为 `true`。
- `docs_per_second`（可选，浮点数）每秒输入文档数的限制（在搜索请求之间添加等待时间）。默认为 `null`（不节流）。
- `max_page_search_size`（可选，整数）每个检查点的组合聚合的初始页面大小；发生熔断器异常时会动态降低。最小值为 **10**，最大值为 **65,536**。默认为 **500**。
- `unattended`（可选，布尔值）如果为 `true`，则以无人值守模式运行 — 出错时无限重试（转换永不失败）。非无限的重试次数会导致验证失败。默认为 `false`。

## 响应体

`preview`

（数组）文档的数组 — 即该转换会在目标索引中创建的文档的 JSON 表示。

`generated_dest_index`

（对象）包含有关目标索引的详细信息：

- `aliases`：目标索引的别名。
- `mappings`：目标索引中每个文档的映射。
- `settings`：目标索引的索引设置。

## 示例

以下示例预览一个使用 pivot 方法的转换：

```txt
POST _transform/_preview
{
  "source": {
    "index": "kibana_sample_data_ecommerce"
  },
  "pivot": {
    "group_by": {
      "customer_id": {
        "terms": {
          "field": "customer_id",
          "missing_bucket": true
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
  }
}
```

API 返回以下响应：

```json
{
  "preview": [
    {
      "max_price": 171.0,
      "customer_id": "10"
    },
    {
      "max_price": 233.0,
      "customer_id": "11"
    },
    {
      "max_price": 200.0,
      "customer_id": "12"
    }
  ],
  "generated_dest_index": {
    "mappings": {
      "_meta": {
        "_transform": {
          "transform": "transform-preview",
          "version": {
            "created": "7.7.0"
          },
          "creation_date_in_millis": 1584738236757
        },
        "created_by": "transform"
      },
      "properties": {
        "max_price": {
          "type": "half_float"
        },
        "customer_id": {
          "type": "keyword"
        }
      }
    },
    "settings": {
      "index": {
        "number_of_shards": "1",
        "auto_expand_replicas": "0-1"
      }
    },
    "aliases": {}
  }
}
```

响应中的 `mappings._meta` 包含转换元数据（`transform`、`version.created`、`creation_date_in_millis`、`created_by`）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/preview-transform.html)
