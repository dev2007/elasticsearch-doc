# 删除 API

从指定索引中删除 JSON 文档。

## 请求

`DELETE /<index>/_doc/<_id>`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有目标索引或索引别名的 `delete` 或 `write` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 说明

你可以用 `DELETE` 从索引中删除文档。你必须指定索引名称和文档 ID。

:::tip 注意
不能直接向数据流发送删除请求。要删除数据流中的文档，必须以包含该文档的备用索引为目标。参阅[更新或删除备用索引中的文档](/data_streams/use_a_data_stream#更新或删除备份索引中的文档)。
:::

### 乐观并发控制

删除操作可以是有条件的，只有在文档的最后一次修改被分配给 `if_seq_no` 和 `if_primary_term` 参数指定的序列号和主要术语时才会执行。如果检测到不匹配，操作将导致 `VersionConflictException` 和状态代码 `409`。有关详细信息，参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。

### 版本控制

索引中的每个文档都有版本。删除文档时，可以指定版本，以确保我们要删除的相关文档确实正在被删除，而且在此期间没有发生变化。对文档执行的每次写操作（包括删除）都会导致其版本递增。删除文档后，其版本号会在短时间内保持可用，以便对并发操作进行控制。已删除文档的版本保持可用的时间长度由 `index.gc_deletes` 索引设置决定，默认为 60 秒。

### 路由

如果在编制索引时使用了路由，那么删除文档时也需要指定路由值。

如果 `_routing` 映射设置为 `required` 且未指定路由值，删除 API 将抛出 `RoutingMissingException` 并拒绝请求。

示例：

```bash
DELETE /my-index-000001/_doc/1?routing=shard-1
```

该请求会删除 id 为 `1` 的文档，但会根据用户进行路由。如果未指定正确的路由，则不会删除文档。

### 自动创建索引

如果使用了[外部版本控制变量](/rest_apis/document_apis/docs_index)，删除操作会自动创建指定的索引（如果该索引不存在）。有关手动创建索引的信息，参阅[创建索引 API](/rest_apis/index_apis/create_index)。

### 分布式

删除操作会被散列到一个特定的分片 id 中。然后，它会被重定向到该 id 组中的主分区，并复制（如需要）到该 id 组中的分区副本。

### 等待活动分片

在提出删除请求时，可以设置 `wait_for_active_shards` 参数，要求在开始处理删除请求之前，至少有多少分片副本处于活动状态。详情和使用示例参阅[此处](/rest_apis/document_apis/docs_index#活动分片)。

### 刷新

控制搜索何时可以看到该请求所做的更改。参阅[刷新](/rest_apis/document_apis/refresh)。

### 超时

当执行删除操作时，指定执行删除操作的主分区可能不可用。造成这种情况的原因可能是主分区目前正在从存储中恢复或正在进行搬迁。默认情况下，删除操作最多会等待主分区可用 1 分钟，然后才会失败并响应错误。`timeout` 参数可用于明确指定等待时间。下面是一个将其设置为 5 分钟的示例：

```bash
DELETE /my-index-000001/_doc/1?timeout=5m
```

## 路径参数

- `<index>`
  （必需，字符串）目标索引的名称。
- `<_id>`
  （必需，字符串）文档的唯一标识符。

## 查询参数

- `if_seq_no`
  (可选，整数） 只有当文档具有此序列号时才执行操作。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。
- `if_primary_term`
  (可选，整数） 只有当文档具有此序列号时才执行操作。参阅[乐观并发控制](/rest_apis/document_apis/docs_index#乐观并发控制)。
- `refresh`
  (可选，枚举）如果为 `true`，Elasticsearch 会刷新受影响的分片，使该操作在搜索中可见；如果为 `wait_for`，则等待刷新，使该操作在搜索中可见；如果为 `false`，则不刷新。有效值：`true`、`false`、`wait_for`。默认值：`false`。
- `routing`
  (可选，字符串） 用于将操作路由到特定分区的自定义值。
- `timeout`
  (可选，[时间单位](/rest_apis/api_convention/common_options#时间单位)）[等待活动分片](/rest_apis/document_apis/docs_index#活动分片)的时间。默认为 `1m`（一分钟）。
- `version`
  (可选，整数）用于并发控制的明确版本号。指定的版本必须与文档的当前版本一致，请求才能成功。
- `version_type`
  (可选，枚举） 特定版本类型：`external`、`external_gte`。
- `wait_for_active_shards`
  (可选，字符串） 进行操作前必须激活的分片副本数量。设置为全部或任何正整数，最多不超过索引中的分片总数（`number_of_replicas+1`）。默认值：`1`，主分区。

  参阅[活动分片](/rest_apis/document_apis/docs_index#活动分片)

## 示例

从 `my-index-000001` 索引中删除 JSON 文档 `1`：

```bash
DELETE /my-index-000001/_doc/1
```

API 返回以下结果：

```json
{
  "_shards": {
    "total": 2,
    "failed": 0,
    "successful": 2
  },
  "_index": "my-index-000001",
  "_id": "1",
  "_version": 2,
  "_primary_term": 1,
  "_seq_no": 5,
  "result": "deleted"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-delete.html)
