# 基础：使用聚合分析电商数据

本动手教程演示如何使用 `_search` API 和 Query DSL，通过 Elasticsearch 聚合来分析电商数据。你将学习如何：

- 计算关键业务指标，例如平均订单金额
- 分析随时间变化的销售模式
- 比较各产品类别的表现
- 跟踪移动平均线和累计总额

## 要求

1. 一个正在运行的 Elasticsearch 实例。对于本地开发环境：

```sh
curl -fsSL https://elastic.co/start-local | sh
```

2. 已加载到 Elasticsearch 中的示例电商数据。在 Kibana UI 中：
   - 打开 **Integrations**（通过全局搜索框）
   - 搜索 `sample data`
   - 打开 **Sample data** 页面
   - 选择 **Other sample data sets**
   - 添加 **Sample eCommerce orders** — 这会创建并填充 `kibana_sample_data_ecommerce` 索引

## 检查索引结构

查看字段映射：

```txt
GET kibana_sample_data_ecommerce/_mapping
```

关键字段说明：

- `fields`：多字段映射，允许同时进行全文搜索和精确匹配。
- `geoip.properties`：包含位置属性的对象字段。
- `geoip.location`：以 `geo_point` 表示的地理坐标。
- `products.properties`：嵌套结构，包含每个订单中商品的详细信息。

使用到的字段数据类型：`text` 和 `keyword`（大多数文本字段通过多字段拥有 `.keyword` 子字段）、`date`、数值类型（`integer`、`long`、`half_float`）、坐标的 `geo_point`，以及嵌套结构（如 `products`、`geoip`）的 `object`。

## 获取关键业务指标

### 1. 获取平均订单金额（avg 聚合）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "avg_order_value": {
      "avg": { "field": "taxful_total_price" }
    }
  }
}
```

- `size: 0`：避免返回匹配的文档；只返回聚合结果。
- `avg_order_value`：描述该指标的有意义名称。
- `avg`：计算简单的算术平均值。

示例响应：

```json
{
  "took": 0,
  "timed_out": false,
  "_shards": { "total": 1, "successful": 1, "skipped": 0, "failed": 0 },
  "hits": { "total": { "value": 4675, "relation": "eq" }, "max_score": null, "hits": [] },
  "aggregations": {
    "avg_order_value": { "value": 75.05542864304813 }
  }
}
```

订单总数为 4675；由于设置了 `size: 0`，`hits` 为空；结果出现在指定的名称下；平均值是动态计算的。

### 2. 一次获取多个订单统计值（stats 聚合）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "order_stats": {
      "stats": { "field": "taxful_total_price" }
    }
  }
}
```

`stats` 聚合一次返回 count、min、max、avg 和 sum：

```json
{
  "aggregations": {
    "order_stats": {
      "count": 4675,
      "min": 6.98828125,
      "max": 2250,
      "avg": 75.05542864304813,
      "sum": 350884.12890625
    }
  }
}
```

`count`：订单总数；`min`：最低订单金额；`max`：最高订单金额；`avg`：每单平均金额；`sum`：总收入。`stats` 聚合比分别运行 min、max、avg 和 sum 聚合更高效。

## 分析销售模式

### 3. 按类别分解销售额（terms 聚合）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "sales_by_category": {
      "terms": {
        "field": "category.keyword",
        "size": 5,
        "order": { "_count": "desc" }
      }
    }
  }
}
```

- `terms` 按字段值对文档分组。
- 对 text 字段进行精确匹配时使用 `.keyword` 字段。
- `size: 5` 限制为前 5 个类别；按计数降序排列。

示例响应：

```json
{
  "took": 4,
  "timed_out": false,
  "_shards": { "total": 5, "successful": 5, "skipped": 0, "failed": 0 },
  "hits": { "total": { "value": 4675, "relation": "eq" }, "max_score": null, "hits": [] },
  "aggregations": {
    "sales_by_category": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 572,
      "buckets": [
        { "key": "Men's Clothing", "doc_count": 2024 },
        { "key": "Women's Clothing", "doc_count": 1903 },
        { "key": "Women's Shoes", "doc_count": 1136 },
        { "key": "Men's Shoes", "doc_count": 944 },
        { "key": "Women's Accessories", "doc_count": 830 }
      ]
    }
  }
}
```

- `doc_count_error_upper_bound`：由于分布式分片计算导致的计数最大可能误差。
- `sum_other_doc_count`：超出请求 size 之外的类别中的文档数。
- `buckets`：按计数排序的类别数组（`key` 为类别名称，`doc_count` 为订单数）。

### 4. 跟踪每日销售模式（date_histogram 聚合）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "daily_orders": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "day",
        "format": "yyyy-MM-dd",
        "min_doc_count": 0
      }
    }
  }
}
```

- `date_histogram` 将文档分组到基于时间的桶中。
- `calendar_interval` 可处理不同长度的月份；`"day"` 确保无论时区如何都按天一致分组。
- `format` 使用日期模式（例如 "yyyy-MM-dd"）；可用选项参阅日期数学表达式。
- `min_doc_count: 0` 即使在没有订单的日期也返回桶 — 这对连续的时间序列很有用。

示例响应（展示前几个桶；完整响应覆盖 2024-11-28 至 2024-12-28）：

```json
{
  "aggregations": {
    "daily_orders": {
      "buckets": [
        { "key_as_string": "2024-11-28", "key": 1732752000000, "doc_count": 146 },
        { "key_as_string": "2024-11-29", "key": 1732838400000, "doc_count": 153 },
        { "key_as_string": "2024-11-30", "key": 1732924800000, "doc_count": 143 },
        "...（其余日期桶省略）"
      ]
    }
  }
}
```

