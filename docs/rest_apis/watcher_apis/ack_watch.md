# 确认 watch API

确认（acknowledge）一个 watch 使你能够手动限制该 watch 的操作的执行。

```txt
PUT _watcher/watch/<watch_id>/_ack
PUT _watcher/watch/<watch_id>/_ack/<action_id>
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 描述

- 操作的确认状态存储在 `status.actions.<id>.ack.state` 结构中。
- 如果指定的 watch 当前正在执行，此 API 将返回错误 — 这可以防止来自 watch 执行的 watch 状态被覆盖。

## 路径参数

`<watch_id>`

（必需，字符串）watch 的标识符。

`<action_id>`

（可选，列表）要确认的操作 ID 的逗号分隔列表。如果省略，则确认该 watch 的**所有**操作。

## 响应体

响应类似于获取 watch API 的响应，但只包含 watch 的**状态**：

```json
{
  "status": {
    "state": {
      "active": true,
      "timestamp": "2015-05-26T18:04:27.723Z"
    },
    "last_checked": "2015-05-26T18:04:27.753Z",
    "last_met_condition": "2015-05-26T18:04:27.763Z",
    "actions": {
      "test_index": {
        "ack": {
          "timestamp": "2015-05-26T18:04:27.713Z",
          "state": "acked"
        },
        "last_execution": {
          "timestamp": "2015-05-25T18:04:27.733Z",
          "successful": true
        },
        "last_successful_execution": {
          "timestamp": "2015-05-25T18:04:27.773Z",
          "successful": true
        }
      }
    },
    "execution_state": "executed",
    "version": 2
  }
}
```

## 确认状态的生命周期

- 新 watch 的操作状态：`awaits_successful_execution`（等待成功执行）。
- watch 执行且条件匹配后：`ackable`（可确认）。
- 调用确认 API 后：`acked`（已确认）。
- 当 watch 的条件求值为 **false**（条件未满足）时，状态会重置为 `awaits_successful_execution`。确认会限制该操作的进一步执行，直到发生该重置。

## 示例

以下示例展示一个完整的工作流程：

1. 创建一个 watch：

```txt
PUT _watcher/watch/my_watch
{
  "trigger": {
    "schedule": {
      "yearly": {
        "in": "february",
        "on": 29,
        "at": "noon"
      }
    }
  },
  "input": {
    "simple": {
      "payload": {
        "send": "yes"
      }
    }
  },
  "condition": {
    "always": {}
  },
  "actions": {
    "test_index": {
      "throttle_period": "15m",
      "index": {
        "index": "test"
      }
    }
  }
}
```

2. 通过获取 watch API 检查初始状态，操作状态为 `awaits_successful_execution`。

3. 通过执行 watch API 强制执行（`record_execution` 为 `true`），然后重新检查状态，操作状态变为 `ackable`。

4. 确认单个操作 `test_index`：

```txt
PUT _watcher/watch/my_watch/_ack/test_index
```

操作状态变为 `acked`。

5. 确认多个操作：

```txt
POST _watcher/watch/my_watch/_ack/action1,action2
```

6. 省略操作 ID 以确认所有操作：

```txt
POST _watcher/watch/my_watch/_ack
```

响应中只包含状态（如上面的响应体所示）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-ack-watch.html)
