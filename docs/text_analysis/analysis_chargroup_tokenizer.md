# char_group 分词器

`char_group` 分词器在遇到定义字符集合中的任何字符时都会将文本拆分为词项。它主要适用于希望进行简单自定义分词、且使用 pattern 分词器的开销不可接受的场景。

## 配置

`char_group` 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `tokenize_on_chars` | 包含用于拆分字符串的字符的列表。每当遇到该列表中的字符时，就会开始一个新词元。它接受单个字符（如 `-`）或字符组：`whitespace`、`letter`、`digit`、`punctuation`、`symbol`。 |
| `max_token_length` | 词元的最大长度。如果出现超过此长度的词元，则会按 `max_token_length` 间隔进行拆分。默认为 `255`。 |

## 示例输出

```bash
POST _analyze
{
  "tokenizer": {
    "type": "char_group",
    "tokenize_on_chars": [
      "whitespace",
      "-",
      "\n"
    ]
  },
  "text": "The QUICK brown-fox"
}
```

上述请求返回以下响应：

```json
{
  "tokens": [
    {
      "token": "The",
      "start_offset": 0,
      "end_offset": 3,
      "type": "word",
      "position": 0
    },
    {
      "token": "QUICK",
      "start_offset": 4,
      "end_offset": 9,
      "type": "word",
      "position": 1
    },
    {
      "token": "brown",
      "start_offset": 10,
      "end_offset": 15,
      "type": "word",
      "position": 2
    },
    {
      "token": "fox",
      "start_offset": 16,
      "end_offset": 19,
      "type": "word",
      "position": 3
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-chargroup-tokenizer.html)
