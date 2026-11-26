# Predicate script 词元过滤器

移除与所提供的谓词脚本（predicate script）不匹配的词元。

- 该过滤器仅支持内联 Painless 脚本。
- 脚本在 `analysis predicate context`（分析谓词上下文）中进行评估。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 predicate_token_filter 过滤器，仅输出文本 `the fox jumps the lazy dog` 中长度大于 3 个字符的词元：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "predicate_token_filter",
      "script": {
        "source": """
          token.term.length() > 3
        """
      }
    }
  ],
  "text": "the fox jumps the lazy dog"
}
```

其中 Painless 脚本为：

```java
token.term.length() > 3
```

该过滤器产生以下词元：

```text
[ jumps, lazy ]
```

API 响应包含每个输出词元的位置和偏移量。注意：predicate_token_filter 不会更改词元的原始位置或偏移量：

```json
{
  "tokens" : [
    {
      "token" : "jumps",
      "start_offset" : 8,
      "end_offset" : 13,
      "type" : "word",
      "position" : 2
    },
    {
      "token" : "lazy",
      "start_offset" : 18,
      "end_offset" : 22,
      "type" : "word",
      "position" : 4
    }
  ]
}
```

## 可配置参数

- `script`

  （必需，脚本对象）一个用于过滤传入词元的条件脚本。只有与该脚本匹配的词元才会包含在输出中。

  此参数仅支持内联 Painless 脚本，脚本在 `analysis predicate context` 中进行评估。

## 自定义并添加到分析器

要自定义 predicate_token_filter，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求配置了一个新的自定义分析器，其中使用了名为 `my_script_filter` 的自定义 predicate_token_filter 过滤器。该过滤器会移除类型不是 `ALPHANUM` 的词元，使用的条件为：

```java
token.type.contains("ALPHANUM")
```

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [
            "my_script_filter"
          ]
        }
      },
      "filter": {
        "my_script_filter": {
          "type": "predicate_token_filter",
          "script": {
            "source": """
              token.type.contains("ALPHANUM")
            """
          }
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-predicatefilter-tokenfilter.html)
