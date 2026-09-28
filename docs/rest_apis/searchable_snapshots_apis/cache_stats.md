# 缓存统计 API

检索部分挂载索引的共享缓存统计信息。

```txt
GET /_searchable_snapshots/cache/stats
GET /_searchable_snapshots/<node_id>/cache/stats
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有**管理**[集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 路径参数

`<node_id>`

（可选，字符串）要目标的集群中特定节点的名称。例如 `nodeId1,nodeId2`。节点选择选项请参阅[节点规范](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/cluster.html#cluster-nodes)。

## 响应体

`nodes`

（对象）包含请求所选择节点的统计信息。

`nodes` 的属性

`<node_id>`

（对象）包含给定标识符节点的统计信息。

`<node_id>` 的属性

`shared_cache`

（对象）包含共享缓存文件的统计信息。

`shared_cache` 的属性

- `reads`（long）使用共享缓存读取数据的次数。

- `bytes_read_in_bytes`（long）从共享缓存读取的总字节数。

- `writes`（long）将 blob 存储仓库中的数据写入共享缓存的次数。

- `bytes_written_in_bytes`（long）写入共享缓存的总字节数。

- `evictions`（long）从共享缓存文件中驱逐的区域数。

- `num_regions`（整数）共享缓存文件中的区域数。

- `size_in_bytes`（long）共享缓存文件的总大小（字节）。

- `region_size_in_bytes`（long）共享缓存文件中一个区域的大小（字节）。

## 示例

获取所有数据节点上部分挂载索引的共享缓存统计信息：

```txt
GET /_searchable_snapshots/cache/stats
```

响应示例：

```json
{
  "nodes" : {
    "eerrtBMtQEisohZzxBLUSw" : {
      "shared_cache" : {
        "reads" : 6051,
        "bytes_read_in_bytes" : 5448829,
        "writes" : 37,
        "bytes_written_in_bytes" : 1208320,
        "evictions" : 5,
        "num_regions" : 65536,
        "size_in_bytes" : 1099511627776,
        "region_size_in_bytes" : 16777216
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/searchable-snapshots-api-cache-stats.html)
