# 数据流生命周期设置

以下是可用于配置数据流生命周期的设置。

## 集群级设置

**`data_streams.lifecycle.retention.max`**

（动态，时间单位值）适用于由数据流生命周期管理的所有用户数据流的最大保留期限。最大保留期限还会覆盖配置的保留期限超过最大值的数据流的保留期限。该值应大于 10s。

**`data_streams.lifecycle.retention.default`**

（动态，时间单位值）适用于由数据流生命周期管理的、未配置保留期限的所有用户数据流的保留期限。该值应大于 10s 且小于等于 `data_streams.lifecycle.retention.max`。

**`data_streams.lifecycle.poll_interval`**

（动态，时间单位值）Elasticsearch 检查所有使用内置生命周期的数据流的下一个操作的频率。默认为 5m。

**`cluster.lifecycle.default.rollover`**

（动态，字符串）此属性接受键值对格式的字符串，配置在数据流配置了生命周期时触发滚动（rollover）的条件。此属性是实现细节，可能会更改。当前默认为 `max_age=auto,max_primary_shard_size=50gb,min_docs=1,max_primary_shard_docs=200000000`，这意味着你的数据流在满足以下任一条件时会滚动：

- 任一主分片达到 50GB 的大小；
- 或任一主分片包含 200,000,000 个文档；
- 或索引达到一定期限（取决于数据流的保留时间）；
- 且至少有一个文档。

**`data_streams.lifecycle.target.merge.policy.merge_factor`**

（动态，整数）数据流生命周期通过更新目标后备索引的 Lucene 合并策略因子来实现尾部合并。合并因子既是应该合并在一起的段的数量，也是我们预期在给定层上找到的最大段数。此设置控制数据流生命周期在目标索引上配置的值。默认为 16。该值将显示在目标索引的 `index.merge.policy.merge_factor` 索引设置下。

**`data_streams.lifecycle.target.merge.policy.floor_segment`**

（动态）数据流生命周期通过更新目标后备索引的 Lucene 合并策略下限段大小（floor segment）来实现尾部合并。此下限段大小是一种防止索引出现大量极小段长尾的方法。此设置控制数据流生命周期在目标索引上配置的值。默认为 100MB。

**`data_streams.lifecycle.signalling.error_retry_interval`**

（动态，整数）表示对于处于错误步骤中的索引，数据流生命周期必须执行的重试次数，以表明该索引没有进展（即卡在错误步骤中）。当前的信号机制是错误级别的日志语句，但信号机制将来可能会扩展。默认为 10 次重试。

## 索引级设置

以下索引级设置通常在数据流的后备索引上配置。

**`index.lifecycle.prefer_ilm`**

（动态，布尔值）当且仅当后备索引具有索引生命周期管理（ILM）策略且数据流也具有内置生命周期时，此设置决定由哪个特性管理数据流的后备索引。为 true 时，该索引由 ILM 管理；为 false 时，后备索引由数据流生命周期管理。默认为 true。

**`index.lifecycle.origination_date`**

（动态，长整型）如果指定，这是在后备索引滚动之后用于计算后备索引生成期限的时间戳。生成期限用于确定数据保留，因此，如果你创建了一个包含较旧数据的后备索引，并希望确保保留期限或生命周期的其他部分基于数据的原始时间戳（而不是它们被索引的时间戳）来应用，可以使用此设置。以 Unix 纪元毫秒值指定。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/data-stream-lifecycle-settings.html)
