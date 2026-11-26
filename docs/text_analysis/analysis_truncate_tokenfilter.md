# Truncate 词元过滤器

截断超过指定字符数的词元。该字符数限制默认为 `10`，可以通过 `length` 参数自定义。

例如，可以使用 truncate 过滤器将所有词元缩短到 3 个字符或更少，把 `jumping fox` 变成 `jum fox`。

此过滤器使用 Lucene 的 TruncateTokenFilter。

:::::tip 提示
truncate 过滤器会“剪短”过长的词元；如果要直接丢弃不符合长度要求的词元，请使用 [length 词元过滤器](/text_analysis/analysis_length_tokenfilter)。
:::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 truncate 过滤器，将 `the quinquennial extravaganza carried on` 中超过 10 个字符的词元缩短：

```bash
GET _analyze
{
  "tokenizer" : "whitespace",
  "filter" : ["truncate"],
  "text" : "the quinquennial extravaganza carried on"
}
```

该过滤器产生以下词元：

```text
[ the, quinquenni, extravagan, carried, on ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 truncate 过滤器配置一个新的自定义分析器：

```bash
PUT custom_truncate_example
{
  "settings" : {
    "analysis" : {
      "analyzer" : {
        "standard_truncate" : {
          "tokenizer": "standard",
          "filter": ["truncate"]
        }
      }
    }
  }
}
```

## 可配置参数

- `length`

  （可选，整数）每个词元的字符数限制。超过该限制的词元会被截断。默认为 `10`。

## 自定义并添加到分析器

要自定义 truncate 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建一个名为 `5_char_trunc` 的自定义 truncate 过滤器，将词元缩短到 5 个字符或更少：

```bash
PUT 5_char_words_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "lowercase_5_char": {
          "tokenizer": "lowercase",
          "filter": [ "5_char_trunc" ]
        }
      },
      "filter": {
        "5_char_trunc": {
          "type": "truncate",
          "length": 5
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-truncate-tokenfilter.html)
