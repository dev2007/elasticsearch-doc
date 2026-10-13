# 创建转换 API

实例化一个转换。

```txt
PUT _transform/<transform_id>
```

## 前置条件

需要以下权限：

- **集群**：`manage_transform`（内置角色 `transform_admin` 授予此权限）。
- **源索引**：`read`、`view_index_metadata`。
- **目标索引**：`read`、`create_index`、`index`。如果配置了 `retention_policy`，还需要 `delete` 权限。

## 描述

此 API 实例化一个转换，该转换从源索引复制数据、进行转换，并将结果持久化到以实体为中心的目标索引中。

- **pivot 方法**：实体由 pivot 对象中的 `group_by` 字段集合定义。
- **latest 方法**：实体由 latest 对象中的 `unique_key` 字段值定义。

可以将目标索引视为一个二维的表格数据结构（数据帧）。每个文档 ID 都是根据实体的哈希值生成的，因此每个实体都有唯一的一行。

创建时会进行一系列验证（例如源索引是否存在、目标索引不属于源模式等）。使用 `defer_validation` 可以跳过这些检查。延迟的验证始终会在转换启动时运行，但权限检查除外。

转换会记住创建用户所拥有的角色并使用这些相同的角色。如果提供了辅助授权请求头，则使用辅助授权请求头。

必须使用 Kibana 或此 API 来创建转换 — 不要通过索引 API 直接将转换添加到 `.transform-internal*` 索引中。不要授予用户对 `.transform-internal*` 索引（或在 7.5 之前使用的 `.data-frame-internal*` 索引）的权限。

你必须选择 `latest` **或** `pivot` 之一 — 不能在单个转换中同时使用两者。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。只能包含小写字母数字字符（a-z、0-9）、连字符和下划线，长度限制为 64 个字符，并且必须以字母数字字符开头和结尾。

## 查询参数

`defer_validation`

（可选，布尔值）如果为 `true`，则不运行可延迟的验证。当源索引在转换创建之后才存在时非常有用。

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待响应的期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 请求体

`description`

（可选，字符串）转换的自由文本描述。

`dest`

（必需，对象）转换的目标，包含：

- `index`（必需，字符串）目标索引。对于 pivot 转换，会尽可能从源字段推断映射；如果需要替代映射，请先使用创建索引 API。对于 latest 转换，**绝不会**推断映射。
- `aliases`（可选，对象数组）目标索引应具有的别名。使用存储的凭据（如果同时提供了主要和辅助凭据，则使用辅助凭据）进行操作。无论索引是由转换创建还是预先创建的，目标索引都会被添加到这些别名中。
  - `alias`（必需，字符串）别名的名称。
  - `move_on_creation`（可选，布尔值）如果为 `true`，则在将目标索引添加到别名之前，所有其他索引都会从该别名中移除。默认为 `false`。
- `pipeline`（可选，字符串）摄取管道的唯一标识符。

`frequency`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）持续运行时检查源索引更改的时间间隔。最小值为 `1s`，最大值为 `1h`。默认为 `1m`。

`latest`

（部分情况下必需，对象）latest 方法 — 为每个唯一键查找最新的文档，包含：

- `sort`（必需，字符串）用于标识最新文档的日期字段。
- `unique_key`（必需，字符串数组）用于对数据进行分组的一个或多个字段。

`_meta`

（可选，对象）可选的转换元数据。

`pivot`

（部分情况下必需，对象）pivot 方法 — 聚合并分组数据，包含：

- `aggregations`（别名 `aggs`，必需，对象）定义如何聚合分组的数据。支持的聚合包括：Average、Boxplot、Bucket script、Bucket selector、Cardinality、Extended Stats、Filter、Geo bounds、Geo centroid、Geo line、Cartesian bounds、Cartesian centroid、Max、Median absolute deviation、Min、Missing、Percentiles、Range、Rare Terms、Scripted metric、Stats、Sum、Terms、Top Metrics、Value count、Weighted average。
- `group_by`（必需，对象）定义如何对数据进行分组；可以定义多个分组。支持的分组包括：Date histogram、Geotile Grid、Histogram、Terms。分组属性可以选择性地包含 `missing_bucket` 属性 — 如果为 `true`，则 `group_by` 字段中没有值的文档也会被包含在内。默认为 `false`。

`retention_policy`

