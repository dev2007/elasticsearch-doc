# 复制索引

复制一个现有索引

```bash
POST /my-index-000001/_clone/cloned-my-index-000001
```

## 请求

`POST /<index>/_clone/<target-index>`

`PUT /<index>/_clone/<target-index>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标索引必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。
- 为了复制索引，索引必须标记为只读，并且[集群健康](/rest_apis/cluster_apis/cluster_health)状态为 `green`（绿色）。

例如，以下请求在 `` 上阻止写操作，所以它就能被复制。元数据变更，比如删除索引仍然是允许的。

```bash
PUT /my_source_index/_settings
{
  "settings": {
    "index.blocks.write": true
  }
}
```

在数据流的当前写索引不能被复制。为了复制当前写索引，这个数据流必须先被[翻转](/data_streams/data_streams?id=翻转)，这样一个新的写索引被创建，前一个写索引才能被复制。

## 描述

使用复制索引 API 来复制现有索引到一个新的索引，现有索引的每个源主分片也会复制到新索引的新主分片中。

### 复制的原理

复制按以下步骤进行：

- 首先，它创建一个与源索引定义一样的新的目标索引。
- 接着，从源索引硬连接 segment（段）到目标索引。（如果文件系统不支持硬连接，那么所有的 segment（段）都会复制到新索引中，这是一个非常耗时的过程）
- 最后，恢复目标索引，就像刚被重新打开的关闭索引一样。

### 复制一个索引

为了将 `my_source_index` 复制为新的索引 `my_target_index`，执行以下请求：

```bash
POST /my_source_index/_clone/my_target_index
```

一旦将目标索引添加到集群状态，上述请求将立即返回——它不会等待复制操作开始。

!> 索引只有满足以下要求才能被复制：
- 目标索引不存在
- 源索引的主分片数与目标索引一致
- 处理复制进程的节点必须有足够的可用磁盘空间来容纳现有索引的第二个副本

`_clone` API 类似[创建索引 API](/rest_apis/index_apis/create_index)，也为目标索引接受参数 `settings` 和 `aliases`：

```bash
POST /my_source_index/_clone/my_target_index
{
  "settings": {
    "index.number_of_shards": 5
  },
  "aliases": {
    "my_search_indices": {}
  }
}
```

1. *"index.number_of_shards": 5* 目标索引的分片数。必须与源索引分片数相同。

> 在 `_clone` 请求中，可以不指定映射（mapping）。源索引的映射将用于目标索引。

### 监控复制过程

监控过程可以通过 [`_cat recovery` API](/rest_apis/compact_and_aligned_text_apis/cat_recovery) 监控，，或使用 [`集群健康` API](/rest_apis/cluster_apis/cluster_health) 通过 `wait_for_status` 参数设置为 `yellow`（黄色）等待所有主分片成功分配。

`_clone` API 一旦目标索引被添加到集群的状态，在任何分片被分配前，就会返回结果。这时，所有的分片都处于 `unassigned`（未分配）状态。如果由于任一原因，目标索引不能分配，它的主分片会保持 `unassigned` 直到它能在节点上分配。

一旦主节点被分配了，它的状态会变为 `initializing`（初始化中），拆分过程开始。当拆分操作完成，分片会变为 `active`（激活）。这时，Elasticsearch 会尝试分配任何副本，并可能决定主分片重定位到另一个节点。

### 等待激活分片

由于拆分操作创建一个新索引来拆分分片进去，所以在索引创建的设置[等待激活分片](/index_apis/create_index?id=等待激活分片)也应用于拆分索引操作。

## 路径参数

- `<index>`

（必需，字符串）待复制的源索引名字

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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-clone-index.html)
