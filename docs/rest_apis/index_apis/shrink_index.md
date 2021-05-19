# 收缩索引 API

将现有索引收缩为具有较少主分片的新索引。

```bash
POST /my-index-000001/_shrink/shrunk-my-index-000001
```

## 请求

`POST /<index>/_shrink/<target-index>`

`PUT /<index>/_shrink/<target-index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

- 在你能收缩一个索引前：
  - 索引必须是只读的
  - 索引的所有主分片必须位于同一节点上
  - [集群健康](/rest_apis/cluster_apis/cluster_health)状态必须为 `green`（绿色）

为了使分片分配更容易，我们建议你也移除索引的副本分片。你也可以稍后作为收缩操作的一部分，重新添加副本分片。

你也可以使用以下的[更新索引设置 API](/rest_apis/index_apis/update_index_settings) 请求去移除一个索引副本分片，重分配索引的剩余分片到相同的节点，并让索引只读。

```bash
PUT /my_source_index/_settings
{
  "settings": {
    "index.number_of_replicas": 0,
    "index.routing.allocation.require._name": "shrink_node_name",
    "index.blocks.write": true
  }
}
```

1. `"index.number_of_replicas": 0` 移除索引的副本分片
2. `"index.routing.allocation.require._name": "shrink_node_name"` 把索引分片重分配给节点 `shrink_node_name`。参阅[索引级分片分配过滤](/index_modules/index_shard_allocation/shard_allocation_filtering)
3. `"index.blocks.write": true` 阻止索引的写操作。仍允许元数据变更，如删除索引。

重分配源索引会花一些时间。进度可以通过 [`_cat recovery` API](/rest_apis/compact_and_aligned_text_apis/cat_recovery) 追踪，或使用 [`集群健康` API](/rest_apis/cluster_apis/cluster_health) 通过 `wait_for_no_relocating_shards` 参数等待所有分片重新定位。

## 描述

收缩索引 API 允许你收缩一个现有的索引收缩为具有较少主分片的新索引。目标索引中请求的主分片数必须是源索引分片数的一个因子。例如，一个有 `8` 个主分片的索引可以被缩为 `4`、`2` 或 `1` 主分片，或者一个有 `15` 个主分片的索引可以缩为 `5`、`3` 或 `1`。如果在索引中的分片数量是质数，则只能将其收缩为单个主分片。在收缩前，索引中的每个分片（主或副本）副本必须存在于同一个节点上。

在数据流的当前写索引不能被收缩。为了收缩当前写索引，这个数据流必须先被[滚动](/data_streams/data_streams?id=滚动)，这样一个新的写索引能被创建，这样前一个写索引能被收缩。

## 收缩如何工作

一个收缩操作：

1. 创建一个新的目标索引，其定义与源索引一样的定义，但主分片数量更少
2. 将段从源索引硬链接到目标索引。(如果文件系统不支持硬链接，则会将所有段复制到新索引中，这是一个非常耗时的过程。另外，如果使用多个数据路径，不同数据路径上的分片如果不在同一硬盘上，则需要段文件的完整副本，因为硬链接不能跨硬盘工作）
3. 恢复目标索引，就像它是刚刚重新打开的关闭索引一样

## 收缩一个索引

为了收缩 `my_source_index` 成为一个名为 `my_target_index` 的新索引，发出以下请求：

```bash
POST /my_source_index/_shrink/my_target_index
{
  "settings": {
    "index.routing.allocation.require._name": null,
    "index.blocks.write": null
  }
}
```

1. `"index.routing.allocation.require._name": null` 清除从源索引复制的分配要求
2. `"index.blocks.write": null` 清除从源索引复制的索引写块

一旦将目标索引添加到集群状态，上述请求将立即返回——它不会等待收缩操作开始。

!> 只有满足以下要求，索引才能收缩:
- 目标索引必须不存在
- 源索引必须有比目标索引更多的主分片
- 目标索引主分片数量必须是源索引主分片数的因子。
- 索引包含所有的分片文档不能超过 `2,147,483,519`，因为所有分片将缩小为目标索引上的单个分片，而这是可以放入单个分片的最大文档数。
- 处理收缩过程的节点必须有足够的可用硬盘空间来容纳现有索引的第二个副本。

`_shrink`（收缩） API 类似于[创建索引 API](/rest_apis/index_apis/create_index)，且目标索引接受参数 `settings` 和 `aliases`。

```bash
POST /my_source_index/_shrink/my_target_index
{
  "settings": {
    "index.number_of_replicas": 1,
    "index.number_of_shards": 1,
    "index.codec": "best_compression"
  },
  "aliases": {
    "my_search_indices": {}
  }
}
```

1. `"index.number_of_shards": 1` 目标索引分片数量。必须是源索引的分片数量的因子。
2. `"index.codec": "best_compression"` 最佳压缩只有在对索引进行新的写入时才会生效，例如强制将分片合并到单个片段时。

?> 映射可以不在收缩请求中指定。

## 监控收缩过程

收缩过程可以通过 [`_cat recovery` API](/rest_apis/compact_and_aligned_text_apis/cat_recovery) 监控，或者通过将 `wait_for_status` 参数设置为 `yellow`（黄色），使用[`集群健康` API](/rest_apis/cluster_apis/cluster_health)等待所有主分片分配完毕。

在分配任何分片之前，目标索引一旦被添加到集群状态后，收缩 API 将返回。此时，所有碎片都处于 `unassigned`（未分配）状态。如果由于任何原因，目标索引无法在收缩节点上分配，则其主分片将保持 `unassigned`（未分配），直到可以在该节点上分配。

一旦分配了主分片，它就进入 `initializing`（初始化）状态，且收缩过程开始。收缩操作完成后，分片将变为 `active`（活动）状态。此时，Elasticsearch 将尝试分配任何副本，并可能决定将主分片重新定位到另一个节点。

## 等待激活分片

因为打开或关闭索引会分配其分片，在创建索引时，[`wait_for_active_shards`](/index_apis/create_index?id=等待激活分片) 设置也适用于 `_open` 和 `_close` 索引操作。

## 路径参数

- `<index>`

（必需的，字符串）收缩的源索引名称

- `<target-index>`

（必需的，字符串）创建的目标索引名称

索引名字必须符合以下约定：

1. 只能是小写字符
2. 不能包含字符：`\`、`/`、`*`、`?`、`"`、`<`、`>`、`|`、` `(空格)、`,`、`#`
3. 7.0 之前索引可以包含冒号（:），但在 7.0 之后不推荐。
4. 不能以 `-`、`_`、`+` 开头
5. 不能是 `.` 或 `..`
6. 长度不能超过 255 字节（注意是字节，所以多字节字符会更快达到 255 的限制）
7. 名字以 `.` 开头不推荐，除非由插件管理的[隐藏索引](/index_modules/index_modules)和内部索引

