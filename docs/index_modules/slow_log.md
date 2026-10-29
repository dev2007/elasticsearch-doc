# 慢日志

慢日志记录执行时长超过指定阈值的数据库搜索和索引事件。你可以使用这些日志来调查、分析或排查集群的历史搜索和索引性能。

慢日志在分片级别报告搜索的任务持续时间，在索引级别报告索引的任务持续时间，但可能不包含客户端观察到的完整任务执行时间。例如，慢日志不会反映 HTTP 网络延迟或任务队列的影响。

满足指定阈值的事件会被发送到 `fileset.name` 为 `slowlog` 的 Elasticsearch 日志记录中。这些日志可以在以下位置查看：

- 如果启用了 Elasticsearch 监控，则从 Stack Monitoring 中查看。慢日志事件的 logger 值为 `index.search.slowlog` 或 `index.indexing.slowlog`。
- 从本地 Elasticsearch 服务日志目录查看。慢日志文件的后缀为 `_index_search_slowlog.json` 或 `_index_indexing_slowlog.json`。

## 慢日志格式

如果调用是以 `X-Opaque-ID` 头发起的，则该 ID 会自动包含在搜索慢日志的 `elasticsearch.slowlog.id` 字段中。有关详细信息和最佳实践，参阅 X-Opaque-Id HTTP 头。

**慢日志中的搜索事件示例：**

```json
{
  "@timestamp": "2024-12-21T12:42:37.255Z",
  "auth.type": "REALM",
  "ecs.version": "1.2.0",
  "elasticsearch.cluster.name": "distribution_run",
  "elasticsearch.cluster.uuid": "Ui23kfF1SHKJwu_hI1iPPQ",
  "elasticsearch.node.id": "JK-jn-XpQ3OsDUsq5ZtfGg",
  "elasticsearch.node.name": "node-0",
  "elasticsearch.slowlog.id": "tomcat-123",
  "elasticsearch.slowlog.message": "[index6][0]",
  "elasticsearch.slowlog.search_type": "QUERY_THEN_FETCH",
  "elasticsearch.slowlog.source": "{\"query\":{\"match_all\":{\"boost\":1.0}}}",
  "elasticsearch.slowlog.stats": "[]",
  "elasticsearch.slowlog.took": "747.3micros",
  "elasticsearch.slowlog.took_millis": 0,
  "elasticsearch.slowlog.total_hits": "1 hits",
  "elasticsearch.slowlog.total_shards": 1,
  "event.dataset": "elasticsearch.index_search_slowlog",
  "fileset.name": "slowlog",
  "log.level": "WARN",
  "log.logger": "index.search.slowlog.query",
  "process.thread.name": "elasticsearch[runTask-0][search][T#5]",
  "service.name": "ES_ECS",
  "user.name": "elastic",
  "user.realm": "reserved"
}
```

**慢日志中的索引事件示例：**

```json
{
  "@timestamp": "2024-12-11T22:34:22.613Z",
  "auth.type": "REALM",
  "ecs.version": "1.2.0",
  "elasticsearch.cluster.name": "41bd111609d849fc9bf9d25b5df9ce96",
  "elasticsearch.cluster.uuid": "BZTn4I9URXSK26imlia0QA",
  "elasticsearch.index.id": "3VfGR7wRRRKmMCEn7Ii58g",
  "elasticsearch.index.name": "my-index-000001",
  "elasticsearch.node.id": "GGiBgg21S3eqPDHzQiCMvQ",
  "elasticsearch.node.name": "instance-0000000001",
  "elasticsearch.slowlog.id": "RCHbt5MBT0oSsCOu54AJ",
  "elasticsearch.slowlog.source": "{\"key\":\"value\"}",
  "elasticsearch.slowlog.took": "0.01ms",
  "event.dataset": "elasticsearch.index_indexing_slowlog",
  "fileset.name": "slowlog",
  "log.level": "TRACE",
  "log.logger": "index.indexing.slowlog.index",
  "service.name": "ES_ECS",
  "user.name": "elastic",
  "user.realm": "reserved"
}
```

## 启用慢日志

你可以在两个级别启用慢日志：

- 对 Elasticsearch `log4j2.properties` 配置文件下的所有索引启用。此方法需要重启节点。
- 在索引级别，使用更新索引设置 API 启用。

默认情况下，所有阈值都设置为 `-1`，即不记录任何事件。

可以为四个日志级别启用慢日志阈值：`trace`、`debug`、`info` 和 `warn`。你可以通过禁用更详细的级别来模拟设置日志级别阈值。

要查看当前的慢日志设置，使用获取索引设置 API：

```txt
GET _all/_settings?expand_wildcards=all&filter_path=*.settings.index.*.slowlog
```

## 为搜索事件启用慢日志

搜索慢日志按分片发出。必须为分片的查询和获取搜索阶段分别启用。

你可以使用 `index.search.slowlog.include.user` 设置将 `user.*` 和 `auth.type` 字段附加到慢日志条目。这些字段包含触发请求的用户的信息。

**使用 `log4j2.properties` 对所有索引的设置：**

