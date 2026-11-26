# Limit token count 词元过滤器

限制输出词元的数量。此过滤器通常用于根据词元数量限制文档字段值的大小。

默认情况下，limit 过滤器只保留词元流中的第一个词元。例如，它可以将词元流 `[ one, two, three ]` 变为 `[ one ]`。

:::::tip 提示
如果要根据字符长度（而不是词元数量）限制字段值的大小，请使用 `ignore_above` 映射参数。
:::::

此过滤器使用 Lucene 的 LimitTokenCountFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 limit 过滤器保留文本 `quick fox jumps over lazy dog` 的前两个词元：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "limit",
      "max_token_count": 2
    }
  ],
  "text": "quick fox jumps over lazy dog"
}
```

该过滤器产生以下词元：

```text
[ quick, fox ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 limit 过滤器配置一个新的自定义分析器。此 limit 过滤器使用 `max_token_count` 的默认值 `1`，仅保留第一个词元：

```bash
PUT limit_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_one_token_limit": {
          "tokenizer": "standard",
          "filter": [ "limit" ]
        }
      }
    }
  }
}
```

## 自定义并添加到分析器

要自定义 limit 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下创建索引 API 请求使用自定义的 limit 过滤器配置一个新的自定义分析器。该过滤器保留前五个词元：

```bash
PUT custom_limit_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_five_token_limit": {
          "tokenizer": "whitespace",
          "filter": [ "five_token_limit" ]
        }
      },
      "filter": {
        "five_token_limit": {
          "type": "limit",
          "max_token_count": 5
        }
      }
    }
  }
}
```

## 可配置参数

- `max_token_count`

  （可选，整数）要保留的最大词元数量。达到此限制后，其余词元将从输出中排除。默认为 `1`。

- `consume_all_tokens`

  （可选，布尔值）如果为 `true`，即使已达到 `max_token_count` 限制，limit 过滤器也会耗尽整个词元流。默认为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-limit-token-count-tokenfilter.html)
