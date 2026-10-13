# 查询 watch API

以分页方式检索所有 watch，并可选择通过查询进行筛选。检索所有已注册的 watch。

```txt
GET /_watcher/_query/watches
```

## 前置条件

- 你必须具有 `manage_watcher` 或 `monitor_watcher` 集群权限才能使用此 API。

## 请求体

- `from`：默认为 `0`。从第一个结果开始获取的偏移量。必须为非负数。
- `size`：默认为 `10`。要返回的命中数。必须为非负数。
- `query`：默认为 `null`。用于筛选要返回的 watch 的可选 Query DSL 过滤器。
- `sort`：默认为 `null`。可选的排序定义。
- `search_after`：默认为 `null`。可选的 "search after" 值，使用最后一个命中的排序值进行分页。

:::note 注意

只有 `_id` 和 `metadata.*` 字段是可查询或可排序的。

:::

## 响应体

- `count`：找到的 watch 总数。
- `watches`：基于 `from`、`size` 或 `search_after` 请求体参数的 watch 列表。每个元素包含 `_id`、`watch`（包含 `trigger`、`input`、`condition`、`actions`）、`status`（包含 `state`、`actions`、`version`）、`_seq_no` 和 `_primary_term`。

## 示例

以下示例查询所有 watch：

```txt
GET /_watcher/_query/watches
```

API 返回以下响应：

```json
{
  "count": 1,
  "watches": [
    {
      "_id": "my_watch",
      "watch": {
        "trigger": {
          "schedule": {
            "hourly": {
              "minute": [ 0, 5 ]
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
            "index": {
              "index": "test"
            }
          }
        }
      },
      "status": {
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
        },
        "version": -1
      },
      "_seq_no": 0,
      "_primary_term": 1
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-query-watches.html)
