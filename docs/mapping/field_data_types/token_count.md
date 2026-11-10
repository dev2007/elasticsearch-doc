# token_count 字段类型

`token_count` 类型的字段实际上是一个接受字符串值的整数字段，它分析字符串，然后索引字符串中词元的数量。

例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "fields": {
          "length": {
            "type":     "token_count",
            "analyzer": "standard"
          }
        }
      }
    }
  }
}

# name 字段是一个使用默认 standard 分析器的 text 字段
# name.length 字段是一个 token_count 多字段，它会索引 name 字段中的词元数量
PUT my-index-000001/_doc/1
{ "name": "John Smith" }

PUT my-index-000001/_doc/2
{ "name": "Rachel Alice Williams" }

# 此查询只匹配包含 Rachel Alice Williams 的文档，因为它包含三个词元
GET my-index-000001/_search
{
  "query": {
    "term": {
      "name.length": 3
    }
  }
}
```

## `token_count` 字段的参数

`token_count` 字段接受以下参数：

- `analyzer`
  （必需，字符串）应用于分析字符串值的分析器。为了获得最佳性能，请使用不带词元过滤器的分析器。
- `enable_position_increments`
  （可选，Boolean）指示是否应计算位置增量。如果你不想统计被分析器过滤器（如 `stop`）移除的词元，请设置为 `false`。默认为 `true`。
- `doc_values`
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- `index`
  （可选，Boolean）该字段是否应该可搜索？接受 `true`（默认）和 `false`。
- `null_value`
  （可选，数值）接受与字段相同类型的数值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。

## 合成 `_source`

`token_count` 字段在其默认配置下支持[合成 `_source`](/mapping/metadata_fields/source)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/token-count.html)
