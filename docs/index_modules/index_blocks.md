# 索引块

索引块限制对指定的索引的可用的操作类型。这些块有不同的风格，可以阻止写、读或元数据操作。块可以通过动态索引设置来设置/移除，也可以通过专用API添加，这也可以确保写入块一旦成功返回用户，所有索引分片都能正确地计算该块，例如，在添加写块后，所有对索引进行中的写入会完成。

## 索引块设置

以下的*动态*（dynamic）索引设置会影响索引上已存在的块：

- `index.blocks.read_only`

设置 `true` 时，索引及索引元数据只读，`false` 允许写以及元数据变更。

- `index.blocks.read_only_allow_delete`

类似于 `index.blocks.read_only`，但也允许删除索引以获取更多资源。[基于硬盘的分片分配器](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings#基于硬盘的分片分配设置)可以自动添加和移除块。

从索引中删除文档以释放资源——而不是删除索引本身——随着时间推移会增加索引大小。当 `index.blocks.read_only_allow_delete` 设置为 `true` 时，删除索引是不允许的。然而，删除索引自身会释放只读索引块，并使资源几乎立即可用。

::: danger 警告
在磁盘利用率低于高水位线时，Elasticsearch 自动添加和移除只读索引块，由 [cluster.routing.allocation.disk.watermark.flood_stage](/set_up_elasticsearch/configuring_elasticsearch/cluster_level_shard_allocation_and_routing_settings) 控制。
:::

- `index.blocks.read`

设置为 `true`，可禁用对索引的读取操作。

- `index.blocks.write`

设置为 `true`，可禁用对索引的数据写操作。不像 `read_only`，这个设置不会影响元数据。例如，你可以用 `write`（写）块关闭索引，但不能用 `read_only`(只读)块关闭索引。

- `index.blocks.metadata`

设置为 `true`，禁用索引元数据读写。

## 添加索引块 API

为索引添加一个索引块。

```bash
PUT /my-index-000001/_block/write
```

### 请求

`PUT /<index>/_block/<block>`

### 路径参数

- `<index>`

（可选，字符串）逗号分隔的列表或通配符表达式的索引名称，用于限定请求。

为所有索引添加块，使用 `_all` 或 `*`。为了禁止通过 `_all` 或通配符表达式添加块，修改集群设置 `action.destructive_requires_name` 为 `true`。你可以在文件 `elasticsearch.yml` 中修改设置，或者通过[集群更新设置](/rest_apis/cluster_apis/cluster_update_settings) API。

- `<block>`

（必需，字符串）添加给索引的块类型。

有效值：

1. `metadata`
  禁用元数据变更，比如关闭索引。
2. `read`
  禁用读操作。
3. `read_only`
  禁用写操作和元数据变更。
4. `write`
  禁用写操作。然后，允许元数据变更。

### 查询参数

- `allow_no_indices`

（可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

默认为 `true`。

- `expand_wildcards`

（可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax#隐藏数据流和索引)（隐藏的）。
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

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 例子

以下例子展示如何添加一个索引块：

```bash
PUT /my-index-000001/_block/write
```

API 返回以下响应：

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "indices" : [ {
    "name" : "my-index-000001",
    "blocked" : true
  } ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-blocks.html)
