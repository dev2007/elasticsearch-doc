# 克隆快照 API

克隆快照 API 允许在同一个仓库内创建现有快照的全部或部分内容的副本。

```txt
PUT /_snapshot/<repository>/<source_snapshot>/_clone/<target_snapshot>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` 集群权限才能使用此 API。

## 路径参数

`<repository>`

（必需，字符串）源快照和目标快照所属的快照仓库的名称。

`<source_snapshot>`

（必需，字符串）要克隆的源快照的名称。

`<target_snapshot>`

（必需，字符串）要创建的新快照的名称。

## 查询参数

`master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）等待主节点的期限。如果在超时期限到期之前主节点不可用，则请求失败并返回错误。默认为 `30s`。也可以设置为 `-1`，表示请求永不超时。

`timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options.html#时间单位)）指定等待响应的时间期限。如果在超时期限到期之前未收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

`indices`

（必需，字符串）要包含在快照中的索引的逗号分隔列表。支持[多目标语法](/rest_apis/api_convention/multi_target_syntax)。

## 示例

以下示例将源快照中的 `index_a` 和 `index_b` 克隆到目标快照中：

```txt
PUT /_snapshot/my_repository/source_snapshot/_clone/target_snapshot
{
  "indices": "index_a,index_b"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/clone-snapshot-api.html)
