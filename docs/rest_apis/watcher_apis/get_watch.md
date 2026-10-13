# 获取 watch API

通过 watch 的 ID 检索一个 watch。

```txt
GET _watcher/watch/<watch_id>
```

## 前置条件

- 使用此 API 必须拥有以下集群权限之一：`manage_watcher` 或 `monitor_watcher`。

## 路径参数

`<watch_id>`

（必需，字符串）watch 的标识符。

## 响应体

顶层字段包括：

- `found`：是否找到了指定 ID 的 watch。
- `_id`：watch 的 ID。
- `_seq_no`：序列号，用于乐观并发控制。
- `_primary_term`：主分片任期，与 `_seq_no` 配合使用。
- `_version`：watch 文档的版本号。
- `status`：watch 的当前状态，包含：
  - `status.version`：状态对象的版本号。
  - `status.state.active`：布尔值，表示 watch 是否处于激活状态。
  - `status.state.timestamp`：状态时间戳。
  - `status.actions.<action_name>.ack.timestamp`：该操作确认状态的时间戳。
  - `status.actions.<action_name>.ack.state`：确认状态，例如 `awaits_successful_execution`（等待成功执行）。
- `watch`：watch 定义本身，包含：
  - `watch.input`：输入定义。
  - `watch.condition`：条件定义。
  - `watch.trigger`：触发器定义。
  - `watch.actions`：操作定义。

## 示例

以下示例获取 ID 为 `my_watch` 的 watch：

```txt
GET _watcher/watch/my_watch
```

API 返回以下响应：

```json
{
  "found": true,
  "_id": "my_watch",
  "_seq_no": 0,
  "_primary_term": 1,
  "_version": 1,
  "status": {
    "version": 1,
    "state": {
      "active": true,
      "timestamp": "2015-05-26T18:21:08.630Z"
    },
    "actions": {
      "test_index": {
        "ack": {
          "timestamp": "2015-05-26T18:21:08.630Z",
          "state": "awaits_successful_execution"
        }
      }
    }
  },
  "watch": {
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
    "trigger": {
      "schedule": {
        "hourly": {
          "minute": [ 0, 5 ]
        }
      }
    },
    "actions": {
      "test_index": {
        "index": {
          "index": "test"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-get-watch.html)