```properties
index.search.slowlog.threshold.query.warn: 10s
index.search.slowlog.threshold.query.info: 5s
index.search.slowlog.threshold.query.debug: 2s
index.search.slowlog.threshold.query.trace: 500ms

index.search.slowlog.threshold.fetch.warn: 1s
index.search.slowlog.threshold.fetch.info: 800ms
index.search.slowlog.threshold.fetch.debug: 500ms
index.search.slowlog.threshold.fetch.trace: 200ms

index.search.slowlog.include.user: true
```

**使用更新索引设置 API 对单个索引的设置：**

```txt
PUT /my-index-000001/_settings
{
  "index.search.slowlog.threshold.query.warn": "10s",
  "index.search.slowlog.threshold.query.info": "5s",
  "index.search.slowlog.threshold.query.debug": "2s",
  "index.search.slowlog.threshold.query.trace": "500ms",
  "index.search.slowlog.threshold.fetch.warn": "1s",
  "index.search.slowlog.threshold.fetch.info": "800ms",
  "index.search.slowlog.threshold.fetch.debug": "500ms",
  "index.search.slowlog.threshold.fetch.trace": "200ms",
  "index.search.slowlog.include.user": true
}
```

## 为索引事件启用慢日志

索引慢日志按索引文档发出。

你可以使用 `index.indexing.slowlog.include.user` 设置将 `user.*` 和 `auth.type` 字段附加到慢日志条目。这些字段包含触发请求的用户的信息。

**使用 `log4j2.properties` 对所有索引的设置：**

```properties
index.indexing.slowlog.threshold.index.warn: 10s
index.indexing.slowlog.threshold.index.info: 5s
index.indexing.slowlog.threshold.index.debug: 2s
index.indexing.slowlog.threshold.index.trace: 500ms

index.indexing.slowlog.source: 1000
index.indexing.slowlog.reformat: true

index.indexing.slowlog.include.user: true
```

**使用更新索引设置 API 对单个索引的设置：**

```txt
PUT /my-index-000001/_settings
{
  "index.indexing.slowlog.threshold.index.warn": "10s",
  "index.indexing.slowlog.threshold.index.info": "5s",
  "index.indexing.slowlog.threshold.index.debug": "2s",
  "index.indexing.slowlog.threshold.index.trace": "500ms",
  "index.indexing.slowlog.source": "1000",
  "index.indexing.slowlog.reformat": true,
  "index.indexing.slowlog.include.user": true
}
```

## 记录 `_source` 字段

默认情况下，Elasticsearch 在慢日志中记录 `_source` 的前 1000 个字符。你可以使用 `index.indexing.slowlog.source` 设置调整 `_source` 的记录方式。将 `index.indexing.slowlog.source` 设置为 `false` 或 `0` 可完全跳过记录源。将 `index.indexing.slowlog.source` 设置为 `true` 可无论大小记录完整源。

默认情况下，原始 `_source` 会被重新格式化以确保它适合放在单行日志中。如果保留原始文档格式很重要，你可以通过将 `index.indexing.slowlog.reformat` 设置为 `false` 来关闭重新格式化。这会使源以原始格式记录，可能跨越多行日志。

## 慢日志的最佳实践

根据符合条件的流量大小，记录慢请求可能对你的 Elasticsearch 集群非常消耗资源。例如，发出的日志可能会增加 Elasticsearch 监控集群的索引磁盘使用量。为了减少慢日志的影响，请考虑：

- 针对特定索引启用慢日志，而不是跨所有索引。
- 设置较高的阈值以减少记录的事件数量。
- 仅在排查问题时启用慢日志。

如果你不确定如何开始调查流量问题，可以考虑使用更新索引设置 API 在索引级别启用 `warn` 阈值并设置较高的 30 秒阈值：

**为搜索请求启用：**

```txt
PUT /*/_settings
{
  "index.search.slowlog.include.user": true,
  "index.search.slowlog.threshold.fetch.warn": "30s",
  "index.search.slowlog.threshold.query.warn": "30s"
}
```

**为索引请求启用：**

```txt
PUT /*/_settings
{
  "index.indexing.slowlog.include.user": true,
  "index.indexing.slowlog.threshold.index.warn": "30s"
}
```

满足慢日志阈值并不保证存在集群性能问题。如果注意到症状，慢日志可以提供有用的数据来诊断上游流量模式或来源，以解决客户端问题。例如，你可以使用包含在 `X-Opaque-ID`、`_source` 请求体或 `user.*` 字段中的数据来确定问题的来源。这类似于排查活跃的高开销任务。

如果你遇到搜索性能问题，还可以考虑使用 profile API 调查标记出查询时长较长的搜索。然后可以使用分析后的查询通过查询分析器研究优化选项。这种类型的调查通常应在非生产环境中进行。

慢日志在事件完成时对照报告阈值检查每个事件。这意味着它无法报告触发熔断器错误的事件。如果怀疑存在熔断器错误，你还应该考虑启用审计日志，它在事件执行之前记录事件。

## 了解更多

要了解优化搜索和索引请求的其他方法，参阅针对搜索速度调优和针对索引速度调优。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules-slowlog.html)
