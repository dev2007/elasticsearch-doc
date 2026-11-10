# 查询时覆盖字段值

如果你创建了一个与映射中已有字段同名的运行时字段，该运行时字段会**遮蔽**（shadow）已映射的字段。在查询时，Elasticsearch 会计算运行时字段，基于脚本计算出一个值，并将该值作为查询结果的一部分返回。由于运行时字段遮蔽了已映射字段，你可以在不修改已映射字段的情况下覆盖搜索中返回的值。

例如，假设你将以下文档索引到 `my-index-000001`：

```bash
POST my-index-000001/_bulk?refresh=true
{"index":{}}
{"@timestamp":1516729294000,"model_number":"QVKC92Q","measures":{"voltage":5.2}}
{"index":{}}
{"@timestamp":1516642894000,"model_number":"QVKC92Q","measures":{"voltage":5.8}}
{"index":{}}
{"@timestamp":1516556494000,"model_number":"QVKC92Q","measures":{"voltage":5.1}}
{"index":{}}
{"@timestamp":1516470094000,"model_number":"QVKC92Q","measures":{"voltage":5.6}}
{"index":{}}
{"@timestamp":1516383694000,"model_number":"HG537PU","measures":{"voltage":4.2}}
{"index":{}}
{"@timestamp":1516297294000,"model_number":"HG537PU","measures":{"voltage":4.0}}
```

后来你发现 `HG537PU` 传感器上报的并不是真实电压。索引中的值本应是上报值的 1.7 倍！你无需重新索引数据，只需在 `_search` 请求的 `runtime_mappings` 部分定义一个脚本来遮蔽 `voltage` 字段，并在查询时计算新值。

如果你搜索型号匹配 `HG537PU` 的文档：

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "model_number": "HG537PU"
    }
  }
}
```

响应中包含匹配型号 `HG537PU` 的文档的索引值：

```json
{
  ...
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0296195,
    "hits" : [
      {
        "_index" : "my-index-000001",
        "_id" : "F1BeSXYBg_szTodcYCmk",
        "_score" : 1.0296195,
        "_source" : {
          "@timestamp" : 1516383694000,
          "model_number" : "HG537PU",
          "measures" : {
            "voltage" : 4.2
          }
        }
      },
      {
        "_index" : "my-index-000001",
        "_id" : "l02aSXYBkpNf6QRDO62Q",
        "_score" : 1.0296195,
        "_source" : {
          "@timestamp" : 1516297294000,
          "model_number" : "HG537PU",
          "measures" : {
            "voltage" : 4.0
          }
        }
      }
    ]
  }
}
```

以下请求定义了一个运行时字段，其中的脚本会对值为 `HG537PU` 的 `model_number` 字段进行判断。对于每个匹配项，脚本会将 `voltage` 字段的值乘以 1.7。

使用 `_search` API 上的 `fields` 参数，你可以检索脚本为匹配搜索请求的文档计算出的 `measures.voltage` 字段值：

```bash
POST my-index-000001/_search
{
  "runtime_mappings": {
    "measures.voltage": {
      "type": "double",
      "script": {
        "source":
        """
        if (doc['model_number.keyword'].value.equals('HG537PU'))
        {emit(1.7 * params._source['measures']['voltage']);}
        else{emit(params._source['measures']['voltage']);}
        """
      }
    }
  },
  "query": {
    "match": {
      "model_number": "HG537PU"
    }
  },
  "fields": ["measures.voltage"]
}
```

查看响应，每个结果的 `measures.voltage` 计算值分别为 7.14 和 6.8。这才是正确的值！运行时字段在搜索请求过程中计算了这个值，而没有修改已映射的值，后者仍然会在响应中返回：

```json
{
  ...
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0296195,
    "hits" : [
      {
        "_index" : "my-index-000001",
        "_id" : "F1BeSXYBg_szTodcYCmk",
        "_score" : 1.0296195,
        "_source" : {
          "@timestamp" : 1516383694000,
          "model_number" : "HG537PU",
          "measures" : {
            "voltage" : 4.2
          }
        },
        "fields" : {
          "measures.voltage" : [
            7.14
          ]
        }
      },
      {
        "_index" : "my-index-000001",
        "_id" : "l02aSXYBkpNf6QRDO62Q",
        "_score" : 1.0296195,
        "_source" : {
          "@timestamp" : 1516297294000,
          "model_number" : "HG537PU",
          "measures" : {
            "voltage" : 4.0
          }
        },
        "fields" : {
          "measures.voltage" : [
            6.8
          ]
        }
      }
    ]
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/runtime-override-values.html)
