# shape 字段类型

`shape` 数据类型便于对任意 x、y 笛卡尔形状（如矩形和多边形）进行索引和搜索。它可用于索引和查询坐标落在二维平面坐标系中的几何图形。

你可以使用 [shape 查询](/query_dsl/geo_queries/shape)来查询使用此类型的文档。

## 映射选项

与 `geo_shape` 字段类型一样，`shape` 字段映射将 GeoJSON 或 Well-Known Text（WKT）几何对象映射到 `shape` 类型。要启用它，用户必须显式地将字段映射为 `shape` 类型。

| 选项 | 描述 | 默认值 |
|:--|:--|:--|
| `orientation` | 可选。定义如何解释多边形/多多边形的顶点顺序。此参数定义了两种坐标系规则之一（右手或左手），每种都可以用三种不同的方式指定。1. 右手规则：`right`、`ccw`、`counterclockwise`。2. 左手规则：`left`、`cw`、`clockwise`。默认方向（逆时针）符合 OGC 标准，该标准定义外环顶点为逆时针顺序、内环顶点（孔洞）为顺时针顺序。在 geo_shape 映射中设置此参数会显式设置 geo_shape 字段坐标列表的顶点顺序，但可以在每个单独的 GeoJSON 或 WKT 文档中覆盖。 | `ccw` |
| `ignore_malformed` | 如果为 `true`，则忽略格式错误的 GeoJSON 或 WKT 形状。如果为 `false`（默认），格式错误的 GeoJSON 和 WKT 形状会抛出异常并拒绝整个文档。 | `false` |
| `ignore_z_value` | 如果为 `true`（默认），则接受三维点（存储在 source 中），但只索引纬度和经度值；第三维会被忽略。如果为 `false`，包含纬度和经度（二维）以外值的地理点会抛出异常并拒绝整个文档。 | `true` |
| `coerce` | 如果为 `true`，多边形中未闭合的线性环将自动闭合。 | `false` |

## 索引方法

与 geo_shape 一样，`shape` 字段类型通过将几何图形分解为三角网格并将每个三角形作为 BKD 树中的一个 7 维点进行索引。提供给索引器的坐标是单精度浮点值，因此该字段保证提供与 Java 虚拟机相同的精度（通常为 1E-38）。对于多边形/多多边形，镶嵌的性能主要取决于定义几何图形的顶点数量。

:::danger[重要]
CONTAINS 关系查询——`relation` 定义为 `contains` 的 shape 查询仅支持基于 Elasticsearch 7.5.0 或更高版本创建的索引。
:::

## 示例

此映射定义将 `geometry` 字段映射为 `shape` 类型。索引器对顶点值使用单精度浮点数，因此精度保证与 Java 虚拟机提供的浮点值精度相同（通常为 1E-38）。

```bash
PUT /example
{
  "mappings": {
    "properties": {
      "geometry": {
        "type": "shape"
      }
    }
  }
}
```

## 输入结构

形状可以使用 GeoJSON 或 Well-Known Text（WKT）格式表示。下表提供了 GeoJSON 和 WKT 到 Elasticsearch 类型的映射：

| GeoJSON 类型 | WKT 类型 | Elasticsearch 类型 | 描述 |
|:--|:--|:--|:--|
| Point | POINT | `point` | 单个 x, y 坐标。 |
| LineString | LINESTRING | `linestring` | 由两个或更多点给出的任意线。 |
| Polygon | POLYGON | `polygon` | 闭合多边形，其第一个点和最后一个点必须相同，因此创建 n 边多边形需要 n+1 个顶点，最少 4 个顶点。 |
| MultiPoint | MULTIPOINT | `multipoint` | 不相连但可能相关的一组点。 |
| MultiLineString | MULTILINESTRING | `multilinestring` | 单独的线字符串数组。 |
| MultiPolygon | MULTIPOLYGON | `multipolygon` | 单独的多边形数组。 |
| GeometryCollection | GEOMETRYCOLLECTION | `geometrycollection` | 形状集合，类似于 multi* 形状，但多种类型可以共存（例如一个 Point 和一个 LineString）。 |
| N/A | BBOX | `envelope` | 边界矩形或包络线，只需指定左上角和右下角两个点。 |

