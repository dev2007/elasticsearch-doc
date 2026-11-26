# 排序搜索结果（Sort search results）

`sort` 参数允许在指定字段上添加一个或多个排序，每个排序都可以反向。排序按字段级别定义，并支持特殊字段名：

- `_score`：按相关性分数排序
- `_doc`：按索引顺序排序

为优化排序性能，应避免对 `text` 字段排序，而应使用 `keyword` 或数值字段。还可以通过启用索引时预排序（index sorting）提高查询时排序性能，但这可能降低索引性能并增加内存使用。

## 示例映射

```bash
PUT /my-index-000001
{
  "mappings": {
    "properties": {
      "post_date": { "type": "date" },
      "user": {
        "type": "keyword"
      },
      "name": {
        "type": "keyword"
      },
      "age": { "type": "integer" }
    }
  }
}
```

## 按字段 / 多字段 / `_score` 排序

```bash
GET /my-index-000001/_search
{
  "sort" : [
    { "post_date" : {"order" : "asc", "format": "strict_date_optional_time_nanos"}},
    "user",
    { "name" : "desc" },
    { "age" : "desc" },
    "_score"
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

`_doc` 除了作为最高效的排序顺序外，没有实际业务排序用途。如果不关心文档返回顺序，应使用 `_doc` 排序，这在使用 scroll 时尤其有帮助。

## 排序值

搜索响应会为每个文档包含 sort 值。对于 `date` 和 `date_nanos` 字段，可以使用 `format` 参数指定 sort 值的日期格式：

```bash
GET /my-index-000001/_search
{
  "sort" : [
    { "post_date" : {"format": "strict_date_optional_time_nanos"}}
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

## 排序方向

`order` 选项支持：

- `asc`：升序排序
- `desc`：降序排序

默认规则：按 `_score` 排序时默认是 `desc`；按其他字段排序时默认是 `asc`。

## Sort mode 选项

Elasticsearch 支持按数组字段或多值字段排序。`mode` 选项控制为一个文档选择哪个数组值参与排序：

- `min`：选择最低值
- `max`：选择最高值
- `sum`：使用所有值的和作为 sort 值，仅适用于数值数组字段
- `avg`：使用所有值的平均值作为 sort 值，仅适用于数值数组字段
- `median`：使用所有值的中位数作为 sort 值，仅适用于数值数组字段

默认规则：升序排序时默认 `mode` 为 `min`；降序排序时默认 `mode` 为 `max`。

以下示例中文档 `price` 字段有多个价格，按每个文档的平均价格升序排序：

```bash
PUT /my-index-000001/_doc/1?refresh
{
   "product": "chocolate",
   "price": [20, 4]
}

POST /_search
{
   "query" : {
      "term" : { "product" : "chocolate" }
   },
   "sort" : [
      {"price" : {"order" : "asc", "mode" : "avg"}}
   ]
}
```

## 数值字段排序

对于数值字段，可以使用 `numeric_type` 将值从一种类型转换为另一种类型：`double`、`long`、`date`、`date_nanos`。

该功能在跨多个数据流或索引搜索时非常有用，尤其是同一 sort 字段在不同索引中映射类型不同的情况。

```bash
PUT /index_double
{
  "mappings": {
    "properties": {
      "field": { "type": "double" }
    }
  }
}

PUT /index_long
{
  "mappings": {
    "properties": {
      "field": { "type": "long" }
    }
  }
}

POST /index_long,index_double/_search
{
   "sort" : [
      {
        "field" : {
            "numeric_type" : "double"
        }
      }
   ]
}
```

上例中，`index_long` 中的值会被转换为 `double`，以便与 `index_double` 中的值兼容。也可以将浮点字段转换为 `long`，但浮点数会被替换为正数的向下取整值或负数的向上取整值，即等于数学整数的相邻值。

`date` 与 `date_nanos` 字段以不同分辨率存储，排序时 `date` 总会排在 `date_nanos` 之前，按升序排序时尤其明显。使用 `numeric_type` 可以设置统一分辨率：

- 设置为 `date`：将 `date_nanos` 转换为毫秒分辨率
- 设置为 `date_nanos`：将 `date` 转换为纳秒分辨率

```bash
POST /index_long,index_double/_search
{
   "sort" : [
      {
        "field" : {
            "numeric_type" : "date_nanos"
        }
      }
   ]
}
```

为避免溢出，`date_nanos` 转换不能用于 1970 年之前和 2262 年之后的日期，因为纳秒使用 long 表示。

## 在 nested 对象内排序

Elasticsearch 支持按一个或多个 nested 对象内部的字段排序。nested 排序使用 `nested` sort 选项，属性如下：

- `path`：定义在哪个 nested 对象上排序。实际 sort 字段必须是该 nested 对象内的直接字段。按 nested 字段排序时该字段必填。
- `filter`：nested path 内的 inner objects 必须匹配该 filter，其字段值才会用于排序。常见做法是在 nested filter 中重复查询/过滤条件。默认无 filter。
- `max_children`：每个 root document 选择 sort 值时考虑的最大子文档数量。默认无限制。
- `nested`：与顶层 `nested` 相同，但应用于当前 nested 对象内部的另一层 nested path。

如果字段是 nested 字段，但在 sort 中没有提供 nested context，Elasticsearch 会报错。

单层 nested 排序示例（`offer` 是 nested 类型字段，必须指定 nested path）：

```bash
POST /_search
{
   "query" : {
      "term" : { "product" : "chocolate" }
   },
   "sort" : [
       {
          "offer.price" : {
             "mode" :  "avg",
             "order" : "asc",
             "nested": {
                "path": "offer",
                "filter": {
                   "term" : { "offer.color" : "blue" }
                }
             }
          }
       }
    ]
}
```

多层 nested 排序示例（`parent` 和 `child` 字段都是 nested，每一层都需要指定 `nested.path`）：

```bash
POST /_search
{
   "query": {
      "nested": {
         "path": "parent",
         "query": {
            "bool": {
                "must": {"range": {"parent.age": {"gte": 21}}},
                "filter": {
                    "nested": {
                        "path": "parent.child",
                        "query": {
                            "match": {"parent.child.name": "matt"}
                        }
                    }
                }
            }
         }
      }
   },
   "sort" : [
      {
         "parent.child.age" : {
            "mode" :  "min",
            "order" : "asc",
            "nested": {
               "path": "parent",
               "filter": {
                  "range": {"parent.age": {"gte": 21}}
               },
               "nested": {
                  "path": "parent.child",
                  "filter": {
                     "match": {"parent.child.name": "matt"}
                  }
               }
            }
         }
      }
   ]
}
```

nested sorting 也支持 script sorting 和 geo distance sorting。

## 缺失值

`missing` 参数指定缺少 sort 字段的文档如何处理：`_last`、`_first` 或自定义值（作为缺失文档的 sort 值）。默认值是 `_last`。

```bash
GET /_search
{
  "sort" : [
    { "price" : {"missing" : "_last"} }
  ],
  "query" : {
    "term" : { "product" : "chocolate" }
  }
}
```

如果 nested inner object 不匹配 `nested.filter`，则会使用 missing value。

## 忽略未映射字段

默认情况下，如果字段没有关联 mapping，搜索请求会失败。

`unmapped_type` 允许忽略没有 mapping 的字段，不按该字段排序。该参数的值用于决定要发出的 sort 值：

```bash
GET /_search
{
  "sort" : [
    { "price" : {"unmapped_type" : "long"} }
  ],
  "query" : {
    "term" : { "product" : "chocolate" }
  }
}
```

如果被查询的任一索引没有 `price` 的 mapping，Elasticsearch 会按 `long` 类型处理该字段，并且该索引中的所有文档都视为没有该字段的值。

## 地理距离排序

可以按 `_geo_distance` 排序。假设 `pin.location` 是 `geo_point` 类型字段：

```bash
GET /_search
{
  "sort" : [
    {
      "_geo_distance" : {
          "pin.location" : [-70, 40],
          "order" : "asc",
          "unit" : "km",
          "mode" : "min",
          "distance_type" : "arc",
          "ignore_unmapped": true
      }
    }
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

### Geo distance 参数

- `distance_type`：距离计算方式。`arc`（默认）或 `plane`（更快，但在长距离和接近极地时不准确）。
- `mode`：字段包含多个 geo point 时如何处理。升序默认采用最短距离，降序默认采用最长距离。支持 `min`、`max`、`median`、`avg`。
- `unit`：计算 sort 值时使用的单位，默认 `m`（米）。
- `ignore_unmapped`：是否将 unmapped 字段视为 missing value。设为 `true` 等价于在字段排序中指定 `unmapped_type`；默认 `false`，此时 unmapped 字段会导致搜索失败。

geo distance sorting 不支持可配置的 missing values。文档没有用于距离计算的字段值时，距离始终视为 `Infinity`。

### 坐标格式

经纬度作为属性对象：

```bash
GET /_search
{
  "sort" : [
    {
      "_geo_distance" : {
        "pin.location" : {
          "lat" : 40,
          "lon" : -70
        },
        "order" : "asc",
        "unit" : "km"
      }
    }
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

WKT（Well-Known Text）字符串：

```bash
GET /_search
{
  "sort": [
    {
      "_geo_distance": {
        "pin.location": "POINT (-70 40)",
        "order": "asc",
        "unit": "km"
      }
    }
  ],
  "query": {
    "term": { "user": "kimchy" }
  }
}
```

Geohash：

```bash
GET /_search
{
  "sort" : [
    {
      "_geo_distance" : {
        "pin.location" : "drm3btev3e86",
        "order" : "asc",
        "unit" : "km"
      }
    }
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

经纬度数组，格式为 `[lon, lat]`，顺序遵循 GeoJSON：

```bash
GET /_search
{
  "sort" : [
    {
      "_geo_distance" : {
        "pin.location" : [ -70, 40 ],
        "order" : "asc",
        "unit" : "km"
      }
    }
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

多个参考点（数组中可包含任意 geo_point 格式）：

```bash
GET /_search
{
  "sort" : [
    {
      "_geo_distance" : {
        "pin.location" : [ [ -70, 40 ], [ -71, 42 ] ],
        "order" : "asc",
        "unit" : "km"
      }
    }
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

最终距离由 `mode` 决定，对所有文档点到所有请求参考点之间的距离取 `min` / `max` / `avg`。

## 基于脚本的排序

```bash
GET /_search
{
  "query": {
    "term": { "user": "kimchy" }
  },
  "sort": {
    "_script": {
      "type": "number",
      "script": {
        "lang": "painless",
        "source": "doc['field_name'].value * params.factor",
        "params": {
          "factor": 1.1
        }
      },
      "order": "asc"
    }
  }
}
```

## 跟踪分数

当按字段排序时，不会计算分数。设置 `track_scores` 为 `true` 后，仍会计算并跟踪分数：

```bash
GET /_search
{
  "track_scores": true,
  "sort" : [
    { "post_date" : {"order" : "desc"} },
    { "name" : "desc" },
    { "age" : "desc" }
  ],
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

## 内存注意事项

排序时，相关 sort 字段值会被加载到内存中，因此每个 shard 都需要有足够内存容纳这些值。

对于字符串类型字段，被排序字段不应被分析或分词，即不应是 analyzed / tokenized 文本字段。

对于数值类型，如果可能，建议显式设置更窄的类型，例如 `short`、`integer` 或 `float`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/sort-search-results.html)
