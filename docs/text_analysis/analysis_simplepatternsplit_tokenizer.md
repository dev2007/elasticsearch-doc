# simple_pattern_split 分词器

`simple_pattern_split` 分词器使用正则表达式在模式匹配处将输入拆分为词项。它支持的正则表达式功能比 `pattern` 分词器更有限，但分词速度通常更快。

此分词器**不会**从匹配项本身产出词项。要使用相同的受限正则表达式子集从匹配项产出词项，请参阅 `simple_pattern` 分词器。

此分词器使用 Lucene 正则表达式。有关支持的功能和语法的说明，参阅[正则表达式语法](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/regexp-syntax.html)。

默认模式为空字符串，这会产出一个包含完整输入的词项。此分词器应始终配置为非默认模式。

## 配置

`simple_pattern_split` 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `pattern` | 一个 Lucene 正则表达式，默认为空字符串。 |

## 配置示例

本示例配置 `simple_pattern_split` 分词器在输入文本中的下划线处进行拆分。

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
          "type": "simple_pattern_split",
          "pattern": "_"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "an_underscored_phrase"
}
```

上面的示例产出以下词项：

```text
[ an, underscored, phrase ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-simplepatternsplit-tokenizer.html)
