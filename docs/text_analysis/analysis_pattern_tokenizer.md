# pattern 分词器

pattern 分词器使用正则表达式，或者在匹配单词分隔符时将文本拆分为词项，或者将匹配的文本捕获为词项。

默认模式为 `\W+`，它在遇到非单词字符时拆分文本。

::::warning 警告
小心病态正则表达式

pattern 分词器使用 Java 正则表达式。

编写不当的正则表达式可能运行得非常慢，甚至抛出 `StackOverflowError` 并导致其所在节点突然退出。

阅读更多关于病态正则表达式及其规避方法的内容。
::::

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "pattern",
  "text": "The foo_bar_size's default is 5."
}
```

上述句子会产出以下词项：

```text
[ The, foo_bar_size, s, default, is, 5 ]
```

## 配置

pattern 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `pattern` | Java 正则表达式，默认为 `\W+`。 |
| `flags` | Java 正则表达式标志。标志应以竖线分隔，例如 `"CASE_INSENSITIVE\|COMMENTS"`。 |
| `group` | 要提取为词元的捕获组。默认为 `-1`（拆分）。 |

## 配置示例

### 示例 1：按逗号拆分

配置 pattern 分词器在遇到逗号时将文本拆分为词元：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "my_tokenizer"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "pattern",
          "pattern": ","
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "comma,separated,values"
}
```

上面的示例产出以下词项：

```text
[ comma, separated, values ]
```

### 示例 2：使用捕获组捕获双引号值

配置 pattern 分词器捕获用双引号括起来的值（忽略内嵌的转义引号 `\"`）。正则表达式本身如下所示：

```text
"((?:\\"|[^"]|\\")*)"
```

其含义如下：

- 一个字面量 `"`
- 开始捕获：
  - 一个字面量 `\"` 或除 `"` 之外的任何字符
  - 重复直到没有更多字符匹配
- 一个字面量的结束 `"`

在 JSON 中指定模式时，`"` 和 `\` 字符需要转义，因此模式最终如下所示：

```text
\"((?:\\\\\"|[^\"]|\\\\\")+)\"
```

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "my_tokenizer"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "pattern",
          "pattern": "\"((?:\\\\\"|[^\"]|\\\\\")+)\"",
          "group": 1
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "\"value\", \"value with embedded \\\" quote\""
}
```

上面的示例产出以下两个词项：

```text
[ value, value with embedded \" quote ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-pattern-tokenizer.html)
