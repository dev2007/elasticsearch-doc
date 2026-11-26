# Pattern replace 词元过滤器

使用正则表达式匹配并替换词元中的子串。

该过滤器使用 [Java 正则表达式语法](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)。默认情况下，过滤器会将匹配到的子串替换为空字符串 `""`。替换字符串可以使用 Java 的 [`$g` 语法](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Matcher.html#appendReplacement-java.lang.StringBuffer-java.lang.String-)引用原始词元文本中的捕获组。

:::::warning 警告
编写不当的正则表达式可能运行缓慢，或抛出 `StackOverflowError`，导致运行该表达式的节点突然退出。

参阅更多关于[病态正则表达式](https://www.regular-expressions.info/catastrophic.html)及如何避免它们的资料。
:::::

此过滤器使用 Lucene 的 PatternReplaceFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 pattern_replace 过滤器，在文本 `foxes jump lazy dogs` 中为子串 `dog` 前置 `watch`：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "pattern_replace",
      "pattern": "(dog)",
      "replacement": "watch$1"
    }
  ],
  "text": "foxes jump lazy dogs"
}
```

该过滤器产生以下词元：

```text
[ foxes, jump, lazy, watchdogs ]
```

## 可配置参数

- `all`

  （可选，布尔值）如果为 `true`，所有匹配 `pattern` 正则表达式的子串都会被替换。如果为 `false`，过滤器只替换每个词元中第一个匹配的子串。默认为 `true`。

- `pattern`

  （必需，字符串）使用 Java 正则表达式语法编写的正则表达式。过滤器会将词元中匹配该模式的子串替换为 `replacement` 参数中的子串。

- `replacement`

  （可选，字符串）替换子串。默认为空字符串 `""`。可以使用 Java 的 `$g` 语法引用捕获组。

## 自定义并添加到分析器

要自定义 pattern_replace 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求配置了一个新的自定义分析器，其中使用了自定义 pattern_replace 过滤器 `my_pattern_replace_filter`。该过滤器使用正则表达式 `[£|€]` 匹配并移除货币符号 `£` 和 `€`。由于其 `all` 参数为 `false`，每个词元只会移除第一个匹配的符号：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "filter": [ "my_pattern_replace_filter" ]
        }
      },
      "filter": {
        "my_pattern_replace_filter": {
          "type": "pattern_replace",
          "pattern": "[£|€]",
          "replacement": "",
          "all": false
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-pattern_replace-tokenfilter.html)
