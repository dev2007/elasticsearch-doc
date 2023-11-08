# kNN 搜索 API

:::caution 警告
此功能在技术预览版中，可能会在未来的版本中更改或删除。Elastic将尽最大努力解决任何问题，但技术预览中的功能不受正式 GA 功能的支持 SLA 的约束。
:::

执行 k-最近邻（k-nearest neighbor,kNN）搜索并返回匹配的文档。

```bash
GET my-index/_knn_search
{
  "knn": {
    "field": "image_vector",
    "query_vector": [0.3, 0.1, 1.2],
    "k": 10,
    "num_candidates": 100
  },
  "_source": ["name", "date"]
}
```

## 请求

`GET <target>/_knn_search`

`POST <target>/_knn_search`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或别名必须有[索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

kNN 搜索 API 在 [`dense_vector`](/mapping/dense_vector) 字段上执行 k-最近邻（kNN）搜索。给定一个查询向量，它会找到 `k` 个最接近的向量，并将这些文档作为搜索结果返回。

Elasticsearch 使用 [HNSW 算法](https://arxiv.org/abs/1603.09320)来支持高效的 kNN 搜索。与大多数 kNN 算法一样，HNSW 是一种近似方法，它牺牲了结果的准确性以提高搜索速度。这意味着返回的结果并不总是真正的 `k` 近邻。

## 路径参数

- `<target>`
  
  （可选，字符串）限制请求的逗号分隔的数据流、索引和别名的列表。支持通配符（*）。要以所有数据流和索引为目标，忽略此参数或使用 `*` 或 `_all`。

  :::caution 警告
  kNN 搜索还不能处理[过滤的别名](/aliases#过滤的别名)。对过滤后的别名运行 kNN 搜索可能会错误地导致少于 *k* 次点击。
  :::

## 查询参数

- `routing`
  
  （可选，字符串）用于路由操作到指定分片的自定义值。

## 请求体

- `knn`
  
  （必需，对象）定义运行的 kNN 查询。
  
  - `knn` 对象属性

    - `field`

      （必需，字符串）要搜索的向量字段的名称。必须是[启用索引的 dense_vector](/mapping/dense_vector#kNN-搜索的索引向量)。

    - `query_vector`

      （必需，浮点数组）查询向量。必须与要搜索的向量场具有相同的维数。

    - `k`

      （必需，整数）作为优先命中返回的最近邻居数。值必须小于 `num_candidates`。

    - `num_candidates`

      （必需，整数）每个分片要考虑的最近邻候选数。不能超过 10,000。Elasticsearch 从每个分片中收集 `num_candidates` 个结果，然后合并它们以找到前 `k` 个结果。增加 `num_candidates` 往往会提高最终 `k`结果的准确性。

- `docvalue_fields`

  （可选，字符串和对象数组）通配符（*）模式数组。该请求返回响应的 `hits.fields` 属性中与这些模式匹配的字段名的文档值。

  你可以在数组中指定字符串或对象。参阅[文档值字段](/search_your_data/retrieve_selected_fields#文档值字段)。

  - `docvalue_fields` 对象属性

    - `field`

      （必需，字符串）通配符模式。请求返回与此模式匹配的字段名的文档值。

    - `format`

      （可选，字符串）返回文档值的格式。

      对于[日期字段](/mapping/field_data_types/date)，你可以指定日期的[日期格式](/mapping/mapping_parameters/format)。对于[数字字段](/mapping/field_data_types/numeric)，你可以指定[十进制模式](https://docs.oracle.com/javase/8/docs/api/java/text/DecimalFormat.html)。

      对于其他字段数据类型，此参数不支持。

- `fields`

  （可选，字符串和对象数组）通配符（*）模式数组。该请求返回响应的 `hits.fields` 属性中与这些模式匹配的字段名的文档值。

  你可以在数组中指定字符串或对象。

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

- `_source`

  （可选）指示为匹配文档返回的[源字段](/mapping/metadata_fields/_source-field)。这些字段将在搜索响应的属性 `hits._source` 中返回。默认为 `true`。

  - `_source` 有效值

    - `true`

      （布尔值）全部文档源返回。

    - `false`

      （布尔值）文档源不返回。

    - `<string>`

      （字符串）逗号分隔的待返回的源字段列表。支持通配符（*）。

- `stored_fields`

  （可选，字符串）以逗号分隔的存储字段列表，作为命中的一部分返回。如果未指定字段，则响应中不包括存储的字段。

  如果指定了此字段，则 `_source` 参数默认为 `false`。你可以传递 `_source:true` 以返回搜索响应中的源字段和存储字段。

## 响应体

kNN 搜索响应的结构与[搜索 API 响应](/rest_apis/search_apis/search#响应体)的结构完全相同。但是，某些部分对 kNN 搜索有特定的含义：

- [文档 _score](/rest_apis/search_apis/search#响应体)由查询和文档向量之间的相似性决定。参阅[相似性](/mapping/dense_vector#稠密向量场的参数)。

- `hits.total` 对象包含考虑的最近邻候选总数，即 `num_candidates * num_shards`。`hits.total.relation` 总是 `eq`，表示精确的值。 

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search-api.html)
