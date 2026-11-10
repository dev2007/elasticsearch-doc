# geo_shape 字段类型

`geo_shape` 数据类型便于对任意地理形状（如矩形、线和多边形）进行索引和搜索。如果要索引的数据包含点以外的形状，则必须使用此映射。如果数据只包含点，则可以将它们索引为 `geo_point` 或 `geo_shape`。

使用此类型的文档可以用于：

- 查找以下范围内的地理形状：
  - 边界框内
  - 距中心点一定距离内
  - `geo_shape` 查询范围内（例如相交的多边形）。
- 按地理网格聚合文档：
  - `geo_hash`
  - 或 `geo_tile`
  - 或 `geo_hex`。

## 映射选项

`geo_shape` 映射将 GeoJSON 或 WKT 几何对象映射到 `geo_shape` 类型。要启用它，用户必须显式地将字段映射为 `geo_shape` 类型。

在 GeoJSON 和 WKT（因此在 Elasticsearch 中）中，坐标数组内正确的坐标顺序是经度、纬度（X, Y）。这与许多地理空间 API（例如 Google Maps）不同，后者通常使用通俗的纬度、经度（Y, X）顺序。

| 选项 | 描述 | 默认值 |
|:--|:--|:--|
| `orientation` | 可选。字段 WKT 多边形的默认方向。<br/><br/>此参数只设置并返回 RIGHT（逆时针）或 LEFT（顺时针）值。不过，你可以用多种方式指定这两个值。<br/><br/>要设置 RIGHT，使用以下参数之一或其大写变体：<br/><br/>- `right`<br/>- `counterclockwise`<br/>- `ccw`<br/><br/>要设置 LEFT，使用以下参数之一或其大写变体：<br/><br/>- `left`<br/>- `clockwise`<br/>- `cw` | `RIGHT` |
| `ignore_malformed` | 如果为 `true`，则忽略格式错误的 GeoJSON 或 WKT 形状。如果为 `false`（默认），格式错误的 GeoJSON 和 WKT 形状会抛出异常并拒绝整个文档。 | `false` |
| `ignore_z_value` | 如果为 `true`（默认），则接受三维点（存储在 source 中），但只索引纬度和经度值；第三维会被忽略。如果为 `false`，包含纬度和经度（二维）以外值的地理点会抛出异常并拒绝整个文档。 | `true` |
| `coerce` | 如果为 `true`，多边形中未闭合的线性环将自动闭合。 | `false` |
| `index` | 该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 `doc_values` 的字段仍然可以查询，只是速度较慢。 | `true` |
| `doc_values` | 是否应该将该字段以列式方式存储在磁盘上，以便之后可用于聚合或脚本？ | `true` |

## 索引方法

地理形状类型通过将形状分解为三角网格并将每个三角形作为 BKD 树中的一个 7 维点进行索引。这提供了近乎完美的空间分辨率（精确到 1e-7 十进制度），因为所有空间关系都是使用原始形状的编码向量表示来计算的。镶嵌（tessellator）的性能主要取决于定义多边形/多多边形的顶点数量。

## 示例

```bash
PUT /example
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_shape"
      }
    }
  }
}
```

## 输入结构

形状可以使用 GeoJSON 或 Well-Known Text（WKT）格式表示。下表提供了 GeoJSON 和 WKT 到 Elasticsearch 类型的映射：

| GeoJSON 类型 | WKT 类型 | Elasticsearch 类型 | 描述 |
|:--|:--|:--|:--|
| Point | POINT | `point` | 单个地理坐标。注意：Elasticsearch 仅使用 WGS-84 坐标。 |
| LineString | LINESTRING | `linestring` | 由两个或更多点给出的任意线。 |
| Polygon | POLYGON | `polygon` | 闭合多边形，其第一个点和最后一个点必须相同，因此创建 n 边多边形需要 n+1 个顶点，最少 4 个顶点。 |
| MultiPoint | MULTIPOINT | `multipoint` | 不相连但可能相关的一组点。 |
| MultiLineString | MULTILINESTRING | `multilinestring` | 单独的线字符串数组。 |
| MultiPolygon | MULTIPOLYGON | `multipolygon` | 单独的多边形数组。 |
| GeometryCollection | GEOMETRYCOLLECTION | `geometrycollection` | 一种 GeoJSON 形状，类似于 multi* 形状，但多种类型可以共存（例如一个 Point 和一个 LineString）。 |
| N/A | BBOX | `envelope` | 边界矩形或包络线，只需指定左上角和右下角两个点。 |

