# letter 分词器

letter 分词器在遇到非字母字符时将文本拆分为词项。它对大多数欧洲语言效果尚可，但对一些单词不以空格分隔的亚洲语言效果很差。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "letter",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词项：

```text
[ The, QUICK, Brown, Foxes, jumped, over, the, lazy, dog, s, bone ]
```

## 配置

letter 分词器**不可配置**。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-letter-tokenizer.html)
