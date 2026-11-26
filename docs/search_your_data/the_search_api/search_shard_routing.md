# 搜索分片路由（Search shard routing）

为了防范硬件故障并提升搜索容量，Elasticsearch 可以将某个索引的数据副本存储在多个节点上的多个分片中。执行搜索请求时，Elasticsearch 会选择一个包含该索引数据副本的节点，并将搜索请求转发到该节点的分片上。这个过程称为 **search shard routing** 或 **routing**。

## 自适应副本选择

默认情况下，Elasticsearch 使用 **adaptive replica selection（自适应副本选择）** 来路由搜索请求。该方法会根据 **shard allocation awareness** 以及以下标准选择一个符合条件的节点：

- 协调节点与该候选节点之间先前请求的响应时间
- 该候选节点运行先前搜索所花费的时间
- 该候选节点 `search` 线程池的队列大小

自适应副本选择旨在降低搜索延迟。

可以通过 cluster settings API 将 `cluster.routing.use_adaptive_replica_selection` 设为 `false` 来禁用自适应副本选择。禁用后，Elasticsearch 会使用 round-robin 方法路由搜索请求，这可能导致搜索变慢。

## 设置 preference 偏好

默认情况下，自适应副本选择会从所有符合条件的节点和分片中进行选择。

但你可能只希望从本地节点获取数据，或者希望根据硬件将搜索路由到特定节点，也可能希望将重复搜索发送到同一个分片以利用缓存。

要限制搜索请求可选的节点和分片集合，可以使用 search API 的 `preference` 查询参数。

### 使用 `_local`

以下请求使用 `preference="_local"` 搜索 `my-index-000001`，将搜索限制在本地节点上的分片。如果本地节点不包含该索引数据的分片副本，请求会使用自适应副本选择回退到另一个符合条件的节点：

```bash
GET /my-index-000001/_search?preference=_local
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

### 使用自定义 preference 字符串

也可以使用 `preference` 参数，根据提供的字符串将搜索路由到特定分片。

如果集群状态和所选分片没有变化，使用相同 `preference` 字符串的搜索会被路由到相同的分片，并且顺序相同。

推荐使用唯一的 `preference` 字符串，例如用户名或 Web session ID。该字符串不能以 `_` 开头。

可以使用此方式缓存频繁使用且资源消耗较大的搜索结果。如果分片数据没有变化，使用相同 `preference` 字符串的重复搜索会从同一个 **shard request cache** 中获取结果。

对于时间序列场景（例如日志），较旧索引中的数据很少更新，可以直接从该缓存中提供服务：

```bash
GET /my-index-000001/_search?preference=my-custom-shard-string
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

如果集群状态或所选分片发生变化，相同的 `preference` 字符串不一定会将搜索路由到相同的分片和相同的顺序。可能原因包括：

- 分片迁移
- 分片故障
- 节点拒绝搜索请求，此时 Elasticsearch 会将请求重新路由到另一个节点

## 使用 routing 值

索引文档时，可以指定可选的 **routing value**，将文档路由到特定分片：

```bash
POST /my-index-000001/_doc?routing=my-routing-value
{
  "@timestamp": "2099-11-15T13:12:00",
  "message": "GET /search HTTP/1.1 200 1070000",
  "user": {
    "id": "kimchy"
  }
}
```

可以在 search API 的 `routing` 查询参数中使用相同的 routing 值，确保搜索运行在索引该文档时使用的同一个分片上：

```bash
GET /my-index-000001/_search?routing=my-routing-value
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

也可以提供多个逗号分隔的 routing 值：

```bash
GET /my-index-000001/_search?routing=my-routing-value,my-routing-value-2
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

## 搜索并发与并行

默认情况下，Elasticsearch 不会根据搜索请求命中的分片数量拒绝搜索请求。但是，命中大量分片会显著增加 CPU 和内存使用。

关于避免索引分片数量过大的建议，可参考 Size your shards。

可以使用 `max_concurrent_shard_requests` 查询参数控制单个搜索请求在每个节点上最多可以并发命中的分片数量，防止单个请求使集群过载。该参数默认最大值为 `5`：

```bash
GET /my-index-000001/_search?max_concurrent_shard_requests=3
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

还可以使用 `action.search.shard_count.limit` 集群设置来设置搜索分片数量限制，并拒绝命中过多分片的请求。该设置可以通过 cluster settings API 配置。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-shard-routing.html)
