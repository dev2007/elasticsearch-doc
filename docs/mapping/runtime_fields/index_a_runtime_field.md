# 索引运行时字段

运行时字段由它运行的上下文定义。例如，你可以在搜索查询的上下文中定义运行时字段，或者在索引映射的 `runtime` 部分定义运行时字段。如果你想获得更好的性能，可以将完整的运行时字段定义（包括脚本）移到索引映射中。Elasticsearch 会自动使用已索引的字段来驱动查询，从而获得更快的响应速度。

你只需编写一次脚本，就可以在任何支持运行时字段的上下文中使用它。

:::danger[重要]
目前不支持索引 `composite` 类型的运行时字段。
:::

由于脚本在索引时运行，你可以在脚本中使用 `params` 来包含索引文档中可用的其他配置参数。

在将运行时字段编入索引之后，你无法更新其中包含的脚本。如需进行更改，必须创建一个新字段。

例如，创建一个包含四个字段的索引：`timestamp`（日期）、`temperature`（长整型）、`voltage`（双精度浮点型）和 `node`（关键字）：

```bash
PUT my-index-000001/
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "temperature": { "type": "long" },
      "voltage": { "type": "double" },
      "node": { "type": "keyword" }
    }
  }
}
```

批量写入一些传感器数据：

```bash
POST my-index-000001/_bulk?refresh=true
{"index":{}}
{"timestamp": 1516729294000, "temperature": 200, "voltage": 5.2, "node": "a"}
{"index":{}}
{"timestamp": 1516642894000, "temperature": 201, "voltage": 5.8, "node": "b"}
{"index":{}}
{"timestamp": 1516556494000, "temperature": 202, "voltage": 5.1, "node": "a"}
{"index":{}}
{"timestamp": 1516470094000, "temperature": 198, "voltage": 5.6, "node": "b"}
{"index":{}}
{"timestamp": 1516383694000, "temperature": 200, "voltage": 4.2, "node": "c"}
{"index":{}}
{"timestamp": 1516297294000, "temperature": 202, "voltage": 4.0, "node": "c"}
```

定义一个将 `voltage` 值乘以系数 2 的运行时字段：

```bash
PUT my-index-000001/_mapping
{
  "runtime": {
    "voltage_corrected": {
      "type": "double",
      "script": {
        "source": """
        emit(doc['voltage'].value * params['multiplier'])
        """,
        "params": { "multiplier": 2 }
      }
    }
  }
}
```

使用 `_search` API 上的 `fields` 参数检索计算后的 `voltage_corrected` 值：

```bash
GET my-index-000001/_search
{
  "fields": ["voltage_corrected", "node"],
  "size": 2
}
```

稍后你确定系数应该是 4，此时可以将运行时字段转为已索引字段。在索引映射的 `properties` 中添加字段定义，并包含 `on_script_error` 参数：

```bash
PUT my-index-000001/
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "temperature": { "type": "long" },
      "voltage": { "type": "double" },
      "node": { "type": "keyword" },
      "voltage_corrected": {
        "type": "double",
        "on_script_error": "fail",
        "script": {
          "source": """
          emit(doc['voltage'].value * params['multiplier'])
          """,
          "params": { "multiplier": 4 }
        }
      }
    }
  }
}
```

:::note[提示]
如果脚本在索引时抛出错误，`on_script_error` 参数会决定相应行为。设置为 `fail`（默认）会拒绝整个文档。设置为 `ignore` 会将该字段记录到文档的 `_ignored` 元数据中，并继续索引文档。
:::

再次批量写入相同的传感器数据，这次 `voltage_corrected` 字段的值会在索引时通过脚本计算得出。

由于 `voltage_corrected` 已是索引字段，你可以对其运行 range 查询：

```bash
POST my-index-000001/_search
{
  "query": {
    "range": {
      "voltage_corrected": { "gte": 16, "lte": 20, "boost": 1.0 }
    }
  },
  "fields": ["voltage_corrected", "node"]
}
```

响应中返回匹配范围内的已索引字段值：

```json
{
  "hits": {
    "total": { "value": 2, "relation": "eq" },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "yoSLrHgBdg9xpPrUZz_P",
        "_score": 1.0,
        "_source": {
          "timestamp": 1516383694000,
          "temperature": 200,
          "voltage": 4.2,
          "node": "c"
        },
        "fields": {
          "voltage_corrected": [16.8],
          "node": ["c"]
        }
      },
      {
        "_index": "my-index-000001",
        "_id": "y4SLrHgBdg9xpPrUZz_P",
        "_score": 1.0,
        "_source": {
          "timestamp": 1516297294000,
          "temperature": 202,
          "voltage": 4.0,
          "node": "c"
        },
        "fields": {
          "voltage_corrected": [16.0],
          "node": ["c"]
        }
      }
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/runtime-indexed.html)
