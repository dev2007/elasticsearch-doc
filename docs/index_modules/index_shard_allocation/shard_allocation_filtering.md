# 索引级分片分配过滤

你可以使用分片分配过滤器来控制 Elasticsearch 在何处分配特定索引的分片。每个索引过滤器与[集群范围的分配过滤](/setup/config/cluster_level_shard_allocation_and_routing_settings?id=集群级分片分配过滤)和[分配感知](/setup/config/cluster_level_shard_allocation_and_routing_settings?id=分片分配感知)一起应用。

分片分配过滤器可以基于自定义节点属性或内置 `_name`，`_host_ip`，`_publish_ip`，`_ip`，`_host`，`_id`，`_tier` 和 `_tier_preference` 属性。[索引生命周期管理](/ILM_manage_the_index_lifecycle)使用基于自定义节点属性的过滤器来确定在阶段之间移动时如何重分配分片。

`cluster.routing.allocation` 设置是动态的，允许将活动索引从一组节点移动到另一组节点。只有在不破坏另一个路由约束的情况下（例如从不在同一节点上分配主分片和副本分片），才能重新定位分片。

例如，可以使用自定义节点属性来指示节点的性能特征，并使用分片分配过滤将特定索引的分片路由到最合适的硬件分类。

## 启用索引级分片分配过滤

为了基于自定义节点属性进行筛选：

1. 在每个节点的 `elasticsearch.yml` 配置文件中指定具有自定义节点属性过滤器特征。例如，如果你有 `small`，`medium` 和 `big` 节点，你能添加一个基于节点大小过滤的 `size` 属性。

```yaml
node.attr.size: medium
```

当你启动节点时，你也可以设置自定义属性：

```bash
`./bin/elasticsearch -Enode.attr.size=medium
```

2. 为索引添加路由分配过滤器。`index.routing.allocation` 设置支持三种过滤器：`include`、`exclude` 和 `require`。例如，要让 Elasticsearch 将测试索引中的分片分配给 `big` 或 `medium` 节点，使用 `index.routing.allocation.include`：

```bash
PUT test/_settings
{
  "index.routing.allocation.include.size": "big,medium"
}
```

如果你指定多个过滤器，则节点必须同时满足以下条件，以便分片重定位到其上：

- 如果指定了任何 `require` 类型条件，则所有条件必须满足
- 如果指定了任何 `exclude` 类型条件，则条件都不用满足
- 如果指定了任何 `include` 类型条件，则至少有一个条件必须满足

例如，要把测试索引移动到在 `rack1` 上的 `big` 节点，你可以指定：

```bash
PUT test/_settings
{
  "index.routing.allocation.require.size": "big",
  "index.routing.allocation.require.rack": "rack1"
}
```

## 索引分配过滤器设置

- `index.routing.allocation.include.{attribute}`

将索引分配给节点，节点的 `{attribute}` 至少有逗号分隔的一个值。

- `index.routing.allocation.require.{attribute}`

将索引分配给节点，节点 `{attribute}` 具有逗号分隔的所有值。

- `index.routing.allocation.exclude.{attribute}`

将索引分配给节点，节点 `{attribute}` 不具有逗号分隔的任何值。

索引分配设置支持以下的内置属性：

|||
|:--|:--|
|`_name`|按节点名字匹配节点|
|`_host_ip`|按主机 IP 地址匹配节点（关联主机名的 IP）|
|`_publish_ip`|按发布 IP 地址匹配节点|
|`_ip`|匹配 `_host_ip` 或 `_publish_ip`|
|`_host`|按主机名匹配节点|
|`_id`|按节点 id 匹配节点|
|`_tier`|按节点[数据层](/data_management/data_tier)角色匹配节点。参阅[数据层分配过滤](/index_modules/index_shard_allocation/data_tier_allocation_filtering)获取更多详情。|

当指定属性值时，你可以使用通配符，例如：

```bash
PUT test/_settings
{
  "index.routing.allocation.include._ip": "192.168.2.*"
}
```
