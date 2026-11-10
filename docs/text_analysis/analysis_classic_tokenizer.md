# classic 分词器

classic 分词器是一种基于语法的分词器，适用于英语文档。该分词器对首字母缩略词、公司名称、电子邮件地址和互联网主机名有特殊的启发式处理。不过，这些规则并非总是有效，而且该分词器对英语以外的大多数语言效果不佳：

- 它在大多数标点符号处拆分单词并移除标点。但是，后面没有紧跟空格的点被视为词元的一部分。
- 它在连字符处拆分单词，除非词元中包含数字——此时整个词元会被解释为产品编号而不被拆分。
- 它将电子邮件地址和互联网主机名识别为单个词元。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "classic",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词项：

```text
[ The, 2, QUICK, Brown, Foxes, jumped, over, the, lazy, dog's, bone ]
```

## 配置

classic 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `max_token_length` | 词元的最大长度。如果出现超过此长度的词元，则会按 `max_token_length` 间隔进行拆分。默认为 `255`。 |

## 配置示例

在本示例中，我们配置 classic 分词器的 `max_token_length` 为 5（仅用于演示）：

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
          "type": "classic",
          "max_token_length": 5
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上面的示例产出以下词项：

```text
[ The, 2, QUICK, Brown, Foxes, jumpe, d, over, the, lazy, dog's, bone ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-classic-tokenizer.html)
