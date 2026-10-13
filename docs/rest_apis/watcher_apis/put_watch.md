# 创建或更新 watch API

在 Watcher 中注册一个新 watch 或更新一个现有 watch。

```txt
PUT _watcher/watch/<watch_id>
```

## 前置条件

- 你必须具有 `manage_watcher` 集群权限才能使用此 API。

## 描述

- 注册 watch 时，会在 `.watches` 索引中添加一个代表该 watch 的新文档，并且其触发器会立即注册到相关的触发引擎（对于 `schedule` 触发器，通常是调度器）。
- 你必须使用 **Kibana 或此 API** 来创建 watch。不要使用 Elasticsearch 的索引 API 将 watch 直接添加到 `.watches` 索引。
- 如果启用了 Elasticsearch 安全功能，**不要**授予用户对 `.watches` 索引的 `write` 权限。
- 添加 watch 时，可以通过 `active` 参数定义其初始活动状态。

### 与安全的集成

启用安全功能后，watch 只能对存储该 watch 的用户具有权限的索引进行索引或搜索。（例如，如果该用户可以读取索引 `a` 但不能读取索引 `b`，则 watch 的执行会受到同样的限制。）

## 路径参数

`<watch_id>`

（必需，字符串）watch 的标识符。

## 查询参数

`active`

（可选，布尔值）定义 watch 默认是活动还是非活动。默认为 `true`（活动）。

## 请求体（watch 定义）

- `trigger`：定义 watch 何时运行的触发器。
- `input`：定义加载 watch 所需数据的输入。
- `condition`：定义是否应运行操作的条件。
- `actions`：条件匹配时将运行的操作列表。
- `transform`：处理 watch 载荷以准备用于 watch 操作的转换。
- `metadata`：将被复制到历史条目中的元数据 JSON。
- `throttle_period`：操作运行之间的最小时间间隔；默认为 5 秒（可通过 `xpack.watcher.throttle.period.default_period` 配置）。如果同时指定了此参数和 `throttle_period_in_millis`，Watcher 会使用请求中**最后**包含的参数。
- `throttle_period_in_millis`：操作之间的最小时间间隔（以毫秒为单位）。默认为 `5000`。如果两者都指定，则以请求中的**最后一个**参数为准。

以下示例创建一个完整的 watch `my-watch`，其特性包括：每分钟触发一次（cron 表达式 `0 0/1 * * * ?`）；搜索 `logstash*` 索引中最近 5 分钟内的 404 HTTP 响应；条件检查是否找到了任何搜索命中；操作是向管理员发送电子邮件：

```txt
PUT _watcher/watch/my-watch
{
  "trigger": {
    "schedule": {
      "cron": "0 0/1 * * * ?"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": [ "logstash*" ],
        "body": {
          "query": {
            "bool": {
              "must": {
                "match": {
                  "response": 404
                }
              },
              "filter": {
                "range": {
                  "@timestamp": {
                    "from": "{{ctx.trigger.scheduled_time}}||-5m",
                    "to": "{{ctx.trigger.triggered_time}}"
                  }
                }
              }
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
    "email_admin": {
      "email": {
        "to": "admin@domain.host.com",
        "subject": "404 recently encountered"
      }
    }
  }
}
```

以下示例注册一个非活动的 watch：

```txt
PUT _watcher/watch/my-watch?active=false
```

如果省略 `active` 参数，则 watch 默认为活动状态。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/watcher-api-put-watch.html)
