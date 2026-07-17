# 重置期望平衡 API

:::::warning 警告
此功能专为 Elasticsearch Service、Elastic Cloud Enterprise 和 Elastic Cloud on Kubernetes 间接使用而设计。不支持直接使用。
:::::

::::info 新版 API 参考
有关最新的 API 详细信息，请参阅 [集群 API](/rest_apis/cluster_apis)。
::::

丢弃当前的期望平衡，并从当前的分片分配开始计算新的期望平衡。这有时可以帮助 Elasticsearch 找到一个需要更少分片移动即可实现的期望平衡，特别是在集群经历了如此巨大的变化，以至于当前的期望平衡已不再是最优的，而 Elasticsearch 尚未检测到当前期望平衡需要比必要的更多的分片移动才能实现时。但是，此 API 会对当选的主节点施加沉重的负载，并且不一定总是能达到预期效果。调用此 API 永远不是必需的。可以考虑改为增加 `cluster.routing.allocation.balance.threshold` 的值，以避免过度的分片移动。

## 请求

```bash
DELETE /_internal/desired_balance
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/delete-desired-balance.html)
