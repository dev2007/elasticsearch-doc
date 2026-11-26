# Length 词元过滤器

移除长度（按字符数计算）短于或长于指定范围的词元。例如，可以使用此过滤器排除少于 2 个字符或多于 5 个字符的词元。

:::::tip 提示
此过滤器会移除整个词元。如果只想将词元截断到指定长度而不是移除它们，请使用 [truncate 词元过滤器](/text_analysis/analysis_truncate_tokenfilter)。
:::::

此过滤器使用 Lucene 的 LengthFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 length 过滤器移除多于 4 个字符的词元：

```bash
GET _analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "length",
      "min": 0,
      "max": 4
    }
  ],
  "text": "the quick brown fox jumps over the lazy dog"
}
```

该过滤器产生以下词元：

```text
[ the, fox, over, the, lazy, dog ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 length 过滤器配置一个新的自定义分析器：

```bash
PUT length_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_length": {
          "tokenizer": "standard",
          "filter": [ "length" ]
        }
      }
    }
  }
}
```

## 自定义并添加到分析器

要自定义 length 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下创建索引 API 请求使用自定义的 length 过滤器配置一个新的自定义分析器。该过滤器会移除少于 2 个字符或多于 10 个字符的词元：

```bash
PUT length_custom_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_length_2_to_10_char": {
          "tokenizer": "whitespace",
          "filter": [ "length_2_to_10_char" ]
        }
      },
      "filter": {
        "length_2_to_10_char": {
          "type": "length",
          "min": 2,
          "max": 10
        }
      }
    }
  }
}
```

## 可配置参数

- `min`

  （可选，整数）词元的最小字符长度。短于此长度的词元将被排除。默认为 `0`。

- `max`

  （可选，整数）词元的最大字符长度。长于此长度的词元将被排除。默认为 `Integer.MAX_VALUE`（`2147483647`）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-length-tokenfilter.html)
