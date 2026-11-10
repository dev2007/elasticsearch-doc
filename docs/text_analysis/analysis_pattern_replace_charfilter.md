# Pattern Replace 字符过滤器

`pattern_replace` 字符过滤器使用正则表达式匹配应被替换为指定替换字符串的字符。替换字符串可以引用正则表达式中的捕获组。

::::warning 警告
小心病态正则表达式

pattern replace 字符过滤器使用 [Java 正则表达式](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)。

编写不当的正则表达式可能运行得非常慢，甚至抛出 `StackOverflowError` 并导致其所在节点突然退出。

阅读更多关于[病态正则表达式及其规避方法](https://www.regular-expressions.info/catastrophic.html)的内容。
::::

## 配置

`pattern_replace` 字符过滤器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `pattern` | 一个 [Java 正则表达式](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html)。（必需） |
| `replacement` | 替换字符串，可以使用 `$1`..`$9` 语法引用捕获组，详见[此处](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Matcher.html#appendReplacement-java.lang.StringBuffer-java.lang.String-)。 |
| `flags` | Java 正则表达式[标志](https://docs.oracle.com/javase/8/docs/api/java/util/regex/Pattern.html#field.summary)。标志应以竖线分隔，例如 `"CASE_INSENSITIVE\|COMMENTS"`。 |

## 配置示例

**示例 1**：将数字中嵌入的连字符替换为下划线，即 `123-456-789` → `123_456_789`。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "char_filter": [ "my_char_filter" ]
        }
      },
      "char_filter": {
        "my_char_filter": {
          "type": "pattern_replace",
          "pattern": "(\\d+)-(?=\\d)",
          "replacement": "$1_"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "My credit card is 123-456-789"
}
```

上面的示例产出以下词项：

```text
[ My, credit, card, is, 123_456_789 ]
```

**示例 2 —— 替换内容改变文本长度的注意事项**：使用会改变原始文本长度的替换字符串可以正常用于搜索，但会导致高亮显示不正确。

本示例在遇到小写字母后跟大写字母时插入一个空格（即 `fooBarBaz` → `foo Bar Baz`），从而允许单独查询 camelCase 单词。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "char_filter": [ "my_char_filter" ],
          "filter": [ "lowercase" ]
        }
      },
      "char_filter": {
        "my_char_filter": {
          "type": "pattern_replace",
          "pattern": "(?<=\\p{Lower})(?=\\p{Upper})",
          "replacement": " "
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "my_analyzer"
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "The fooBarBaz method"
}
```

上面的示例返回以下词项：

```text
[ the, foo, bar, baz, method ]
```

**示例 3 —— 演示高亮问题**：查询 `bar` 可以正确找到文档，但对结果进行高亮显示会产生不正确的高亮，因为字符过滤器改变了原始文本的长度。

```bash
PUT my-index-000001/_doc/1?refresh
{
  "text": "The fooBarBaz method"
}

GET my-index-000001/_search
{
  "query": {
    "match": {
      "text": "bar"
    }
  },
  "highlight": {
    "fields": {
      "text": {}
    }
  }
}
```

上面的示例返回以下响应：

```json
{
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "text": "The fooBarBaz method"
        },
        "highlight": {
          "text": [ "The foo<em>Ba</em>rBaz method" ]
        }
      }
    ]
  }
}
```

高亮 `<em>Ba</em>r` 是不正确的——由于字符过滤器改变了文本长度，它高亮了 `Ba` 而不是完整的词元 `bar`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-pattern-replace-charfilter.html)
