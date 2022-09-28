# 矢量图块搜索 API

在矢量图块中搜索地理空间值。以二进制 [Mapbox 矢量图块](https://docs.mapbox.com/vector-tiles/specification)的形式返回结果。

```bash
GET my-index/_mvt/my-geo-field/15/5271/12710
```

## 请求

`GET <target>/_mvt/<field>/<zoom>/<x>/<y>`

`POST <target>/_mvt/<field>/<zoom>/<x>/<y>`

## 前置条件

- 在使用此 API 之前，你应该了解 [Mapbox矢量图块规范](https://github.com/mapbox/vector-tile-spec)。
- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。对于跨集群搜索，参阅[配置跨集群搜索权限](/set_up_elasticsearch/remote_clusters/configure_roles_and_users_for_remote_clusters?id=配置跨集群搜索权限)。

## 路径参数

- `<target>`
  （可选，字符串）逗号分隔的用于搜索的数据流、索引和别名列表。支持通配符（*）。为了在集群中搜索所有数据流和索引，忽略此参数或者使用 `_all` 或 `*`。

  为了搜索远程集群，使用语法 `<cluster>:<target>`。参阅[跨集群搜索](/search_your_data/seach_cross_clusters)。

- `<field>`
  （必需，字符串）包含要返回的地理空间值的字段。必须是 [`geo_point`](/mapping/field_data_types/geopoint) 或 [`geo_shape`](/mapping/field_data_types/geosharp) 字段。该字段必须启用[文档值](/mapping/mapping_parameters/doc_values)。不能是嵌套字段。

  ?> 矢量分片本身不支持几何体集合。对于字段 `geo_shape` 中的 `geometrycollection` 值，API 为集合的每个元素返回一个 `hits` 层特征。这种行为在未来的版本中可能会改变。

- `<zoom>`
  （必需，整数）待搜索的矢量图块的缩放级别。接受 `0-29`。

- `<x>`
  （必需，整数）待搜索的矢量图块 X 坐标。

- `<y>`
  （必需，整数）待搜索的矢量图块 Y 坐标。

## 描述

在内部，Elasticsearch 将矢量图块搜索 API 请求转换为包含以下内容的[搜索](/rest_apis/search_apis/search)：

- `<field>` 上的 [`geo_bounding_box`](/query_dsl/geo_queries/geo_bounding_box) 查询。查询使用 `<zoom>/<x>/<y>` 块作为边界框。

- `<field>` 上的 [`geotile_grid`](/query_dsl/geo_queries/geotile_grid) 或 [`geohex_grid`](/query_dsl/geo_queries/geohex_grid) 聚合。`grid_agg` 参数确定聚合类型。查询使用 `<zoom>/<x>/<y>` 块作为边界框。

- 可选的，`<field>`上 `geo_bounds` 聚合。如果 `exact_bounds` 参数为 `true`，则搜索仅包括此聚合。

- 如果 `with_labels` 的可选参数为 `true`，则内部搜索将包括一个动态运行时字段，该字段调用几何体文档值的 `getLabelPosition` 函数。这可以生成包含建议的几何体标签的新点特征，例如，多个多边形将只有一个标签。

例如，Elasticsearch 可以将具有 `geotile` 的 `grid_agg` 参数和为 `true` 的 `exact_bounds` 参数的向量图块搜索 API 请求转换为以下搜索：

```bash
GET my-index/_search
{
  "size": 10000,
  "query": {
    "geo_bounding_box": {
      "my-geo-field": {
        "top_left": {
          "lat": -40.979898069620134,
          "lon": -45
        },
        "bottom_right": {
          "lat": -66.51326044311186,
          "lon": 0
        }
      }
    }
  },
  "aggregations": {
    "grid": {
      "geotile_grid": {
        "field": "my-geo-field",
        "precision": 11,
        "size": 65536,
        "bounds": {
          "top_left": {
            "lat": -40.979898069620134,
            "lon": -45
          },
          "bottom_right": {
            "lat": -66.51326044311186,
            "lon": 0
          }
        }
      }
    },
    "bounds": {
      "geo_bounds": {
        "field": "my-geo-field",
        "wrap_longitude": false
      }
    }
  }
}
```

API 以二进制 [Mapbox 矢量图块](https://github.com/mapbox/vector-tile-spec)的形式返回结果。Mapbox 矢量图块编码为 [Google Protobufs（PBF）](https://github.com/protocolbuffers/protobuf)。默认情况下，互动程序包含三层：

- 一个 `hits` 层，包含与 `geo_bounding_box` 查询匹配的每个 `<field>` 值的特征。

- 包含 `geotile_grid` 或 `geohex_grid` 每个单元的特征的 `aggs` 层。该层仅包含具有匹配数据的单元格的特征。

- `meta` 层包含：

  - 包含边界框的特征。默认情况下，这是块的边界框。

  - `geotile_grid` 或 `geohex_grid` 上任何子聚合的值范围。

  - 搜索的元数据。

API 仅返回可以在其缩放级别显示的功能。例如，如果多边形特征在其缩放级别没有区域，则 API 会忽略它。

API 以 UTF-8 编码的 JSON 形式返回错误。

## 查询参数

!> 你可以将此 API 的几个选项指定为查询参数或请求体参数。如果同时指定这两个参数，则查询参数优先。

- `exact_bounds`
  （可选，布尔值）如果为 `false`，则 `meta` 层的特征是块的边界框。默认为 `false`。

  如果为 `true`，则 `meta` 层的特征是 [`geo_bounds`](/aggregations/metrics_aggregations/geo_bounds) 聚合产生的边界框。聚合在与 `wrap_longitude` 设置为 `false` 的 `〈zoom〉/〈x〉/〈y〉` 平铺相交的 `<field>` 值上运行。生成的边界框可能大于矢量图块。

- `extent`
  （可选，整数）块一侧的大小（以像素为单位）。矢量平铺是等边的正方形。默认值为 `4096`。

- `buffer`
  （可选，整数）块的外部剪切缓冲区的大小（以像素为单位）。这使得渲染器可以避免几何体中的轮廓瑕疵，这些几何体延伸到瓷砖的范围之外。默认为 `5`。

- `grid_agg`
  （可选，字符串）用于为 `<field>` 创建网格的聚合。

  - `grid_agg` 有效值
    - `geotile` **(Default)**
      [geotile_grid](/aggregations/bucket_aggregations/geotile_grid) 聚合。

    - `geohex`
      [geohex_grid](/aggregations/bucket_aggregations/geohex_grid) 聚合。如果指定此值，则 `<field>` 必须是 [`geo_point`](/aggregations/bucket_aggregations/geo_point) 字段。

- `grid_precision`
  （可选，整数）`grid_agg` 中单元格的精度级别。接受 `0`-`8`。默认为 `8`。如果为 `0`，则结果不包括 `aggs` 层。

  - `geotile` 网格精度

    对于 `geotile` 的 `grid_agg`，可以将 `aggs` 层中的单元用作较低缩放级别的块。`grid_precision` 表示通过这些单元格可用的其他缩放级别。最终精度计算如下：

    `<zoom> + grid_precision`

    例如，如果 `<zoom>` 为 `7`，`grid_precision` 为 `8`，则 `geotile_grid` 聚合将使用 `15` 的精度。最大最终精度为 `29`。

    `grid_precision` 还决定了网格的单元数，如下所示：

    `(2^grid_precision) x (2^grid_precision)`

    例如，值 `8` 将分片划分为 256 x 256 个单元格的网格。`aggs` 层仅包含具有匹配数据的单元格的特征。

  - `geohex` 网格精度

    对于 `geohex` 的 `grid_agg`，Elasticsearch 使用 `<zoom>` 和 `grid_precision` 计算最终精度，如下所示：

    `<zoom> + grid_precision`

    该精度决定了 `geohex` 聚集产生的[六边形单元的 H3 分辨率](https://h3geo.org/docs/core-library/restable)。下表显示了每种精度的 H3 分辨率。

    例如，如果 `<zoom>` 为 `3`，`grid_precision` 为 `3`，则精度为 `6`。在精度为 `6` 时，六边形单元格的 H3 分辨率为 `2`。如果 `<zoom>` 为 `3`，`grid_precision` 为 `4`，则精度为 `7`。在精度为 `7` 时，六边形单元格的 H3 分辨率为 `3`。

    |精度|唯一的块箱|H3 分辨率|唯一的六边形箱|比率|
    |--|--|--|--|--|
    |1|4|0|122|30.5
    |2|16|0|122|7.625|
    |3|64|1|842|13.15625|
    |4|256|1|842|3.2890625|
    |5|1024|2|5882|5.744140625|
    |6|4096|2|5882|1.436035156|
    |7|16384|3|41162|2.512329102|
    |8|65536|3|41162|0.6280822754|
    |9|262144|4|288122|1.099098206|
    |10|1048576|4|288122|0.2747745514|
    |11|4194304|5|2016842|0.4808526039|
    |12|16777216|6|14117882|0.8414913416|
    |13|67108864|6|14117882|0.2103728354|
    |14|268435456|7|98825162|0.3681524172|
    |15|1073741824|8|691776122|0.644266719|
    |16|4294967296|8|691776122|0.1610666797|
    |17|17179869184|9|4842432842|0.2818666889|
    |18|68719476736|10|33897029882|0.4932667053|
    |19|274877906944|11|237279209162|0.8632167343|
    |20|1099511627776|11|237279209162|0.2158041836|
    |21|4398046511104|12|1660954464122|0.3776573213|
    |22|17592186044416|13|11626681248842|0.6609003122|
    |23|70368744177664|13|11626681248842|0.165225078|
    |24|281474976710656|14|81386768741882|0.2891438866|
    |25|1125899906842620|15|569707381193162|0.5060018015|
    |26|4503599627370500|15|569707381193162|0.1265004504|
    |27|18014398509482000|15|569707381193162|0.03162511259|
    |28|72057594037927900|15|569707381193162|0.007906278149|
    |29|288230376151712000|15|569707381193162|0.001976569537|

    六边形单元格在矢量图块上没有完全对齐。某些单元格可能与多个矢量图块相交。为了计算每个精度的 H3 分辨率，Elasticsearch 将每个分辨率下六边形箱的平均密度与每个缩放级别下块箱的平均密度进行比较。Elasticsearch 使用最接近相应块密度的 H3 分辨率。

    - `grid_type`
    （可选，字符串）确定 `aggs` 层中特征的几何体类型。在 `aggs` 层中，每个特征代表网格中的一个单元。

      - `grid_type` 可用值

        - `grid`（**默认**）
          每个特征都是单元几何体的`多边形（Polygon）`。对于 `geotile` 的 `grid_agg`，特征是单元格的边界框。对于 `geohex` 的 `grid_agg`，特征是六边形单元的边界。

        - `point`
          每个特征都是一个`点（Point）`，即单元格的质心。

        - `centroid`
          每个特征都是一个`点（Point）`，即单元内数据的质心。对于复杂几何形状，实际质心可能在单元外部。在这些情况下，特征设置为距单元内质心最近的点。
    - `size`
      （可选，整数）在 `hits` 层中返回的最大功能数。接受 `0`-`10000`。默认值为 `10000`。如果为 `0`，则结果不包括 `hits` 层。

    - `track_total_hits`
      （可选，整数或布尔值）与查询匹配以准确计数的点击数。默认值为 `10000`。

      如果为 `true`，则返回准确的点击数，但会牺牲一些性能。如果为 `false`，则响应不包括与查询匹配的总点击数。

    - `with_labels`
      （可选，布尔值）如果为 `true`，`hits` 和 `aggs` 层将包含表示原始特征的建议标签位置的其他点特征。

      - `Point` 和 `MultiPoint` 特征将选择其中一个点。
      - `Polygon` 和 `MultiPolygon` 特征将生成一个单点，即质心（如果位于多边形内），或从[有序三角形树](/mapping/field_data_types/geoshape?id=索引方法)中选择的多边形内的另一个点。
      - `LineString` 特征同样将提供从[三角形树](/mapping/field_data_types/geoshape?id=索引方法)中选择的大致中心点。
      - 聚合结果将为每个聚合桶提供一个中心点。

      原始特征的所有属性也将复制到新的标签特征。此外，使用标签 `_mvt_label_position` 可以区分新功能。

## 请求体

- `aggs`
  （可选，[聚合对象](/aggregations/aggregations)）`grid_agg` 的子聚合。支持以下聚合类型：

  - [avg](/aggregations/metrics_aggregations/avg)
  - [boxplot](/aggregations/metrics_aggregations/boxplot)
  - [cardinality](/aggregations/metrics_aggregations/cardinality)
  - [extended stats](/aggregations/metrics_aggregations/extended_stats)
  - [max](/aggregations/metrics_aggregations/max)
  - [median absolute deviation](/aggregations/metrics_aggregations/median_absolute_deviation)
  - [min](/aggregations/metrics_aggregations/min)
  - [percentile](/aggregations/metrics_aggregations/percentiles)
  - [percentile-rank](/aggregations/metrics_aggregations/percentile_ranks)
  - [stats](/aggregations/metrics_aggregations/stat)
  - [sum](/aggregations/metrics_aggregations/sum)
  - [value count](/aggregations/metrics_aggregations/value_count)

  聚合名称不能以 `_mvt_` 开头。`_mvt_` 前缀是为内部聚合保留的。

- `exact_bounds`
  （可选，布尔值）如果为 `false`，则 `meta` 层的特征是块的边界框。默认为 `false`。

  如果为 `true`，则 `meta` 层的特征是 [geo_bounds](/aggregations/metrics_aggregations/geo_bounds) 边界聚合产生的边界框。聚合在与 `wrap_longitude` 设置为 `false` 的 `〈zoom〉/〈x〉/〈y〉` 平铺相交的 `<field>` 值上运行。生成的边界框可能大于矢量图块。

- `extent`
  （可选，整数）块一侧的像素大小。矢量平铺是等边的正方形。默认值为 `4096`。

- `buffer`
  （可选，整数）分幅外部剪切缓冲区的像素大小。这使得渲染器可以避免几何体中的轮廓瑕疵，延伸到块的范围之外。默认为 `5`。

- `fields`
  （可选，字符串或对象数组）要在 `hits` 层中返回的字段。支持通配符（*）。

  此参数不支持具有[数组值](/mapping/field_data_types/arrays)的字段。具有数组值的字段可能返回不一致的结果。

  可以将数组中的字段指定为字符串或对象。

  - `fields` 对象属性

    - `field`
      （必需，字符串）返回的字段。支持通配符（*）。

    - `format`
      （可选，字符串）日期和地理空间字段的格式。其他字段数据类型不支持此参数。

      [`date`](/mapping/field_data_types/date) 和 [`date_nanos`](/mapping/field_data_types/date_nanoseconds) 字段接受[日期格式](/mapping/mapping_parameters/format)。[`geo_point`](/mapping/field_data_types/geopoint) 和 [`geo_shape`](/mapping/field_data_types/geoshape) 字段接受：

      - `geojson`（默认）
        [GeoJSON](http://www.geojson.org/)

      - `wkt`
        [Well Known Text/知名文本](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry)

      - `mvt(<zoom>/<x>/<y>@<extent>) or mvt(<zoom>/<x>/<y>)`
        地图盒矢量块。此 API 返回的块是 base64 编码的字符串。
        - `mvt` 参数
          - `<zoom>`
            （必需，整数）块的缩放级别。支持 `0`-`29`。
          - `<x>`
            （必需，整数）块的 X 坐标。
          - `<y>`
            （必需，整数）块的 Y 坐标。
          - `<extent>`
            （可选，整数）平铺一侧的大小（以像素为单位）。矢量平铺是等边的正方形。默认为 `4,096`。

- `grid_agg`
  （可选，字符串）用于为 `<field>` 创建网格的聚合。

  - `grid_agg` 可用值

    - `geotile` **(Default)**
      [geotile_grid](/aggregations/bucket_aggregations/geotile_grid) 聚合。

    - `geohex`
      [geohex_grid](/aggregations/bucket_aggregations/geohex_grid) 聚合。如果指定此值，则 `<field>` 必须是 [`geo_point`](/aggregations/bucket_aggregations/geo_point) 字段。

- `grid_precision`
  （可选，整数）`grid_agg` 中单元格的精度级别。接受 `0`-`8`。默认为 `8`。如果为 `0`，则结果不包括 `aggs` 层。

  - `geotile` 网格精度

    对于 `geotile` 的 `grid_agg`，可以将 `aggs` 层中的单元用作较低缩放级别的块。`grid_precision` 表示通过这些单元格可用的其他缩放级别。最终精度计算如下：

    `<zoom> + grid_precision`

    例如，如果 `<zoom>` 为 `7`，`grid_precision` 为 `8`，则 `geotile_grid` 聚合将使用 `15` 的精度。最大最终精度为 `29`。

    `grid_precision` 还决定了网格的单元数，如下所示：

    `(2^grid_precision) x (2^grid_precision)`

    例如，值 `8` 将分片划分为 256 x 256 个单元格的网格。`aggs` 层仅包含具有匹配数据的单元格的特征。

  - `geohex` 网格精度

    对于 `geohex` 的 `grid_agg`，Elasticsearch 使用 `<zoom>` 和 `grid_precision` 计算最终精度，如下所示：

    `<zoom> + grid_precision`

    该精度决定了 `geohex` 聚集产生的[六边形单元的 H3 分辨率](https://h3geo.org/docs/core-library/restable)。下表显示了每种精度的 H3 分辨率。

    例如，如果 `<zoom>` 为 `3`，`grid_precision` 为 `3`，则精度为 `6`。在精度为 `6` 时，六边形单元格的 H3 分辨率为 `2`。如果 `<zoom>` 为 `3`，`grid_precision` 为 `4`，则精度为 `7`。在精度为 `7` 时，六边形单元格的 H3 分辨率为 `3`。

    |精度|唯一的块箱|H3 分辨率|唯一的六边形箱|比率|
    |--|--|--|--|--|
    |1|4|0|122|30.5
    |2|16|0|122|7.625|
    |3|64|1|842|13.15625|
    |4|256|1|842|3.2890625|
    |5|1024|2|5882|5.744140625|
    |6|4096|2|5882|1.436035156|
    |7|16384|3|41162|2.512329102|
    |8|65536|3|41162|0.6280822754|
    |9|262144|4|288122|1.099098206|
    |10|1048576|4|288122|0.2747745514|
    |11|4194304|5|2016842|0.4808526039|
    |12|16777216|6|14117882|0.8414913416|
    |13|67108864|6|14117882|0.2103728354|
    |14|268435456|7|98825162|0.3681524172|
    |15|1073741824|8|691776122|0.644266719|
    |16|4294967296|8|691776122|0.1610666797|
    |17|17179869184|9|4842432842|0.2818666889|
    |18|68719476736|10|33897029882|0.4932667053|
    |19|274877906944|11|237279209162|0.8632167343|
    |20|1099511627776|11|237279209162|0.2158041836|
    |21|4398046511104|12|1660954464122|0.3776573213|
    |22|17592186044416|13|11626681248842|0.6609003122|
    |23|70368744177664|13|11626681248842|0.165225078|
    |24|281474976710656|14|81386768741882|0.2891438866|
    |25|1125899906842620|15|569707381193162|0.5060018015|
    |26|4503599627370500|15|569707381193162|0.1265004504|
    |27|18014398509482000|15|569707381193162|0.03162511259|
    |28|72057594037927900|15|569707381193162|0.007906278149|
    |29|288230376151712000|15|569707381193162|0.001976569537|

    六边形单元格在矢量图块上没有完全对齐。某些单元格可能与多个矢量图块相交。为了计算每个精度的 H3 分辨率，Elasticsearch 将每个分辨率下六边形箱的平均密度与每个缩放级别下块箱的平均密度进行比较。Elasticsearch 使用最接近相应块密度的 H3 分辨率。

- `grid_type`
  （可选，字符串）确定 `aggs` 层中特征的几何体类型。在 `aggs` 层中，每个特征代表网格中的一个单元。

  - `grid_type` 可用值

    - `grid`（**默认**）
      每个特征都是单元几何体的`多边形（Polygon）`。对于 `geotile` 的 `grid_agg`，特征是单元格的边界框。对于 `geohex` 的 `grid_agg`，特征是六边形单元的边界。

    - `point`
      每个特征都是一个`点（Point）`，即单元格的质心。

    - `centroid`
      每个特征都是一个`点（Point）`，即单元内数据的质心。对于复杂几何形状，实际质心可能在单元外部。在这些情况下，特征设置为距单元内质心最近的点。

- `query`
  （可选，对象）[查询 DSL 对象](/query_dsl/query_dsl)用于搜索过滤文档。

- `runtime_mappings`
  （可选，对象）在搜索请求中定义一个或多个[运行时字段](/mapping/runtime_fields/define_runtime_fields_in_a_search_request)。这些字段优先于具有相同名称的映射字段。

  - `runtime_mappings` 对象属性

    - `<field-name>`
      （必需，对象）配置运行时字段。键（key）是字段名字。

      - `<field-name>` 属性
        - `type`
          （必需，字符串）[字段类型](/mapping/field_data_types)，可以是以下任一种：
          - `boolean`
            - `composite`
            - `date`
            - `double`
            - `geo_point`
            - `ip`
            - `keyword`
            - `long`
          - `script`
            （可选，字符串）查询时执行的 [Plainless Script](/scripting/how_to_write_script/how_to_write_script)。脚本可以访问文档的整个上下文，包括原始 `_source` 和任何映射字段及其值。

            此脚本必须包含 `emit` 以返回计算值。例如：

            ```bash
            "script": "emit(doc['@timestamp'].value.dayOfWeekEnum.toString())"
            ```

- `size`
  （可选，整数）在 `hits` 层中返回的最大功能数。接受 `0`-`10000`。默认值为 `10000`。如果为 `0`，则结果不包括 `hits` 层。

- `sort`
  （可选，[排序对象](/search_your_data/sort_search_results)数组）`hits` 层排序特性。

  默认情况下，API 为每个特征计算边界框。它根据该框的对角线长度对特征进行排序，从最长到最短。

- `track_total_hits`
  （可选，整数或布尔值）与查询匹配以准确计数的点击数。默认值为 `10000`。

  如果为 `true`，则返回准确的点击数，但会牺牲一些性能。如果为 `false`，则响应不包括与查询匹配的总点击数。

- `with_labels`
  （可选，布尔值）如果为 `true`，`hits` 和 `aggs` 层将包含表示原始特征的建议标签位置的其他点特征。

  - `Point` 和 `MultiPoint` 特征将选择其中一个点。
  - `Polygon` 和 `MultiPolygon` 特征将生成一个单点，即质心（如果位于多边形内），或从[有序三角形树](/mapping/field_data_types/geoshape?id=索引方法)中选择的多边形内的另一个点。
  - `LineString` 特征同样将提供从[三角形树](/mapping/field_data_types/geoshape?id=索引方法)中选择的大致中心点。
  - 聚合结果将为每个聚合桶提供一个中心点。

  原始特征的所有属性也将复制到新的标签特征。此外，使用标签 `_mvt_label_position` 可以区分新功能。

## 响应

返回的矢量图块包含以下数据：

- `hits`
  （对象）层包含 `geo_bounding_box` 查询结果。

  - `hits` 属性

    - `extent`
      （可选，整数）块一侧的大小（以像素为单位）。矢量平铺是等边的正方形。
    - `version`
      （整数）[Mapbox 矢量图块规范](https://github.com/mapbox/vector-tile-spec)的主要版本号。
    - `features`
      （对象数组）特性数组。包含与 `geo_bounding_box` 查询匹配的每个 `<field>` 值的特征。
      - `features` 对象属性
        - `geometry`
          （对象）特性的几何图形。
          - `geometry` 属性
            - `type`
              （字符串）特征的几何图形类型。可用值为：
              - `UNKNOWN`
              - `POINT`
              - `LINESTRING`
              - `POLYGON`
            - `coordinates`
              （整数数组或二重数组）特性的坐标。
      - `properties`
        （对象）特性的属性。
        - `properties` 属性
          - `_id`
            （字符串）特性文档的文档 `_id`。
          - `_index`
            （字符串）特性文档的索引名字。
          - `<field>`
            字段值。仅返回 `fields` 参数的字段。
      - `type`
        （整数）特性几何体类型的标识符。数值为：
        - `1`(`POINT`)
        - `2`(`LINESTRING`)
        - `3`(`POLYGON`)

- `aggs`
  （对象）包含 `grid_agg` 聚合及其子聚合结果的层。
  - `aggs` 属性
    - `extent`
      （可选，整数）块一侧的大小（以像素为单位）。矢量平铺是等边的正方形。
    - `version`
      （整数）[Mapbox 矢量图块规范](https://github.com/mapbox/vector-tile-spec)的主要版本号。
    - `features`
      （对象数组）特性数组。包含与 `geo_bounding_box` 查询匹配的每个 `<field>` 值的特征。
      - `features` 对象属性
        - `geometry`
          （对象）特性的几何图形。
          - `geometry` 属性
            - `type`
              （字符串）特征的几何图形类型。可用值为：
              - `UNKNOWN`
              - `POINT`
              - `LINESTRING`
              - `POLYGON`
            - `coordinates`
              （整数数组或二重数组）特性的坐标。
      - `properties`
        （对象）特性的属性。
        - `properties` 属性
          - `_count`
            （长整型）单元格文档的计数。
          - `_key`
            （字符串）单元格的桶（Bucket）键，格式为 `<zoom>/<x>/<y>`。
          - `<sub-aggregation>.value`
            单元格的子聚集结果。仅针对 `aggs` 参数中的子聚合返回。
      - `type`
        （整数）特性几何体类型的标识符。数值为：
        - `1`(`POINT`)
        - `2`(`LINESTRING`)
        - `3`(`POLYGON`)

- `meta`
  （对象）包含请求元数据的层。
  - `meta` 属性
    - `extent`
      （可选，整数）块一侧的大小（以像素为单位）。矢量平铺是等边的正方形。
    - `version`
      （整数）[Mapbox 矢量图块规范](https://github.com/mapbox/vector-tile-spec)的主要版本号。
    - `features`
      （对象数组）特性数组。包含与 `geo_bounding_box` 查询匹配的每个 `<field>` 值的特征。
      - `features` 对象属性
        - `geometry`
          （对象）特性的几何图形。
          - `geometry` 属性
            - `type`
              （字符串）特征的几何图形类型。可用值为：
              - `UNKNOWN`
              - `POINT`
              - `LINESTRING`
              - `POLYGON`
            - `coordinates`
              （整数数组或二重数组）特性的坐标。
      - `properties`
        （对象）特性的属性。
        - `properties` 属性
          - `_shards.failed`
            （整数）无法执行搜索的分片数。参阅搜索 API 的 [`shards`](/rest_apis/search_apis/search?id=响应体) 响应属性。
          - `_shards.skipped`
            （整数）跳过搜索的分片数。参阅搜索 API 的 [`shards`](/rest_apis/search_apis/search?id=响应体) 响应属性。
          - `_shards.successful`
            （整数）成功执行搜索的分片数。参阅搜索 API 的 [`shards`](/rest_apis/search_apis/search?id=响应体) 响应属性。
          - `_shards.total`
            （整数）需要查询的分片总数，包括未分配的分片。参阅搜索 API 的 [`shards`](/rest_apis/search_apis/search?id=响应体) 响应属性。
          - `aggregations._count.avg`
            （浮点数）`aggs` 层中特性的平均 `_count` 值。
          - `aggregations._count.count`
            （整数）`aggs` 层中特性的唯一 `_count` 值的数量。
          - `aggregations._count.max`
            （浮点数）`aggs` 层特性的最大 `_count` 值。
          - `aggregations._count.min`
            （浮点数）`aggs` 层特性的最小 `_count` 值。
          - `aggregations._count.sum`
            （浮点数）`aggs` 层特性的合计 `_count` 值。
          - `aggregations.<sub-aggregation>.avg`
            （浮点数）子聚合结果的平均值。
          - `aggregations.<agg_name>.count`
            （整数）子聚合结果中的唯一值的数量。
          - `aggregations.<agg_name>.max`
            （浮点数）子聚合结果中的最大值。
          - `aggregations.<agg_name>.min`
            （浮点数）子聚合结果中的最小值。
          - `aggregations.<agg_name>.sum`
            （浮点数）子聚合结果中的合计值。
          - `hits.max_score`
            （浮点数）搜索结果的最高文档 `_score`。
          - `hits.total.relation`
            （字符串）指示是否 `hits.total.value` 是准确的或下限。可能的值为：
            - `eq`
              准确值
            - `gte`
              下限值
          - `hits.total.value`
            （整数）搜索命中的总数。
          - `timed_out`
            （布尔值）如果为 `true`，则搜索在完成之前超时。结果可能部分或为空。
          - `took`
            （整数）Elasticsearch 运行搜索所需毫秒。参阅搜索 API 的 [`took`](/rest_apis/search_apis/search?id=请求体) 响应属性。
      - `type`
        （整数）特性几何体类型的标识符。数值为：
        - `1`(`POINT`)
        - `2`(`LINESTRING`)
        - `3`(`POLYGON`)

## 示例

以下请求创建索引 `museum` 并添加几个地理空间 `location` 值。

```bash
PUT museums
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      },
      "name": {
        "type": "keyword"
      },
      "price": {
        "type": "long"
      },
      "included": {
        "type": "boolean"
      }
    }
  }
}

POST museums/_bulk?refresh
{ "index": { "_id": "1" } }
{ "location": "POINT (4.912350 52.374081)", "name": "NEMO Science Museum",  "price": 1750, "included": true }
{ "index": { "_id": "2" } }
{ "location": "POINT (4.901618 52.369219)", "name": "Museum Het Rembrandthuis", "price": 1500, "included": false }
{ "index": { "_id": "3" } }
{ "location": "POINT (4.914722 52.371667)", "name": "Nederlands Scheepvaartmuseum", "price":1650, "included": true }
{ "index": { "_id": "4" } }
{ "location": "POINT (4.914722 52.371667)", "name": "Amsterdam Centre for Architecture", "price":0, "included": true }
```

以下请求在索引中搜索与 `13/4207/2692` 矢量图块相交的位置值。

```bash
GET museums/_mvt/location/13/4207/2692
{
  "grid_agg": "geotile",
  "grid_precision": 2,
  "fields": [
    "name",
    "price"
  ],
  "query": {
    "term": {
      "included": true
    }
  },
  "aggs": {
    "min_price": {
      "min": {
        "field": "price"
      }
    },
    "max_price": {
      "max": {
        "field": "price"
      }
    },
    "avg_price": {
      "avg": {
        "field": "price"
      }
    }
  }
}
```

API 以二进制向量分片的形式返回结果。当解码为 JSON 时，块包含以下数据：

```json
{
  "hits": {
    "extent": 4096,
    "version": 2,
    "features": [
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            3208,
            3864
          ]
        },
        "properties": {
          "_id": "1",
          "_index": "museums",
          "name": "NEMO Science Museum",
          "price": 1750
        },
        "type": 1
      },
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            3429,
            3496
          ]
        },
        "properties": {
          "_id": "3",
          "_index": "museums",
          "name": "Nederlands Scheepvaartmuseum",
          "price": 1650
        },
        "type": 1
      },
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            3429,
            3496
          ]
        },
        "properties": {
          "_id": "4",
          "_index": "museums",
          "name": "Amsterdam Centre for Architecture",
          "price": 0
        },
        "type": 1
      }
    ]
  },
  "aggs": {
    "extent": 4096,
    "version": 2,
    "features": [
      {
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                3072,
                3072
              ],
              [
                4096,
                3072
              ],
              [
                4096,
                4096
              ],
              [
                3072,
                4096
              ],
              [
                3072,
                3072
              ]
            ]
          ]
        },
        "properties": {
          "_count": 3,
          "max_price.value": 1750.0,
          "min_price.value": 0.0,
          "avg_price.value": 1133.3333333333333
        },
        "type": 3
      }
    ]
  },
  "meta": {
    "extent": 4096,
    "version": 2,
    "features": [
      {
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [
                0,
                0
              ],
              [
                4096,
                0
              ],
              [
                4096,
                4096
              ],
              [
                0,
                4096
              ],
              [
                0,
                0
              ]
            ]
          ]
        },
        "properties": {
          "_shards.failed": 0,
          "_shards.skipped": 0,
          "_shards.successful": 1,
          "_shards.total": 1,
          "aggregations._count.avg": 3.0,
          "aggregations._count.count": 1,
          "aggregations._count.max": 3.0,
          "aggregations._count.min": 3.0,
          "aggregations._count.sum": 3.0,
          "aggregations.avg_price.avg": 1133.3333333333333,
          "aggregations.avg_price.count": 1,
          "aggregations.avg_price.max": 1133.3333333333333,
          "aggregations.avg_price.min": 1133.3333333333333,
          "aggregations.avg_price.sum": 1133.3333333333333,
          "aggregations.max_price.avg": 1750.0,
          "aggregations.max_price.count": 1,
          "aggregations.max_price.max": 1750.0,
          "aggregations.max_price.min": 1750.0,
          "aggregations.max_price.sum": 1750.0,
          "aggregations.min_price.avg": 0.0,
          "aggregations.min_price.count": 1,
          "aggregations.min_price.max": 0.0,
          "aggregations.min_price.min": 0.0,
          "aggregations.min_price.sum": 0.0,
          "hits.max_score": 0.0,
          "hits.total.relation": "eq",
          "hits.total.value": 3,
          "timed_out": false,
          "took": 2
        },
        "type": 3
      }
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-vector-tile-api.html)