对于所有类型，内部的 `type` 和 `coordinates` 字段都是必需的。

在 GeoJSON 和 WKT（因此在 Elasticsearch 中）中，坐标数组内正确的坐标顺序是 **(X, Y)**。这与许多地理空间 API（例如 geo_shape）不同，后者通常使用通俗的纬度、经度（Y, X）顺序。

### Point（点）

点是笛卡尔 x、y 空间中的单个坐标。它可以表示虚拟世界或投影空间中某个关注项的位置。以下是 GeoJSON 格式的点示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "point",
    "coordinates" : [-377.03653, 389.897676]
  }
}
```

以下是 WKT 格式的点示例：

```bash
POST /example/_doc
{
  "location" : "POINT (-377.03653 389.897676)"
}
```

### LineString（线字符串）

线字符串由两个或更多位置的数组定义。只指定两个点时，线字符串表示一条直线。指定多于两个点会创建任意路径。以下是 GeoJSON 格式的线字符串示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "linestring",
    "coordinates" : [[-377.03653, 389.897676], [-377.009051, 389.889939]]
  }
}
```

以下是 WKT 格式的线字符串示例：

```bash
POST /example/_doc
{
  "location" : "LINESTRING (-377.03653 389.897676, -377.009051 389.889939)"
}
```

### Polygon（多边形）

多边形由点列表的列表定义。每个（外层）列表中的第一个点和最后一个点必须相同（多边形必须是闭合的）。以下是 GeoJSON 格式的多边形示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "polygon",
    "coordinates" : [
      [ [1000.0, -1001.0], [1001.0, -1001.0], [1001.0, -1000.0], [1000.0, -1000.0], [1000.0, -1001.0] ]
    ]
  }
}
```

以下是 WKT 格式的多边形示例：

```bash
POST /example/_doc
{
  "location" : "POLYGON ((1000.0 -1001.0, 1001.0 -1001.0, 1001.0 -1000.0, 1000.0 -1000.0, 1000.0 -1001.0))"
}
```

第一个数组表示多边形的外边界，其他数组表示内部形状（"孔洞"）。以下是带孔洞多边形的 GeoJSON 示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "polygon",
    "coordinates" : [
      [ [1000.0, -1001.0], [1001.0, -1001.0], [1001.0, -1000.0], [1000.0, -1000.0], [1000.0, -1001.0] ],
      [ [1000.2, -1001.2], [1000.8, -1001.2], [1000.8, -1001.8], [1000.2, -1001.8], [1000.2, -1001.2] ]
    ]
  }
}
```

以下是 WKT 格式的带孔洞多边形示例：

```bash
POST /example/_doc
{
  "location" : "POLYGON ((1000.0 1000.0, 1001.0 1000.0, 1001.0 1001.0, 1000.0 1001.0, 1000.0 1000.0), (1000.2 1000.2, 1000.8 1000.2, 1000.8 1000.8, 1000.2 1000.8, 1000.2 1000.2))"
}
```

:::danger[重要提示]
WKT 不强制顶点的特定顺序。GeoJSON 强制要求外多边形必须为逆时针，内部形状必须为顺时针，这与开放地理空间联盟（OGC）简单要素访问规范中的顶点顺序一致。
:::

默认情况下，Elasticsearch 期望顶点为逆时针（右手规则）顺序。如果以顺时针（左手规则）顺序提供数据，用户可以在字段映射中更改 `orientation` 参数，或作为随文档提供的参数进行更改。

以下是在文档上覆盖 orientation 参数的示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "polygon",
    "orientation" : "clockwise",
    "coordinates" : [
      [ [1000.0, 1000.0], [1000.0, 1001.0], [1001.0, 1001.0], [1001.0, 1000.0], [1000.0, 1000.0] ]
    ]
  }
}
```

### MultiPoint（多点）

以下是 GeoJSON 点列表示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "multipoint",
    "coordinates" : [
      [1002.0, 1002.0], [1003.0, 2000.0]
    ]
  }
}
```

