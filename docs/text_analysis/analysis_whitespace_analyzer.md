# whitespace 分析器

`whitespace` 分析器在遇到空白字符时将文本拆分为词项。

## 示例输出

```bash
POST _analyze
{
  "analyzer": "whitespace",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词项：

```text
[ The, 2, QUICK, Brown-Foxes, jumped, over, the, lazy, dog's, bone. ]
```

## 配置

`whitespace` 分析器**不可配置**。

## 定义

它由以下部分组成：

**分词器**

- [Whitespace 分词器](/text_analysis/analysis_whitespace_tokenizer)

## 自定义

如果你需要自定义 `whitespace` 分析器，则需要将其重建为 `custom` 分析器并加以修改，通常通过添加词元过滤器来实现。以下代码会重建内置的 `whitespace` 分析器，你可以将其作为进一步自定义的起点：

```bash
PUT /whitespace_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "rebuilt_whitespace": {
          "tokenizer": "whitespace",
          "filter": []
        }
      }
    }
  }
}
```

你可以在这里添加任何词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-whitespace-analyzer.html)
