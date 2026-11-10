# pattern 分析器

pattern 分析器使用正则表达式将文本拆分为词项。正则表达式应该匹配词元分隔符而不是词元本身。正则表达式默认为 `\W+`（即所有非单词字符）。

::::warning 警告
小心病态正则表达式

pattern 分析器使用 Java 正则表达式。

编写不当的正则表达式可能运行得非常慢，甚至抛出 `StackOverflowError` 并导致其所在节点突然退出。

阅读更多关于病态正则表达式及其规避方法的内容。
::::

## 示例输出

```bash
POST _analyze
{
  "analyzer": "pattern",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词项：

```text
[ the, 2, quick, brown, foxes, jumped, over, the, lazy, dog, s, bone ]
```

## 配置

pattern 分析器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `pattern` | Java 正则表达式，默认为 `\W+`。 |
| `flags` | Java 正则表达式标志。标志应以竖线分隔，例如 `"CASE_INSENSITIVE\|COMMENTS"`。 |
| `lowercase` | 是否将词项小写化。默认为 `true`。 |
| `stopwords` | 预定义的停用词列表（如 `_english_`），或包含停用词列表的数组。默认为 `_none_`。 |
| `stopwords_path` | 包含停用词的文件的路径。 |

有关停用词配置的更多信息，参阅 [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)。

## 配置示例

在本示例中，我们配置 pattern 分析器按非单词字符或下划线（`\W|_`）拆分电子邮件地址，并将结果小写化：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_email_analyzer": {
          "type": "pattern",
          "pattern": "\\W|_",
          "lowercase": true
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_email_analyzer",
  "text": "John_Smith@foo-bar.com"
}
```

::::note 提示
在 JSON 字符串中指定模式时，模式中的反斜杠需要转义。
::::

上面的示例产出以下词项：

```text
[ john, smith, foo, bar, com ]
```

## CamelCase 分词

下面这个更复杂的示例将 CamelCase 文本拆分为词元：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "camel": {
          "type": "pattern",
          "pattern": "([^\\p{L}\\d]+)|(?<=\\D)(?=\\d)|(?<=\\d)(?=\\D)|(?<=[\\p{L}&&[^\\p{Lu}]])(?=\\p{Lu})|(?<=\\p{Lu})(?=\\p{Lu}[\\p{L}&&[^\\p{Lu}]])"
        }
      }
    }
  }
}

GET my-index-000001/_analyze
{
  "analyzer": "camel",
  "text": "MooseX::FTPClass2_beta"
}
```

上面的示例产出以下词项：

```text
[ moose, x, ftp, class, 2, beta ]
```

上面的正则表达式可以更容易地理解为：

```text
([^\p{L}\d]+)                 # 吞掉非字母和非数字,
| (?<=\D)(?=\d)               # 或非数字后跟数字,
| (?<=\d)(?=\D)               # 或数字后跟非数字,
| (?<=[ \p{L} && [^\p{Lu}]])  # 或小写
  (?=\p{Lu})                  #   后跟大写,
| (?<=\p{Lu})                 # 或大写
  (?=\p{Lu}                   #   后跟大写
    [\p{L}&&[^\p{Lu}]]        #   再后跟小写
  )
```

## 定义

pattern 分析器由以下部分组成：

**分词器**

- [Pattern 分词器](/text_analysis/analysis_pattern_tokenizer)

**词元过滤器**

- [Lowercase 词元过滤器](/text_analysis/analysis_lowercase_tokenfilter)
- [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)（默认禁用）

如果你需要在配置参数之外自定义 pattern 分析器，则需要将其重建为自定义分析器并加以修改，通常通过添加词元过滤器来实现。以下代码会重建内置的 pattern 分析器，你可以将其作为进一步自定义的起点：

```bash
PUT /pattern_example
{
  "settings": {
    "analysis": {
      "tokenizer": {
        "split_on_non_word": {
          "type": "pattern",
          "pattern": "\\W+"
        }
      },
      "analyzer": {
        "rebuilt_pattern": {
          "tokenizer": "split_on_non_word",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  }
}
```

- 默认模式是 `\W+`，它按非单词字符拆分，这里就是你可以修改它的地方。
- 你可以在 `lowercase` 之后添加其他词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-pattern-analyzer.html)
