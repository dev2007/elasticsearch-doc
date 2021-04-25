# 开启索引 API

开启关闭的索引。对数据流而言，API 打开所有关闭的备份索引。

```bash
POST /my-index-000001/_open
```

## 请求

`POST /<target>/_open`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 描述

你可以使用开启索引 API 重新打开关闭的索引。如果请求目标是数据流，请求重新打开任何数据流关闭的后备索引。

关闭的索引被阻止进行读/写操作，也不允许开启的索引允许的所有操作。在关闭的索引中无法索引文档或搜索文档。这允许关闭的索引不必维护索引或搜索文档的内部数据结构，以减少集群的开销。

当打开或关闭索引时，主节点负责重新启动索引分片以反映索引的新状态。分片将经过正常的恢复过程。打开的/关闭的索引数据由集群自动复制，以确保始终安全地保留足够的分片副本。

你可以打开和关闭多个索引。如果请求显示引用缺失的索引，会抛出错误。这个行为可以通用 `ignore_unavailable=true` 参数禁用。

所有索引可以通过 `_all` 作为索引名字或指定标识所有索引模式（如 `*`）来一次打开或关闭。

在配置文件中通过设置 `action.destructive_requires_name` 标识为 `true`，可以禁用通过通配符或 `_all` 来定义所有索引。这个设置也可以通过集群更新设置 API 来修改。

关闭的索引会消耗显著数量的硬盘空间，这在托管环境中可能会造成问题。通过集群设置 API 将 `cluster.indices.close.enable` 设置为 `false`，可以禁用关闭索引。默认值为 `true`。

在7.12.0及更早版本中，无法关闭数据流上的当前写入索引。为了关闭当前写索引，数据流必须先被[滚动](/data_streams/data_streams?id=滚动)以便创建新的写入索引，这样之前的写入索引能被关闭。此限制从 7.12.1 不再适用。

## 等待激活分片

因为打开或关闭索引会分配其分片，在创建索引时，[`wait_for_active_shards`](/index_apis/create_index?id=等待激活分片) 设置也适用于 `_open` 和 `_close` 索引操作。

## 路径参数

- `<target>`

（可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。

若要以集群中的所有数据流和索引为目标，省略此参数或使用 `_all` 或 `*`。

使用 `_all` 或 `*` 关闭所有索引。修改 `action.destructive_requires_name` 集群设置为 `true`，可以禁用通过 `_all` 或 `*` 关闭索引。你可以在文件 `elasticsearch.yml` 中 或通过 [集群更新设置](/rest_apis/cluster_apis/cluster_update_settings) API 来更新这个设置。

## 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，如果任何通配符表达式、索引别名或 `_all` 值只针对丢失或关闭的索引，则请求返回一个错误。即使请求以其他开放索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，但没有索引以 `bar` 开头，以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式能匹配的索引类型。如果请求目标为数据流，则此参数确定通配符表达式是否匹配隐藏的数据流则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔列表的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
2. `open`
匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
3. `closed`
匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
4. `hidden`
匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
5. `none`
不接受通配符表达式。

默认为 `open`。

- `ignore_unavailable`
（可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `wait_for_active_shards`
（可选，字符串）在操作执行之前必须活动的分片复制数量。设置为 `all` 或任何正整数，最大值为索引分片总数（`number_of_replicas+1`）。值 `index-setting` 指依据索引设置 `index.write.wait_for_active_shards` 等待。默认：`0`，意味着不等待任何分片准备。

参阅[激活分片](/rest_apis/document_apis/index?id=激活分片)。

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 示例

以下请求重新打开名为 `my-index-000001` 的关闭的索引。

```bash
POST /my-index-000001/_open
```

API 返回以下响应：

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-open-close.html)
