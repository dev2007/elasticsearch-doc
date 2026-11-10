# alias 字段类型

alias 映射为索引中的字段定义一个备用名称。在搜索请求以及字段能力（field capabilities）等选定的其他 API 中，可以使用别名替代目标字段。

```bash
PUT trips
{
  "mappings": {
    "properties": {
      "distance": {
        "type": "long"
      },
      "route_length_miles": {
        "type": "alias",
        "path": "distance"
      },
      "transit_mode": {
        "type": "keyword"
      }
    }
  }
}

GET _search
{
  "query": {
    "range" : {
      "route_length_miles" : {
        "gte" : 39
      }
    }
  }
}
```

:::note[提示]
`path` 为目标字段的路径。注意这必须是完整路径，包括任何父对象（例如 `object1.object2.field`）。
:::

搜索请求的几乎所有组件都接受字段别名。特别是，别名可用于查询、聚合和排序字段，也可用于请求 `docvalue_fields`、`stored_fields`、建议和突出显示时。脚本在访问字段值时也支持别名。例外情况参阅不支持的 API 部分。

在搜索请求的某些部分以及请求字段能力时，可以提供字段通配符模式。在这些情况下，通配符模式除了匹配具体字段外，还会匹配字段别名：

```bash
GET trips/_field_caps?fields=route_*,transit_mode
```

## 别名目标

别名对其目标有一些限制：

- 目标必须是具体字段，而不能是对象或另一个字段别名。
- 目标字段必须在创建别名时已经存在。
- 如果定义了嵌套对象，字段别名必须与其目标具有相同的嵌套作用域。

此外，一个字段别名只能有一个目标。这意味着无法使用字段别名在单个子句中查询多个目标字段。

可以通过映射更新将别名改为指向新目标。一个已知的限制是，如果任何已存储的 percolator 查询包含该字段别名，它们仍会指向其原始目标。更多信息参阅 percolator 文档。

## 不支持的 API

不支持对字段别名进行写入：尝试在索引或更新请求中使用别名会导致失败。同样，别名不能用作 `copy_to` 的目标，也不能用于多字段。

由于别名名称不存在于文档源中，因此执行源过滤时不能使用别名。例如，以下请求对 `_source` 将返回空结果：

```bash
GET /_search
{
  "query" : {
    "match_all": {}
  },
  "_source": "route_length_miles"
}
```

目前只有搜索和字段能力 API 接受并解析字段别名。其他接受字段名称的 API（例如词向量 API）不能与字段别名一起使用。

最后，某些查询（例如 `terms`、`geo_shape` 和 `more_like_this`）允许从已索引的文档中获取查询信息。由于获取文档时不支持字段别名，查询中指定查找路径的部分不能通过别名来引用字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/field-alias.html)
