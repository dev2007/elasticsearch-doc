# 索引级数据层分配过滤

你可以使用索引级别分配设置来控制将索引分配到哪个[数据层](/data_management/data_tiers)。数据层分配器是一个使用两个内置节点属性的分片分配过滤器：`_tier` 和 `_tier_preference`。

这些层属性通过这些数据角色设置：

- [data_content](/set_up_elasticsearch/configuring_elasticsearch/node#内容数据节点)
- [data_hot](/set_up_elasticsearch/configuring_elasticsearch/node#热数据节点)
- [data_warm](/set_up_elasticsearch/configuring_elasticsearch/node#温数据节点)
- [data_cold](/set_up_elasticsearch/configuring_elasticsearch/node#冷数据节点)
- [data_frozen](/set_up_elasticsearch/configuring_elasticsearch/node#冻结数据节点)

:::note 提示
[数据](/set_up_elasticsearch/configuring_elasticsearch/node#数据节点)角色不是有效的数据层，不能用于数据层筛选。[data_frozen](/set_up_elasticsearch/configuring_elasticsearch/node#冻结数据节点) 角色只能用于搜索挂载了 shared_cache 选项的快照。
:::

## 数据层分配设置

- `index.routing.allocation.include._tier`

分配索引给节点，节点的 `node.roles` 配置至少有一个逗号分隔的值。

- `index.routing.allocation.require._tier`

分配索引给节点，节点的 `node.roles` 配置有所有逗号分隔的值。

- `index.routing.allocation.exclude._tier`

分配索引给节点，节点的 `node.roles` 配置没有任何逗号分隔的值。

- `index.routing.allocation.include._tier_preference`

分配索引给列表中具有可用节点的第一层。如果优先层中没有节点，这会阻止索引保持未分配状态。例如，如果你设置 `index.routing.allocation.include._tier_preference` 为 `data_warm,data_hot`，那么如果有节点具有 `data_warm` 角色，索引会被分配到温（warm）层。如果在温层没有节点，但有节点具有 `data_hot` 角色，索引分被分配到热（hot）层。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/data-tier-shard-filtering.html)
