# Fleet 批量搜索 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [Fleet 批量搜索 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-fleet-msearch)。

:::::

通过单个 API 请求执行多个 Fleet 搜索。

该 API 遵循与[批量搜索 API](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-multi-search.html) 相同的结构。但与 [Fleet 搜索 API](./fleet_search) 类似，它支持 `wait_for_checkpoints` 参数。

Fleet 批量搜索 API 专为通过 Fleet Server 间接使用而设计。不支持直接使用。Elastic 保留在未来的版本中更改或移除此功能的权利，恕不另行通知。

## 请求

```bash
GET /_fleet/_fleet_msearch
```

```bash
GET /<target>/_fleet/_fleet_msearch
```

## 路径参数

- `<target>`

  （可选，字符串）要搜索的单个目标。如果目标是索引别名，它必须解析为单个索引。

## 查询参数

- `wait_for_checkpoints`

  （可选，列表）以逗号分隔的检查点列表。配置后，搜索 API 将仅在相关检查点对搜索可见后才在分片上执行。默认为空列表，这将导致 Elasticsearch 立即执行搜索。

- `allow_partial_search_results`

  （可选，布尔值）如果为 `true`，当存在分片请求超时或分片失败时返回部分结果。如果为 `false`，返回错误且不返回部分结果。默认为集群设置 `search.default_allow_partial_results`，该设置默认为 `true`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/fleet-multi-search.html)