## 查询参数

- `wait_for_active_shards`
（可选，字符串）在操作执行之前必须活动的分片复制数量。设置为 `all` 或任何正整数，最大值为索引分片总数（`number_of_replicas+1`）。默认为：1，主分片。

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `aliases`

（可选，[别名对象](/rest_apis/idnex_apis/bulk_index_alias)）包含目标索引的索引别名。参阅[批量索引别名](/rest_apis/idnex_apis/bulk_index_alias)。

- `settings`

（可选，[索引设置对象](/index_modules/index_modules?id=索引设置)）目标索引配置选项。参阅[索引设置](/index_modules/index_modules?id=索引设置)。

- `max_primary_shard_size`

（可选，[字节单位](/rest_apis/api_convention/common_options?id=字节大小单位)）目标索引最大主分片大小。用于查找目标索引的最佳分片数。设置此参数后，每个分片在目标索引中的存储量将不会大于此参数。目标索引的分片数仍将是源索引分片数的一个因子，但如果该参数小于源索引中的单个分片大小，则目标索引的分数将等于源索引的分片数。例如，当该参数设置为 50gb 时，如果源索引有 60 个主分片，总计 100gb，则目标索引将有 2 个主分片，每个分片大小为 50gb；如果源索引有 60 个主碎片，总计 1000gb，那么目标索引将有 20 个主碎片；如果源索引有 60 个总容量为 4000gb 的主分片，那么目标索引仍将有 60 个主分片。此参数与 `settings` 中的 `number_of_shards` 冲突，它们只有一个能被应用。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-shrink-index.html)
