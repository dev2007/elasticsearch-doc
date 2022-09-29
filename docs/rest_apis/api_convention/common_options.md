# 常用选项

以下选项可以用于所有的 REST API。

## 美观结果

为任何请求添加 `?pretty=true` 时，JSON 会以美观的样式返回（仅在调试模式使用！）另一个选项是设置 `?format=yaml`，这可以导致结果以（有时）更可读的 yaml 格式返回。

## 可读输出

统计数据以适合人的格式（如，`"exists_time": "1h"` 或 `"size": "1kb"`）和计算机的格式（如，`"exists_time_in_millis": 3600000` 或 `"size_in_bytes": 1024`）返回。人可读的格式可以通过在查询字符串中通过添加 `?human=false` 关闭。当统计结果被监控工具使用，而不是供人使用时，这是有意义的。`human` 标记默认为 `false`。

## 日期数学

多数接受格式化日期值的参数——比如在[范围查询](/query_dsl/term-level_queries/range)中的 `gt` 和 `lt`，或者[日期范围聚合](/aggregations/bucket_aggregations/date_range)中的 `from` 和 `to`——都能理解日期数学。

表达式以锚点日期开始，可以是 `now`（现在），或者以 `||` 结尾的日期字符串。锚点日期后面可以跟一个或多个数学表达式：

- `+1h`：加一个小时
- `-1d`：减一天
- `/d`：舍入到最近的一天

