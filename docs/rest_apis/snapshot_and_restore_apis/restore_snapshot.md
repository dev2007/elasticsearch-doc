# 恢复快照 API

恢复集群或指定数据流和索引的快照。

```txt
POST /_snapshot/<repository>/<snapshot>/_restore
```

## 前置条件

- 如果使用了 Elasticsearch 安全功能，你必须具有 `manage` 或 `cluster:admin/snapshot/*` 集群权限。
- 你只能将快照恢复到具有当选主节点的正在运行的集群。快照的仓库必须已注册并且对集群可用。
- 快照和集群版本必须兼容（参见[快照兼容性](/operational_management/snapshot_and_restore)）。
- 集群的全局元数据必须是可写的 — 确保没有任何集群块阻止写入。恢复操作会忽略索引块。
- 在恢复数据流之前，确保集群包含一个启用了数据流的匹配索引模板。可以使用以下请求进行检查：

```txt
GET _index_template/*?filter_path=index_templates.name,index_templates.index_template.index_patterns,index_templates.index_template.data_stream
```

:::note 注意

如果没有匹配的模板，数据流将无法进行 rollover 或创建后备索引。你可以创建一个模板，或恢复包含模板的集群状态。

:::

:::note 注意

如果快照包含 App Search 或 Workplace Search 数据，请先恢复 Enterprise Search 加密密钥。

:::

## 路径参数

`<repository>`

（必需，字符串）要从中恢复快照的仓库的名称。

`<snapshot>`

（必需，字符串）要恢复的快照的名称。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）默认为 `30s`。等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。可以设置为 `-1` 表示永不超时。

`wait_for_completion`

（可选，布尔值）默认为 `false`。如果为 `true`，则请求在恢复操作完成时返回响应（在所有恢复主分片的尝试之后，即使某些尝试失败）。如果为 `false`，则请求在操作初始化时返回响应。

## 请求体

`ignore_unavailable`

（可选，布尔值）默认为 `false`。如果为 `true`，则忽略 `indices` 中快照缺失的任何索引或数据流。如果为 `false`，则对于缺失的项返回错误。

`ignore_index_settings`

（可选，字符串或字符串数组）**不**从快照恢复的索引设置。不能用于忽略 `index.number_of_shards`。对于数据流，仅应用于已恢复的后备索引。

`include_aliases`

（可选，布尔值）默认为 `true`。如果为 `true`，则恢复已恢复的数据流和索引的别名。

`include_global_state`

（可选，布尔值）默认为 `false`。如果为 `true`，则恢复集群状态。集群状态包括：持久集群设置、索引模板、旧式索引模板、摄取管道、ILM 策略、存储的脚本，以及（对于 7.12.0 之后的快照）功能状态。如果为 `true`，旧式索引模板会被合并（现有匹配项被替换）；持久设置、非旧式索引模板、摄取管道和 ILM 策略会被完全移除并替换为快照中的内容。如果为 `true` 且快照创建时未包含全局状态，则请求失败。

`feature_states`

（可选，字符串数组）要恢复的功能状态。如果 `include_global_state` 为 `true`，则默认恢复快照中的所有功能状态；如果为 `false`，则默认不恢复任何功能状态。空数组会产生默认行为。要排除所有功能状态（无论 `include_global_state` 的值如何），请指定 `["none"]`。

`indices`

（可选，字符串或字符串数组）要恢复的索引和数据流的逗号分隔列表。支持[多目标语法](/rest_apis/api_convention/multi_target_syntax)。默认为快照中的所有常规索引和常规数据流。不能用于恢复系统索引或系统数据流 — 请改用 `feature_states`。

`partial`

（可选，布尔值）默认为 `false`。如果为 `false`，则当任何包含的索引缺少部分主分片时，整个恢复将失败。如果为 `true`，则允许恢复具有不可用分片的索引的部分快照 — 仅恢复成功快照的分片；缺失的分片会被重建为空分片。

`rename_pattern`

（可选，字符串）应用于已恢复的数据流和索引的重命名模式，作为一个正则表达式，支持引用原始文本（Java `Matcher.appendReplacement` 逻辑）。

`rename_replacement`

（可选，字符串）重命名替换字符串。

`index_settings`

（可选，对象）要在已恢复索引（包括后备索引）中添加或更改的索引设置。不能更改 `index.number_of_shards`。对于数据流，仅应用于已恢复的后备索引；新的后备索引使用匹配的索引模板。

## 示例

### 重命名恢复

以下示例从 `snapshot_2` 恢复 `index_1` 和 `index_2`。匹配 `index_(.+)` 的索引被重命名为 `restored_index_$1` — 例如，`index_1` 被重命名为 `restored_index_1`，`index_2` 被重命名为 `restored_index_2`：

```txt
POST /_snapshot/my_repository/snapshot_2/_restore?wait_for_completion=true
{
  "indices": "index_1,index_2",
  "ignore_unavailable": true,
  "include_global_state": false,
  "rename_pattern": "index_(.+)",
  "rename_replacement": "restored_index_$1",
  "include_aliases": false
}
```

如果请求成功，API 会返回一个确认。如果遇到错误，响应会指示发现的问题，例如打开的索引阻止了恢复。

### 原位恢复

此用法适用于例如集群分配解释 API 报告 `no_valid_shard_copy` 的情况。先关闭索引，然后将其原位恢复：

```txt
POST index_1/_close
```

```txt
POST /_snapshot/my_repository/snapshot_2/_restore?wait_for_completion=true
{
  "indices": "index_1"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/restore-snapshot-api.html)
