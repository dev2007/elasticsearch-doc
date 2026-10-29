# 事务日志

对 Lucene 的更改只有在 Lucene 提交（commit）期间才会持久化到磁盘，这是一个相对昂贵的操作，因此无法在每次索引或删除操作之后执行。在一次提交之后、另一次提交之前发生的更改，会在进程退出或硬件故障的情况下被 Lucene 从索引中移除。

Lucene 提交的成本太高，无法对每个单独的更改执行，因此每个分片副本还会将其操作写入其事务日志（即 translog）。所有索引和删除操作在由内部 Lucene 索引处理之后、在被确认之前，都会写入 translog。在发生崩溃时，已确认但尚未包含在最后一次 Lucene 提交中的近期操作，会在分片恢复时从 translog 中恢复。

Elasticsearch 的 flush 是执行一次 Lucene 提交并开始一个新的 translog 世代（generation）的过程。flush 会在后台自动执行，以确保 translog 不会增长得过大，否则在恢复期间重放其操作将耗费相当长的时间。translog 的大小永远不会超过磁盘大小的 1%。通过 API 执行手动 flush 的能力也可用，但很少需要。

## TRANSLOG 设置

translog 中的数据只有在 translog 被 fsync 并提交之后才会持久化到磁盘。在发生硬件故障、操作系统崩溃、JVM 崩溃或分片故障的情况下，自上次 translog 提交以来写入的任何数据都将丢失。

默认情况下，`index.translog.durability` 设置为 `request`，这意味着 Elasticsearch 只有在 translog 已在主分片和每个已分配副本上成功 fsync 并提交之后，才会向客户端报告索引、删除、更新或批量请求成功。如果 `index.translog.durability` 设置为 `async`，则 Elasticsearch 每隔 `index.translog.sync_interval` 才对 translog 进行 fsync 和提交，这意味着在崩溃之前刚执行的操作在节点恢复时可能会丢失。

以下可动态更新的按索引设置控制 translog 的行为：

**`index.translog.sync_interval`**

无论写入操作如何，translog 被 fsync 到磁盘并提交的频率。默认为 `5s`。不允许小于 `100ms` 的值。

**`index.translog.durability`**

是否在每次索引、删除、更新或批量请求之后对 translog 进行 fsync 并提交。此设置接受以下参数：

- **`request`**（默认）— 每次请求之后进行 fsync 并提交。发生硬件故障时，所有已确认的写入将已经提交到磁盘。
- **`async`** — 每个 `sync_interval` 在后台进行 fsync 并提交。发生故障时，自上次自动提交以来的所有已确认写入都将被丢弃。

**`index.translog.flush_threshold_size`**

translog 存储所有尚未安全持久化到 Lucene 的操作（即不属于 Lucene 提交点的操作）。虽然这些操作可用于读取，但如果分片停止并且必须恢复，它们将需要被重放。此设置控制这些操作的最大总大小，以防止恢复耗时过长。一旦达到最大大小，就会发生一次 flush，生成一个新的 Lucene 提交点。默认为 `10 GB`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules-translog.html)
