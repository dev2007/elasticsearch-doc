# 强制合并 API

强制[合并](/index_modules/merge)一个或多个索引的分片。对数据流，API 强制合并数据流的备份索引的分片。

```bash
POST /my-index-000001/_forcemerge
```

## 请求

`POST /<target>/_forcemerge`

`POST /_forcemerge`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `maintenance` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)

## 描述

使用强制合并 API 强制[合并](/index_modules/merge)一个或多个索引的分片。合并通过将部分片段合并在一起，减少了每个片段中的片段数，还释放了被删除文档所使用的空间。合并通常自动进行，但有时手动触发合并是有用的。

:::caution 警告
**只有在完成对索引的写入后，才能对其调用强制合并**。强制合并可以产生非常大的（>5GB）段，并且如果继续写入这样的索引，那么自动合并策略将永远不会考虑这些段以用于将来合并，直到它们大部分由删除的文档组成。这可能会导致索引中保留非常大的段，从而导致磁盘使用率增加和搜索性能下降。
:::

### 在强制合并期间阻塞

调用此 API ，直到合并完成都是阻塞的。如果客户端连接在完成之前丢失，则强制合并过程将在后台继续。强制合并相同索引的任何新请求也将被阻止，直到正在进行的强制合并完成。

### 强制合并多个索引

你可以通过以下目标强制将多个索引与单个请求合并：

- 包含多个备份索引的一个或多个数据流

- 多指标

- 一个或多个别名

- 集群中的所有数据流和索引

使用 [`force_merge` 线程池](/set_up_elasticsearch/configuring_elasticsearch/thread_pools)分别强制合并每个目标分片。默认情况下，每个节点只有一个强制合并线程，这意味着该节点上的碎片一次强制合并一个。如果在节点上展开 `force_merge` 线程池，则它将强制并行合并其分片。

强制合并使被合并的分片的存储空间临时增加，在 `max_num_segments` 参数设置为 `1` 的情况下，存储空间将增加一倍，因为所有的片段都需要重写为新的片段。

## 路径参数

- `<target>`

  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

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

- `flush`

  （可选，布尔值）如果为 `true`，Elasticsearch 在强制合并后对索引执行刷新。默认为 `true`。

- `ignore_unavailable`

  （可选，布尔值）如果为 `true`，丢失或关闭的索引不包含在响应中。

  默认为 `false`。

- `max_num_segments`

  （可选，整型）待合并的段数量。为了完全合并索引，设置为 `1`。默认为检查是否需要执行合并。如果是，执行它。

- `only_expunge_deletes`

  （可选，布尔值）如果为 `true`，仅删除包含文档删除的段。默认为 `false`。

  在 Lucene 中，文档不会从段中删除；只是标记为已删除。在合并过程中，将创建一个不包含这些文档删除的新段。

  :::note 提示
  此参数**不会**覆写设置 `index.merge.policy.expunge_deletes_allowed`。
  :::

## 示例

### 强制合并一个指定的数据流或索引

```bash
POST /my-index-000001/_forcemerge
```

### 强制合并多个数据流或索引

```bash
POST /my-index-000001,my-index-000002/_forcemerge
```

### 强制合并所有索引

```bash
POST /_forcemerge
```

### 数据流和基于时间的索引

强制合并对于管理数据流的旧备份索引和其他基于时间的索引非常有用，尤其是在[翻转](/rest_apis/index_apis/rollover_index)之后。在这些情况下，每个索引只在一段时间内接收索引流量。一旦索引不再接收写入，它的分片就可以强制合并到单个段中。

```bash
POST /.ds-my-data-stream-2099.03.07-000001/_forcemerge?max_num_segments=1
```

这是一个好主意，因为单段分片有时可以使用更简单、更高效的数据结构来执行搜索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-forcemerge.html)
