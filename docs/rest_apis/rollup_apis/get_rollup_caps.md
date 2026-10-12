# 获取 rollup 能力 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

返回为特定索引或索引模式配置的 rollup 作业的能力。

```txt
GET _rollup/data/<index>
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `monitor`、`monitor_rollup`、`manage` 或 `manage_rollup` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 描述

此 API 很有用，因为 rollup 作业通常配置为仅 rollup 源索引中字段的子集。此外，只能为各个字段配置某些聚合，这导致功能受到配置的限制。

此 API 使你能够检查索引并确定：

1. 此索引在集群中某处是否有关联的 rollup 数据？
2. 如果有，哪些字段被 rollup 了、可以执行哪些聚合、数据存储在哪里？

## 路径参数

`<index>`

（必需，字符串）要返回 rollup 能力的索引、多个索引或索引模式。可以使用 `_all` 从所有作业获取 rollup 能力。

## 示例

### 设置：创建 rollup 作业

假设我们有一个名为 `sensor-1` 的索引，其中装满原始数据。数据会随时间增长，因此还会有 `sensor-2`、`sensor-3` 等。创建一个目标为索引模式 `sensor-*` 的 rollup 作业：

```json
PUT _rollup/job/sensor
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

### 检索索引模式的 rollup 能力

```txt
GET _rollup/data/sensor-*
```

响应：

```json
{
  "sensor-*" : {
    "rollup_jobs" : [
      {
        "job_id" : "sensor",
        "rollup_index" : "sensor_rollup",
        "index_pattern" : "sensor-*",
        "fields" : {
          "node" : [
            {
              "agg" : "terms"
            }
          ],
          "temperature" : [
            {
              "agg" : "min"
            },
            {
              "agg" : "max"
            },
            {
              "agg" : "sum"
            }
          ],
          "timestamp" : [
            {
              "agg" : "date_histogram",
              "time_zone" : "UTC",
              "fixed_interval" : "1h",
              "delay": "7d"
            }
          ],
          "voltage" : [
            {
              "agg" : "avg"
            }
          ]
        }
      }
    ]
  }
}
```

响应包含与原始 rollup 配置类似的信息，但格式不同：

- **调度细节**：rollup 作业 ID、保存 rollup 后数据的索引，以及作业目标的索引模式。

- **字段列表**：包含可用于 rollup 搜索的字段 — `node`、`temperature`、`timestamp` 和 `voltage`。每个字段列出其可能的聚合。例如，可以对 `temperature` 使用 `min`、`max` 或 `sum` 聚合，但对 `timestamp` 只能使用 `date_histogram`。

- `rollup_jobs` 元素是一个**数组** — 可以为单个索引或索引模式配置多个独立的作业。每个作业可能有不同的配置，因此 API 返回所有各种可用配置的列表。

### 使用 `_all` 检索所有能力

```txt
GET _rollup/data/_all
```

### 具体索引名称不返回能力

使用具体索引名称（`sensor-1`）检索**不到**任何 rollup 能力：

```txt
GET _rollup/data/sensor-1
```

响应：

```json
{}
```

原因：原始 rollup 作业是针对索引模式（`sensor-*`）而非具体索引（`sensor-1`）配置的。虽然该索引属于此模式，但 rollup 作业仅在模式整体范围内有效 — 而非其包含的单个索引。因此，获取 rollup 能力 API 仅基于最初配置的索引名称或模式返回信息。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-get-rollup-caps.html)
