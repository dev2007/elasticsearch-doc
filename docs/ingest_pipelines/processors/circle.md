# Circle 处理器

将圆形（circle）形状定义转换为近似该圆形的正多边形（regular polygon）。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 解释为圆形的字段。可以是 WKT 格式的字符串，或 GeoJSON 格式的 map。 |
| `target_field` | 否 | `field` | 分配多边形形状的目标字段。默认情况下原字段被就地更新。 |
| `ignore_missing` | 否 | `false` | 如果为 `true` 且字段不存在，处理器将静默退出而不修改文档。 |
| `error_distance` | 是 | - | 生成的内切圆心到边的距离与圆半径之间的差值（对 `geo_shape` 以米为单位，对 `shape` 为无单位值）。 |
| `shape_type` | 是 | - | 处理圆形时使用的字段映射类型：`geo_shape` 或 `shape`。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

## 示例

创建 `circles` 索引并定义管道：

```bash
PUT circles
{
  "mappings": {
    "properties": {
      "circle": {
        "type": "geo_shape"
      }
    }
  }
}

PUT _ingest/pipeline/polygonize_circles
{
  "description": "translate circle to polygon",
  "processors": [
    {
      "circle": {
        "field": "circle",
        "error_distance": 28.0,
        "shape_type": "geo_shape"
      }
    }
  ]
}
```

::::note 提示
使用上述管道，我们可以尝试向 `circles` 索引写入文档。圆形可以表示为 WKT 圆形或 GeoJSON 圆形。生成的多边形将使用与输入圆形相同的格式进行表示和索引：WKT 圆形会被转换为 WKT 多边形，GeoJSON 圆形会被转换为 GeoJSON 多边形。

**包含极点（pole）的圆形不受支持。**
::::

## 以 WKT 格式定义的圆形示例

在此示例中，写入一个以 WKT 格式定义的圆形。

```bash
PUT circles/_doc/1?pipeline=polygonize_circles
{
  "circle": "CIRCLE (30 10 40)"
}

GET circles/_doc/1
```

上述索引请求的响应：

```json
{
  "found": true,
  "_index": "circles",
  "_id": "1",
  "_version": 1,
  "_seq_no": 22,
  "_primary_term": 1,
  "_source": {
    "circle": "POLYGON ((30.000365257263184 10.0, 30.000111397193788 10.00034284530941, 29.999706043744222 10.000213571721195, 29.999706043744222 9.999786428278805, 30.000111397193788 9.99965715469059, 30.000365257263184 10.0))"
  }
}
```

## 以 GeoJSON 格式定义的圆形示例

在此示例中，写入一个以 GeoJSON 格式定义的圆形。

```bash
PUT circles/_doc/2?pipeline=polygonize_circles
{
  "circle": {
    "type": "circle",
    "radius": "40m",
    "coordinates": [30, 10]
  }
}

GET circles/_doc/2
```

上述索引请求的响应：

```json
{
  "found": true,
  "_index": "circles",
  "_id": "2",
  "_version": 1,
  "_seq_no": 22,
  "_primary_term": 1,
  "_source": {
    "circle": {
      "coordinates": [
        [
          [30.000365257263184, 10.0],
          [30.000111397193788, 10.00034284530941],
          [29.999706043744222, 10.000213571721195],
          [29.999706043744222, 9.999786428278805],
          [30.000111397193788, 9.99965715469059],
          [30.000365257263184, 10.0]
        ]
      ],
      "type": "Polygon"
    }
  }
}
```

## 关于精度的说明

表示圆形的多边形的精度由 `error_distance` 定义。该差值越小，多边形就越接近完美的圆形。

下表旨在帮助说明不同输入下，圆形的半径如何影响生成的多边形边数。

**多边形的最小边数为 4，最大边数为 1000。**

| error_distance | 半径（米） | 多边形边数 |
|:--|:--|:--|
| 1.00 | 1.0 | 4 |
| 1.00 | 10.0 | 14 |
| 1.00 | 100.0 | 45 |
| 1.00 | 1000.0 | 141 |
| 1.00 | 10000.0 | 445 |
| 1.00 | 100000.0 | 1000 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/ingest-circle-processor.html)
