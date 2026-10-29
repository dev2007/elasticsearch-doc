# 合并

Elasticsearch 中的分片是一个 Lucene 索引，而 Lucene 索引被分解为段（segments）。段是索引中存储索引数据的内部存储元素，它们是不可变的。较小的段会定期合并为较大的段，以控制索引大小并清除已删除的文档。

合并过程使用自动节流（auto-throttling）来平衡合并与搜索等其他活动之间的硬件资源使用。

## 合并调度

合并调度器（ConcurrentMergeScheduler）在需要时控制合并操作的执行。合并在单独的线程中运行，当达到最大线程数时，后续的合并将等待，直到有合并线程可用。

合并调度器支持以下**动态**设置：

**`index.merge.scheduler.max_thread_count`**

单个分片上可以同时进行合并的最大线程数。默认为 `Math.max(1, Math.min(4, node.processors / 2))`，这对于性能良好的固态硬盘（SSD）效果很好。如果你的索引位于机械硬盘上，请将其减小为 1。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules-merge.html)
