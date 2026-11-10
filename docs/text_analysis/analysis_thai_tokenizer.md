# thai 分词器

`thai` 分词器使用 Java 内置的泰语分段算法将泰语文本分段为单词。其他语言的文本通常与[标准分词器](/text_analysis/analysis_standard_tokenizer)的处理方式相同。

::::note 提示
此分词器可能不被所有 JRE 支持。已知它在 Sun/Oracle 和 OpenJDK 上可以工作。如果你的应用需要完全的可移植性，请考虑使用 [ICU 分词器](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-icu-tokenizer.html)。
::::

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "thai",
  "text": "การที่ได้ต้องแสดงว่างานดี"
}
```

上述句子会产出以下词项：

```text
[ การ, ที่, ได้, ต้อง, แสดง, ว่า, งาน, ดี ]
```

## 配置

`thai` 分词器**不可配置**。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-thai-tokenizer.html)
