# Pattern capture 词元过滤器

与 pattern 分词器不同，pattern_capture 过滤器会为正则表达式中的**每一个捕获组**生成一个词元。

这些模式不会被锚定到字符串的开头和结尾。因此：

- 每个模式可以在同一个字符串中匹配多次。
- 匹配结果可以重叠。

:::::warning 警告
pattern_capture 过滤器使用 [Java 正则表达式](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)。编写不当的正则表达式可能运行非常缓慢，甚至抛出 `StackOverflowError`，导致运行该表达式的节点突然退出。

参阅更多关于[病态正则表达式](https://www.regular-expressions.info/catastrophic.html)及如何避免它们的资料。
:::::

## 示例

例如，使用以下模式：

```text
(([a-z]+)(\d*))
```

匹配文本：

```text
abc123def456
```

会产生以下词元：

```text
[ abc123, abc, 123, def456, def, 456 ]
```

如果 `preserve_original` 设置为 `true`（默认值），还会额外输出原始词元 `abc123def456`。

## 可配置参数

- `patterns`

  （必需，字符串数组）正则表达式数组。每个捕获组都会产生一个词元。

  模式不要求从字符串开头匹配，也不要求匹配到字符串结尾。同一个模式可以匹配多次，且允许匹配重叠。

  官方文档指出：需要多个模式来允许重叠捕获，同时这也让模式更不密集、更容易理解。

- `preserve_original`

  （可选，布尔值）如果为 `true`，除了捕获组生成的词元之外，还会保留并输出原始词元。默认为 `true`。

## 自定义并添加到分析器

### 示例：索引 camel-case 代码文本

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求为类似 `stripHTML` 这样的 camel-case 代码文本配置了一个自定义分析器，使用户可以搜索 `"strip html"` 或 `"striphtml"`：

```bash
PUT test
{
  "settings": {
    "analysis": {
      "filter": {
        "code": {
          "type": "pattern_capture",
          "preserve_original": true,
          "patterns": [
            "(\\p{Ll}+|\\p{Lu}\\p{Ll}+|\\p{Lu}+)",
            "(\\d+)"
          ]
        }
      },
      "analyzer": {
        "code": {
          "tokenizer": "pattern",
          "filter": [ "code", "lowercase" ]
        }
      }
    }
  }
}
```

使用此分析器分析以下文本：

```text
import static org.apache.commons.lang.StringEscapeUtils.escapeHtml
```

输出词元：

```text
[
  import,
  static,
  org,
  apache,
  commons,
  lang,
  stringescapeutils,
  string,
  escape,
  utils,
  escapehtml,
  escape,
  html
]
```

### 示例：索引电子邮件地址

以下请求为电子邮件地址配置了一个自定义分析器：

```bash
PUT test
{
  "settings": {
    "analysis": {
      "filter": {
        "email": {
          "type": "pattern_capture",
          "preserve_original": true,
          "patterns": [
            "([^@]+)",
            "(\\p{L}+)",
            "(\\d+)",
            "@(.+)"
          ]
        }
      },
      "analyzer": {
        "email": {
          "tokenizer": "uax_url_email",
          "filter": [ "email", "lowercase", "unique" ]
        }
      }
    }
  }
}
```

使用此分析器分析以下电子邮件地址：

```text
john-smith_123@foo-bar.com
```

输出词元：

```text
john-smith_123@foo-bar.com,
john-smith_123,
john,
smith,
123,
foo-bar.com,
foo,
bar,
com
```

## 位置、偏移量与高亮

所有词元都在**相同的位置**发出，并且具有**相同的字符偏移量**。

这意味着，例如，对 `john-smith_123@foo-bar.com` 执行 `match` 查询时，即使使用 `and` 操作符，也会返回包含这些词元中任意一个的文档。

此外，与高亮（highlighting）一起使用时，会高亮整个原始词元，而不是只高亮匹配到的子部分。例如，查询上述电子邮件地址中的 `smith` 会高亮：

```html
<em>john-smith_123@foo-bar.com</em>
```

而不是：

```html
john-<em>smith</em>_123@foo-bar.com
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-pattern-capture-tokenfilter.html)