支持的时间单位不同于支持的周期[时间单位](/rest_apis/api_convention/common_options#时间单位)。支持的单位有：

|||
|:--|:--|
|`y`|年|
|`M`|月|
|`w`|周|
|`d`|天|
|`h`|小时|
|`H`|小时|
|`m`|分钟|
|`s`|秒|

假定 `now`（现在）是 `2001-01-01 12:00:00`，一些例子如下：

|||
|:--|:--|
|now+1h|在 `now` 上以毫秒加一小时。解析为：`2001-01-01 13:00:00`|
|now-1h|在 `now` 上以毫秒减一小时。解析为：`2001-01-01 11:00:00`|
|now-1h/d|在 `now` 上以毫秒减一小时，然后舍入为 UTC 00:00。解析为：`2001-01-01 00:00:00`|
|2001.02.01\ &#124; \ &#124; +1M/d|在 `2001-02-01`上加一个月。解析为：`2001-03-01 00:00:00`|

## 响应过滤

所有的 REST API 都接受 `filter_path` 参数，它可以用于减少 Elasticsearch 返回的响应。此参数采用逗号分隔的过滤器列表，过滤器用点符号表示：

```bash
GET /_search?q=kimchy&filter_path=took,hits.hits._id,hits.hits._score
```

响应：

```json
{
  "took" : 3,
  "hits" : {
    "hits" : [
      {
        "_id" : "0",
        "_score" : 1.6375021
      }
    ]
  }
}
```

它也支持 `*` 通配符用于匹配任何字段或字段名字的一部分：

```bash
GET /_cluster/state?filter_path=metadata.indices.*.stat*
```

响应：

```json
{
  "metadata" : {
    "indices" : {
      "my-index-000001": {"state": "open"}
    }
  }
}
```

而且，`**` 通配符可以用于包含字段而不用知道字段的具体路径。例如，我们可以通过以下请求返回每个段的 Lucene 版本：

```bash
GET /_cluster/state?filter_path=routing_table.indices.**.state
```

响应：

```json
{
  "routing_table": {
    "indices": {
      "my-index-000001": {
        "shards": {
          "0": [{"state": "STARTED"}, {"state": "UNASSIGNED"}]
        }
      }
    }
  }
}
```

它也可以通过在过滤器前缀添加字符 `-` 来排除一个或多个字段：

```bash
GET /_count?filter_path=-_shards
```

响应：

```json
{
  "count" : 5
}
```

为了获得更多的控制，可以在同一个表达式中组合包含过滤器和排除过滤器。在这个例子中，排除过滤器会先生效，然后结果会再次使用包含过滤器筛选：

```bash
GET /_cluster/state?filter_path=metadata.indices.*.state,-metadata.indices.logstash-*
```

响应：

```json
{
  "metadata" : {
    "indices" : {
      "my-index-000001" : {"state" : "open"},
      "my-index-000002" : {"state" : "open"},
      "my-index-000003" : {"state" : "open"}
    }
  }
}
```

注意 Elasticsearch 有时直接返回字段的原始值，比如 `_source` 字段。如果你想过滤 `_source` 字段，你应该考虑使用 `filter_path` 参数联合已有的 `_source` 参数（参阅[获得 API](/rest_apis/document_apis/get) 获取更多信息）：

```bash
POST /library/book?refresh
{"title": "Book #1", "rating": 200.1}
POST /library/book?refresh
{"title": "Book #2", "rating": 1.7}
POST /library/book?refresh
{"title": "Book #3", "rating": 0.1}
GET /_search?filter_path=hits.hits._source&_source=title&sort=rating:desc
```

```json
{
  "hits" : {
    "hits" : [ {
      "_source":{"title":"Book #1"}
    }, {
      "_source":{"title":"Book #2"}
    }, {
      "_source":{"title":"Book #3"}
    } ]
  }
}
```

## 扁平设置

`flat_settings` 标志影响设置列表的展示。当 `flat_settings` 标志为 `true` 时，设置以扁平格式展示：

```bash
GET my-index-000001/_settings?flat_settings=true
```

响应：

```json
{
  "my-index-000001" : {
    "settings": {
      "index.number_of_replicas": "1",
      "index.number_of_shards": "1",
      "index.creation_date": "1474389951325",
      "index.uuid": "n6gzFZTgS664GUfx0Xrpjw",
      "index.version.created": ...,
      "index.routing.allocation.include._tier_preference" : "data_content",
      "index.provided_name" : "my-index-000001"
    }
  }
}
```

当 `flat_settings` 标志为 `false`，设置以更符合人类可读的结构格式返回：

```bash
GET my-index-000001/_settings?flat_settings=false
```

响应：

```json
{
  "my-index-000001" : {
    "settings" : {
      "index" : {
        "number_of_replicas": "1",
        "number_of_shards": "1",
        "creation_date": "1474389951325",
        "uuid": "n6gzFZTgS664GUfx0Xrpjw",
        "version": {
          "created": ...
        },
        "routing": {
          "allocation": {
            "include": {
              "_tier_preference": "data_content"
            }
          }
        },
        "provided_name" : "my-index-000001"
      }
    }
  }
}
```

默认情况，`flat_settings` 设置为 `false`。

## 参数

REST 参数（当使用 HTTP，映射到 HTTP URL 参数）遵循下划线大小写的约定。

## 布尔值

所有 REST API 参数（包括请求参数和 JSON 体）支持提供布尔值 “false” 作为值 `false`，以及布尔值 “true” 作为值 `true`。其他所有值会报错。

## 数值

所有 REST API 在原生 JSON 数字类型之上，都支持以字符串形式提交数字参数。

## 时间单位

当需要指定周期时间时，例如 `timeout` （超时）参数，周期必须指定单位，如 `2d` 代表 2 天。支持的单位有：

|||
|:--|:--|
|`d`|天|
|`h`|小时|
|`m`|分钟|
|`s`|秒|
|`ms`|毫秒|
|`micros`|微秒|
|`nanos`|纳秒|

## 字节大小单位

当需要指定数据字符大小时，例如当设置一个缓存大小参数，值必须指定单位，如 `10kb` 代表 10 千字节。注意这些单位是 1024 的幂，因此 `1kb` 表示 1024 字节。支持的单位有：

|||
|:--|:--|
|`b`|字节|
|`kb`|千字节|
|`mb`|兆字节|
|`gb`|千兆字节|
|`tb`|兆兆字节|
|`pb`|拍字节|

## 无单位数量

无单位数量表示没有像“字节”或“赫兹”或“米”或“长吨”这种单位。

如果一个数量很大，我们输出它，类似 10m 代表 10,000,000，7k 代表 7,000。然而，87 的话，我们还是会输出 87。这些是支持的倍数：

|||
|:--|:--|
|`k`|千（10<sup>3</sup>）|
|`m`|兆（百万 10<sup>6</sup>）|
|`g`|千兆（十亿 10<sup>9</sup>）|
|`t`|兆兆（万亿 10<sup>12</sup>）|
|`p`|拍（亿亿 10<sup>15</sup>）|

## 距离单位

当需要指定距离时，比如在 [Geo-距离](/query_dsl/geo_queries/geo-distance)中的 `distance` 参数，如果没有指定，默认单位为米。距离可以被指定为其他单位，比如 `1km` 或 `2mi`（2 英里）。

单位的完整列表如下：

|||
|:--|:--|
|`Mile（英里）`|`mi` 或 `miles`|
|`Yard（码）`|`yd` 或 `yards`|
|`Feet（英尺）`|`ft` 或 `feet`|
|`Inch（英寸）`|`in` 或 `inch`|
|`Kilometer（千米）`|`km` 或 `kilometers`|
|`Meter（米）`|`m` 或 `meters`|
|`Centimeter（厘米）`|`cm` 或 `centimeters`|
|`Millimeter（毫米）`|`mm` 或 `millimeters`|
|`Nautical mile（海里）`|`NM`， `nmi` 或 `nauticalmiles`|

## 模糊性

一些查询和 API 支持参数通过 `fuzziness` 参数以允许不精确的模糊匹配。

当查询 `text` 或 `keyword` 字段时，`fuzziness` 被解释为[Levenshtein编辑距离](https://en.wikipedia.org/wiki/Levenshtein_distance)——需要对一个字符串进行更改以使其与另一个字符串相同的字符数。

`fuzziness` 参数可以被指定为：

|||
|:--|:--|
|`0`，`1`，`2`| 允许的最大Levenshtein编辑距离（或编辑数）|
|`AUTO`|根据词语的长度生成编辑距离。可以选择提供低和高距离参数 `AUTO:[low],[high]`。如果未指定，默认值为 3 和 6，相当于 `AUTO:3,6`，这表示长度：<br>  `0..2`<br>    必须完全匹配<br>  `3..5`<br>    允许一次编辑<br>  `>5`<br>    允许两次编辑<br>  `AUTO` 应该是 `fuzziness` 首选值。|

## 允许堆栈跟踪

默认情况下，当请求返回错误时 Elasticsearch 不会包含错误的堆栈跟踪。你可以通过设置 url 参数 `error_trace` 为 `true` 来允许这个行为。例如，默认情况当你向 `_search` API 发送一个无效的 `size` 参数：

```bash
POST /my-index-000001/_search?size=surprise_me
```

响应如下：

```json
{
  "error" : {
    "root_cause" : [
      {
        "type" : "illegal_argument_exception",
        "reason" : "Failed to parse int parameter [size] with value [surprise_me]"
      }
    ],
    "type" : "illegal_argument_exception",
    "reason" : "Failed to parse int parameter [size] with value [surprise_me]",
    "caused_by" : {
      "type" : "number_format_exception",
      "reason" : "For input string: \"surprise_me\""
    }
  },
  "status" : 400
}
```

但是如果你设置 `error_trace=true`：

```bash
POST /my-index-000001/_search?size=surprise_me&error_trace=true
```

响应如下：

```json
{
  "error": {
    "root_cause": [
      {
        "type": "illegal_argument_exception",
        "reason": "Failed to parse int parameter [size] with value [surprise_me]",
        "stack_trace": "Failed to parse int parameter [size] with value [surprise_me]]; nested: IllegalArgumentException..."
      }
    ],
    "type": "illegal_argument_exception",
    "reason": "Failed to parse int parameter [size] with value [surprise_me]",
    "stack_trace": "java.lang.IllegalArgumentException: Failed to parse int parameter [size] with value [surprise_me]\n    at org.elasticsearch.rest.RestRequest.paramAsInt(RestRequest.java:175)...",
    "caused_by": {
      "type": "number_format_exception",
      "reason": "For input string: \"surprise_me\"",
      "stack_trace": "java.lang.NumberFormatException: For input string: \"surprise_me\"\n    at java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)..."
    }
  },
  "status": 400
}
```

## 查询字符串中的请求体

对不接受非 POST 请求的请求体的库，你可以 `source` 查询字符串参数替代传递请求体。当使用这个方法时，`source_content_type` 参数也要表明源格式的媒体类型值，如 `application/json`。

## 内容类型要求

请求体中发送的内容类型，必须通过 `Content-Type` 头指定。头的值必须映射为 API 支持的格式。大多数 API 支持 JSON、YAML、CBOR 和 SMILE。批量（bulk）和多搜索（multi-search） API 支持 NDJSON、JSON 和 SMILE；其他类型会导致错误响应。

另外，当使用 `source` 查询字符串参数时，内容类型必须通过 `source_content_type` 查询字符串参数指定。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html)
