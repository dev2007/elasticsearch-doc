# 标准分析器

标准分析器是在未指定分析器时使用的默认分析器。它提供基于语法的分词（基于 Unicode 文本分段算法，即 Unicode 标准附录 #29 中规定的算法），适用于大多数语言。

## 示例输出

```bash
POST _analyze
{
  "analyzer": "standard",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词元：

```text
[ the, 2, quick, brown, foxes, jumped, over, the, lazy, dog's, bone ]
```

## 配置

标准分析器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `max_token_length` | 词元的最大长度。如果出现超过此长度的词元，则会按 `max_token_length` 间隔进行拆分。默认为 `255`。 |
| `stopwords` | 预定义的停用词列表（如 `_english_`），或包含停用词列表的数组。默认为 `_none_`。 |
| `stopwords_path` | 包含停用词的文件的路径。 |

有关停用词配置的更多信息，参阅 [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)。

## 配置示例

在本示例中，我们配置标准分析器的 `max_token_length` 为 5（仅用于演示），并使用预定义的英语停用词列表：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_english_analyzer": {
          "type": "standard",
          "max_token_length": 5,
          "stopwords": "_english_"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_english_analyzer",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上面的示例产出以下词元：

```text
[ 2, quick, brown, foxes, jumpe, d, over, lazy, dog's, bone ]
```

## 定义

标准分析器由以下部分组成：

**分词器**

- [标准分词器](/text_analysis/analysis_standard_tokenizer)

**词元过滤器**

- [Lowercase 词元过滤器](/text_analysis/analysis_lowercase_tokenfilter)
- [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)（默认禁用）

如果你需要在配置参数之外自定义标准分析器，则需要将其重建为自定义分析器并加以修改，通常通过添加词元过滤器来实现。以下代码会重建内置的标准分析器，你可以将其作为起点：

```bash
PUT /standard_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "rebuilt_standard": {
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  }
}
```

你可以在 `lowercase` 之后添加任何词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-standard-analyzer.html)
