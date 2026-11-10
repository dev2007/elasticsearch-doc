# position_increment_gap

经过分析的 text 字段会考虑词元位置，以便支持邻近查询或短语查询。索引具有多个值的 text 字段时，会在值之间添加一个“虚拟”间隙（gap），以防止大多数短语查询跨值匹配。此间隙的大小通过 `position_increment_gap` 配置，默认为 100。

例如：

```bash
PUT my-index-000001/_doc/1
{
  "names": [ "John Abraham", "Lincoln Smith"]
}

# 此短语查询不匹配我们的文档，这完全符合预期
GET my-index-000001/_search
{
  "query": {
    "match_phrase": {
      "names": {
        "query": "Abraham Lincoln"
      }
    }
  }
}

# 此短语查询匹配我们的文档，尽管 Abraham 和 Lincoln 位于不同的字符串中，因为 slop > position_increment_gap
GET my-index-000001/_search
{
  "query": {
    "match_phrase": {
      "names": {
        "query": "Abraham Lincoln",
        "slop": 101
      }
    }
  }
}
```

可以在映射中指定 `position_increment_gap`。例如：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "names": {
        "type": "text",
        "position_increment_gap": 0
      }
    }
  }
}

# 下一个数组元素的第一个词元与前一个数组元素的最后一个词元间隔 0 个位置
PUT my-index-000001/_doc/1
{
  "names": [ "John Abraham", "Lincoln Smith"]
}

# 短语查询匹配了我们的文档，这很奇怪，但这就是我们在映射中要求的
GET my-index-000001/_search
{
  "query": {
    "match_phrase": {
      "names": "Abraham Lincoln"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/position-increment-gap.html)
