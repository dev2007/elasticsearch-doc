# 内存锁定检查

当 JVM 进行一次主垃圾收集时，它会触及堆的每一页。如果这些页面中有任何被换出到磁盘，它们将不得不被换回内存。这会导致大量的磁盘抖动，而 Elasticsearch 更愿意用这些资源来服务请求。有几种方法可以将系统配置为禁止交换。一种方法是请求 JVM 通过 `mlockall`（Unix）或虚拟锁定（Windows）将堆锁定在内存中。这是通过 Elasticsearch 设置 `bootstrap.memory_lock` 完成的。但是，在某些情况下，此设置可以传递给 Elasticsearch，但 Elasticsearch 无法锁定堆（例如，如果 `elasticsearch` 用户没有 `memlock unlimited` 权限）。内存锁定检查验证：**如果**启用了 `bootstrap.memory_lock` 设置，JVM 是否成功锁定了堆。要通过内存锁定检查，你可能必须配置 `bootstrap.memory_lock`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/bootstrap-checks-memory-lock.html)
