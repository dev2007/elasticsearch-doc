# unsigned_long 字段类型

unsigned_long 是一种数值字段类型，表示无符号 64 位整数，最小值为 0，最大值为 2^64-1（从 0 到 18446744073709551615，含两端）。

```bash
PUT my_index
{
  "mappings": {
    "properties": {
      "my_counter": {
        "type": "unsigned_long"
      }
    }
  }
}
```

unsigned_long 可以以数字或字符串形式索引，表示 [0, 18446744073709551615] 范围内的整数值。它们不能有小数部分。

```bash
POST /my_index/_bulk?refresh
{"index":{"_id":1}}
{"my_counter": 0}
{"index":{"_id":2}}
{"my_counter": 9223372036854775808}
{"index":{"_id":3}}
{"my_counter": 18446744073709551614}
{"index":{"_id":4}}
{"my_counter": 18446744073709551615}
```

Term 查询接受数字或字符串形式的任意数值。

```bash
GET /my_index/_search
{
    "query": {
        "term" : {
            "my_counter" : 18446744073709551615
        }
    }
}
```

范围查询的值可以包含小数部分。在这种情况下，Elasticsearch 会将它们转换为整数值：`gte` 和 `gt` 被转换为向上取整（含）的最接近整数，`lt` 和 `lte` 被转换为向下取整（含）的最接近整数。

建议以字符串形式传递范围，以确保解析时不会丢失精度。

```bash
GET /my_index/_search
{
    "query": {
        "range" : {
            "my_counter" : {
                "gte" : "9223372036854775808",
                "lte" : "18446744073709551615"
            }
        }
    }
}
```

## 排序值

对于在 unsigned_long 字段上排序的查询，对于某个特定文档，如果该文档的值在 long 值范围内，Elasticsearch 返回 long 类型的排序值；如果值超出此范围，则返回 BigInteger 类型。

REST 客户端需要能够处理 JSON 中的大整数值，才能正确支持此字段类型。

```bash
GET /my_index/_search
{
    "query": {
        "match_all" : {}
    },
    "sort" : {"my_counter" : "desc"}
}
```

## 存储字段

unsigned_long 的存储字段以字符串形式存储和返回。

## 聚合

对于 terms 聚合，与排序值类似，使用 Long 或 BigInteger 值。对于其他聚合，值会被转换为 double 类型。

## 脚本值

默认情况下，unsigned_long 字段的脚本值以 Java 有符号 Long 返回，这意味着大于 Long.MAX_VALUE 的值会显示为负值。你可以使用 `Long.compareUnsigned(long, long)`、`Long.divideUnsigned(long, long)` 和 `Long.remainderUnsigned(long, long)` 来正确处理这些值。

例如，下面的脚本返回计数器除以 10 的值。

```bash
GET /my_index/_search
{
    "query": {
        "match_all" : {}
    },
    "script_fields": {
        "count10" : {
          "script": {
            "source": "Long.divideUnsigned(doc['my_counter'].value, 10)"
          }
        }
    }
}
```

或者，你可以在脚本中通过字段 API 将 unsigned long 类型视为 BigInteger。例如，此脚本将 `my_counter` 视为 BigInteger，默认值为 `BigInteger.ZERO`：

```json
"script": {
    "source": "field('my_counter').asBigInteger(BigInteger.ZERO)"
}
```

对于需要返回浮点或双精度值的脚本，你可以进一步将 BigInteger 值转换为 double 或 float：

```bash
GET /my_index/_search
{
    "query": {
        "script_score": {
          "query": {"match_all": {}},
          "script": {
            "source": "field('my_counter').asBigInteger(BigInteger.ZERO).floatValue()"
          }
        }
    }
}
```

## 混合数值类型的查询

支持混合数值类型的搜索（其中之一为 unsigned_long），但带排序的查询除外。因此，跨两个索引的排序查询中，同一字段名称在一个索引中为 unsigned_long 类型、在另一个索引中为 long 类型时，不会产生正确的结果，必须避免。如果确实需要此类排序，可以改用基于脚本的排序。

支持跨多种数值类型（其中之一为 unsigned_long）的聚合。在这种情况下，值会被转换为 double 类型。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/unsigned-long.html)
