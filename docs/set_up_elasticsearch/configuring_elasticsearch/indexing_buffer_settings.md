---
sidebar_position: 130
---

# 索引缓存区设置

索引缓冲区用于存储新索引的文档。当它填满时，缓冲区中的文档将写入磁盘上的一个段。它在节点上的所有分片之间划分。

以下设置是静态的，必须在集群中的每个数据节点上配置：

- `indices.memory.index_buffer_size`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch)接受百分比或字节大小值。它默认为 `10%`，这意味着分配给节点的总堆的 `10%` 将用作所有分片共享的索引缓冲区大小。

- `indices.memory.min_index_buffer_size`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch)如果将 `index_buffer_size` 指定为百分比，则可以使用此设置指定绝对最小值。默认值为 `48mb`。

- `indices.memory.max_index_buffer_size`

  ([静态](/set_up_elasticsearch/configuring_elasticsearch)如果将 `index_buffer_size` 指定为百分比，则可以使用此设置指定绝对最大值。默认为未限定。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indexing-buffer.html)
