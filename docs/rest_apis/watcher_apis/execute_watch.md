# 执行 watch API

强制执行一个已存储的 watch，而不考虑其触发逻辑；或模拟执行以进行调试。

```txt
POST _watcher/watch/<watch_id>/_execute
POST _watcher/watch/_execute
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 描述

- 提供细粒度的控制：可以在不执行所有操作的情况下运行、模拟操作、通过忽略 watch 条件来强制执行，以及控制是否将 watch 记录写入 watch 历史。
- **内联 watch 执行**：你可以执行*尚未注册*的 watch，方法是在请求体中内联指定 watch 定义 — 这在注册 watch 之前进行测试/调试时非常有用。

## 路径参数

`<watch_id>`

（可选，字符串）watch 的标识符。

## 查询参数

`debug`

（可选，布尔值）默认为 `false`。定义 watch 是否以调试模式运行。

## 请求体

`trigger_data`

（可选，对象）解析为 watch 执行期间使用的触发器事件数据的结构。

`ignore_condition`

（可选，布尔值）默认为 `false`。如果为 `true`，则使用**always 条件**。也可以作为 HTTP 参数使用。

`alternative_input`

（可选，对象）如果存在，watch 将使用此对象作为载荷，而不是执行自己的输入。

`action_modes`

（可选，对象）确定执行期间如何处理 watch 操作（参见操作执行模式）。

`record_execution`

（可选，布尔值）默认为 `false`。如果为 `true`，则 watch 记录会持久化到 `.watcher-history` 索引；watch 状态会被更新，可能会限制后续执行。也可以作为 HTTP 参数使用。

`watch`

（可选，对象）如果存在，则使用此 watch 定义代替已存储的 watch。不会持久化到索引；**不能设置 `record_execution`**。

### 操作执行模式（用于 `action_modes`）

- `simulate`：操作执行被模拟（例如，电子邮件操作会创建但不发送电子邮件）。操作可能会根据当前 watch 状态被节流。
- `force_simulate`：与 `simulate` 类似，但忽略节流。
- `execute`：像正常触发一样执行操作。可能会被节流。
- `force_execute`：与 `execute` 类似，但忽略节流。
- `skip`：操作被跳过 — 不执行也不模拟（实际上等于强制节流）。

模式可以按操作 ID 设置（例如 `{"action1": "force_simulate", "action2": "skip"}`），也可以使用 `"_all"` 作为操作 ID 对所有操作设置。

### 与安全的集成

- 启用安全功能后，watch 以**存储该 watch 的用户**的权限执行。
- 使用执行 watch API 时，**调用者**的授权数据将作为基础，而不是存储该 watch 的用户。

## 响应体

响应包含一个会存储到 `.watcher-history` 中的 watch 记录：

- `_id`：watch 记录的 ID。
- `watch_record`：完整的 watch 记录文档，包括 `@timestamp`、`watch_id`、`node`、`messages`、`trigger_event`（类型为 `manual`）、`state`（例如 `executed`）、`status`（版本、执行状态、活动状态、`last_checked`、`last_met_condition`、每个操作的确认/执行状态）、`input` 和 `condition`（求值结果）、`result`（执行时间、输入结果、条件结果以及每个操作的结果）、`user`（用于执行该 watch 的用户）。

## 示例

以下示例对已存储的 watch 进行综合执行：

```txt
POST _watcher/watch/my_watch/_execute
{
  "trigger_data": {
    "triggered_time": "now",
    "scheduled_time": "now"
  },
  "alternative_input": {
    "foo": "bar"
  },
  "ignore_condition": true,
  "action_modes": {
    "my-action": "force_simulate"
  },
  "record_execution": true
}
```

该请求的效果：提供了触发/计划时间；忽略 watch 自己的输入而使用提供的输入作为载荷；忽略 watch 的条件（假定其为 `true`）；`my-action` 操作被强制模拟（忽略节流）；watch 记录持久化到历史记录，节流状态可能被更新。

以下示例以内联方式执行一个尚未注册的 watch：

```txt
POST _watcher/watch/_execute
{
  "watch": {
    "trigger": {
      "schedule": {
        "interval": "10s"
      }
    },
    "input": {
      "search": {
        "request": {
          "indices": [ "logs" ],
          "body": {
            "query": {
              "match": {
                "message": "error"
              }
            }
          }
        }
      }
    },
    "condition": {
      "compare": {
        "ctx.payload.hits.total": {
          "gt": 0
        }
      }
    },
    "actions": {
      "log_error": {
        "logging": {
          "text": "Found {{ctx.payload.hits.total}} errors in the logs"
        }
      }
    }
  }
}
```

如果同时设置 `"ignore_condition": true`，则在执行期间会忽略内联的 `compare` 条件。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-execute-watch.html)
