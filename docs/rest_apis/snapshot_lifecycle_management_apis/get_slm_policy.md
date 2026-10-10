# 获取快照生命周期策略 API

检索一个或多个快照生命周期策略的定义，以及有关最新快照尝试（成功和失败）的信息。

```txt
GET _slm/policy/<policy-id>
GET _slm/policy
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage_slm` 集群权限才能使用此 API。

## 描述

此 API 返回指定策略的定义，以及有关最近**成功和失败**快照尝试的信息。

如果没有指定策略，则返回**所有**已定义的策略。

## 路径参数

`<policy-id>`

（可选，字符串）快照生命周期策略 ID 的逗号分隔列表。

## 示例

以下示例检索策略 `daily-snapshots`：

```txt
GET _slm/policy/daily-snapshots?human
```

API 返回以下响应：

```json
{
  "daily-snapshots": {
    "version": 1,
    "modified_date": "2099-05-06T01:30:00.000Z",
    "modified_date_millis": 4081757400000,
    "policy": {
      "schedule": "0 30 1 * * ?",
      "name": "<daily-snap-{now/d}>",
      "repository": "my_repository",
      "config": {
        "indices": [ "data-*", "important" ],
        "ignore_unavailable": false,
        "include_global_state": false
      },
      "retention": {
        "expire_after": "30d",
        "min_count": 5,
        "max_count": 50
      }
    },
    "stats": {
      "policy": "daily-snapshots",
      "snapshots_taken": 0,
      "snapshots_failed": 0,
      "snapshots_deleted": 0,
      "snapshot_deletion_failures": 0
    },
    "next_execution": "2099-05-07T01:30:00.000Z",
    "next_execution_millis": 4081843800000
  }
}
```

响应包含以下字段：

- `version`：快照策略的版本；只存储最新版本，策略更新时会递增。
- `modified_date`：此策略最后一次被修改的时间（人类可读的时间戳）。
- `modified_date_millis`：最后一次修改时间（自 Unix 纪元以来的毫秒数）。
- `policy`：策略定义对象，包含：
  - `policy.name`：快照名称模式，例如 `<daily-snap-{now/d}>`。
  - `policy.schedule`：Cron 风格的时间表，例如 `0 30 1 * * ?`（每天 01:30）。
  - `policy.repository`：快照仓库的名称。
  - `policy.config`：快照配置，包括 `indices`（要快照的索引模式）、`ignore_unavailable`、`include_global_state`。
  - `policy.retention`：保留规则，包括 `expire_after`（例如 `30d`）、`min_count`、`max_count`。
- `stats`：策略统计信息，包括 `policy`、`snapshots_taken`、`snapshots_failed`、`snapshots_deleted`、`snapshot_deletion_failures`。
- `next_execution`：此策略下次执行的时间（人类可读格式）。
- `next_execution_millis`：下次执行时间（自 Unix 纪元以来的毫秒数）。
- `last_success` / `last_failure`：有关最近成功/失败快照尝试的信息。这些字段仅在实际发生过快照尝试时才会出现。

以下示例省略策略 ID 以检索所有已定义的策略：

```txt
GET _slm/policy
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/slm-api-get-policy.html)
