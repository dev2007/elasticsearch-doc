# 堆大小检查

默认情况下，Elasticsearch 基于节点的角色和总内存自动调整 JVM 堆大小。如果你手动覆盖默认大小并以不同的初始和最大堆大小启动 JVM，JVM 可能会在系统使用期间调整堆大小时暂停。如果启用了 `bootstrap.memory_lock`，JVM 会在启动时锁定初始堆大小。如果初始堆大小不等于最大堆大小，调整大小后部分 JVM 堆可能未被锁定。为避免这些问题，启动 JVM 时应使用等于最大堆大小的初始堆大小。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-heap-size.html)
