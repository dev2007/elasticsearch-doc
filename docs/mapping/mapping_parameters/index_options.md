# index_options

`index_options` 参数控制为了搜索和高亮目的而添加到倒排索引中的信息。只有基于词条的字段类型（如 `text` 和 `keyword`）支持此配置。

该参数接受以下值之一。每个值都会从前一个值获取信息。例如，`freqs` 包含 `docs`；`positions` 同时包含 `freqs` 和 `docs`。

- `docs`
  只索引文档编号。可以回答`这个词是否存在于该字段中？`的问题。
- `freqs`
  索引文档编号和词元频率。词元频率用于使重复出现的词元比单个词元获得更高的评分。
- `positions`（默认）
  索引文档编号、词元频率和词元位置（或顺序）。位置可用于邻近查询或短语查询。
- `offsets`
  索引文档编号、词元频率、位置以及开始和结束字符偏移量（将词元映射回原始字符串）。统一高亮器使用偏移量来加速高亮显示。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "index_options": "offsets"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "text": "Quick brown fox"
}

# 默认情况下，text 字段将使用倒排表进行高亮显示，因为偏移量已被索引
GET my-index-000001/_search
{
  "query": {
    "match": {
      "text": "brown fox"
    }
  },
  "highlight": {
    "fields": {
      "text": {}
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-options.html)