以下是 WKT 点列表示例：

```bash
POST /example/_doc
{
  "location" : "MULTIPOINT (1002.0 2000.0, 1003.0 2000.0)"
}
```

### MultiLineString（多线字符串）

以下是 GeoJSON 线字符串列表示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "multilinestring",
    "coordinates" : [
      [ [1002.0, 200.0], [1003.0, 200.0], [1003.0, 300.0], [1002.0, 300.0] ],
      [ [1000.0, 100.0], [1001.0, 100.0], [1001.0, 100.0], [1000.0, 100.0] ],
      [ [1000.2, 100.2], [1000.8, 100.2], [1000.8, 100.8], [1000.2, 100.8] ]
    ]
  }
}
```

以下是 WKT 线字符串列表示例：

```bash
POST /example/_doc
{
  "location" : "MULTILINESTRING ((1002.0 200.0, 1003.0 200.0, 1003.0 300.0, 1002.0 300.0), (1000.0 100.0, 1001.0 100.0, 1001.0 100.0, 1000.0 100.0), (1000.2 0.2, 1000.8 100.2, 1000.8 100.8, 1000.2 100.8))"
}
```

### MultiPolygon（多多边形）

以下是 GeoJSON 多边形列表示例（第二个多边形包含一个孔洞）：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "multipolygon",
    "coordinates" : [
      [ [[1002.0, 200.0], [1003.0, 200.0], [1003.0, 300.0], [1002.0, 300.0], [1002.0, 200.0]] ],
      [ [[1000.0, 200.0], [1001.0, 100.0], [1001.0, 100.0], [1000.0, 100.0], [1000.0, 100.0]],
        [[1000.2, 200.2], [1000.8, 100.2], [1000.8, 100.8], [1000.2, 100.8], [1000.2, 100.2]] ]
    ]
  }
}
```

以下是 WKT 多边形列表示例（第二个多边形包含一个孔洞）：

```bash
POST /example/_doc
{
  "location" : "MULTIPOLYGON (((1002.0 200.0, 1003.0 200.0, 1003.0 300.0, 1002.0 300.0, 102.0 200.0)), ((1000.0 100.0, 1001.0 100.0, 1001.0 100.0, 1000.0 100.0, 1000.0 100.0), (1000.2 100.2, 1000.8 100.2, 1000.8 100.8, 1000.2 100.8, 1000.2 100.2)))"
}
```

### Geometry Collection（几何集合）

以下是 GeoJSON 几何对象集合示例：

```bash
POST /example/_doc
{
  "location" : {
    "type": "geometrycollection",
    "geometries": [
      {
        "type": "point",
        "coordinates": [1000.0, 100.0]
      },
      {
        "type": "linestring",
        "coordinates": [ [1001.0, 100.0], [1002.0, 100.0] ]
      }
    ]
  }
}
```

以下是 WKT 几何对象集合示例：

```bash
POST /example/_doc
{
  "location" : "GEOMETRYCOLLECTION (POINT (1000.0 100.0), LINESTRING (1001.0 100.0, 1002.0 100.0))"
}
```

### Envelope（包络线）

Elasticsearch 支持 `envelope` 类型，它由形状的左上角和右下角点的坐标组成，以 `[[minX, maxY], [maxX, minY]]` 格式表示边界矩形：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "envelope",
    "coordinates" : [ [1000.0, 100.0], [1001.0, 100.0] ]
  }
}
```

以下是使用 WKT BBOX 格式的包络线示例：

```bash
POST /example/_doc
{
  "location" : "BBOX (1000.0, 1002.0, 2000.0, 1000.0)"
}
```

:::note[提示]
WKT 规范期望的顺序是：minLon, maxLon, maxLat, minLat。
:::

## 排序和检索已索引的形状

由于形状的输入结构和索引表示复杂，目前无法对形状进行排序或直接检索其字段。shape 值只能通过 `_source` 字段检索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/shape.html)
