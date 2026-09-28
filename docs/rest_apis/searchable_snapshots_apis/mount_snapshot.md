# 挂载快照 API

将一个快照挂载为可搜索快照索引。

:::warning 警告

不要对由 ILM（索引生命周期管理）管理的快照使用此 API。手动挂载 ILM 管理的快照可能会干扰 ILM 进程。

:::

```txt
POST /_snapshot/<repository>/<snapshot>/_mount
```

## 前置条件

如果启用了 Elasticsearch 安全功能，你必须具有：

- `manage` [集群权限](../security_privileges/cluster_privileges)
- 对任何包含的索引的 `manage` [索引权限](../security_privileges/index_privileges)

## 路径参数

`<repository>`

（必需，字符串）包含要挂载索引快照的仓库名称。

`<snapshot>`

（必需，字符串）要挂载索引的快照的名称。

## 查询参数

`master_timeout`

（可选，[时间单位](../api_conventions/time_units)）等待主节点的时长。如果超时前主节点不可用，请求失败并返回错误。也可以设置为 `-1` 表示请求永远不超时。默认为 `30s`。

`wait_for_completion`

（可选，布尔值）如果为 `true`，请求阻塞直到操作完成。默认为 `false`。

`storage`

（可选，字符串）可搜索快照索引的挂载选项。可能值为：

- `full_copy`（默认）— 完全挂载的索引。

- `shared_cache` — 部分挂载的索引。

## 请求体

`index`

（必需，字符串）快照中包含的要挂载其数据的索引的名称。如果未指定 `renamed_index`，此名称也将用于创建新索引。

`renamed_index`

（可选，字符串）将要创建的索引的名称。

`index_settings`

（可选，对象）挂载时应添加到索引的设置（例如 `index.number_of_replicas`）。

`ignore_index_settings`

（可选，字符串数组）挂载时应从索引中移除的设置的名称（例如 `index.refresh_interval`）。

## 示例

以下示例将存储在 `my_repository` 中名为 `my_snapshot` 的现有快照中的索引 `my_docs` 挂载为新索引 `docs`：

```json
POST /_snapshot/my_repository/my_snapshot/_mount?wait_for_completion=true
{
  "index": "my_docs",
  "renamed_index": "docs",
  "index_settings": {
    "index.number_of_replicas": 0
  },
  "ignore_index_settings": [ "index.refresh_interval" ]
}
```

- `index` — 快照中要挂载的索引的名称
- `renamed_index` — 要创建的索引的名称
- `index_settings` — 要添加到新索引的任何索引设置
- `ignore_index_settings` — 挂载快照索引时要忽略的索引设置列表

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/searchable-snapshots-api-mount-snapshot.html)
