# 集群健康 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

返回一个集群的健康状态。

## 请求

```bash
GET /_cluster/health/<target>
```

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须有 `monitor` 或 `manage` 的[集群权限](/secure_the_elastic_statck/user_authorization/security_privileges#集群权限)以使用此 API。

## 描述

集群健康 API 返回集群健康的简单状态。你还可以使用 API 仅获取指定数据流和索引的健康状况。对于数据流，API 会检索流的后备索引的健康状况。

集群健康状况分为：`green`（绿色）、`yellow`（黄色）或 `red`（红色）。在分片级别，`red`（红色）状态表示特定分片未在集群中分配，`yellow`（黄色）表示主分片已分配但副本未分配，`green`（绿色）表示所有分片均已分配。索引级状态由最差分区状态控制。集群状态由最差索引状态控制。

此 API 的主要优点之一是可以等待集群达到一定的高水位健康水平。例如，以下内容将等待 50 秒，等待集群达到黄色级别（如果在 50 秒后达到 `green`（绿色）或`yellow`（黄色）状态，则会在此时返回）：

```bash
GET /_cluster/health?wait_for_status=yellow&timeout=50s
```

## 路径参数

- `<target>`

  （可选，字符串） 用于限制请求的数据流、索引和索引别名的逗号分隔列表。支持通配符表达式 (`*`)。

  要以集群中的所有数据流和索引为目标，请省略此参数或使用 `_all` 或 `*`。

## 查询参数

- `level`

  （可选，字符串） 可以是 `cluster`（集群）、`indices`（索引）或 `shards`（分片）之一。控制返回的健康信息的详细信息级别。默认为 `cluster`（集群）。

- `local`

  （可选，布尔值） 如果为 `true`，则请求只从本地节点检索信息。默认为 `false`，表示从主节点获取信息。

- `master_timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待连接到主节点的时间。如果在超时前主节点不可用，则请求失败并返回错误信息。默认值为 `30s`。也可以设置为 `-1`，表示请求永不超时。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）更新集群元数据后等待集群中所有相关节点响应的时间。如果在超时前未收到任何响应，群集元数据更新仍将适用，但响应将显示未完全确认。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

- `wait_for_active_shards`

  （可选，字符串）一个数字，表示要等待多少个激活的分片，`all` 表示等待集群中所有分片都激活，`0` 表示不等待。默认为 `0`。

- `wait_for_events`

  （可选，字符串）可以是 `immediate`、 `urgent`、 `high`、 `normal`、 `low`、 `languid`中的一个。等待当前队列中所有具有给定优先级的事件被处理完毕。

- `wait_for_no_initializing_shards`

  （可选，布尔值）一个布尔值，用于控制是否等待（直到提供的超时时间）集群没有分片初始化。默认值为 `false`，即不等待分片初始化。

- `wait_for_no_relocating_shards`

（可选，布尔值）一个布尔值，用于控制是否等待（直到提供的超时时间）集群没有分片重定位。默认值为 `false`，即不等待分片重定位。

- `wait_for_nodes`

  （可选，字符串）请求等待指定数量的 `N` 节点可用。它也接受 `>=N`、`<=N`、`>N` 和 `<N`。也可以使用 `ge(N)`、`le(N)`、`gt(N)`和 `lt(N)` 符号。

- `wait_for_status`

  （可选，字符串）`green`（绿色）、`yellow`（黄色）或 `red`（红色）之一。将等待（直到超时）群集的状态变为所提供的状态或更好的状态，即 `green`（绿色）> `yellow`（黄色） > red`（红色。默认情况下，不会等待任何状态。

## 响应体

- `cluster_name`

  （字符串）集群的名称。

- `status`

  （字符串）群集的健康状态，基于其主分片和副本分片的状态。状态包括：

  - `green`:所有分区都已分配。
  - `yellow`: 所有主分片都已分配，但一个或多个副本分片未分配。如果集群中的一个节点发生故障，在该节点修复之前，一些数据可能无法使用。
  - `red`: 一个或多个主分区未分配，因此某些数据不可用。这种情况可能在群集启动期间主分区分配时短暂出现。

- `timed_out`

  （布尔值）如果为 `false`，则在超时参数指定的时间内（默认为 `30s`）返回响应。

- `number_of_nodes`

  （整数）集群内的节点数。

- `number_of_data_nodes`

  （整数）专用数据节点的数量。

- `active_primary_shards`
  （整数）活动主分区的数量。

- `active_shards`

  （整数）活动主分片和副本分片的总数。

- `relocating_shards`
  （整数）正在重新定位的分片数量。

- `initializing_shards`
  （整数） 正在初始化的分片数量。

- `unassigned_shards`
  （整数）未分配的分区数量。

- `unassigned_primary_shards`

  （整数）主要但未分配的分片数量。**注意**：如果集群中包含运行低于 8.16 版本的节点，则该数字可能低于真实值。要在这种情况下获得更准确的计数，请使用集群健康 API。

- `delayed_unassigned_shards`

  （整数）因超时设置而延迟分配的分片数量。

- `number_of_pending_tasks`
  （整数）尚未执行的群集级更改的数量。

- `number_of_in_flight_fetch`

  （整数）未完成的获取次数。

- `task_max_waiting_in_queue_millis`

  （整数）最早启动的任务等待执行的时间，以毫秒为单位。

- `active_shards_percent_as_number`

  （浮点数）集群中活动分片的比例，以百分比表示。

## 示例

```bash
GET _cluster/health
```

如果单节点集群中只有一个索引，且只有一个分片和一个副本，API 会返回以下响应：

```json
{
  "cluster_name": "testcluster",
  "status": "yellow",
  "timed_out": false,
  "number_of_nodes": 1,
  "number_of_data_nodes": 1,
  "active_primary_shards": 1,
  "active_shards": 1,
  "relocating_shards": 0,
  "initializing_shards": 0,
  "unassigned_shards": 1,
  "unassigned_primary_shards": 0,
  "delayed_unassigned_shards": 0,
  "number_of_pending_tasks": 0,
  "number_of_in_flight_fetch": 0,
  "task_max_waiting_in_queue_millis": 0,
  "active_shards_percent_as_number": 50.0
}
```

下面是一个在 `shards`（分片）级别获取集群健康状况的示例：

```bash
GET /_cluster/health/my-index-000001?level=shards
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster-health.html)
