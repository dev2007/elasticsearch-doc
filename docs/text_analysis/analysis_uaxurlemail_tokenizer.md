# UAX URL email 分词器

`uax_url_email` 分词器与[标准分词器](/text_analysis/analysis_standard_tokenizer)类似，但它能将 URL 和电子邮件地址识别为单个词元。

## 示例输出

以下 analyze API 请求使用 `uax_url_email` 分词器：

```bash
POST _analyze
{
  "tokenizer": "uax_url_email",
  "text": "Email me at john.smith@global-international.com"
}
```

上述句子会产出以下词项：

```text
[ Email, me, at, john.smith@global-international.com ]
```

而标准分词器会产出：

```text
[ Email, me, at, john.smith, global, international.com ]
```

## 配置

`uax_url_email` 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `max_token_length` | 词元的最大长度。如果出现超过此长度的词元，则会按 `max_token_length` 间隔进行拆分。默认为 `255`。 |

## 配置示例

在本示例中，`uax_url_email` 分词器被配置为 `max_token_length` 为 5（仅用于演示）：

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
          "type": "uax_url_email",
          "max_token_length": 5
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "john.smith@global-international.com"
}
```

上面的示例产出以下词项：

```text
[ john, smith, globa, l, inter, natio, nal.c, om ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-uaxurlemail-tokenizer.html)
