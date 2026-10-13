# 获取 Watcher 统计信息 API

检索当前的 Watcher 指标。

```txt
GET _watcher/stats
GET _watcher/stats/<metric>
```

## 前置条件

- 你必须具有 `manage_watcher` 或 `monitor_watcher` 集群权限才能使用此 API。

## 路径参数

`<metric>`

（可选，枚举）定义响应中包含哪些附加指标。该指标既可作为路径参数传递，也可作为查询字符串参数（`?metric=...`）传递。选项包括：

- `current_watches`：包含当前正在执行的 watch。
- `queued_watches`：包含排队等待执行的 watch。
- `_all`：包含所有指标。

## 查询参数

`emit_stacktraces`

（可选，布尔值）默认为 `false`。定义是否为每个正在运行的 watch 生成堆栈跟踪。

## 响应体

此 API **始终返回基本指标**；附加指标通过 `metric` 参数获取。

基本指标包括：

- `watcher_state`：Watcher 的当前状态：`started`、`starting` 或 `stopped`。
- `watch_count`：当前注册的 watch 数量。
- `execution_thread_pool`：包含 `queue_size`（已触发并当前排队等待执行的 watch 数量）和 `max_size`（执行线程池的最大大小，表示可并发执行的 watch 的最大数量）。

### `current_watches` 指标

将 `metric` 设置为 `current_watches` 或 `_all` 即可包含此指标。设置 `emit_stacktraces` 为 `true` 时，会为每个正在执行的 watch 添加堆栈跟踪，以便更深入地了解执行情况。

返回当前正在执行的 watch 列表。如果没有，则返回**空数组**。watch **按执行时间降序排序** — 运行时间最长的 watch 始终排在最前面。每个 watch 的字段包括：

- `watch_id`：正在执行的 watch 的 ID。
- `watch_record_id`：watch 记录的 ID。
- `triggered_time`：watch 被触发引擎触发的时间。
- `execution_time`：watch 被执行的时间（在输入执行之前）。
- `execution_phase`：当前执行阶段。可以是：`input`、`condition`、`actions`、`awaits_execution`、`started`、`watch_transform`、`aborted`、`finished`。

### `queued_watches` 指标

将 `metric` 设置为 `queued_watches` 或 `_all` 即可包含此指标。

背景：Watcher 会调节 watch 的执行，以免节点资源过载。如果太多 watch 同时触发而容量不足，一些 watch 会排队等待正在执行的 watch 完成。每个 watch 的字段包括：

- `watch_id`：排队等待执行的 watch 的 ID。
- `watch_record_id`：watch 记录的 ID。
- `triggered_time`：watch 被触发引擎触发的时间。
- `execution_time`：watch 进入排队状态的时间。

如果没有 watch 排队，则返回空数组。

## 示例

以下示例获取基本指标：

```txt
GET _watcher/stats
```

API 返回以下响应：

```json
{
  "watcher_state": "started",
  "watch_count": 1,
  "execution_thread_pool": {
    "size": 1000,
    "max_size": 1
  }
}
```

以下示例通过查询字符串获取 `current_watches` 指标（等效的路径变体为 `GET _watcher/stats/current_watches`）：

```txt
GET _watcher/stats?metric=current_watches
```

API 返回以下响应（包含一个执行中的 watch）：

```json
{
  "watcher_state": "started",
  "watch_count": 2,
  "execution_thread_pool": {
    "queue_size": 1000,
    "max_size": 20
  },
  "current_watches": [
    {
      "watch_id": "slow_condition",
      "watch_record_id": "slow_condition_3-2015-05-13T07:42:32.179Z",
      "triggered_time": "2015-05-12T11:53:51.800Z",
      "execution_time": "2015-05-13T07:42:32.179Z",
      "execution_phase": "condition"
    }
  ]
}
```

以下示例获取 `queued_watches` 指标：

```txt
GET _watcher/stats/queued_watches
```

API 返回以下响应：

```json
{
  "watcher_state": "started",
  "watch_count": 10,
  "execution_thread_pool": {
    "queue_size": 1000,
    "max_size": 20
  },
  "queued_watches": [
    {
      "watch_id": "slow_condition4",
      "watch_record_id": "slow_condition4_223-2015-05-21T11:59:59.811Z",
      "triggered_time": "2015-05-21T11:59:59.811Z",
      "execution_time": "2015-05-21T11:59:59.811Z"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-stats.html)
