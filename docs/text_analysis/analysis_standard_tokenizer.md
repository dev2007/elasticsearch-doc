# 标准分词器

标准分词器提供基于语法的分词（基于 **Unicode 文本分段算法**，即 Unicode 标准附录 #29 中规定的算法），适用于大多数语言。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "standard",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词项：

```text
[ The, 2, QUICK, Brown, Foxes, jumped, over, the, lazy, dog's, bone ]
```

## 配置

标准分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `max_token_length` | 词元的最大长度。如果出现超过此长度的词元，则会按 `max_token_length` 间隔进行拆分。默认为 `255`。 |

## 配置示例

在本示例中，我们配置标准分词器的 `max_token_length` 为 **5**（仅用于演示）：

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
          "type": "standard",
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

注意 `jumped` 由于 `max_token_length` 为 5 而被拆分为 `jumpe` 和 `d`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-standard-tokenizer.html)