（可选，对象）保留策略；满足条件的数据会从目标索引中删除，包含：

- `time`（必需，对象）转换使用时间字段作为保留策略。如果 `time.field` 存在且包含早于 `max.age` 的数据，则这些数据会被删除：
  - `field`（必需，字符串）用于计算文档年龄的日期字段。必须是已存在的日期字段。
  - `max_age`（必需，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）目标索引中文档的最大保留时间；超过该时间的文档会被移除。

`settings`

（可选，对象）可选的转换设置，包含：

- `align_checkpoints`（可选，布尔值）是否应对检查点范围进行性能优化（当日期直方图是分组源时，与日期直方图间隔对齐），从而减少目标索引的更新。默认为 `true`。
- `dates_as_epoch_millis`（可选，布尔值）输出中的日期是写为 ISO 格式的字符串（默认）还是自纪元以来的毫秒数。`epoch_millis` 是 7.11 之前创建的转换的默认值；如需兼容的输出请设置为 `true`。默认为 `false`。
- `deduce_mappings`（可选，布尔值）转换是否从配置中推断目标索引映射。默认为 `true`。
- `docs_per_second`（可选，浮点数）每秒输入文档数的限制；通过在搜索请求之间添加等待时间来对转换进行节流。默认为 `null`（不节流）。
- `max_page_search_size`（可选，整数）每个检查点的组合聚合的初始页面大小。如果发生熔断器异常，页面大小会动态减小。最小值为 `10`，最大值为 `65,536`。默认为 `500`。
- `num_failure_retries`（可选，整数）在任务被标记为失败之前的可恢复失败重试次数。最小值为 `0`，最大值为 `100`；`-1` 表示无限。默认为集群级设置 `num_transform_failure_retries`。
- `unattended`（可选，布尔值）如果为 `true`，则转换以无人值守模式运行 — 出错时无限重试且永不失败。设置非无限的重试次数会导致验证失败。默认为 `false`。

`source`

（必需，对象）数据的来源，包含：

- `index`（必需，字符串或字符串数组）源索引。可以是单个索引、索引模式（例如 `"my-index-*"`）、索引数组（例如 `["my-index-000001", "my-index-000002"]`）或索引模式数组（例如 `["my-index-*", "my-other-index-*"]`）。对于远程索引，使用 `"remote_name:index_name"`。如果有任何索引位于远程集群中，则主节点和至少一个转换节点必须具有 `remote_cluster_client` 节点角色。
- `query`（可选，对象）检索源数据子集的查询子句（参见 Query DSL）。
- `runtime_mappings`（可选，对象）转换可使用的搜索时运行时字段的定义。所有数据节点（包括远程节点）必须为 7.12 或更高版本。

`sync`

（可选，对象）转换持续运行所需的属性，包含：

- `time`（必需，对象）指定转换使用时间字段来同步源索引和目标索引：
  - `delay`（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）当前时间与最新输入数据时间之间的延迟。默认为 `60s`。
  - `field`（必需，字符串）用于标识源中新文档的日期字段。**强烈建议**使用包含摄取时间戳的字段；否则 `delay` 可能需要将数据传输延迟考虑在内。

## 示例

### pivot 方法示例

以下示例使用 pivot 方法创建一个转换：

```txt
PUT _transform/ecommerce_transform1
{
  "source": {
    "index": "kibana_sample_data_ecommerce",
    "query": {
      "term": {
        "geoip.continent_name": {
          "value": "Asia"
        }
      }
    }
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
  },
  "description": "Maximum priced ecommerce data by customer_id in Asia",
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
  "retention_policy": {
    "time": {
      "field": "order_date",
      "max_age": "30d"
    }
  }
}
```

API 返回以下响应：

```json
{
  "acknowledged": true
}
```

### latest 方法示例

以下示例使用 latest 方法创建一个转换：

```txt
PUT _transform/ecommerce_transform2
{
  "source": {
    "index": "kibana_sample_data_ecommerce"
  },
  "latest": {
    "unique_key": [ "customer_id" ],
    "sort": "order_date"
  },
  "description": "Latest order for each customer",
  "dest": {
    "index": "kibana_sample_data_ecommerce_transform2"
  },
  "frequency": "5m",
  "sync": {
    "time": {
      "field": "order_date",
      "delay": "60s"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/put-transform.html)
