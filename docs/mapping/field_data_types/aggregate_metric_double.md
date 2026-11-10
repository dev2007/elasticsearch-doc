# aggregate_metric_double 字段类型

`aggregate_metric_double` 字段类型用于存储供指标聚合使用的预聚合数值。该字段是一个对象，包含以下一个或多个指标子字段：`min`、`max`、`sum` 和 `value_count`。

当你在 `aggregate_metric_double` 字段上运行某些指标聚合时，聚合会使用相关子字段的值。例如，对 `aggregate_metric_double` 字段运行 `min` 聚合，会返回所有 `min` 子字段中的最小值。

`aggregate_metric_double` 字段为每个指标子字段存储一个数值文档值。不支持数组值。`min`、`max` 和 `sum` 值是 double 数字。`value_count` 是正的长整型数字。

```bash
PUT my-index
{
  "mappings": {
    "properties": {
      "my-agg-metric-field": {
        "type": "aggregate_metric_double",
        "metrics": [ "min", "max", "sum", "value_count" ],
        "default_metric": "max"
      }
    }
  }
}
```

## aggregate_metric_double 字段的参数

- `metrics`
  （必需，字符串数组）要存储的指标子字段数组。每个值对应一个指标聚合。有效值为 `min`、`max`、`sum` 和 `value_count`。你必须至少指定一个值。
- `default_metric`
  （必需，字符串）供不使用子字段的查询、脚本和聚合使用的默认指标子字段。必须是 `metrics` 数组中的一个值。
- `time_series_metric`
  （可选，字符串）将字段标记为时序指标。值为指标类型。你不能对现有字段更新此参数。

**`aggregate_metric_double` 字段的有效 `time_series_metric` 值**

| 值 | 描述 |
|:--|:--|
| `gauge` | 表示可以任意增加或减少的单一数值的指标。例如温度或可用磁盘空间。 |
| `null`（默认） | 不是时序指标。 |

## 用途

我们设计 `aggregate_metric_double` 字段用于以下聚合：

- `min` 聚合返回所有 `min` 子字段中的最小值。
- `max` 聚合返回所有 `max` 子字段中的最大值。
- `sum` 聚合返回所有 `sum` 子字段的值的总和。
- `value_count` 聚合返回所有 `value_count` 子字段的值的总和。
- `avg` 聚合。没有 `avg` 子字段；`avg` 聚合的结果使用 `sum` 和 `value_count` 指标计算得出。要运行 `avg` 聚合，字段必须同时包含 `sum` 和 `value_count` 指标子字段。

在 `aggregate_metric_double` 字段上运行任何其他聚合都会失败，并返回“不支持的聚合”（unsupported aggregation）错误。

此外，`aggregate_metric_double` 字段还支持以下查询。对于这些查询，它会将行为委托给 `default_metric` 子字段，表现为一个 double 类型：

- `exists`
- `range`
- `term`
- `terms`

## 示例

以下创建索引 API 请求创建一个带有名为 `agg_metric` 的 `aggregate_metric_double` 字段的索引。请求将 `max` 设置为该字段的 `default_metric`。

```bash
PUT stats-index
{
  "mappings": {
    "properties": {
      "agg_metric": {
        "type": "aggregate_metric_double",
        "metrics": [ "min", "max", "sum", "value_count" ],
        "default_metric": "max"
      }
    }
  }
}
```

以下索引 API 请求向 `agg_metric` 字段添加带有预聚合数据的文档。

```bash
PUT stats-index/_doc/1
{
  "agg_metric": {
    "min": -302.50,
    "max": 702.30,
    "sum": 200.0,
    "value_count": 25
  }
}

PUT stats-index/_doc/2
{
  "agg_metric": {
    "min": -93.00,
    "max": 1702.30,
    "sum": 300.00,
    "value_count": 25
  }
}
```

你可以在 `agg_metric` 字段上运行 `min`、`max`、`sum`、`value_count` 和 `avg` 聚合。

```bash
POST stats-index/_search?size=0
{
  "aggs": {
    "metric_min": { "min": { "field": "agg_metric" } },
    "metric_max": { "max": { "field": "agg_metric" } },
    "metric_value_count": { "value_count": { "field": "agg_metric" } },
    "metric_sum": { "sum": { "field": "agg_metric" } },
    "metric_avg": { "avg": { "field": "agg_metric" } }
  }
}
```

聚合结果基于相关的指标子字段值。

```json
{
...
  "aggregations": {
    "metric_min": {
      "value": -302.5
    },
    "metric_max": {
      "value": 1702.3
    },
    "metric_value_count": {
      "value": 50
    },
    "metric_sum": {
      "value": 500.0
    },
    "metric_avg": {
      "value": 10.0
    }
  }
}
```

对 `aggregate_metric_double` 字段的查询使用 `default_metric` 值。

```bash
GET stats-index/_search
{
  "query": {
    "term": {
      "agg_metric": {
        "value": 702.30
      }
    }
  }
}
```

搜索返回以下命中结果。`default_metric` 字段（`max`）的值与查询值匹配。

```json
{
  ...
    "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "stats-index",
        "_id": "1",
        "_score": 1.0,
        "_source": {
          "agg_metric": {
            "min": -302.5,
            "max": 702.3,
            "sum": 200.0,
            "value_count": 25
          }
        }
      }
    ]
  }
}
```

## 合成 _source

例如：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "agg_metric": {
        "type": "aggregate_metric_double",
        "metrics": [ "min", "max", "sum", "value_count" ],
        "default_metric": "max"
      }
    }
  }
}

PUT idx/_doc/1
{
  "agg_metric": {
    "min": -302.50,
    "max": 702.30,
    "sum": 200.0,
    "value_count": 25
  }
}
```

将变为：

```json
{
  "agg_metric": {
    "min": -302.50,
    "max": 702.30,
    "sum": 200.0,
    "value_count": 25
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/aggregate-metric-double.html)
