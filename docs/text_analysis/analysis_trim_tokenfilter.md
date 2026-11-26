# Trim 词元过滤器

移除词元流中每个词元的首尾空白字符。

虽然这可能改变词元的长度，但 trim 过滤器不会改变词元的偏移量（offsets）。

此过滤器使用 Lucene 的 TrimFilter。

:::::tip 提示
许多常用分词器（例如 `standard` 或 `whitespace` 分词器）默认会移除空白字符。使用这些分词器时，不需要额外添加单独的 trim 过滤器。
:::::

## 示例

为了查看 trim 过滤器的工作方式，首先生成一个包含空白字符的词元。以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `keyword` 分词器为 `" fox "` 生成一个词元：

```bash
GET _analyze
{
  "tokenizer" : "keyword",
  "text" : " fox "
}
```

响应中的 `" fox "` 词元包含原始文本中的空白字符：

```json
{
  "tokens": [
    {
      "token": " fox ",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    }
  ]
}
```

要移除空白字符，请在请求中添加 trim 过滤器：

```bash
GET _analyze
{
  "tokenizer" : "keyword",
  "filter" : ["trim"],
  "text" : " fox "
}
```

返回的 `fox` 词元不包含任何首尾空白字符。注意，尽管词元长度发生了变化，`start_offset` 和 `end_offset` 保持不变：

```json
{
  "tokens": [
    {
      "token": "fox",
      "start_offset": 0,
      "end_offset": 5,
      "type": "word",
      "position": 0
    }
  ]
}
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 trim 过滤器配置一个新的自定义分析器：

```bash
PUT trim_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "keyword_trim": {
          "tokenizer": "keyword",
          "filter": [ "trim" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-trim-tokenfilter.html)
