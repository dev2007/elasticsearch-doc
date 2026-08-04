# Fleet 搜索 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [Fleet 搜索 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-fleet-search)。

:::::

Fleet 搜索 API 的目的是提供一个搜索 API，其中搜索仅在提供的检查点已被处理并对 Elasticsearch 内部的搜索可见之后才执行。

Fleet 搜索 API 专为通过 Fleet Server 间接使用而设计。不支持直接使用。Elastic 保留在未来的版本中更改或移除此功能的权利，恕不另行通知。

## 等待检查点功能

Fleet 搜索 API 支持可选参数 `wait_for_checkpoints`。此参数是序列号检查点列表。当此参数存在时，搜索将仅在本地分片上执行，且前提是直到并包括提供的序列号检查点的所有操作都对搜索可见。索引操作在刷新后变为可见。检查点按分片索引。

如果在检查点刷新到 Elasticsearch 之前发生超时，搜索请求将超时。

Fleet 搜索 API 仅支持对单个目标进行搜索。如果提供索引别名作为搜索目标，它必须解析为单个具体索引。

## 允许部分结果

默认情况下，Elasticsearch 搜索 API 允许返回部分搜索结果。对于此 Fleet API，通常将其配置为 `false`，或在响应中检查以确保每个分片搜索都成功。如果不采取这些预防措施，即使一个或多个分片超时，也可能成功返回搜索结果。

## 请求

```bash
GET /<target>/_fleet/_fleet_search
```

## 路径参数

- `<target>`

  （必需，字符串）要搜索的单个目标。如果目标是索引别名，它必须解析为单个索引。

## 查询参数

- `wait_for_checkpoints`

  （可选，列表）以逗号分隔的检查点列表。配置后，搜索 API 将仅在相关检查点对搜索可见后才在分片上执行。默认为空列表，这将导致 Elasticsearch 立即执行搜索。

- `allow_partial_search_results`

  （可选，布尔值）如果为 `true`，当存在分片请求超时或分片失败时返回部分结果。如果为 `false`，返回错误且不返回部分结果。默认为集群设置 `search.default_allow_partial_results`，该设置默认为 `true`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/fleet-search.html)
