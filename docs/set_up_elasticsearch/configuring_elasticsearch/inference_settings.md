# 推理设置

你无需配置任何设置即可使用推理 API。每个设置都有默认值。

## 推理 API 日志记录设置

当发生某些故障时，会发出日志消息。在故障重复发生的情况下，日志节流器会限制重复消息被记录。

| 设置 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `xpack.inference.logging.reset_interval` | 动态 | 指定清理线程清除先前已记录消息的内部缓存的间隔。 | `1d` |
| `xpack.inference.logging.wait_duration` | 动态 | 指定记录一条消息后、该消息再次被记录之前需要等待的时间。 | `1h` |

## 推理 API HTTP 设置

| 设置 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `xpack.inference.http.max_response_size` | 动态 | 指定 HTTP 响应允许的最大大小（以字节为单位）。最大可配置值为 100mb。 | `50mb` |
| `xpack.inference.http.max_total_connections` | 动态 | 指定内部连接池可以租出的最大连接数。 | `50` |
| `xpack.inference.http.max_route_connections` | 动态 | 指定单个路由可以从内部连接池租出的最大连接数。如果设置为等于或大于 `max_total_connections`，单个第三方服务可能租出所有可用连接，导致其他服务无法租用连接。 | `20` |
| `xpack.inference.http.connection_eviction_interval` | 动态 | 指定清除线程运行的间隔，用于从内部连接池中移除过期和陈旧的连接。如果多个第三方服务争用可用连接，减小此值可以提高吞吐量。 | `1m` |
| `xpack.inference.http.connection_eviction_max_idle_time` | 动态 | 指定连接在被标记为空闲、可关闭并从共享连接池中移除之前，可以处于未使用状态的最长时间。 | `1m` |
| `xpack.inference.http.request_executor.queue_capacity` | 动态 | 指定等待发送的请求的内部队列大小。如果队列已满，发送到推理 API 的请求将被拒绝。 | `2000` |

## 推理 API HTTP 重试设置

当第三方服务返回临时故障代码（例如 429）时，推理 API 会重试该请求。这些设置控制重试行为。重试请求时使用指数退避。

| 设置 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `xpack.inference.http.retry.initial_delay` | 动态 | 指定重试请求前的初始延迟。 | `1s` |
| `xpack.inference.http.retry.max_delay_bound` | 动态 | 指定请求的最大延迟。 | `5s` |
| `xpack.inference.http.retry.timeout` | 动态 | 指定请求可以重试的最长时间。超过此时间后，请求将不再重试并返回失败。 | `30s` |

## 推理 API 输入文本

对于某些第三方服务集成，当服务返回指示请求输入过大的错误时，输入将被截断并重试请求。这些设置控制截断的执行方式。

| 设置 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `xpack.inference.truncator.reduction_percentage` | 动态 | 指定当第三方服务响应指示输入过长时，输入文本要缩减的百分比。 | `0.5`（50%） |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/inference-settings.html)
