# fingerprint 分析器

fingerprint 分析器实现了一种指纹算法，该算法被 OpenRefine 项目用于辅助聚类。

输入文本会被小写化、规范化以去除扩展字符、排序、去重，并拼接为单个词元。如果配置了停用词列表，停用词也会被移除。

## 示例输出

```bash
POST _analyze
{
  "analyzer": "fingerprint",
  "text": "Yes yes, Gödel said this sentence is consistent and."
}
```

上述句子会产出以下单个词项：

```text
[ and consistent godel is said sentence this yes ]
```

## 配置

fingerprint 分析器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `separator` | 用于拼接词项的字符。默认为空格。 |
| `max_output_size` | 输出词元的最大尺寸。默认为 `255`。超过此尺寸的词元将被丢弃。 |
| `stopwords` | 预定义的停用词列表（如 `_english_`），或包含停用词列表的数组。默认为 `_none_`。 |
| `stopwords_path` | 包含停用词的文件的路径。 |

有关停用词配置的更多信息，参阅 [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)。

## 配置示例

在本示例中，我们配置 fingerprint 分析器使用预定义的英语停用词列表：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_fingerprint_analyzer": {
          "type": "fingerprint",
          "stopwords": "_english_"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_fingerprint_analyzer",
  "text": "Yes yes, Gödel said this sentence is consistent and."
}
```

上面的示例产出以下词项：

```text
[ consistent godel said sentence yes ]
```

## 定义

fingerprint 分析器由以下部分组成：

**分词器**

- [标准分词器](/text_analysis/analysis_standard_tokenizer)

**词元过滤器（按顺序）**

- [Lowercase 词元过滤器](/text_analysis/analysis_lowercase_tokenfilter)
- [ASCII-Folding 词元过滤器](/text_analysis/analysis_asciifolding_tokenfilter)
- [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)（默认禁用）
- [Fingerprint 词元过滤器](/text_analysis/analysis_fingerprint_tokenfilter)

如果你需要在配置参数之外自定义 fingerprint 分析器，则需要将其重建为自定义分析器并加以修改，通常通过添加词元过滤器来实现。以下代码会重建内置的 fingerprint 分析器，你可以将其作为进一步自定义的起点：

```bash
PUT /fingerprint_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "rebuilt_fingerprint": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding",
            "fingerprint"
          ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-fingerprint-analyzer.html)
