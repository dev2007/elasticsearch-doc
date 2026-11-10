# range 字段类型

range 字段类型表示上下界之间的连续值范围。例如，一个范围可以表示 10 月中的任意日期，或 0 到 9 之间的任意整数。范围使用 `gt` 或 `gte` 运算符定义下界，使用 `lt` 或 `lte` 运算符定义上界。它们可用于查询，并对聚合提供有限的支持。唯一支持的聚合是 `histogram` 和 `cardinality`。

支持以下范围类型：

- `integer_range`
  （有符号 32 位整数的范围）最小值为 -2^31，最大值为 2^31-1。
- `float_range`
  （单精度浮点数的范围）单精度 32 位 IEEE 754 浮点值的范围。
- `long_range`
  （有符号 64 位整数的范围）最小值为 -2^63，最大值为 2^63-1。
- `double_range`
  （双精度浮点数的范围）双精度 64 位 IEEE 754 浮点值的范围。
- `date_range`
  （日期值的范围）日期范围通过 `format` 映射参数支持各种日期格式。无论使用哪种格式，日期值都会被解析为表示 UTC 下自 Unix 纪元以来毫秒数的无符号 64 位整数。不支持包含 `now` 日期数学表达式的值。
- `ip_range`
  （ip 值的范围）支持 IPv4 或 IPv6（或混合）地址的范围。

以下是使用各种范围字段配置映射的示例，随后是索引几种范围类型的示例。

```bash
PUT range_index
{
  "settings": {
    "number_of_shards": 2
  },
  "mappings": {
    "properties": {
      "expected_attendees": {
        "type": "integer_range"
      },
      "time_frame": {
        "type": "date_range",
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      }
    }
  }
}

# 索引一个有 10 到 20 名与会者（不包括 20）的会议
# 使用日期时间戳的日期范围示例
PUT range_index/_doc/1?refresh
{
  "expected_attendees" : {
    "gte" : 10,
    "lt" : 20
  },
  "time_frame" : {
    "gte" : "2015-10-31 12:00:00",
    "lte" : "2015-11-01"
  }
}
```

`date_range` 类型接受 `date` 类型定义的相同字段参数。

以下是对名为 `expected_attendees` 的 `integer_range` 字段执行 term 查询的示例。12 是该范围内的一个值，因此会匹配。

```bash
GET range_index/_search
{
  "query" : {
    "term" : {
      "expected_attendees" : {
        "value": 12
      }
    }
  }
}
```

上面查询产生的结果：

```json
{
  "took": 13,
  "timed_out": false,
  "_shards" : {
    "total": 2,
    "successful": 2,
    "skipped" : 0,
    "failed": 0
  },
  "hits" : {
    "total" : {
        "value": 1,
        "relation": "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "range_index",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "expected_attendees" : {
            "gte" : 10, "lt" : 20
          },
          "time_frame" : {
            "gte" : "2015-10-31 12:00:00", "lte" : "2015-11-01"
          }
        }
      }
    ]
  }
}
```

以下是对名为 `time_frame` 的 `date_range` 字段执行 range 查询的示例。

```bash
GET range_index/_search
{
  "query" : {
    "range" : {
      "time_frame" : {
        "gte" : "2015-10-31",
        "lte" : "2015-11-01",
        "relation" : "within"
      }
    }
  }
}
```

1. 范围查询的工作方式与[范围查询](/query_dsl/term_level_queries/range)中描述的相同。
2. 对范围字段执行的范围查询支持 `relation` 参数，可以是 `WITHIN`、`CONTAINS`、`INTERSECTS`（默认）之一。

此查询产生类似的结果：

```json
{
  "took": 13,
  "timed_out": false,
  "_shards" : {
    "total": 2,
    "successful": 2,
    "skipped" : 0,
    "failed": 0
  },
  "hits" : {
    "total" : {
        "value": 1,
        "relation": "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "range_index",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "expected_attendees" : {
            "gte" : 10, "lt" : 20
          },
          "time_frame" : {
            "gte" : "2015-10-31 12:00:00", "lte" : "2015-11-01"
          }
        }
      }
    ]
  }
}
```

## IP 范围

除了上述范围格式之外，IP 范围还可以用 CIDR 表示法提供：

```bash
PUT range_index/_mapping
{
  "properties": {
    "ip_allowlist": {
      "type": "ip_range"
    }
  }
}

PUT range_index/_doc/2
{
  "ip_allowlist" : "192.168.0.0/16"
}
```

## range 字段的参数

范围类型接受以下参数：

- `coerce`
  （可选，Boolean）尝试将字符串转换为数字，并对整数截断小数部分。接受 `true`（默认）和 `false`。
- `doc_values`
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- `index`
  （可选，Boolean）该字段是否应该可搜索？接受 `true`（默认）和 `false`。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。

## 合成 _source

range 字段在其默认配置下支持合成 `_source`。

对于除 `ip_range` 之外的所有范围字段，合成 source 可能会对范围字段值进行排序并删除重复项。范围按其下界排序，然后按上界排序。例如：

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
      "my_range": { "type": "long_range" }
    }
  }
}

PUT idx/_doc/1
{
  "my_range": [
    {
        "gte": 200,
        "lte": 300
    },
    {
        "gte": 1,
        "lte": 100
    },
    {
        "gte": 200,
        "lte": 300
    },
    {
        "gte": 200,
        "lte": 500
    }
  ]
}
```

将变为：

```json
{
  "my_range": [
    {
        "gte": 1,
        "lte": 100
    },
    {
        "gte": 200,
        "lte": 300
    },
    {
        "gte": 200,
        "lte": 500
    }
  ]
}
```

`ip_range` 字段的值不排序，但不保留原始顺序。重复的范围会被删除。如果 `ip_range` 字段值以 CIDR 提供，在合成 source 中它将表示为一个 IP 地址范围。

例如：

```bash
PUT idx/_doc/1
{
  "my_range": [
    "10.0.0.0/24",
    {
      "gte": "10.0.0.0",
      "lte": "10.0.0.255"
    }
  ]
}
```

将变为：

```json
{
  "my_range": {
      "gte": "10.0.0.0",
      "lte": "10.0.0.255"
    }
}
```

范围字段值始终表示为两侧都包含的值，并相应调整边界。范围边界的默认值表示为 `null`。即使显式提供了范围边界也是如此。例如：

```bash
PUT idx/_doc/1
{
  "my_range": {
    "gt": 200,
    "lt": 300
  }
}
```

将变为：

```json
{
  "my_range": {
    "gte": 201,
    "lte": 299
  }
}
```

范围边界的默认值在合成 source 中表示为 `null`。即使范围边界显式提供为默认值也是如此。例如：

```bash
PUT idx/_doc/1
{
  "my_range": {
    "lte": 2147483647
  }
}
```

将变为：

```json
{
  "my_range": {
    "gte": null,
    "lte": null
  }
}
```

日期范围使用提供的格式进行格式化，默认使用 `yyyy-MM-dd'T'HH:mm:ss.SSSZ` 格式。例如：

```bash
PUT idx/_doc/1
{
  "my_range": [
    {
      "gte": 1504224000000,
      "lte": 1504569600000
    },
    {
      "gte": "2017-09-01",
      "lte": "2017-09-10"
    }
  ]
}
```

将变为：

```json
{
  "my_range": [
    {
      "gte": "2017-09-01T00:00:00.000Z",
      "lte": "2017-09-05T00:00:00.000Z"
    },
    {
      "gte": "2017-09-01T00:00:00.000Z",
      "lte": "2017-09-10T23:59:59.999Z"
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/range.html)
