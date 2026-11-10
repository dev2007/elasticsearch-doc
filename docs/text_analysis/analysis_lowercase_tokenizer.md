# lowercase 分词器

lowercase 分词器与 letter 分词器一样，在遇到非字母字符时将文本拆分为词项，但它还会将所有词项小写化。它在功能上等同于 [letter 分词器](/text_analysis/analysis_letter_tokenizer)与 [lowercase 词元过滤器](/text_analysis/analysis_lowercase_tokenfilter)的组合，但效率更高，因为它在单次遍历中完成这两步。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "lowercase",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

产出的词项：

```text
[ the, quick, brown, foxes, jumped, over, the, lazy, dog, s, bone ]
```

## 配置

lowercase 分词器**不可配置**。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-lowercase-tokenizer.html)
