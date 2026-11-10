# stop 分析器

`stop` 分析器与 [`simple` 分析器](/text_analysis/analysis_simple_analyzer)相同，但增加了移除停用词的支持。它默认使用 `_english_` 停用词。

## 示例输出

```bash
POST _analyze
{
  "analyzer": "stop",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上述句子会产出以下词项：

```text
[ quick, brown, foxes, jumped, over, lazy, dog, s, bone ]
```

## 配置

`stop` 分析器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `stopwords` | 预定义的停用词列表（如 `_english_`），或包含停用词列表的数组。默认为 `_english_`。 |
| `stopwords_path` | 包含停用词的文件的路径。此路径相对于 Elasticsearch 的 `config` 目录。 |

有关停用词配置的更多信息，参阅 [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)。

## 配置示例

在本示例中，我们配置 `stop` 分析器使用指定的单词列表作为停用词。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_stop_analyzer": {
          "type": "stop",
          "stopwords": [ "the", "over" ]
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_stop_analyzer",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}
```

上面的示例产出以下词项：

```text
[ quick, brown, foxes, jumped, lazy, dog, s, bone ]
```

## 定义

它由以下部分组成：

**分词器**

- [Lowercase 分词器](/text_analysis/analysis_lowercase_tokenizer)

**词元过滤器**

- [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)

如果你需要在配置参数之外自定义 `stop` 分析器，则需要将其重建为 `custom` 分析器并加以修改，通常通过添加词元过滤器来实现。以下代码会重建内置的 `stop` 分析器，你可以将其作为进一步自定义的起点：

```bash
PUT /stop_example
{
  "settings": {
    "analysis": {
      "filter": {
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        }
      },
      "analyzer": {
        "rebuilt_stop": {
          "tokenizer": "lowercase",
          "filter": [
            "english_stop"
          ]
        }
      }
    }
  }
}
```

1. 默认停用词可以通过 `stopwords` 或 `stopwords_path` 参数覆盖。
2. 你可以在 `english_stop` 之后添加任何词元过滤器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-stop-analyzer.html)
