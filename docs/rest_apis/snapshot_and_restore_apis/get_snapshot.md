# 获取快照 API

检索一个或多个快照的信息。

```txt
GET /_snapshot/<repository>/<snapshot>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor_snapshot`、`create_snapshot` 或 `manage` 集群权限才能使用此 API。

## 路径参数

`<repository>`

（必需，字符串）用于限定请求的快照仓库名称的逗号分隔列表。支持通配符（`*`）表达式，包括将通配符与以 `-` 开头的排除模式组合使用。要获取集群中注册的**所有**快照仓库的信息，请省略此参数，或使用 `*` 或 `_all`。

`<snapshot>`

（必需，字符串）要检索的快照名称的逗号分隔列表。支持通配符（`*`），包括以 `-` 开头的排除模式。要获取已注册仓库中**所有快照**的信息，请使用通配符（`*`）或 `_all`。要获取**当前正在运行**的快照的信息，请使用 `_current`。

:::note 注意

使用 `_all` 时，如果任何快照不可用，则请求失败。将 `ignore_unavailable` 设置为 `true` 可以仅返回可用的快照。

:::

## 查询参数

`after`

（可选，字符串）开始分页的偏移标识符，由响应体中的 `next` 字段返回。与 `from_sort_value` 互斥。

`from_sort_value`

（可选，字符串）开始检索的当前排序列的值。可以是字符串形式的快照或仓库名称（按名称或仓库排序时）、以毫秒为单位的时间值（按开始时间排序时）或数字（按索引/分片数量排序时）。与 `after` 互斥。

`ignore_unavailable`

（可选，布尔值）默认为 `false`。如果为 `false`，则对于任何不可用的快照（例如已损坏或暂时不可用），请求都会返回错误。如果为 `true`，则忽略不可用的快照。

`index_details`

（可选，布尔值）默认为 `false`。如果为 `true`，则返回每个索引的附加信息：分片数量、总大小（以字节为单位）以及每个分片的最大段数。

`index_names`

（可选，布尔值）默认为 `true`。如果为 `true`，则返回每个快照中包含的索引名称列表。

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败。可以设置为 `-1` 表示永不超时。

`order`

（可选，字符串）默认为 `asc`。排序顺序。有效值为 `asc`（升序）或 `desc`（降序）。

`offset`

（可选，整数）默认为 `0`。开始分页的数字偏移量。与 `after` 互斥。

`size`

（可选，整数）默认为 `0`。要返回的快照的最大数量。`0` 表示无限制地返回所有匹配项。

`slm_policy_filter`

（可选，字符串）按以逗号分隔的 SLM 策略名称列表筛选快照。支持通配符（`*`）和以 `-` 开头的排除模式。例如 `*,-policy-a-*` 返回除名称以 `policy-a-` 开头的 SLM 策略所创建的快照之外的所有快照。通配符 `*` 匹配由 SLM 策略创建的所有快照，但**不**匹配没有 SLM 策略的快照；使用特殊模式 `_none` 可匹配没有 SLM 策略的快照。

`sort`

（可选，字符串）默认为 `start_time`。结果的排序方式。有效值为 `start_time`、`duration`、`name`、`repository`、`index_count`、`shard_count`、`failed_shard_count`（并列时按快照名称排序）。

`verbose`

（可选，布尔值）默认为 `true`。如果为 `true`，则返回每个快照的附加信息（拍摄快照的 Elasticsearch 版本、开始/结束时间、已快照的分片数量）。如果为 `false`，则省略这些信息。

:::note 注意

`after` 参数和 `next` 字段允许遍历快照，并对并发创建/删除提供一致性保证：任何在迭代开始时存在且未被并发删除的快照都会被看到；并发创建的快照可能会被看到。

:::

:::note 注意

当 `verbose` 为 `false` 时，不支持 `size`、`order`、`after`、`from_sort_value`、`offset`、`slm_policy_filter` 和 `sort`；此时请求的排序方式是不确定的。

:::

## 响应体

`snapshots`

快照对象的数组，每个对象包含：

