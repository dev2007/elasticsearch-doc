# 停止 rollup 作业 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

停止一个现有的、已启动的 rollup 作业。

```txt
POST _rollup/job/<job_id>/_stop
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 或 `manage_rollup` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 路径参数

`<job_id>`

（必需，字符串）rollup 作业的标识符。

## 查询参数

`timeout`

（可选，[时间值](../api_conventions/time_units)）如果 `wait_for_completion` 为 `true`，API 在等待作业停止期间最多阻塞指定的时长。如果超过 `timeout` 时间，API 会抛出超时异常。默认为 `30s`。即使抛出超时异常，停止请求仍在继续处理，并最终将作业移动到 `STOPPED` — 超时仅表示 API 调用本身在等待状态更改时超时了。

`wait_for_completion`

（可选，布尔值）如果为 `true`，API 会阻塞直到索引器状态完全停止。如果为 `false`，API 立即返回，索引器在后台异步停止。默认为 `false`。

## 描述

- 如果尝试停止一个**不存在**的作业，会发生异常。
- 如果尝试停止一个**已停止**的作业，不会发生任何变化。

## 响应码

- `404`（资源缺失）

  表示没有与请求匹配的资源。尝试停止不存在的作业时会发生。

## 示例

由于只有已停止的作业才能删除，让 API 阻塞直到索引器完全停止可能很有用。这可以通过 `wait_for_completion` 查询参数以及可选的 `timeout` 来实现：

```txt
POST _rollup/job/sensor/_stop?wait_for_completion=true&timeout=10s
```

`wait_for_completion` 参数会阻止 API 调用返回，直到作业已移动到 `STOPPED` 或指定的时间已经过去。如果在指定时间过去后作业仍未移动到 `STOPPED`，将抛出超时异常。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-stop-job.html)