对于所有类型，内部的 `type` 和 `coordinates` 字段都是必需的。

### POINT（点）

点是一个单一的地理坐标，例如建筑物的位置或智能手机 Geolocation API 给出的当前位置。以下是 GeoJSON 格式的点示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "Point",
    "coordinates" : [-77.03653, 38.897676]
  }
}
```

以下是 WKT 格式的点示例：

```bash
POST /example/_doc
{
  "location" : "POINT (-77.03653 38.897676)"
}
```

### LINESTRING（线字符串）

线字符串由两个或更多位置的数组定义。只指定两个点时，线字符串表示一条直线。指定多于两个点会创建任意路径。以下是 GeoJSON 格式的线字符串示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "LineString",
    "coordinates" : [[-77.03653, 38.897676], [-77.009051, 38.889939]]
  }
}
```

以下是 WKT 格式的线字符串示例：

```bash
POST /example/_doc
{
  "location" : "LINESTRING (-77.03653 38.897676, -77.009051 38.889939)"
}
```

上面的线字符串绘制了一条从白宫到美国国会大厦的直线。

### POLYGON（多边形）

多边形由点列表的列表定义。每个（外层）列表中的第一个点和最后一个点必须相同（多边形必须是闭合的）。以下是 GeoJSON 格式的多边形示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "Polygon",
    "coordinates" : [
      [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ]
    ]
  }
}
```

以下是 WKT 格式的多边形示例：

```bash
POST /example/_doc
{
  "location" : "POLYGON ((100.0 0.0, 101.0 0.0, 101.0 1.0, 100.0 1.0, 100.0 0.0))"
}
```

第一个数组表示多边形的外边界，其他数组表示内部形状（"孔洞"）。以下是带孔洞多边形的 GeoJSON 示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "Polygon",
    "coordinates" : [
      [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
      [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
    ]
  }
}
```

以下是 WKT 格式的带孔洞多边形示例：

```bash
POST /example/_doc
{
  "location" : "POLYGON ((100.0 0.0, 101.0 0.0, 101.0 1.0, 100.0 1.0, 100.0 0.0), (100.2 0.2, 100.8 0.2, 100.8 0.8, 100.2 0.8, 100.2 0.2))"
}
```

#### 多边形方向

多边形的方向表示其顶点的顺序：RIGHT（逆时针）或 LEFT（顺时针）。Elasticsearch 使用多边形的方向来确定它是否跨越国际日期变更线（±180° 经度）。

你可以使用 `orientation` 映射参数为 WKT 多边形设置默认方向。这是因为 WKT 规范没有指定或强制默认方向。

无论 orientation 映射参数的值如何，GeoJSON 多边形都使用默认的 RIGHT 方向。这是因为 GeoJSON 规范强制要求外多边形使用逆时针方向，内部形状使用顺时针方向。

你可以使用文档级别的 `orientation` 参数覆盖 GeoJSON 多边形的默认方向。例如，以下索引请求指定了文档级别的 LEFT 方向：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "Polygon",
    "orientation" : "LEFT",
    "coordinates" : [
      [ [-177.0, 10.0], [176.0, 15.0], [172.0, 0.0], [176.0, -15.0], [-177.0, -10.0], [-177.0, 10.0] ]
    ]
  }
}
```

Elasticsearch 只使用多边形的方向来确定它是否跨越国际日期变更线。如果多边形的最小经度和最大经度之差小于 180°，则该多边形不跨越日期变更线，其方向没有任何影响。

如果多边形的最小经度和最大经度之差大于或等于 180°，Elasticsearch 会检查多边形的文档级方向是否与默认方向不同。如果方向不同，Elasticsearch 认为该多边形跨越国际日期变更线，并在日期变更线处将其拆分。

### MULTIPOINT（多点）

以下是 GeoJSON 点列表示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "MultiPoint",
    "coordinates" : [
      [102.0, 2.0], [103.0, 2.0]
    ]
  }
}
```