- `snapshot`：快照的名称。
- `repository`：仓库的名称（在 `include_repository` 为 `true`（默认值）时返回）。
- `uuid`：快照的通用唯一标识符（UUID）。
- `version_id`：用于创建快照的 Elasticsearch 版本的构建 ID。
- `version`：用于创建快照的 Elasticsearch 版本。
- `indices`：快照中包含的索引列表。
- `index_details`：每个索引的详细信息（以索引名称为键）。仅在 `index_details` 为 `true` 时出现，且仅针对以足够新的版本完整快照的索引。属性包括 `shard_count`（分片数量）、`size` / `size_in_bytes`（总大小，仅在设置 `human` 查询参数时返回 `size`）、`max_segments_per_shard`（每个分片的最大段数）。
- `data_streams`：快照中包含的数据流列表。
- `include_global_state`：快照中是否包含当前集群状态。
- `feature_states`：快照中的功能状态（仅当快照包含一个或多个功能状态时出现）。属性包括 `feature_name`（功能名称，由获取功能 API 返回）和 `indices`（索引列表）。
- `start_time` / `start_time_in_millis`：快照创建的开始时间（日期时间戳 / 毫秒数）。
- `end_time` / `end_time_in_millis`：快照创建的结束时间（日期时间戳 / 毫秒数）。
- `duration_in_millis`：快照创建所花费的时间（以毫秒为单位）。
- `failures`：创建快照时发生的任何失败的列表。
- `shards`：分片计数对象，包含 `total`、`successful` 和 `failed`。
- `state`：快照状态，取值之一：
  - `IN_PROGRESS`：快照当前正在运行。
  - `SUCCESS`：快照已完成，所有分片都已存储。
  - `FAILED`：快照已完成但有错误，未存储任何数据。
  - `PARTIAL`：已存储全局集群状态，但至少有一个分片的数据未成功存储（参见 `failures`）。

顶层字段还包括：

- `next`：如果请求包含大小限制并且可能还有更多结果，则会添加此字段，可用作 `after` 查询参数以获取其他结果。
- `total`：与请求匹配的快照总数（忽略大小限制或 `after` 参数）。
- `remaining`：由于大小限制而未返回的剩余快照数量，可通过使用 `next` 值的后续请求获取。

## 示例

以下示例检索单个快照的信息：

```txt
GET /_snapshot/my_repository/snapshot_2
```

API 返回以下响应：

```json
{
  "snapshots": [
    {
      "snapshot": "snapshot_2",
      "uuid": "vdRctLCxSketdKb54xw67g",
      "repository": "my_repository",
      "version_id": 8180099,
      "version": "8.18.0",
      "indices": [],
      "data_streams": [],
      "feature_states": [],
      "include_global_state": true,
      "state": "SUCCESS",
      "start_time": "2020-07-06T21:55:18.129Z",
      "start_time_in_millis": 1593093628850,
      "end_time": "2020-07-06T21:55:18.129Z",
      "end_time_in_millis": 1593094752018,
      "duration_in_millis": 0,
      "failures": [],
      "shards": {
        "total": 0,
        "failed": 0,
        "successful": 0
      }
    }
  ],
  "total": 1,
  "remaining": 0
}
```

以下示例使用通配符配合 `size` 和 `sort` 进行分页查询：

```txt
GET /_snapshot/my_repository/snapshot*?size=2&sort=name
```

响应中包含 `"next": "c25hcHNob3RfMixteV9yZXBvc2l0b3J5LHNuYXBzaG90XzI="`、`"total": 3` 和 `"remaining": 1`。

以下示例使用 `after` 获取下一页：

```txt
GET /_snapshot/my_repository/snapshot*?size=2&sort=name&after=c25hcHNob3RfMixteV9yZXBvc2l0b3J5LHNuYXBzaG90XzI=
```

以下示例使用 `offset` 获得相同的结果：

```txt
GET /_snapshot/my_repository/snapshot*?size=2&sort=name&offset=2
```

以下示例使用带排除模式的通配符：

```txt
GET /_snapshot/my_repository/snapshot*,-snapshot_3?sort=name
```

以下示例使用 `from_sort_value` 按名称分页：

```txt
GET /_snapshot/my_repository/*?sort=name&from_sort_value=snapshot_2
```

以下示例使用 `from_sort_value` 按时间分页（返回 2020 年 1 月 1 日当天或之后开始的所有 `snapshot_*` 快照）：

```txt
GET /_snapshot/my_repository/snapshot_*?sort=start_time&from_sort_value=1577833200000
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-snapshot-api.html)
