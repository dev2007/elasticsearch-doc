# Snowball 词元过滤器

使用由 Snowball 生成的词干提取器（Snowball-generated stemmer）对单词进行词干化处理。

`language` 参数用于控制使用哪种词干提取器。

:::::warning 警告
`Kp` 和 `Lovins` 支持自 8.16.0 起已弃用，并将在未来版本中移除。
:::::

## `language` 参数可用值

- `Arabic`
- `Armenian`
- `Basque`
- `Catalan`
- `Danish`
- `Dutch`
- `English`
- `Estonian`
- `Finnish`
- `French`
- `German`
- `German2`
- `Hungarian`
- `Irish`
- `Italian`
- `Kp`（已弃用）
- `Lithuanian`
- `Lovins`（已弃用）
- `Norwegian`
- `Porter`
- `Portuguese`
- `Romanian`
- `Russian`
- `Serbian`
- `Spanish`
- `Swedish`
- `Turkish`

## 示例

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求创建了一个自定义分析器 `my_analyzer`，它使用 `standard` 分词器、lowercase 过滤器和自定义的 `my_snow` 过滤器。`my_snow` 过滤器的类型为 `snowball`，并使用 `English` 语言：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "lowercase", "my_snow" ]
        }
      },
      "filter": {
        "my_snow": {
          "type": "snowball",
          "language": "English"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-snowball-tokenfilter.html)