以下是 WKT 点列表示例：

```bash
POST /example/_doc
{
  "location" : "MULTIPOINT (102.0 2.0, 103.0 2.0)"
}
```

### MULTILINESTRING（多线字符串）

以下是 GeoJSON 线字符串列表示例：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "MultiLineString",
    "coordinates" : [
      [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0] ],
      [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0] ],
      [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8] ]
    ]
  }
}
```

以下是 WKT 线字符串列表示例：

```bash
POST /example/_doc
{
  "location" : "MULTILINESTRING ((102.0 2.0, 103.0 2.0, 103.0 3.0, 102.0 3.0), (100.0 0.0, 101.0 0.0, 101.0 1.0, 100.0 1.0), (100.2 0.2, 100.8 0.2, 100.8 0.8, 100.2 0.8))"
}
```

### MULTIPOLYGON（多多边形）

以下是 GeoJSON 多边形列表示例（第二个多边形包含一个孔洞）：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "MultiPolygon",
    "coordinates" : [
      [ [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]] ],
      [ [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
        [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]] ]
    ]
  }
}
```

以下是 WKT 多边形列表示例（第二个多边形包含一个孔洞）：

```bash
POST /example/_doc
{
  "location" : "MULTIPOLYGON (((102.0 2.0, 103.0 2.0, 103.0 3.0, 102.0 3.0, 102.0 2.0)), ((100.0 0.0, 101.0 0.0, 101.0 1.0, 100.0 1.0, 100.0 0.0), (100.2 0.2, 100.8 0.2, 100.8 0.8, 100.2 0.8, 100.2 0.2)))"
}
```

### GEOMETRY COLLECTION（几何集合）

以下是 GeoJSON 几何对象集合示例：

```bash
POST /example/_doc
{
  "location" : {
    "type": "GeometryCollection",
    "geometries": [
      {
        "type": "Point",
        "coordinates": [100.0, 0.0]
      },
      {
        "type": "LineString",
        "coordinates": [ [101.0, 0.0], [102.0, 1.0] ]
      }
    ]
  }
}
```

以下是 WKT 几何对象集合示例：

```bash
POST /example/_doc
{
  "location" : "GEOMETRYCOLLECTION (POINT (100.0 0.0), LINESTRING (101.0 0.0, 102.0 1.0))"
}
```

### ENVELOPE（包络线）

Elasticsearch 支持 `envelope` 类型，它由形状的左上角和右下角点的坐标组成，以 `[[minLon, maxLat], [maxLon, minLat]]` 格式表示边界矩形：

```bash
POST /example/_doc
{
  "location" : {
    "type" : "envelope",
    "coordinates" : [ [100.0, 1.0], [101.0, 0.0] ]
  }
}
```

以下是使用 WKT `BBOX` 格式的包络线示例：

```bash
POST /example/_doc
{
  "location" : "BBOX (100.0, 102.0, 2.0, 0.0)"
}
```

:::note[提示]
WKT 规范期望的顺序是：minLon, maxLon, maxLat, minLat。
:::

### CIRCLE（圆）

GeoJSON 和 WKT 都不支持点-半径圆类型。作为替代，可以使用 `circle` 摄取处理器将圆近似为多边形。

## 排序和检索已索引的形状

由于形状的输入结构和索引表示复杂，目前无法对形状进行排序或直接检索其字段。`geo_shape` 值只能通过 `_source` 字段检索。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geo-shape.html)
