# 获取全局检查点 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [获取全局检查点 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-fleet-global-checkpoints)。

:::::

获取全局检查点 API 的目的是返回索引的当前全局检查点。此 API 允许用户了解哪些序列号已安全持久化到 Elasticsearch 中。

## 轮询全局检查点推进

该 API 有一个可选的轮询模式，通过 `wait_for_advance` 查询参数启用。在轮询模式下，API 只有在全局检查点推进超过提供的检查点之后才会返回。默认情况下，`checkpoints` 为空数组，API 会立即返回。

如果在全局检查点推进超过提供的检查点之前发生超时，Elasticsearch 将返回当前的全局检查点和一个指示请求已超时的布尔值。

目前 `wait_for_advance` 参数仅支持单分片索引。

## 轮询索引就绪

默认情况下，在轮询模式中，如果索引不存在或所有主分片未处于活动状态，将返回异常。在轮询模式下，可以使用 `wait_for_index` 参数修改此行为。如果 `wait_for_index` 设置为 `true`，API 将等待索引被创建且所有主分片处于活动状态。

如果在满足这些条件之前发生超时，将返回相应的异常。

目前 `wait_for_index` 参数仅在 `wait_for_advance` 为 `true` 时支持。

## 请求

```bash
GET /<index>/_fleet/global_checkpoints
```

## 路径参数

- `<index>`

  （必需，字符串）单个索引或解析为单个索引的索引别名。

## 查询参数

- `wait_for_advance`

  （可选，布尔值）控制是否等待（直到超时）全局检查点推进超过提供的检查点。默认为 `false`。

- `wait_for_index`

  （可选，布尔值）控制是否等待（直到超时）目标索引存在且所有主分片处于活动状态。仅在 `wait_for_advance` 为 `true` 时才能设置为 `true`。默认为 `false`。

- `checkpoints`

  （可选，列表）以逗号分隔的先前全局检查点列表。与 `wait_for_advance` 结合使用时，API 只有在全局检查点推进超过这些检查点后才会返回。默认为空列表，这将导致 Elasticsearch 立即返回当前的全局检查点。

- `timeout`

  （可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待全局检查点推进超过 `checkpoints` 的时间。默认为 30s。

## 响应体

- `global_checkpoints`

  （整数数组）索引的全局检查点。

- `timed_out`

  （布尔值）如果为 `false`，表示全局检查点未在指定的超时时间内推进超过 `checkpoints`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-global-checkpoints.html)
