# 获取快照生命周期统计信息 API

返回有关快照生命周期管理所执行操作的全局和策略级统计信息。

```txt
GET /_slm/stats
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 响应体

`retention_runs`

保留策略执行运行的总次数。

`retention_failed`

失败的保留运行次数。

`retention_timed_out`

超时的保留运行次数。

`retention_deletion_time` / `retention_deletion_time_millis`

保留运行期间删除快照所花费的总时间（人类可读格式 / 以毫秒为单位）。

`policy_stats`

每个策略的统计信息对象数组。每个条目包含单个 SLM 策略的统计信息（例如每个策略的快照拍摄/失败/删除次数以及保留结果）。

`total_snapshots_taken`

SLM 成功拍摄的快照总数。

`total_snapshots_failed`

失败的快照尝试总数。

`total_snapshots_deleted`

SLM 保留机制删除的快照总数。

`total_snapshot_deletion_failures`

快照删除失败的总数。

## 示例

以下示例检索快照生命周期管理的统计信息：

```txt
GET /_slm/stats
```

API 返回以下响应：

```json
{
  "retention_runs": 13,
  "retention_failed": 0,
  "retention_timed_out": 0,
  "retention_deletion_time": "1.4s",
  "retention_deletion_time_millis": 1404,
  "policy_stats": [ ],
  "total_snapshots_taken": 1,
  "total_snapshots_failed": 1,
  "total_snapshots_deleted": 0,
  "total_snapshot_deletion_failures": 0
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-get-stats.html)
