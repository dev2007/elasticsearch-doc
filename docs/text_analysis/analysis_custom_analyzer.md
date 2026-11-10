# 创建自定义分析器

当内置分析器无法满足你的需求时，你可以创建一个自定义分析器（custom analyzer），它使用以下组件的适当组合：

- 零个或多个[字符过滤器](/text_analysis/analysis_char_filters)
- 一个[分词器](/text_analysis/analysis_tokenizers)
- 零个或多个[词元过滤器](/text_analysis/analysis_token_filters)

## 配置

自定义分析器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `type` | 分析器类型。接受内置分析器类型。对于自定义分析器，使用 `custom` 或省略此参数。 |
| `tokenizer` | 内置或自定义的分词器。（必需） |
| `char_filter` | 可选的内置或自定义[字符过滤器](/text_analysis/analysis_char_filters)数组。 |
| `filter` | 可选的内置或自定义[词元过滤器](/text_analysis/analysis_token_filters)数组。 |
| `position_increment_gap` | 索引文本值数组时，Elasticsearch 会在某个值的最后一个词项与下一个值的第一个词项之间插入一个伪“间隙”（gap），以确保短语查询不会匹配来自不同数组元素的两个词项。默认为 `100`。更多信息参阅 [position_increment_gap](/mapping/mapping_parameters/position_increment_gap)。 |

## 配置示例

下面是一个组合了以下组件的示例：

**字符过滤器**

- [HTML Strip 字符过滤器](/text_analysis/analysis_htmlstrip_charfilter)

**分词器**

- [标准分词器](/text_analysis/analysis_standard_tokenizer)

**词元过滤器**

- [Lowercase 词元过滤器](/text_analysis/analysis_lowercase_tokenfilter)
- [ASCII-Folding 词元过滤器](/text_analysis/analysis_asciifolding_tokenfilter)

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "char_filter": [ "html_strip" ],
          "filter": [ "lowercase", "asciifolding" ]
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_custom_analyzer",
  "text": "Is this <b>déjà vu</b>?"
}
```

::::note 提示
对于自定义分析器，请使用 `custom` 类型或省略 `type` 参数。
::::

上面的示例产出以下词项：

```text
[ is, this, deja, vu ]
```

上面的示例使用了默认配置的分词器、词元过滤器和字符过滤器，但你也可以创建各自经过配置的版本，并在自定义分析器中使用它们。

下面是一个更复杂的示例，它组合了以下组件：

**字符过滤器**

- [Mapping 字符过滤器](/text_analysis/analysis_mapping_charfilter)，配置为将 `:)` 替换为 `_happy_`，将 `:(` 替换为 `_sad_`

**分词器**

- [Pattern 分词器](/text_analysis/analysis_pattern_tokenizer)，配置为按标点字符拆分

**词元过滤器**

- [Lowercase 词元过滤器](/text_analysis/analysis_lowercase_tokenfilter)
- [Stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)，配置为使用预定义的英语停用词列表

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "char_filter": [ "emoticons" ],
          "tokenizer": "punctuation",
          "filter": [ "lowercase", "english_stop" ]
        }
      },
      "tokenizer": {
        "punctuation": {
          "type": "pattern",
          "pattern": "[ .,!?]"
        }
      },
      "char_filter": {
        "emoticons": {
          "type": "mapping",
          "mappings": [
            ":) => _happy_",
            ":( => _sad_"
          ]
        }
      },
      "filter": {
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_custom_analyzer",
  "text": "I'm a :) person, and you?"
}
```

1. 为索引指定默认的自定义分析器 `my_custom_analyzer`。该分析器使用了请求中稍后定义的自定义分词器、字符过滤器和词元过滤器。该分析器还省略了 `type` 参数。
2. 定义自定义的 `punctuation` 分词器。
3. 定义自定义的 `emoticons` 字符过滤器。
4. 定义自定义的 `english_stop` 词元过滤器。

上面的示例产出以下词项：

```text
[ i'm, _happy_, person, you ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-custom-analyzer.html)
