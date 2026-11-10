# simple 分析器

simple 分析器在任何非字母字符处（例如数字、空格、连字符和撇号）将文本拆分为词元，丢弃非字母字符，并将大写字母改为小写。

## 示例

```bash
POST _analyze
{
  "analyzer": "simple",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词元：

```text
[ the, quick, brown, foxes, jumped, over, the, lazy, dog, s, bone ]
```

## 定义

simple 分析器由一个分词器定义：

| 分词器 |
|:--|
| [Lowercase 分词器](/text_analysis/analysis_lowercase_tokenizer) |

## 自定义

要自定义 simple 分析器，可以复制它以创建自定义分析器的基础。该自定义分析器可以按需修改，通常通过添加词元过滤器。

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_simple_analyzer": {
          "tokenizer": "lowercase",
          "filter": [
          ]
        }
      }
    }
  }
}
```

你可以在这里添加任何词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-simple-analyzer.html)
