# keyword 分析器

`keyword` 分析器是一个“noop”分析器，它将整个输入字符串作为单个词元返回。

## 示例输出

```bash
POST _analyze
{
  "analyzer": "keyword",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下单个词项：

```text
[ The 2 QUICK Brown-Foxes jumped over the lazy dog's bone. ]
```

## 配置

`keyword` 分析器**不可配置**。

## 定义

`keyword` 分析器由以下部分组成：

**分词器**

- [Keyword 分词器](/text_analysis/analysis_keyword_tokenizer)

如果你需要自定义 `keyword` 分析器，则需要将其重建为 `custom` 分析器并加以修改，通常通过添加词元过滤器来实现。通常，当你希望字符串不被拆分为词元时，应该优先使用 [keyword 字段类型](/mapping/field_data_types/keyword)；但万不得已时，以下代码会重建内置的 `keyword` 分析器，你可以将其作为进一步自定义的起点：

```bash
PUT /keyword_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "rebuilt_keyword": {
          "tokenizer": "keyword",
          "filter": []
        }
      }
    }
  }
}
```

你可以在这里添加任何词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-keyword-analyzer.html)
