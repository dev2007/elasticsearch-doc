# Rollup 搜索 API

:::warning 已弃用

在 8.11.0 中已弃用。

Rollup 将在未来版本中移除。请改用[降采样](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/downsampling-data-stream.html)。

:::

支持使用标准查询 DSL 搜索 rollup 后的数据。

之所以需要 rollup 搜索端点，是因为 rollup 后的文档在内部使用的文档结构与原始数据不同。rollup 搜索端点将标准查询 DSL 重写为与 rollup 文档匹配的格式，然后获取响应并将其重写回客户端根据原始查询所期望的形式。

```txt
GET <target>/_rollup_search
```

## 路径参数

`<target>`

（必需，字符串）用于限制请求的数据流和索引的逗号分隔列表。支持通配符表达式（`*`）。此目标可以同时包含 rollup 索引和非 rollup 索引。

`<target>` 参数的规则：

- 必须至少指定一个数据流、索引或通配符表达式。目标可以包含 rollup 索引或非 rollup 索引。对于数据流，数据流的后备索引只能作为非 rollup 索引。不允许省略 `<target>` 参数或使用 `_all`。

- 可以指定多个非 rollup 索引。

- **只能指定一个 rollup 索引。**如果提供多个，会发生异常。

- 可以使用通配符表达式，但如果匹配到多个 rollup 索引，会发生异常。但是，可以使用表达式匹配多个非 rollup 索引或数据流。

## 请求体

请求体支持常规搜索 API 功能的一个子集：

**支持：**

- `query` — 用于指定 DSL 查询，但有一些限制（请参阅 [rollup 搜索限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-search-limitations.html)和 [rollup 聚合限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-aggregation-limitations.html)）

- `aggregations` — 用于指定聚合

**不可用：**

- `size`：由于 rollup 处理的是预聚合数据，无法返回搜索命中 — `size` 必须设置为零或完全省略。

- `highlighter`、`suggestors`、`post_filter`、`profile`、`explain`：这些同样不允许使用。

## 示例

### 仅搜索历史数据

假设有一个名为 `sensor-1` 的索引，其中装满原始数据，并按如下方式配置了一个 rollup 作业：

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

这将 rollup `sensor-*` 模式并将结果存储在 `sensor_rollup` 中。要搜索这些 rollup 后的数据，使用带常规查询 DSL 的 `_rollup_search` 端点：

```json
GET /sensor_rollup/_rollup_search
{
  "size": 0,
  "aggregations": {
    "max_temperature": {
      "max": {
        "field": "temperature"
      }
    }
  }
}
```

响应：

```json
{
  "took" : 102,
  "timed_out" : false,
  "terminated_early" : false,
  "_shards" : ... ,
  "hits" : {
    "total" : {
        "value": 0,
        "relation": "eq"
    },
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "max_temperature" : {
      "value" : 202.0
    }
  }
}
```

响应与常规查询 + 聚合所期望的完全一致：有关请求的元数据（`took`、`_shards` 等）、搜索命中（rollup 搜索始终为空）以及聚合响应。

**限制示例 — 不可用的指标：**rollup 搜索仅限于 rollup 作业中配置的功能。例如，无法计算*平均温度*，因为 `avg` 不是为 `temperature` 字段配置的指标。尝试此搜索：

```json
GET sensor_rollup/_rollup_search
{
  "size": 0,
  "aggregations": {
    "avg_temperature": {
      "avg": {
        "field": "temperature"
      }
    }
  }
}
```

将返回以下错误：

```json
{
  "error": {
    "root_cause": [
      {
        "type": "illegal_argument_exception",
        "reason": "There is not a rollup job that has a [avg] agg with name [avg_temperature] which also satisfies all requirements of query.",
        "stack_trace": ...
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "There is not a rollup job that has a [avg] agg with name [avg_temperature] which also satisfies all requirements of query.",
    "stack_trace": ...
  },
  "status": 400
}
```

### 同时搜索历史 rollup 数据和非 rollup 数据

rollup 搜索 API 可以通过在 URI 中添加实时索引，同时搜索「实时」非 rollup 数据和聚合的 rollup 数据：

```json
GET sensor-1,sensor_rollup/_rollup_search
{
  "size": 0,
  "aggregations": {
    "max_temperature": {
      "max": {
        "field": "temperature"
      }
    }
  }
}
```

其工作方式为 — 执行搜索时，rollup 搜索端点：

1. 将原始请求**原封不动**地发送到非 rollup 索引。

2. 将原始请求的**重写**版本发送到 rollup 索引。

收到两个响应后，端点会重写 rollup 响应并将两者合并。在合并过程中，如果两个响应的**桶存在重叠**，则使用**非 rollup 索引的桶**。

响应（尽管跨越 rollup 和非 rollup 索引，仍符合预期）：

```json
{
  "took" : 102,
  "timed_out" : false,
  "terminated_early" : false,
  "_shards" : ... ,
  "hits" : {
    "total" : {
        "value": 0,
        "relation": "eq"
    },
    "max_score" : 0.0,
    "hits" : [ ]
  },
  "aggregations" : {
    "max_temperature" : {
      "value" : 202.0
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/rollup-search.html)
