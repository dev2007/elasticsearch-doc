# 可搜索快照统计 API

:::warning 技术预览

此功能处于技术预览阶段，可能会在未来版本中更改或删除。Elastic 将努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。

:::

检索有关可搜索快照的统计信息。

```txt
GET /_searchable_snapshots/stats

GET /<target>/_searchable_snapshots/stats
```

## 前置条件

如果启用了 Elasticsearch 安全功能：

- 你必须具有 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。
- 你还必须对目标数据流或索引具有 `manage` [索引权限](../security_privileges/index_privileges)。

## 路径参数

`<target>`

（可选，字符串）要检索统计信息的数据流和索引的逗号分隔列表。要检索**所有**数据流和索引的统计信息，请省略此参数。

## 示例

以下示例检索索引 `my-index` 的统计信息：

```txt
GET /my-index/_searchable_snapshots/stats
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/searchable-snapshots-api-stats.html)
