# EQL 搜索 API

::::info 新版 API 参考

有关最新的 API 详情，请参阅[EQL API](/rest_apis/eql_qpis/eql_qpis)。

::::

返回[事件查询语言（EQL）](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql.html)查询的搜索结果。EQL 假设数据流或索引中的每个文档对应一个事件。

## 请求

```json
GET /<target>/_eql/search
```

```json
POST /<target>/_eql/search
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须拥有目标数据流、索引或别名的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。
- 参见[必填字段](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql.html#eql-required-fields)。
- **[preview]** 此功能处于技术预览版，可能会在未来的版本中更改或移除。Elastic 将努力修复任何问题，但技术预览版功能不受正式 GA 功能的支持 SLA 约束。对于跨集群搜索，如果本地和远程集群使用 7.17.7（含）之前或 8.5.1（含）之前的 Elasticsearch 版本，则必须使用相同版本。有关安全性，参见[远程集群](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/remote-clusters.html)。

### 限制

参见 [EQL 限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql-syntax.html#eql-syntax-limitations)。

## 路径参数

- `<target>`（必需，字符串）

  用于限制请求的数据流、索引或别名的逗号分隔列表。支持通配符（`*`）。要搜索所有数据流和索引，使用 `*` 或 `_all`。

  **[preview]** 要搜索远程集群，使用 `<cluster>:<target>` 语法。

## 查询参数

- `allow_no_indices`（可选，布尔值）

  如果为 `false`，当任何通配符模式、别名或 `_all` 值仅目标到缺失或关闭的索引时返回错误。如果为 `true`，仅目标到缺失或关闭索引的请求返回错误。默认为 `true`。

- `allow_partial_search_results`（可选，布尔值）

  如果为 `false`，当一个或多个分片不可用时返回错误。如果为 `true`，查询仅在可用分片上执行。默认为 `true`。可通过 `xpack.eql.default_allow_partial_results` 集群设置覆盖。

- `allow_partial_sequence_results`（可选，布尔值）

  与 `allow_partial_search_results=true` 一起使用。控制分片不可用时序列查询的行为。如果为 `true`，仅在可用分片上计算序列。如果为 `false`，仅返回分片失败信息。默认为 `false`。可通过 `xpack.eql.default_allow_partial_sequence_results` 集群设置覆盖。

- `ccs_minimize_roundtrips`（可选，布尔值）

  如果为 `true`，最小化 CCS 请求的本地和远程集群之间的网络往返。适用于目标数据完全包含在一个远程集群中的请求。默认为 `true`。

- `expand_wildcards`（可选，字符串）

  通配符模式可以匹配的索引类型。支持逗号分隔值。有效值为：`all`、`open`、`closed`、`hidden`、`none`。默认为 `open`。

- `filter_path`（可选，字符串）

  用于 API 响应的逗号分隔过滤器列表。

- `ignore_unavailable`（可选，布尔值）

  如果为 `false`，当目标到缺失或关闭的索引时返回错误。默认为 `true`。

- `keep_alive`（可选，时间值）

  搜索及其结果存储在集群上的时间。默认为 `5d`（五天）。

- `keep_on_completion`（可选，布尔值）

  如果为 `true`，搜索及其结果存储在集群上。如果为 `false`，仅当请求未在 `wait_for_completion_timeout` 期间完成时才存储。默认为 `false`。

- `wait_for_completion_timeout`（可选，时间值）

  等待请求完成的超时时间。默认为无超时。如果请求在此期间未完成，搜索变为异步。

## 请求体

- `event_category_field`（必需*，字符串）

  包含事件分类的字段，如 `process`、`file` 或 `network`。

  默认为 `event.category`（根据 ECS）。如果数据流或索引不包含 `event.category` 字段，则此值为必需。

  必须映射为 `keyword` 系列的字段类型。

- `fetch_size`（可选，整数）

  序列查询每次搜索的最大事件数。默认为 `1000`。

  必须大于 `2`，但不能超过 `index.max_result_window`（默认 `10000`）。

  更大的值通常会提高搜索速度，但会使用更多内存。

- `fields`（可选，字符串和对象数组）

  字段模式数组。返回 `hits.fields` 属性中匹配字段名的值。

  `fields` 对象的属性：

  - `field`（必需，字符串）：要返回的字段。支持通配符（`*`）。
  - `format`（可选，字符串）：日期和地理空间字段的格式。

    有效的 `format` 值：
    - 对于 `date`/`date_nanos`：接受日期格式
    - 对于 `geo_point`/`geo_shape`：接受 `geojson`（默认）、`wkt` 或 `mvt(<spec>)`

- `filter`（可选，查询 DSL 对象）

  用 Query DSL 编写的查询，用于过滤 EQL 查询运行的事件。

- `keep_alive`（可选，时间值）

  搜索及其结果存储在集群上的时间。默认为 `5d`。如果同时指定了查询参数和请求体参数，仅使用查询参数。

- `keep_on_completion`（可选，布尔值）

  如果为 `true`，搜索及其结果存储在集群上。如果同时指定了查询参数和请求体参数，仅使用查询参数。

- `query`（必需，字符串）

  要运行的 EQL 查询。

- `result_position`（可选，枚举）

  要返回的匹配事件或序列集合。

  - `tail`：（默认）返回最近的匹配。
  - `head`：返回最早的匹配。

- `runtime_mappings`（可选，对象的对象）

  在搜索请求中定义一个或多个运行时字段。这些字段优先于具有相同名称的已映射字段。

  `runtime_mappings` 对象的属性：

  - `<field-name>`（必需，对象）：运行时字段的配置。键是字段名称。
    - `type`（必需，字符串）：字段类型：`boolean`、`composite`、`date`、`double`、`geo_point`、`ip`、`keyword`、`long`、`lookup`
    - `script`（可选，字符串）：在查询时执行的 Painless 脚本。必须包含 `emit` 以返回值。

- `size`（可选，整数或浮点数）

  对于基本查询：返回的最大匹配事件数。对于序列查询：返回的最大匹配序列数。默认为 `10`。必须大于 `0`。不能使用管道超过此值。

- `tiebreaker_field`（可选，字符串）

  用于对具有相同时间戳的命中按升序排序的字段。

- `timestamp_field`（必需*，字符串）

  包含事件时间戳的字段。默认为 `@timestamp`（根据 ECS）。如果不存在，则此值为必需。事件按此字段的值（转换为自 Unix 纪元以来的毫秒数）升序排序。应映射为 `date`。不支持 `date_nanos`。

- `wait_for_completion_timeout`（可选，时间值）

  等待请求完成的超时时间。默认为无超时。如果同时指定了查询参数和请求体参数，仅使用查询参数。

## 响应体

- `id`（字符串）

  搜索的标识符。仅在以下情况下提供：
  - 搜索未在 `wait_for_completion_timeout` 期间返回完整结果（异步搜索），或
  - `keep_on_completion` 参数为 `true`。

  可与[获取异步 EQL 搜索 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-async-eql-search-api.html) 或[获取异步 EQL 状态 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-async-eql-status-api.html) 一起使用。

- `is_partial`（布尔值）

  如果为 `true`，响应不包含完整的搜索结果。

- `is_running`（布尔值）

  如果为 `true`，搜索请求仍在执行。
  - 如果为 `true` 且 `is_partial` 为 `true`：正在进行的异步搜索。
  - 如果 `is_partial` 为 `true` 但 `is_running` 为 `false`：搜索因失败返回了部分结果。

- `took`（整数）

  Elasticsearch 执行请求所花费的毫秒数。
  - **包括**：协调节点和数据节点之间的通信时间、搜索线程池队列中的时间、实际执行时间。
  - **不包括**：向 Elasticsearch 发送请求的时间、JSON 序列化时间、向客户端发送响应的时间。

- `timed_out`（布尔值）

  如果为 `true`，请求在完成之前超时。

- `hits`（对象）

  包含匹配的事件和序列以及相关元数据。

  `hits` 的属性：

  - `total`（对象）：有关匹配事件或序列数量的元数据。
    - `value`（整数）：匹配事件（基本查询）或序列（序列查询）的总数。
    - `relation`（字符串）：`eq` = 准确；`gte` = 下限
  - `sequences`（对象数组）：包含匹配查询的事件序列。仅对包含序列的 EQL 查询返回。
    - `join_keys`（值数组）：用于约束匹配的共享字段值（由 `by` 关键字定义）。
    - `events`（对象数组）：包含匹配序列中的事件。
  - `events`（对象数组）：包含匹配查询的事件。
    - `_index`（字符串）：包含事件的索引名称。
    - `_id`（字符串）：事件的唯一标识符（在索引内唯一）。
    - `_source`（对象）：索引时为事件传递的原始 JSON 正文。

## 示例

### 基本查询

```json
GET /my-data-stream/_eql/search
{
  "query": """
    process where (process.name == "cmd.exe" and process.pid != 2013)
  """
}
```

API 返回以下结果：

```json
{
  "is_partial": false,
  "is_running": false,
  "took": 6,
  "timed_out": false,
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "events": [
      {
        "_index": ".ds-my-data-stream-2099.12.07-000001",
        "_id": "babI3XMBI9IjHuIqU0S_",
        "_source": {
          "@timestamp": "2099-12-06T11:04:05.000Z",
          "event": {
            "category": "process",
            "id": "edwCRnyD",
            "sequence": 1
          },
          "process": {
            "pid": 2012,
            "name": "cmd.exe",
            "executable": "C:\\Windows\\System32\\cmd.exe"
          }
        }
      },
      {
        "_index": ".ds-my-data-stream-2099.12.07-000001",
        "_id": "b6bI3XMBI9IjHuIqU0S_",
        "_source": {
          "@timestamp": "2099-12-07T11:06:07.000Z",
          "event": {
            "category": "process",
            "id": "cMyt5SZ2",
            "sequence": 3
          },
          "process": {
            "pid": 2012,
            "name": "cmd.exe",
            "executable": "C:\\Windows\\System32\\cmd.exe"
          }
        }
      }
    ]
  }
}
```

`hits.events` 中的匹配事件按时间戳（转换为自 Unix 纪元以来的毫秒数）升序排序。如果事件具有相同的时间戳，则使用 `tiebreaker_field` 按升序排序。

### 序列查询

```json
GET /my-data-stream/_eql/search
{
  "query": """
    sequence by process.pid
      [ file where file.name == "cmd.exe" and process.pid != 2013 ]
      [ process where stringContains(process.executable, "regsvr32") ]
  """
}
```

此查询匹配以下事件序列：
1. 以 `event.category` 为 `file`、`file.name` 为 `cmd.exe`、`process.pid` 不为 `2013` 的事件开始
2. 后跟 `event.category` 为 `process` 且 `process.executable` 包含子字符串 `regsvr32` 的事件
3. 两个事件必须共享相同的 `process.pid` 值

API 返回以下结果：

```json
{
  "is_partial": false,
  "is_running": false,
  "took": 6,
  "timed_out": false,
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "sequences": [
      {
        "join_keys": [2012],
        "events": [
          {
            "_index": ".ds-my-data-stream-2099.12.07-000001",
            "_id": "AtOJ4UjUBAAx3XR5kcCM",
            "_source": {
              "@timestamp": "2099-12-06T11:04:07.000Z",
              "event": {
                "category": "file",
                "id": "dGCHwoeS",
                "sequence": 2
              },
              "file": {
                "accessed": "2099-12-07T11:07:08.000Z",
                "name": "cmd.exe",
                "path": "C:\\Windows\\System32\\cmd.exe",
                "type": "file",
                "size": 16384
              },
              "process": {
                "pid": 2012,
                "name": "cmd.exe",
                "executable": "C:\\Windows\\System32\\cmd.exe"
              }
            }
          },
          {
            "_index": ".ds-my-data-stream-2099.12.07-000001",
            "_id": "OQmfCaduce8zoHT93o4H",
            "_source": {
              "@timestamp": "2099-12-07T11:07:09.000Z",
              "event": {
                "category": "process",
                "id": "aR3NWVOs",
                "sequence": 4
              },
              "process": {
                "pid": 2012,
                "name": "regsvr32.exe",
                "command_line": "regsvr32.exe  /s /u /i:https://...RegSvr32.sct scrobj.dll",
                "executable": "C:\\Windows\\System32\\regsvr32.exe"
              }
            }
          }
        ]
      }
    ]
  }
}
```

匹配的序列包含在 `hits.sequences` 属性中。`hits.sequences.join_keys` 属性包含每个匹配事件的共享 `process.pid` 值。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/eql-search-api.html)