- `key_as_string`：便于阅读的日期；`key`：同一日期的 Unix 时间戳；`doc_count`：该桶中的文档数。

## 将指标与分组组合

### 5. 比较各类别的表现（terms 中的子聚合）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {
        "field": "category.keyword",
        "size": 5,
        "order": { "total_revenue": "desc" }
      },
      "aggs": {
        "total_revenue": { "sum": { "field": "taxful_total_price" } },
        "avg_order_value": { "avg": { "field": "taxful_total_price" } },
        "total_items": { "sum": { "field": "total_quantity" } }
      }
    }
  }
}
```

- 按 `total_revenue` 而不是计数对类别排序。
- 在每个类别内定义指标：总收入、平均订单金额、售出商品总数。

示例响应：

```json
{
  "aggregations": {
    "categories": {
      "buckets": [
        {
          "key": "Men's Clothing",
          "doc_count": 2179,
          "total_revenue": { "value": 156729.453125 },
          "avg_order_value": { "value": 71.92726898715927 },
          "total_items": { "value": 8716 }
        },
        "...（其余类别桶与此类似）"
      ]
    }
  }
}
```

### 6. 分析每日销售表现（date_histogram 内的指标）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "daily_sales": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "day",
        "format": "yyyy-MM-dd"
      },
      "aggs": {
        "revenue": { "sum": { "field": "taxful_total_price" } },
        "unique_customers": { "cardinality": { "field": "customer_id" } },
        "avg_basket_size": { "avg": { "field": "total_quantity" } }
      }
    }
  }
}
```

- `revenue`：每日收入。
- `unique_customers`：使用 `cardinality` 聚合统计每天的独立客户数。
- `avg_basket_size`：每个订单的平均商品数。

示例响应（前几个桶）：

```json
{
  "aggregations": {
    "daily_sales": {
      "buckets": [
        {
          "key_as_string": "2024-11-14",
          "key": 1731542400000,
          "doc_count": 146,
          "unique_customers": { "value": 42 },
          "revenue": { "value": 10578.53125 },
          "avg_basket_size": { "value": 2.1780821917808217 }
        },
        "...（其余日期桶省略）"
      ]
    }
  }
}
```

## 跟踪趋势和模式（管道聚合）

管道聚合作用于其他聚合的结果。

### 7. 平滑每日波动（moving_fn）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "daily_sales": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "day"
      },
      "aggs": {
        "daily_revenue": { "sum": { "field": "taxful_total_price" } },
        "smoothed_revenue": {
          "moving_fn": {
            "buckets_path": "daily_revenue",
            "window": 3,
            "script": "MovingFunctions.unweightedAvg(values)"
          }
        }
      }
    }
  }
}
```

- 先计算每日收入，然后创建平滑版本。
- `moving_fn` 执行移动窗口计算。
- `buckets_path` 引用日期直方图中的收入。
- `window: 3` 使用 3 天窗口（不同的窗口大小会揭示不同时间尺度的趋势）。
- `MovingFunctions.unweightedAvg(values)` 是 `moving_fn` 聚合的内置函数。

示例响应（前几个桶）：

```json
{
  "aggregations": {
    "daily_sales": {
      "buckets": [
        {
          "key_as_string": "2024-11-14T00:00:00.000Z",
          "key": 1731542400000,
          "doc_count": 146,
          "daily_revenue": { "value": 10578.53125 },
          "smoothed_revenue": { "value": null }
        },
        {
          "key_as_string": "2024-11-15T00:00:00.000Z",
          "key": 1731628800000,
          "doc_count": 153,
          "daily_revenue": { "value": 10448 },
          "smoothed_revenue": { "value": 10578.53125 }
        },
        "...（其余日期桶省略）"
      ]
    }
  }
}
```

要点：

- 由于未指定格式，日期使用默认的 ISO 格式。
- 第一天的平滑值为 `null` — 移动平均需要之前几天的数据。
- 平滑值滞后于实际值，因为它依赖于之前几天；移动平均的第一天总是 null。

### 8. 跟踪累计总额（cumulative_sum）

```txt
GET kibana_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "daily_sales": {
      "date_histogram": {
        "field": "order_date",
        "calendar_interval": "day"
      },
      "aggs": {
        "revenue": { "sum": { "field": "taxful_total_price" } },
        "cumulative_revenue": {
          "cumulative_sum": { "buckets_path": "revenue" }
        }
      }
    }
  }
}
```

- `cumulative_sum` 跨桶累加值。
- `buckets_path` 引用要累加的收入。

示例响应（前几个桶）：

```json
{
  "aggregations": {
    "daily_sales": {
      "buckets": [
        {
          "key_as_string": "2024-11-14T00:00:00.000Z",
          "key": 1731542400000,
          "doc_count": 146,
          "revenue": { "value": 10578.53125 },
          "cumulative_revenue": { "value": 10578.53125 }
        },
        {
          "key_as_string": "2024-11-15T00:00:00.000Z",
          "key": 1731628800000,
          "doc_count": 153,
          "revenue": { "value": 10448 },
          "cumulative_revenue": { "value": 21026.53125 }
        },
        "...（其余日期桶省略）"
      ]
    }
  }
}
```

- `revenue`：该日期的当日收入；`cumulative_revenue`：截至该日期的收入累计总额（完整响应中最终的累计值为 350884.12890625，与 stats 聚合中的总收入 `sum` 一致）。

## 后续步骤

参阅[聚合参考](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-aggregations.html)了解所有可用聚合类型的更多细节。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/aggregations-tutorial.html)
