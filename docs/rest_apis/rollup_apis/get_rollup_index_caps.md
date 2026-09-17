# 获取 rollup 索引能力 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

返回 rollup 索引（即存储 rollup 数据的索引）内所有作业的 rollup 能力。单个 rollup 索引可能存储多个 rollup 作业的数据，并且根据这些作业的不同可能具有多种能力。

此 API 使你能够确定：

1. 一个索引（或通过模式指定的多个索引）中存储了哪些作业
2. 哪些目标索引被 rollup 了、这些 rollup 中使用了哪些字段，以及可以对每个作业执行哪些聚合

```txt
GET <target>/_rollup/data
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须对存储 rollup 结果的索引具有**读取**、**查看索引元数据**或**管理**[索引权限](../security_privileges/index_privileges)。

## 路径参数

`<target>`

（必需，字符串）要检查 rollup 能力的数据流或索引。支持通配符（`*`）表达式。

## 示例

### 步骤 1：创建示例 rollup 作业

假设有一个名为 `sensor-1` 的索引，其中装满原始数据（数据会增长为 `sensor-2`、`sensor-3` 等）。创建一个将数据存储在 `sensor_rollup` 中的 rollup 作业：

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

### 步骤 2：查询 rollup 索引能力

```txt
GET /sensor_rollup/_rollup/data
```

请注意，具体的 rollup 索引名称（`sensor_rollup`）是 URL 的第一部分。

响应体：

```json
{
  "sensor_rollup" : {
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

响应解读：

- **调度细节**：rollup 作业 ID（`sensor`）、保存 rollup 后数据的索引（`sensor_rollup`），以及作业目标的索引模式（`sensor-*`）。

- **可用于 rollup 搜索的字段**：列出了四个字段 — `node`、`temperature`、`timestamp` 和 `voltage` — 每个字段都有其可用的聚合。例如，`temperature` 支持 `min`、`max` 或 `sum` 聚合，而 `timestamp` 仅支持 `date_histogram`。

- `rollup_jobs` 元素是一个**数组**：可以为单个索引或索引模式配置多个独立的作业，每个作业可能有不同的配置，因此 API 返回所有可用配置的列表。

### 使用索引模式

与其他与索引交互的 API 一样，可以指定索引模式而非明确的索引：

```txt
GET /*_rollup/_rollup/data
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-get-rollup-index-caps.html)
