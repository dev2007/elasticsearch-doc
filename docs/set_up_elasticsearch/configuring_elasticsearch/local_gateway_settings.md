---
sidebar_position: 150
---

# 本地网关设置

本地网关在整个集群重启期间存储集群状态和分片数据。

以下*静态*设置（必须在每个主节点上设置）控制新选择的主节点在尝试恢复群集状态和群集数据之前应等待多长时间。

:::tip 注意
这些设置仅在完全重新启动集群时生效。
:::

- `gateway.expected_data_nodes`

    ([静态](/set_up_elasticsearch/configuring_elasticsearch)集群中预期的数据节点数。当预期数量的数据节点加入集群时，开始恢复本地分片。默认值为 `0`。

- `gateway.recover_after_time`

    ([静态](/set_up_elasticsearch/configuring_elasticsearch)如果未达到预期的节点数，恢复过程将等待配置的时间量，然后再尝试恢复。默认为 `5m`。

    一旦 `recover_after_time` 持续时间超时，只要满足以下条件，恢复将开始：

- `gateway.recover_after_data_nodes`

    ([静态](/set_up_elasticsearch/configuring_elasticsearch)只要有这么多数据节点加入群集，即可恢复。

这些设置可以在 `elasticsearch.yml` 中配置如下：

```yaml
gateway.expected_data_nodes: 3
gateway.recover_after_time: 600s
gateway.recover_after_data_nodes: 3
```

## 悬空索引

当节点加入集群时，如果发现存储在其本地数据目录中的任何碎片在集群中尚不存在，则会认为这些分片属于“悬空”索引。你可以使用[悬空索引 API](/rest_apis/index_apis.html#悬空索引) 列出、导入或删除悬空索引。

:::tip 注意
当索引仍然是集群的一部分时，API 无法保证导入的数据是否真正代表数据的最新状态。
:::

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-gateway.html)
