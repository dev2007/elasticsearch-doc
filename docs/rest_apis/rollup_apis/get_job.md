# 获取 rollup 作业 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

检索 rollup 作业的配置、统计信息和状态。

```txt
GET _rollup/job/<job_id>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor`、`monitor_rollup`、`manage` 或 `manage_rollup` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 描述

此 API 可以返回单个 rollup 作业或所有 rollup 作业的详细信息。

此 API 仅返回活动的（STARTED 和 STOPPED）作业。如果一个作业已创建、运行一段时间后被删除，此 API 不会返回该作业的任何详细信息。

有关历史 rollup 作业的详细信息，[rollup 能力 API](./get_rollup_caps) 可能更有用。

## 路径参数

`<job_id>`

（可选，字符串）rollup 作业的标识符。如果为 `_all` 或省略，则返回所有 rollup 作业。

## 响应体

`jobs`

（数组）rollup 作业资源的数组。

rollup 作业资源的属性

- `config`（对象）包含 rollup 作业的配置。此信息与通过[创建 rollup 作业 API](./put_job) 创建作业时提供的配置相同。

- `stats`（对象）包含 rollup 作业的临时统计信息，例如已处理的文档数和已索引的 rollup 摘要文档数。这些统计信息不会持久化。如果节点重启，这些统计信息会被重置。

- `status`（对象）包含 rollup 作业索引器的当前状态。可能的值及其含义为：

  - `stopped` 表示索引器已暂停，即使其 cron 间隔触发也不会处理数据。

  - `started` 表示索引器正在运行，但没有主动索引数据。当 cron 间隔触发时，作业的索引器将开始处理数据。

  - `indexing` 表示索引器正在主动处理数据并创建新的 rollup 文档。处于此状态时，后续的 cron 间隔触发将被忽略，因为作业已因先前的触发而处于活动状态。

  - `abort` 是一种瞬态，用户通常不会看到。它用于因某些原因需要关闭任务时（作业已被删除、遇到不可恢复的错误等）。abort 状态设置后不久，作业将自行从集群中移除。

## 示例

如果已经创建了一个名为 `sensor` 的 rollup 作业，可以使用以下命令检索该作业的详细信息：

```txt
GET _rollup/job/sensor
```

API 返回以下响应：

```json
{
  "jobs": [
    {
      "config": {
        "id": "sensor",
        "index_pattern": "sensor-*",
        "rollup_index": "sensor_rollup",
        "cron": "*/30 * * * * ?",
        "groups": {
          "date_histogram": {
            "fixed_interval": "1h",
            "delay": "7d",
            "field": "timestamp",
            "time_zone": "UTC"
          },
          "terms": {
            "fields": [
              "node"
            ]
          }
        },
        "metrics": [
          {
            "field": "temperature",
            "metrics": [
              "min",
              "max",
              "sum"
            ]
          },
          {
            "field": "voltage",
            "metrics": [
              "avg"
            ]
          }
        ],
        "timeout": "20s",
        "page_size": 1000
      },
      "status": {
        "job_state": "stopped"
      },
      "stats": {
        "pages_processed": 0,
        "documents_processed": 0,
        "rollups_indexed": 0,
        "trigger_count": 0,
        "index_failures": 0,
        "index_time_in_ms": 0,
        "index_total": 0,
        "search_failures": 0,
        "search_time_in_ms": 0,
        "search_total": 0,
        "processing_time_in_ms": 0,
        "processing_total": 0
      }
    }
  ]
}
```

由于我们在端点 URL 中请求了单个作业，`jobs` 数组仅包含一个作业（id: sensor）。如果添加另一个作业，可以看到多作业响应的处理方式：

```json
PUT _rollup/job/sensor2
{
  "index_pattern": "sensor-*",
  "rollup_index": "sensor_rollup",
  "cron": "*/30 * * * * ?",
  "page_size": 1000,
  "groups": {
    "date_histogram": {
      "field": "timestamp",
      "fixed_interval": "1h",
      "delay": "7d"
    },
    "terms": {
      "fields": [ "node" ]
    }
  },
  "metrics": [
    {
      "field": "temperature",
      "metrics": [ "min", "max", "sum" ]
    },
    {
      "field": "voltage",
      "metrics": [ "avg" ]
    }
  ]
}
```

```txt
GET _rollup/job/_all
```

1. 创建名为 `sensor2` 的第二个作业。
2. 然后在 GetJobs API 中使用 `_all` 请求所有作业。

将返回以下响应（`jobs` 数组中同时包含 `sensor2` 和 `sensor` 两个作业的完整配置、状态和统计信息）：

```json
{
  "jobs": [
    {
      "config": {
        "id": "sensor2",
        "index_pattern": "sensor-*",
        "rollup_index": "sensor_rollup",
        "cron": "*/30 * * * * ?",
        "groups": {
          "date_histogram": {
            "fixed_interval": "1h",
            "delay": "7d",
            "field": "timestamp",
            "time_zone": "UTC"
          },
          "terms": {
            "fields": [
              "node"
            ]
          }
        },
        "metrics": [
          {
            "field": "temperature",
            "metrics": [
              "min",
              "max",
              "sum"
            ]
          },
          {
            "field": "voltage",
            "metrics": [
              "avg"
            ]
          }
        ],
        "timeout": "20s",
        "page_size": 1000
      },
      "status": {
        "job_state": "stopped"
      },
      "stats": {
        "pages_processed": 0,
        "documents_processed": 0,
        "rollups_indexed": 0,
        "trigger_count": 0,
        "index_failures": 0,
        "index_time_in_ms": 0,
        "index_total": 0,
        "search_failures": 0,
        "search_time_in_ms": 0,
        "search_total": 0,
        "processing_time_in_ms": 0,
        "processing_total": 0
      }
    },
    {
      "config": {
        "id": "sensor",
        "index_pattern": "sensor-*",
        "rollup_index": "sensor_rollup",
        "cron": "*/30 * * * * ?",
        "groups": {
          "date_histogram": {
            "fixed_interval": "1h",
            "delay": "7d",
            "field": "timestamp",
            "time_zone": "UTC"
          },
          "terms": {
            "fields": [
              "node"
            ]
          }
        },
        "metrics": [
          {
            "field": "temperature",
            "metrics": [
              "min",
              "max",
              "sum"
            ]
          },
          {
            "field": "voltage",
            "metrics": [
              "avg"
            ]
          }
        ],
        "timeout": "20s",
        "page_size": 1000
      },
      "status": {
        "job_state": "stopped"
      },
      "stats": {
        "pages_processed": 0,
        "documents_processed": 0,
        "rollups_indexed": 0,
        "trigger_count": 0,
        "index_failures": 0,
        "index_time_in_ms": 0,
        "index_total": 0,
        "search_failures": 0,
        "search_time_in_ms": 0,
        "search_total": 0,
        "processing_time_in_ms": 0,
        "processing_total": 0
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-get-job.html)
