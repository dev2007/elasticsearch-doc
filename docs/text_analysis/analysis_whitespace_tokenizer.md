# whitespace 分词器

whitespace 分词器在遇到任何空白字符时将文本拆分为词项。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "whitespace",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

产出的词项：

```text
[ The, 2, QUICK, Brown-Foxes, jumped, over, the, lazy, dog's, bone. ]
```

## 配置

whitespace 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `max_token_length` | 词元的最大长度。如果出现超过此长度的词元，则会按 `max_token_length` 间隔进行拆分。默认为 `255`。 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-whitespace-tokenizer.html)
