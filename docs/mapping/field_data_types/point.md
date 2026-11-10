# point 字段类型

`point` 数据类型便于对落在二维平面坐标系中的任意 x、y 点对进行索引和搜索。

你可以使用 [shape 查询](/query_dsl/geo_queries/shape)来查询使用此类型的文档。

与 `geo_shape` 和 `geo_point` 一样，`point` 可以用 GeoJSON 和 Well-Known Text（WKT）格式指定。不过，出于便利性和历史原因，还支持一些额外的格式。总共有五种指定笛卡尔点的方式，如下所示：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "location": {
        "type": "point"
      }
    }
  }
}

# 使用 GeoJSON 格式的对象表示的点
PUT my-index-000001/_doc/1
{
  "text": "Point as an object using GeoJSON format",
  "location": {
    "type": "Point",
    "coordinates": [-71.34, 41.12]
  }
}

# 使用 WKT POINT 原语表示的点，格式为："POINT(x y)"
PUT my-index-000001/_doc/2
{
  "text": "Point as a WKT POINT primitive",
  "location" : "POINT (-71.34 41.12)"
}

# 使用带 'x' 和 'y' 键的对象表示的点
PUT my-index-000001/_doc/3
{
  "text": "Point as an object with 'x' and 'y' keys",
  "location": {
    "x": -71.34,
    "y": 41.12
  }
}

# 使用数组表示的点，格式为：[ x, y]
PUT my-index-000001/_doc/4
{
  "text": "Point as an array",
  "location": [ -71.34, 41.12 ]
}

# 使用字符串表示的点，格式为："x,y"
PUT my-index-000001/_doc/5
{
  "text": "Point as a string",
  "location": "-71.34,41.12"
}
```

与 `geo_point` 字段类型不同，上述所有格式中坐标 `x` 和 `y` 的顺序是相同的。

提供给索引器的坐标是单精度浮点值，因此该字段保证提供与 Java 虚拟机相同的精度（通常为 1E-38）。

## point 字段的参数

`point` 字段接受以下参数：

- `ignore_malformed`
  （可选，Boolean）如果为 `true`，则忽略格式错误的点。如果为 `false`（默认），格式错误的点会抛出异常并拒绝整个文档。
- `ignore_z_value`
  （可选，Boolean）如果为 `true`（默认），则接受三维点（存储在 source 中），但只索引 `x` 和 `y` 值；第三维会被忽略。如果为 `false`，包含 `x` 和 `y`（二维）以外值的点会抛出异常并拒绝整个文档。
- `null_value`
  （可选，字符串）接受一个点值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。

## 排序和检索点

目前无法对点进行排序或直接检索其字段。`point` 值只能通过 `_source` 字段检索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/point.html)
