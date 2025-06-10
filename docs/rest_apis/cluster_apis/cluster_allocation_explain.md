# 集群分配解释 API

:::info 新 API 参考
有关最新 API 的详细信息，参阅[集群 API](https://www.elastic.co/docs/api/doc/elasticsearch/v8/group/endpoint-cluster)。
:::

解释分区当前的分配情况。

```bash
GET _cluster/allocation/explain
{
  "index": "my-index-000001",
  "shard": 0,
  "primary": false,
  "current_node": "my-node"
}
```

## 请求

`GET _cluster/allocation/explain`

`POST _cluster/allocation/explain`

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-allocation-explain.html)
