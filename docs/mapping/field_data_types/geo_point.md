# geo_point 字段类型

`geo_point` 类型的字段接受经纬度对，可用于：

- 查找边界框内、距中心点一定距离内，或 `geo_shape` 查询范围内的地理点（例如多边形内的点）。
- 按距中心点的距离聚合文档。
- 按地理网格聚合文档：`geo_hash`、`geo_tile` 或 `geo_hex`。
- 使用指标聚合 `geo_line` 将地理点聚合为轨迹。
- 将距离整合到文档的相关性评分中。
- 按距离对文档排序。

与 `geo_shape` 和 `point` 类型一样，`geo_point` 可以用 GeoJSON 和 Well-Known Text（WKT）格式指定。不过，出于便利性和历史原因，还支持一些额外的格式。总共有六种指定地理点的方式，如下所示：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      }
    }
  }
}

# 使用 GeoJSON 格式的对象表示的地理点
PUT my-index-000001/_doc/1
{
  "text": "Geopoint as an object using GeoJSON format",
  "location": {
    "type": "Point",
    "coordinates": [-71.34, 41.12]
  }
}

# 使用 WKT POINT 原语表示的地理点，格式为："POINT(lon lat)"
PUT my-index-000001/_doc/2
{
  "text": "Geopoint as a WKT POINT primitive",
  "location" : "POINT (-71.34 41.12)"
}

# 使用带 'lat' 和 'lon' 键的对象表示的地理点
PUT my-index-000001/_doc/3
{
  "text": "Geopoint as an object with 'lat' and 'lon' keys",
  "location": {
    "lat": 41.12,
    "lon": -71.34
  }
}

# 使用数组表示的地理点，格式为：[ lon, lat]
PUT my-index-000001/_doc/4
{
  "text": "Geopoint as an array",
  "location": [ -71.34, 41.12 ]
}

# 使用字符串表示的地理点，格式为："lat,lon"
PUT my-index-000001/_doc/5
{
  "text": "Geopoint as a string",
  "location": "41.12,-71.34"
}

# 使用 geohash 表示的地理点
PUT my-index-000001/_doc/6
{
  "text": "Geopoint as a geohash",
  "location": "drm3btev3e86"
}

# 一个 geo-bounding box 查询，查找落在框内的所有地理点
GET my-index-000001/_search
{
  "query": {
    "geo_bounding_box": {
      "location": {
        "top_left": {
          "lat": 42,
          "lon": -72
        },
        "bottom_right": {
          "lat": 40,
          "lon": -74
        }
      }
    }
  }
}
```

## 以数组或字符串表示的地理点

请注意，字符串形式的地理点顺序为 `lat,lon`，而数组形式的地理点、GeoJSON 和 WKT 的顺序则相反：`lon,lat`。

这是历史原因造成的。地理学家传统上先写纬度后写经度，而较新的地理数据格式（如 GeoJSON 和 Well-Known Text）为了符合数学上 x 在 y 之前的惯例，将经度排在纬度之前（东经先于北纬）。

一个点可以用 geohash 表示。Geohash 是将纬度和经度的比特交错编码后的 base32 编码字符串。geohash 中的每个字符都会增加 5 位精度，因此哈希越长，精度越高。出于索引目的，geohash 会被转换为经纬度对。在此过程中只使用前 12 个字符，因此在 geohash 中指定超过 12 个字符并不会提高精度。这 12 个字符提供 60 位精度，应能将可能的误差降低到 2 厘米以内。

## geo_point 字段的参数

`geo_point` 字段接受以下参数：

- `ignore_malformed`
  （可选，Boolean）如果为 `true`，则忽略格式错误的地理点。如果为 `false`（默认），格式错误的地理点会抛出异常并拒绝整个文档。如果地理点的纬度超出 -90 ≤ 纬度 ≤ 90 的范围，或经度超出 -180 ≤ 经度 ≤ 180 的范围，则视为格式错误。注意，如果使用了 `script` 参数，则无法设置此项。
- `ignore_z_value`
  （可选，Boolean）如果为 `true`（默认），则接受三维点（存储在 source 中），但只索引纬度和经度值；第三维会被忽略。如果为 `false`，包含纬度和经度（二维）以外值的地理点会抛出异常并拒绝整个文档。注意，如果使用了 `script` 参数，则无法设置此项。
- `index`
  （可选，Boolean）该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 `doc_values` 的字段仍然可以查询，只是速度较慢。
- `null_value`
  （可选，字符串）接受一个地理点值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。注意，如果使用了 `script` 参数，则无法设置此项。
- `on_script_error`
  （可选，枚举）定义当 `script` 参数定义的脚本在索引时抛出错误时该怎么办。接受 `fail`（默认），它会导致整个文档被拒绝；以及 `continue`，它会将该字段记录到文档的 `_ignored` 元数据字段中并继续索引。只有同时设置了 `script` 字段时才能设置此参数。
- `script`
  （可选，字符串）如果设置了此参数，则该字段将索引由此脚本生成的值，而不是直接从源中读取值。如果输入文档中为该字段设置了值，文档将被拒绝并返回错误。脚本的格式与其运行时字段等效格式相同，并且应输出一对 `(lat, lon)` double 值表示的点。

## 在脚本中使用地理点

在脚本中访问地理点的值时，该值以 `GeoPoint` 对象的形式返回，允许分别访问 `.lat` 和 `.lon` 值：

```painless
def geopoint = doc['location'].value;
def lat      = geopoint.lat;
def lon      = geopoint.lon;
```

出于性能考虑，最好直接访问 lat/lon 值：

```painless
def lat      = doc['location'].lat;
def lon      = doc['location'].lon;
```

## 合成 _source

合成 source 可能会对 `geo_point` 字段进行排序（先按纬度，再按经度），并将其缩减到存储精度。例如：

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
      "point": { "type": "geo_point" }
    }
  }
}

PUT idx/_doc/1
{
  "point": [
    {"lat":-90, "lon":-80},
    {"lat":10, "lon":30}
  ]
}
```

将变为：

```json
{
  "point": [
    {"lat":-90.0, "lon":-80.00000000931323},
    {"lat":9.999999990686774, "lon":29.999999972060323}
   ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/geo-point.html)
