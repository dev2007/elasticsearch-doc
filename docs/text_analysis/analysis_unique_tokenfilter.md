# Unique 词元过滤器

从词元流中移除重复词元。

例如，可以使用 unique 过滤器将：

```text
lazy lazy dog
```

变为：

```text
lazy dog
```

如果 `only_on_same_position` 参数设置为 `true`，则 unique 过滤器只移除位于相同位置的重复词元。此时它的行为与 [remove_duplicates 过滤器](/text_analysis/analysis_remove_duplicates_tokenfilter)相同。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 unique 过滤器，从文本 `the quick fox jumps the lazy fox` 中移除重复词元：

```bash
GET _analyze
{
  "tokenizer" : "whitespace",
  "filter" : ["unique"],
  "text" : "the quick fox jumps the lazy fox"
}
```

该过滤器会移除重复的 `the` 和 `fox`，产生以下词元：

```text
[ the, quick, fox, jumps, lazy ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 unique 过滤器配置一个新的自定义分析器：

```bash
PUT custom_unique_example
{
  "settings" : {
    "analysis" : {
      "analyzer" : {
        "standard_truncate" : {
          "tokenizer": "standard",
          "filter": ["unique"]
        }
      }
    }
  }
}
```

## 可配置参数

- `only_on_same_position`

  （可选，布尔值）如果为 `true`，仅移除位于相同位置的重复词元。默认为 `false`。

## 自定义并添加到分析器

要自定义 unique 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建一个自定义 unique 过滤器，并将 `only_on_same_position` 设置为 `true`：

```bash
PUT letter_unique_pos_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "letter_unique_pos": {
          "tokenizer": "letter",
          "filter": [ "unique_pos" ]
        }
      },
      "filter": {
        "unique_pos": {
          "type": "unique",
          "only_on_same_position": true
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-unique-tokenfilter.html)
