# _tier 字段

在跨多个索引执行查询时，有时希望定位托管在给定数据层（`data_hot`、`data_warm`、`data_cold` 或 `data_frozen`）节点上的索引。`_tier` 字段允许匹配文档被索引到的索引的 `tier_preference` 设置。首选值可以在某些查询中访问：

```bash
PUT index_1/_doc/1
{
  "text": "Document in index 1"
}

PUT index_2/_doc/2?refresh=true
{
  "text": "Document in index 2"
}

# 在 _tier 字段上查询
GET index_1,index_2/_search
{
  "query": {
    "terms": {
      "_tier": ["data_hot", "data_warm"]
    }
  }
}
```

通常，查询会使用 `terms` 查询列出关注的层，但你可以在任何重写为 term 查询的查询中使用 `_tier` 字段，例如 `match`、`query_string`、`term`、`terms` 或 `simple_query_string` 查询，以及 `prefix` 和 `wildcard` 查询。但是，它不支持 `regexp` 和 `fuzzy` 查询。

索引的 `tier_preference` 设置是一个按优先顺序排列的逗号分隔的层名称列表，即托管索引的首选层排在第一位，后面可能有许多备选选项。查询匹配只考虑第一个偏好（列表的第一个值）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-tier-field.html)
