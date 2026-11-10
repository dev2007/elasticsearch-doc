# simple_pattern 分词器

`simple_pattern` 分词器使用正则表达式将匹配的文本捕获为词项。它支持的正则表达式功能比 `pattern` 分词器更有限，但分词速度通常更快。

与 `pattern` 分词器不同，此分词器**不支持在模式匹配处拆分输入**。要使用相同的受限正则表达式子集在模式匹配处拆分，请参阅 `simple_pattern_split` 分词器。

此分词器使用 **Lucene 正则表达式**。有关支持的功能和语法的说明，参阅[正则表达式语法](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/regexp-syntax.html)。

::::note 提示
默认模式为空字符串，这不会产出任何词项。此分词器应**始终配置为非默认模式**。
::::

## 配置

`simple_pattern` 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `pattern` | Lucene 正则表达式，默认为空字符串。 |

## 配置示例

本示例配置 `simple_pattern` 分词器产出**三位数字**的词项。

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
          "type": "simple_pattern",
          "pattern": "[0123456789]{3}"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "fd-786-335-514-x"
}
```

上面的示例产出以下词项：

```text
[ 786, 335, 514 ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-simplepattern-tokenizer.html)
