# 拆分索引

将现有索引拆分为包含更多主分片的新索引。

```bash
POST /my-index-000001/_split/split-my-index-000001
{
  "settings": {
    "index.number_of_shards": 2
  }
}
```

## 请求

`POST /<index>/_split/<target-index>`

`PUT /<index>/_split/<target-index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

- 在你能拆分一个索引前：
  - 索引必须是只读的
  - [集群健康](/rest_apis/cluster_apis/cluster_health) 状态必须为 `green`（绿色）

你可以通过以下请求将索引设置为只读：

```bash
PUT /my_source_index/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}
```

1. 阻止对索引的写操作，同时仍允许元数据修改（如删除索引）

在数据流的当前写索引不能被拆分。为了拆分当前写索引，这个数据流必须先被[滚动](/data_streams/data_streams?id=滚动)，这样一个新的写索引被创建，前一个写索引才能被拆分。

## 描述

拆分索引 API 允许你将现有索引拆分为一个新索引，其中每个原始主分片在新索引中会被拆分为两个或更多的主分片。

索引能被拆分的次数（以及原始分片可以被拆分的的分片数量），由设置 `index.number_of_routing_shards` 决定。路由分片的数量指定内部使用的哈希空间，这个空间用于通过一致的哈希在分片之间分发文档。例如，一个 5 分片的索引，`number_of_routing_shards` 设置为 `30`（`5 x 2 x 3`），可以按因子 `2` 或 `3` 拆分。换而言之，它可以按以下方式进行拆分：

- `5` → `10` → `30` (除以 2, 再除以 3)
- `5` → `15` → `30` (除以 3, 再除以 2)
- `5` → `30` (除以 6)

`index.number_of_routing_shards` 是[静态索引设置](/index_modules/index_modules?id=索引设置)。你只能在索引创建时或在[关闭的索引](/rest_apis/index_apis/open_index)上设置 `index.number_of_routing_shards`。

### 索引创建示例

以下的[索引创建 API](/rest_apis/index_apis/create_index) 创建了一个名为 `my-index-000001` 的索引，设置 `index.number_of_routing_shards` 为 30。

```bash
PUT /my-index-000001
{
  "settings": {
    "index": {
      "number_of_routing_shards": 30
    }
  }
}
```

设置 `index.number_of_routing_shards` 的默认值，依赖于原始索引的主分片数。默认设计下，允许你按 2 的因子拆分到最大 1024 分片。然而，必须要考虑原始的主分片数。例如，一个索引创建时有 5 个主分片，它可以分为 10、20、40、80、160、320 或最大 640 个分片（通过一次拆分操作或多次拆分操作）。

如果原始索引包含一个主分片（或者一个多分片索引被[收缩](/rest_apis/index_apis/shrink_index)到一个主分片），那这个索引可以被分为大于 1 的任意数量分片。然后，路由分片的默认数量的属性将用于新拆分的索引。

### 拆分的原理

一个拆分操作：

1. 创建一个与源索引相同定义的新的目标索引，但是会有更大数量的主分片。
2. 从源索引硬连接 segment（段）到目标索引。（如果文件系统不支持硬连接，那么所有的 segment（段）都会复制到新索引中，这是一个非常耗时的过程）
3. 在创建低级文件后，再次哈希所有文档，以删除属于不同分片的文档。
4. 恢复目标索引，就像刚被重新打开的关闭索引一样。

### 为什么 Elasticsearch 不支持增量重分片？

从 `N` 个分片增加到 `N+1` 个分片，也被称为，增量重分片，它确实是所许多键值存储所支持的特性。添加一个新的分片并将新数据推送到这个新分片是不可行的：这可能是一个索引瓶颈，并且通过给定的 `_id` 确认一个文档属于哪个分片，必须通过查找（get）、删除（delete）和更新（update）请求，这相当复杂。这意味着我们需要通过不同的哈希表重平衡现有数据。

键值存储更高效的执行这个操作的常见方法是使用一致哈希。当碎片数从 `N` 增加到 `N+1` 时，一致哈希只需要重新定位第 `1/N` 个键值。然而 Elasticsearch 的存储单位，分片，是 Lucene 索引。由于他们面向搜索的数据结构，占据了 Lucene 索引的很大一部分，即使只有 5% 的文档，删除它们并索引它们到另一个分片，典型的要比键值存储有更高的成本。当通过上一节中描述的乘法因子来增加分片的数量时，该成本保持在合理的状态：这允许 Elasticsearch 能够在本地执行拆分，这能允许在索引级别执行拆分，而不是需要移动的重索引文档，也可以使用硬连接进行高效的文件复制。

在只追加数据的情况下，可以通过创建新索引并向其中推送新数据来来获得更大的灵活性，同时为读操作添加一个覆盖新旧索引的别名。假设旧索引和新索引分别有 `M` 和 `N` 个分片，这种情况与搜索有 `M+N` 个分片的索引相比没有更多开销。

### 拆分一个索引

为了拆分 `my_source_index` 为一个名为 `my_target_index` 的新索引，假定以下操作：

```bash
POST /my_source_index/_split/my_target_index
{
  "settings": {
    "index.number_of_shards": 2
  }
}
```

- 一旦将目标索引添加到集群状态，上述请求将立即返回——它不会等待拆分操作开始。

!> 只有满足以下要求的索引才能拆分：
- 目标索引不存在
- 源索引的主分片必须比目标索引更少
- 目标索引的分片数必须是源索引分片的倍数
- 处理拆分进程的节点必须有足够的可用磁盘空间来容纳现有索引的第二个副本

`_split` API 类似[创建索引 API](/rest_apis/index_apis/create_index)，也为目标索引接受参数 `settings` 和 `aliases`：

```bash
POST /my_source_index/_split/my_target_index
{
  "settings": {
    "index.number_of_shards": 5
  },
  "aliases": {
    "my_search_indices": {}
  }
}
```

1. *"index.number_of_shards": 5* 目标索引的分片数。必须是源索引分片数的倍数。

> 在 `_split` 请求中，不能指定映射（mapping）。

### 监控拆分过程

拆分过程可以通过 [`_cat recovery` API](/rest_apis/compact_and_aligned_text_apis/cat_recovery) 监控，，或使用 [`集群健康` API](/rest_apis/cluster_apis/cluster_health) 通过 `wait_for_status` 参数设置为 `yellow`（黄色）等待所有主分片成功分配。

`_split` API 一旦目标索引被添加到集群的状态，在任何分片被分配前，就会返回结果。这时，所有的分片都处于 `unassigned`（未分配）状态。如果由于任一原因，目标索引不能分配，它的主分片会保持 `unassigned` 直到它能在节点上分配。

一旦主节点被分配了，它的状态会变为 `initializing`（初始化中），拆分过程开始。当拆分操作完成，分片会变为 `active`（激活）。这时，Elasticsearch 会尝试分配任何副本，并可能决定主分片重定位到另一个节点。

### 等待激活分片

由于拆分操作创建一个新索引来拆分分片进去，所以在索引创建的设置[等待激活分片](/index_apis/create_index?id=等待激活分片)也应用于拆分索引操作。

## 路径参数

- `<index>`

（必需，字符串）待拆分的源索引名字

- `<target-index>`

（必需，字符串）创建的目标索引名字

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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-split-index.html)
