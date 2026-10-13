# 获取转换统计信息 API

检索转换的使用信息。

```txt
GET _transform/<transform_id>/_stats
GET _transform/<transform_id>,<transform_id>/_stats
GET _transform/_stats
GET _transform/_all/_stats
GET _transform/*/_stats
```

## 前置条件

需要以下权限：

- **集群**：`monitor_transform`（内置角色 `transform_user` 授予此权限）。
- **目标索引**：`read`、`view_index_metadata`。

## 描述

你可以使用逗号分隔的标识符列表或通配符表达式，在单个 API 请求中获取多个转换的统计信息。可以使用 `_all`、将 `<transform_id>` 指定为 `*` 或省略 `<transform_id>` 来获取所有转换的统计信息。

## 路径参数

`<transform_id>`

（可选，字符串）转换的标识符。可以是转换标识符或通配符表达式。如果未指定，此 API 将返回所有转换的统计信息。

## 查询参数

`allow_no_match`

（可选，布尔值）指定当请求出现以下情况时的处理方式：包含通配符表达式但没有匹配的转换；包含 `_all` 或未指定标识符且没有匹配项；或包含只有部分匹配的通配符表达式。默认为 `true` — 当没有匹配项时返回空的 `transforms` 数组，对于部分匹配则返回结果的子集。如果为 `false`，则当没有匹配项或只有部分匹配时返回 404 状态码。

`from`

（可选，整数）默认为 `0`。跳过指定数量的转换。

`size`

（可选，整数）默认为 `100`。要获取的转换的最大数量。

## 响应体

此 API 返回一个转换统计信息对象数组，**按 `id` 升序排序**。所有属性仅供参考；你无法更新它们的值。顶层字段为 `count`（结果数量）和 `transforms`（统计信息对象数组）。

`checkpointing`

（对象）关于检查点的统计信息，包含：

- `changes_last_detected_at`：在源索引中最后一次检测到更改的时间戳。
- `last`：关于最后一个已完成检查点的统计信息：
  - `checkpoint`：检查点的序号。
  - `time_upper_bound_millis`：使用基于时间的同步时，检查点所包含数据的上限。
  - `timestamp_millis`：检查点的时间戳（即它被创建的时间）。
- `next`：关于当前正在进行中的下一个检查点的统计信息。仅在转换状态为 `indexing` 时出现：
  - `checkpoint`：检查点的序号。
  - `checkpoint_progress`：进度统计信息，例如 `total_docs`、`docs_remaining`、`percent_complete`、`docs_processed`、`docs_indexed`。仅对批量转换以及持续转换的第一个检查点可用。
  - `time_upper_bound_millis`：检查点所包含数据的上限（基于时间的同步）。
  - `timestamp_millis`：检查点被创建的时间。
- `operations_behind`：在源索引上发生但尚未应用到目标索引的操作数量。数值较高可能表示转换未能跟上数据变化。

`health`

（对象）此转换的健康状况指示器，包含：

- `status`：`green`（健康）、`unknown`（无法确定）、`yellow`（已降级，可能需要修复以避免变为红色）、`red`（中断或不可用）。
- `issues`（可选，数组）：如果状态不健康，则为问题列表：
  - `issue`：问题的描述。
  - `details`（可选，字符串）：有关该问题的详细信息。
  - `count`：自问题开始以来发生的次数。
  - `first_occurrence`（可选，日期）：首次发生的时间戳。

`id`

转换的标识符。

`node`

（对象）仅对已启动的转换有效，为该转换所启动的节点：

- `attributes`：节点属性列表。
- `ephemeral_id`：节点临时 ID。
- `id`：唯一的节点标识符，例如 `"0-o0tOoRTwKFZifatTWKNw"`。
- `name`：节点名称。
- `transport_address`：用于传输 HTTP 连接的主机和端口，例如 `127.0.0.1:9300`。

`reason`

如果转换处于失败状态，则为有关失败原因的详细信息。

`state`

转换的状态：

- `aborting`：转换正在中止。
- `failed`：转换失败（参见 `reason` 字段）。
- `indexing`：正在积极处理数据并创建新文档。
- `started`：正在运行但未主动索引数据。
- `stopped`：已停止。
- `stopping`：正在停止。

`stats`

（对象）统计信息：

- `delete_time_in_ms`：删除所花费的时间（以毫秒为单位）。
- `documents_deleted`：由于保留策略而从目标索引中删除的文档数。
- `documents_indexed`：索引到目标索引中的文档数。
- `documents_processed`：从源索引处理的文档数。
- `exponential_avg_checkpoint_duration_ms`：检查点持续时间的指数移动平均值（以毫秒为单位）。
- `exponential_avg_documents_indexed`：已索引文档数的指数移动平均值。
- `exponential_avg_documents_processed`：已处理文档数的指数移动平均值。
- `index_failures`：索引失败的次数。
- `index_time_in_ms`：索引所花费的时间（以毫秒为单位）。
- `index_total`：索引操作的次数。
- `pages_processed`：已处理的搜索或批量索引操作的次数（文档是分批处理的）。
- `processing_time_in_ms`：处理结果所花费的时间（以毫秒为单位）。
- `processing_total`：处理操作的次数。
- `search_failures`：搜索失败的次数。
- `search_time_in_ms`：搜索所花费的时间（以毫秒为单位）。
- `search_total`：对源索引的搜索操作次数。
- `trigger_count`：转换被调度器触发的次数（例如，按 `frequency` 属性设置的时间间隔检查更新或摄取新数据）。

## 响应码

- `404`（缺少资源）— 如果 `allow_no_match` 为 `false`，表示没有与请求匹配的资源或只有部分匹配。

## 示例

以下示例跳过前 5 个转换，最多获取 10 个结果：

```txt
GET _transform/_stats?from=5&size=10
```

以下示例获取特定转换的统计信息：

```txt
GET _transform/ecommerce-customer-transform/_stats
```

API 返回以下响应：

```json
{
  "count": 1,
  "transforms": [
    {
      "id": "ecommerce-customer-transform",
      "state": "started",
      "node": {
        "id": "cpTIGMsVQ8Gqwqlxxxxxxx",
        "name": "my.home",
        "ephemeral_id": "5-L21nFsQxxxxxxxxxx-xx",
        "transport_address": "127.0.0.1:9300",
        "attributes": {}
      },
      "stats": {
        "pages_processed": 78,
        "documents_processed": 6027,
        "documents_indexed": 68,
        "documents_deleted": 22,
        "delete_time_in_ms": 214,
        "trigger_count": 168,
        "index_time_in_ms": 412,
        "index_total": 20,
        "index_failures": 0,
        "search_time_in_ms": 353,
        "search_total": 78,
        "search_failures": 0,
        "processing_time_in_ms": 8,
        "processing_total": 78,
        "exponential_avg_checkpoint_duration_ms": 97.30637923893185,
        "exponential_avg_documents_indexed": 2.2064915040974062,
        "exponential_avg_documents_processed": 179.89419945785045
      },
      "checkpointing": {
        "last": {
          "checkpoint": 20,
          "timestamp_millis": 1585344558220,
          "time_upper_bound_millis": 1585344498220
        },
        "changes_last_detected_at": 1585344558219
      },
      "health": {
        "status": "green"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-transform-stats.html)
