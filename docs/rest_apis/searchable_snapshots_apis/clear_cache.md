# 清除缓存 API

:::warning 技术预览

此功能处于技术预览阶段，可能会在未来版本中更改或删除。Elastic 将努力修复任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 约束。

:::

从部分挂载索引的共享缓存中清除索引和数据流。

```txt
POST /_searchable_snapshots/cache/clear

POST /<target>/_searchable_snapshots/cache/clear
```

## 前置条件

如果启用了 Elasticsearch 安全功能：

- 你必须具有**管理**[集群权限](../security_privileges/cluster_privileges)才能使用此 API。
- 你还必须对目标数据流、索引或别名具有**管理**[索引权限](../security_privileges/index_privileges)。

## 路径参数

`<target>`

（可选，字符串）要从缓存中清除的数据流、索引和别名的逗号分隔列表。支持通配符（`*`）。要清除整个缓存，请省略此参数。

## 示例

以下示例清除索引 `my-index` 的缓存：

```txt
POST /my-index/_searchable_snapshots/cache/clear
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/searchable-snapshots-api-clear-cache.html)
