# Conditional 词元过滤器

将一组词元过滤器应用于匹配所提供谓词脚本条件的词元。

此过滤器使用 Lucene 的 ConditionalTokenFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `condition` 过滤器匹配 `THE QUICK BROWN FOX` 中少于 5 个字符的词元，然后对这些匹配的词元应用 `lowercase` 过滤器，将其转换为小写：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "condition",
      "filter": [ "lowercase" ],
      "script": {
        "source": "token.getTerm().length() < 5"
      }
    }
  ],
  "text": "THE QUICK BROWN FOX"
}
```

该过滤器产生以下词元：

```text
[ the, QUICK, BROWN, fox ]
```

## 可配置参数

- `filter`

  （必填，词元过滤器数组）词元过滤器数组。如果词元匹配 `script` 参数中的谓词脚本，则按提供的顺序对这些过滤器应用到该词元。这些过滤器可以包括在索引映射中定义的自定义词元过滤器。

- `script`

  （必填，脚本对象）用于应用词元过滤器的谓词脚本。如果词元匹配此脚本，则应用 `filter` 参数中的过滤器。有关有效参数，参阅[脚本编写](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/modules-scripting.html)。仅支持内联（inline）脚本。Painless 脚本在 analysis predicate 上下文中执行，并且需要 `token` 属性。

## 自定义并添加到分析器

要自定义 `condition` 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义 `condition` 过滤器配置一个新的自定义分析器。该自定义 `condition` 过滤器匹配流中的第一个词元，然后使用 `reverse` 过滤器反转该匹配的词元：

```bash
PUT /palindrome_list
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_reverse_first_token": {
          "tokenizer": "whitespace",
          "filter": [ "reverse_first_token" ]
        }
      },
      "filter": {
        "reverse_first_token": {
          "type": "condition",
          "filter": [ "reverse" ],
          "script": {
            "source": "token.getPosition() === 0"
          }
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-condition-tokenfilter.html)
