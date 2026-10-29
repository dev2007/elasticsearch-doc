# 最大虚拟内存大小检查

Elasticsearch 和 Lucene 非常有效地使用 mmap 将索引的部分内容映射到 Elasticsearch 地址空间。这使某些索引数据保留在 JVM 堆之外但保留在内存中，以实现极快的访问。为此，Elasticsearch 应该拥有无限的地址空间。最大虚拟内存大小检查强制要求 Elasticsearch 进程拥有无限的地址空间，并且仅在 Linux 上强制执行。要通过最大虚拟内存大小检查，你必须将系统配置为允许 Elasticsearch 进程拥有无限的地址空间。这可以通过向 `/etc/security/limits.conf` 添加 `<user> - as unlimited` 来完成。这可能还要求你提高 root 用户的限制。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/max-size-virtual-memory-check.html)
