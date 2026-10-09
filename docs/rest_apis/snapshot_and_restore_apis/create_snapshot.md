# 创建快照 API

拍摄集群或指定数据流和索引的快照。

```txt
PUT /_snapshot/<repository>/<snapshot>
POST /_snapshot/<repository>/<snapshot>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `create_snapshot` 或 `manage` 集群权限才能使用此 API。

## 路径参数

`<repository>`

（必需，字符串）快照仓库的名称。

`<snapshot>`

（必需，字符串）快照的名称。支持[日期运算](/rest_apis/api_convention/date_math_support_in_parameter_values)。在快照仓库中必须唯一。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

`wait_for_completion`

（可选，布尔值）默认为 `false`。如果为 `true`，则请求在快照完成时返回响应。如果为 `false`，则请求在快照初始化时返回响应。

## 请求体

`expand_wildcards`

（可选，字符串）确定 `indices` 参数中的通配符模式如何匹配数据流和索引。支持逗号分隔的值（例如 `open,hidden`）。默认为 `all`。有效值包括：

- `all`：匹配任何数据流或索引，包括隐藏的数据流和索引。
- `open`：仅匹配打开的索引。
- `closed`：仅匹配已关闭的索引。
- `hidden`：仅匹配隐藏的索引。必须与 `open`、`closed` 或两者组合使用。
- `none`：不展开通配符模式。

`ignore_unavailable`

（可选，布尔值）默认为 `false`。如果为 `false`，则当 `indices` 中指定的任何数据流或索引缺失时，快照将失败。如果为 `true`，则缺失的数据流或索引将被忽略。

`include_global_state`

（可选，布尔值）默认为 `true`。如果为 `true`，则将集群状态包含在快照中。集群状态包括：持久集群设置、索引模板、旧式索引模板、摄取管道、ILM 策略、存储的脚本，以及（对于 7.12.0 之后拍摄的快照）功能状态。

`indices`

（可选，字符串或字符串数组）要包含的数据流和索引的逗号分隔列表。支持[多目标语法](/rest_apis/api_convention/multi_target_syntax)。默认为空数组（`[]`），包含所有常规数据流和常规索引。要排除所有数据流和索引，请使用 `-*`。你不能使用此参数来包含或排除系统索引或系统数据流 — 请改用 `feature_states`。

`feature_states`

（可选，字符串数组）要包含在快照中的功能状态。要获取可能的值，请使用获取功能 API。如果 `include_global_state` 为 `true`，则默认包含所有功能状态；如果为 `false`，则默认不包含任何功能状态。指定空数组会产生默认行为。要排除所有功能状态（无论 `include_global_state` 的值如何），请指定 `["none"]`。

`metadata`

（可选，对象）为快照附加任意元数据（例如拍摄者以及拍摄原因）。元数据必须小于 1024 字节。

`partial`

（可选，布尔值）默认为 `false`。如果为 `false`，则当包含的一个或多个索引没有所有主分片可用时，整个快照将失败。如果为 `true`，则允许对具有不可用分片的索引拍摄部分快照。

## 示例

以下示例为 `index_1` 和 `index_2` 拍摄快照：

```txt
PUT /_snapshot/my_repository/snapshot_2?wait_for_completion=true
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "metadata": {
    "taken_by": "user123",
    "taken_because": "backup before upgrading"
  }
}
```

API 返回以下响应：

```json
{
  "snapshot": {
    "snapshot": "snapshot_2",
    "uuid": "vdRctLCxSketdKb54xw67g",
    "repository": "my_repository",
    "version_id": 8180099,
    "version": "8.18.0",
    "indices": [ "index_1", "index_2" ],
    "data_streams": [],
    "feature_states": [],
    "include_global_state": false,
    "metadata": {
      "taken_by": "user123",
      "taken_because": "backup before upgrading"
    },
    "state": "SUCCESS",
    "start_time": "2020-06-25T14:00:28.850Z",
    "start_time_in_millis": 1593093628850,
    "end_time": "2020-06-25T14:00:28.850Z",
    "end_time_in_millis": 1593094752018,
    "duration_in_millis": 0,
    "failures": [],
    "shards": {
      "total": 0,
      "failed": 0,
      "successful": 0
    }
  }
}
```

响应中 `snapshot` 对象的字段包括：

- `snapshot`：快照的名称。
- `uuid`：快照的唯一标识符。
- `repository`：快照仓库的名称。
- `version_id` / `version`：创建快照的 Elasticsearch 版本 ID 和版本号。
- `indices`：快照中包含的索引数组。
- `data_streams`：快照中包含的数据流数组。
- `feature_states`：快照中包含的功能状态数组。
- `include_global_state`：快照中是否包含集群状态。
- `metadata`：附加到快照的自定义元数据。
- `state`：快照的状态，例如 `SUCCESS`。
- `start_time` / `start_time_in_millis`：快照的开始时间（ISO 时间戳格式 / 以毫秒为单位的 epoch 时间）。
- `end_time` / `end_time_in_millis`：快照的结束时间（ISO 时间戳格式 / 以毫秒为单位的 epoch 时间）。
- `duration_in_millis`：快照的持续时间（以毫秒为单位）。
- `failures`：失败的数组。
- `shards`：分片计数对象，包含 `total`（总数）、`failed`（失败数）和 `successful`（成功数）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/create-snapshot-api.html)
