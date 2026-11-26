# 近实时搜索（Near real-time search）

当文档存储到 Elasticsearch 中后，它会在近实时内被索引并完全可搜索——即 1 秒以内。那么什么定义了近实时搜索？

## 逐段搜索

Elasticsearch 基于 Java 库 [Lucene](https://lucene.apache.org/)，Lucene 引入了**逐段搜索（per-segment search）**的概念。一个**段（segment）**类似于一个倒排索引，但 Lucene 中的“索引”一词指的是“段的集合加上一个提交点（commit point）”。提交之后，新段会被加入提交点，缓冲区被清空。

## 文件系统缓存的角色

在 Elasticsearch 与磁盘之间是文件系统缓存（filesystem cache）。内存索引缓冲区中的文档会被写入一个新段：新段**首先写入文件系统缓存**（开销小），**之后才刷写到磁盘**（开销大）。不过，文件一旦进入缓存，就可以像其他文件一样被打开和读取——无需等待落盘。

Lucene 允许写入并打开新段，使其中的文档对搜索可见，而无需执行完整的提交。这比提交到磁盘轻量得多，可以频繁执行而不影响性能。

## 刷新（refresh）

在 Elasticsearch 中，这个写入并打开新段的过程称为**刷新（refresh）**。一次刷新会使自上次刷新以来对索引执行的所有操作变为可搜索。

控制刷新的三种方式：

1. 等待刷新间隔（refresh interval）到期；
2. 设置 `?refresh` 选项；
3. 使用 [refresh API](/rest_apis/index_apis/refresh) 显式执行刷新：`POST _refresh`。

默认情况下，Elasticsearch 每秒周期性刷新索引，但仅针对最近 30 秒内收到至少一次搜索请求的索引。

这就是为什么称为“*近*实时搜索”：文档变更不会立即对搜索可见，但会在此时间范围内变为可见。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/near-real-time.html)
