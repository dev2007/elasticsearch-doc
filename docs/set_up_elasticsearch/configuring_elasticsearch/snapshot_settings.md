# 快照和恢复设置

以下集群设置用于配置快照和恢复。

**`snapshot.max_concurrent_operations`**

（动态，整数）并发快照操作的最大数量。默认为 1000。

此限制统一应用于所有正在进行的快照创建、克隆和删除操作。Elasticsearch 将拒绝任何超出此限制的操作。

## SLM 设置

以下集群设置用于配置快照生命周期管理（SLM）。

**`slm.history_index_enabled`**

（动态，布尔值）控制 SLM 是否将作为 SLM 策略一部分执行的操作历史记录到 `slm-history-*` 索引中。默认为 `true`。

**`slm.retention_schedule`**

（动态，cron 调度值）控制保留任务何时运行。可以是周期性或绝对时间计划。支持 cron 调度器支持的所有值。默认为每天 UTC 时间凌晨 1:30：`0 30 1 * * ?`。

**`slm.retention_duration`**

（动态，时间值）限制 SLM 删除旧快照所花费的时间。默认为一小时：`1h`。

**`slm.health.failed_snapshot_warn_threshold`**

（动态，长整型）自上次成功快照以来的失败调用次数，达到该次数时健康状况 API 将指出策略存在问题。默认为连续失败五次后发出健康状况 API 警告：`5L`。

**`repositories.url.allowed_urls`**

（静态）指定快照可以从中恢复的只读 URL 仓库。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/snapshot-settings.html)
