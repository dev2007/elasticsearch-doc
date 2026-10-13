# 更新转换 API

更新现有转换的某些属性。

```txt
POST _transform/<transform_id>/_update
```

## 前置条件

需要以下权限：

| 范围 | 权限 |
| --- | --- |
| 集群 | `manage_transform`（由内置角色 `transform_admin` 授予） |
| 源索引 | `read`、`view_index_metadata` |
| 目标索引 | `read`、`index` |
| 目标索引（如果配置了 `retention_policy`） | 另外需要 `delete` |

## 描述

可更新的属性列表是转换创建时可定义属性的一个**子集**。

更新时会进行一系列**验证**以确保成功。使用 `defer_validation` 参数可以跳过这些检查。

:::important 重要

除 `description` 外，所有更新的属性都要在转换启动下一个检查点之后才会生效（以确保每个检查点内的数据一致性）。

:::

转换会记住更新用户在更新时拥有的角色并以这些权限运行。如果提供了辅助授权请求头，则使用这些凭据。

你必须使用 **Kibana 或此 API** 来更新转换。不支持直接更新转换的内部、系统或隐藏索引，这可能会导致永久性故障。

## 路径参数

`<transform_id>`

（必需，字符串）转换的标识符。

## 查询参数

`defer_validation`

（可选，布尔值）默认为 `false`。如果为 `true`，则不运行可延迟的验证。当源索引在转换更新之后才存在时非常有用。

`timeout`

（可选，[时间值](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待响应的期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。

## 请求体

`description`

（可选，字符串）转换的自由文本描述。**这是唯一会立即生效的已更新属性**（在下一个检查点之前）。

`dest`

（可选，对象）转换的目标，包含：

- `index`（必需，字符串）目标索引。
  - 对于 `pivot` 转换：目标映射会尽可能**从源字段推断得出**。如果需要替代映射，请预先使用创建索引 API。
  - 对于 `latest` 转换：映射**绝不会**被推断。如果不希望使用动态映射，请预先使用创建索引 API。
- `aliases`（可选，对象数组）目标索引应具有的别名。别名使用转换的存储凭据（如果在创建时同时提供了主要和辅助凭据，则使用辅助凭据）进行操作。无论目标索引是由转换创建还是由用户预先创建，都会被添加到别名中。
  - `alias`（必需，字符串）别名名称。
  - `move_on_creation`（可选，布尔值，默认为 `false`）如果为 `true`，则目标索引会成为别名中**唯一**的索引（首先移除所有其他索引）。
- `pipeline`（可选，字符串）摄取管道的唯一标识符。

`frequency`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）持续运行时检查源索引更改的时间间隔。最小值为 `1s`，最大值为 `1h`，默认为 `1m`。

`_meta`

（可选，对象）定义可选的转换元数据（用户定义的对象）。

`retention_policy`

（可选，对象）定义保留策略；满足条件的数据会从目标索引中删除，包含：

- `time`（必需，对象）使用时间字段作为保留策略。如果 `time.field` 存在且包含早于 `max.age` 的数据，则这些数据会被删除：
  - `field`（必需，字符串）用于计算文档年龄的日期字段（必须是已存在的日期字段）。
  - `max_age`（必需，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）目标索引中文档的最大保留时间；超过该时间的文档会被移除。

`settings`

（可选，对象）可选的转换设置：

- `align_checkpoints`（布尔值，默认为 `true`）通过将检查点范围与日期直方图间隔对齐（当日期直方图是分组源时）进行性能优化，从而减少目标索引的文档更新。
- `dates_as_epoch_millis`（布尔值，默认为 `false`）将日期输出为自纪元以来的毫秒数（`true`）还是 ISO 格式的字符串。`epoch_millis` 是 7.11 之前创建的转换的默认值。
- `deduce_mappings`（布尔值，默认为 `true`）转换是否从转换配置中推断目标索引映射。
- `docs_per_second`（浮点数，默认为 `null` 即不节流）限制每秒输入文档数；通过在搜索请求之间添加等待时间来节流。
- `max_page_search_size`（整数，默认为 `500`）每个检查点的组合聚合的初始页面大小。最小值为 `10`，最大值为 `65,536`。发生熔断器异常时会动态降低。
- `num_failure_retries`（整数，默认为集群设置 `num_transform_failure_retries`）在任务被标记为 `failed` 之前的可恢复失败重试次数。最小值为 `0`，最大值为 `100`；`-1` 表示无限重试。
- `unattended`（布尔值，默认为 `false`）如果为 `true`，则以无人值守模式运行 — 出错时无限重试（转换永不失败）。任何非无限的重试次数都会导致验证失败。

`source`

（可选，对象）转换的数据来源，包含：

- `index`（必需，字符串或字符串数组）源索引。可以是单个索引、索引模式（`"my-index-*"`）、索引数组（`["my-index-000001", "my-index-000002"]`）或索引模式数组（`["my-index-*", "my-other-index-*"]`）。对于远程索引，使用 `"remote_name:index_name"`。如果有任何索引位于远程集群中，则主节点和至少一个转换节点必须具有 `remote_cluster_client` 节点角色。
- `query`（可选，对象）检索源数据子集的 Query DSL 子句。

`sync`

（可选，对象）定义持续运行的属性。

:::important 重要

这些属性**只有在转换已经是持续运行的**时才能被更新。你不能通过此 API 将批量转换更改为持续转换，反之亦然 — 而是应在 Kibana 中克隆转换并添加/移除 `sync` 属性。

:::

`time`（必需，对象）— 使用时间字段来同步源索引和目标索引：

- `delay`（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)，默认为 `60s`）当前时间与最新输入数据时间之间的延迟。
- `field`（必需，字符串）用于标识源中新文档的日期字段。最佳实践是使用包含**摄取时间戳**的字段；否则应将 `delay` 配置为将数据传输延迟考虑在内。

## 响应体

此 API 返回**完整的更新后转换配置**。示例响应中的字段包括：`id`、`authorization`（角色）、`version`、`create_time`、`source`（索引、查询）、`dest`（索引、管道）、`frequency`、`sync`（time：字段、延迟）、`pivot`（group_by、聚合）、`description`、`settings`。

## 示例

以下示例更新名为 `simple-kibana-ecomm-pivot` 的转换：

```txt
POST _transform/simple-kibana-ecomm-pivot/_update
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
  "description": "Maximum priced ecommerce data by customer_id in Asia",
  "dest": {
    "index": "kibana_sample_data_ecommerce_transform_v2",
    "pipeline": "add_timestamp_pipeline"
  },
  "frequency": "15m",
  "sync": {
    "time": {
      "field": "order_date",
      "delay": "120s"
    }
  }
}
```

API 返回以下响应：

```json
{
  "id": "simple-kibana-ecomm-pivot",
  "authorization": {
    "roles": [ "superuser" ]
  },
  "version": "8.4.0",
  "create_time": 1656113450613,
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
    "index": "kibana_sample_data_ecommerce_transform_v2",
    "pipeline": "add_timestamp_pipeline"
  },
  "frequency": "15m",
  "sync": {
    "time": {
      "field": "order_date",
      "delay": "120s"
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
  "settings": {}
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/update-transform.html)
