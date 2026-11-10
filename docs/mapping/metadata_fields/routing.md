# _routing 字段

文档使用以下公式路由到索引中的特定分片：

```
routing_factor = num_routing_shards / num_primary_shards
shard_num = (hash(_routing) % num_routing_shards) / routing_factor
```

`num_routing_shards` 是 `index.number_of_routing_shards` 索引设置的值。`num_primary_shards` 是 `index.number_of_shards` 索引设置的值。

`_routing` 的默认值是文档的 `_id`。通过为每个文档指定自定义路由值，可以实现自定义路由模式。例如：

```bash
# 该文档使用 user1 作为其路由值，而不是其 ID
PUT my-index-000001/_doc/1?routing=user1&refresh=true
{
  "title": "This is a document"
}

# 获取、删除或更新该文档时，需要提供相同的路由值
GET my-index-000001/_doc/1?routing=user1
```

`_routing` 字段的值可以在查询中访问：

```bash
# 在 _routing 字段上查询（另参阅 ids 查询）
GET my-index-000001/_search
{
  "query": {
    "terms": {
      "_routing": [ "user1" ]
    }
  }
}
```

:::note[提示]
数据流不支持自定义路由，除非在模板中启用 `allow_custom_routing` 设置创建。
:::

## 使用自定义路由搜索

自定义路由可以减少搜索的影响。不必将搜索请求扇出到索引中的所有分片，而是可以只将请求发送到匹配特定路由值（或多个值）的分片：

```bash
GET my-index-000001/_search?routing=user1,user2
{
  "query": {
    "match": {
      "title": "document"
    }
  }
}
```

此搜索请求将只在与 `user1` 和 `user2` 路由值关联的分片上执行。

## 使路由值成为必需

使用自定义路由时，在索引、获取、删除或更新文档时提供路由值非常重要。

忘记路由值可能导致文档被索引到多个分片上。作为一种保护措施，可以配置 `_routing` 字段，使自定义路由值成为所有 CRUD 操作的必需项：

```bash
# 所有文档都需要路由
# 此索引请求会抛出 routing_missing_exception
PUT my-index-000002
{
  "mappings": {
    "_routing": {
      "required": true
    }
  }
}

PUT my-index-000002/_doc/1
{
  "text": "No routing value provided"
}
```

## 使用自定义路由的唯一 ID

在索引文档时指定自定义 `_routing`，`_id` 的唯一性无法在整个索引的所有分片上得到保证。事实上，如果使用不同的 `_routing` 值进行索引，具有相同 `_id` 的文档可能会落在不同的分片上。

确保 ID 在整个索引中唯一是用户的责任。

## 路由到索引分区

可以将索引配置为让自定义路由值进入分片的子集，而不是单个分片。这有助于降低集群不平衡的风险，同时仍然减少搜索的影响。

这是通过在创建索引时提供索引级设置 `index.routing_partition_size` 来实现的。随着分区大小的增加，数据分布会变得更加均匀，但代价是每个请求需要搜索更多的分片。

存在此设置时，计算分片的公式变为：

```
routing_value = hash(_routing) + hash(_id) % routing_partition_size
shard_num = (routing_value % num_routing_shards) / routing_factor
```

也就是说，`_routing` 字段用于计算索引内的一组分片，然后使用 `_id` 在该组中挑选一个分片。

要启用此功能，`index.routing_partition_size` 的值应大于 1 且小于 `index.number_of_shards`。

启用后，分区索引将具有以下限制：

- 不能在其中创建带 join 字段关系的映射。
- 索引中的所有映射都必须将 `_routing` 字段标记为必需。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-routing-field.html)
