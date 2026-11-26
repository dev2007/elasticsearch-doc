# Multiplexer 词元过滤器

在同一位置（position）发出多个词元，每个词元都是原词元经过不同过滤器处理后的版本。在同一位置上相同的输出词元会被去重移除。

如果输入词元流中已存在重复词元，multiplexer 过滤器也会将其移除。

## 可配置参数

- `filters`

  （必需，字符串数组）应用于输入词元的词元过滤器列表。可以使用索引映射中定义的任何词元过滤器。

  过滤器可以使用逗号分隔的字符串进行串联。例如，`"lowercase, porter_stem"` 会先应用 lowercase 过滤器，再应用 porter_stem 过滤器。

  :::::warning 警告
  shingle 或多词同义词（multi-word synonym）过滤器在 `filters` 数组中无法正常工作，因为它们会在内部向前读取词元，而 multiplexer 过滤器不支持这种操作。
  :::::

- `preserve_original`

  （可选，布尔值）如果为 `true`，除了过滤后的词元之外，还会额外发出原始词元。默认为 `true`。

## 示例

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义的 multiplexer 过滤器配置一个新的自定义分析器。该 multiplexer 过滤器包含两条过滤器链：

- `lowercase`
- `lowercase, porter_stem`

```bash
PUT /multiplexer_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "my_multiplexer" ]
        }
      },
      "filter": {
        "my_multiplexer": {
          "type": "multiplexer",
          "filters": [ "lowercase", "lowercase, porter_stem" ]
        }
      }
    }
  }
}
```

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用此自定义分析器分析文本 `Going HOME`：

```bash
POST /multiplexer_example/_analyze
{
  "analyzer": "my_analyzer",
  "text": "Going HOME"
}
```

API 返回以下响应。注意位置 0 发出了三个词元：原始词元 `Going`（`preserve_original` 默认为 `true`）、小写化后的 `going`，以及 `lowercase, porter_stem` 链产生的词干形式 `go`。

位置 1 发出了两个词元：原始词元 `HOME` 和小写词元 `home`。词干提取过滤器本应在位置 1 也发出一个 `home` 词元，但由于它与小写链输出的 `home` 重复，因此已从词元流中移除：

```json
{
  "tokens": [
    {
      "token": "Going",
      "start_offset": 0,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "going",
      "start_offset": 0,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "go",
      "start_offset": 0,
      "end_offset": 5,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "HOME",
      "start_offset": 6,
      "end_offset": 10,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "home",
      "start_offset": 6,
      "end_offset": 10,
      "type": "<ALPHANUM>",
      "position": 1
    }
  ]
}
```

## 与 synonym 和 synonym_graph 过滤器的配合

[synonym](/text_analysis/analysis_synonym_tokenfilter) 和 [synonym_graph](/text_analysis/analysis_synonym_graph_tokenfilter) 过滤器会使用其前置的分析链来解析和分析同义词列表。如果该前置链中包含在同一位置产生多个词元的过滤器（例如 multiplexer 过滤器），这些过滤器会抛出异常。

要对包含 multiplexer 过滤器的词元流应用同义词，请将同义词过滤器追加到 multiplexer 过滤器的每条相关过滤器列表内部，而不是将同义词过滤器添加到 multiplexer 过滤器之后的主词元链中。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-multiplexer-tokenfilter.html)
