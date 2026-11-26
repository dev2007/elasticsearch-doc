# Common grams 词元过滤器

为指定的常用词集合生成二元组（bigram）。

例如，可将 `is` 和 `the` 指定为常用词。该过滤器会将词元 `[the, quick, fox, is, brown]` 转换为 `[the, the_quick, quick, fox, fox_is, is, is_brown, brown]`。

当你**不希望完全忽略**常用词时，可以用 `common_grams` 过滤器替代 [stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)。

此过滤器基于 Lucene 的 CommonGramsFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求为 `is` 和 `the` 生成二元组：

```bash
GET /_analyze
{
  "tokenizer" : "whitespace",
  "filter" : [
    {
      "type": "common_grams",
      "common_words": ["is", "the"]
    }
  ],
  "text" : "the quick fox is brown"
}
```

该过滤器产生以下词元：

```text
[ the, the_quick, quick, fox, fox_is, is, is_brown, brown ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `common_grams` 过滤器配置一个新的自定义分析器：

```bash
PUT /common_grams_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "index_grams": {
          "tokenizer": "whitespace",
          "filter": [ "common_grams" ]
        }
      },
      "filter": {
        "common_grams": {
          "type": "common_grams",
          "common_words": [ "a", "is", "the" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `common_words`

  （必需*，字符串数组）词元列表。过滤器为这些词元生成二元组。此参数与 `common_words_path` 二选一必填。

- `common_words_path`

  （必需*，字符串）指向包含词元列表的文件的路径。过滤器为这些词元生成二元组。路径必须为绝对路径，或相对于 `config` 目录。文件必须为 UTF-8 编码，文件中每个词元以换行符分隔。此参数与 `common_words` 二选一必填。

- `ignore_case`

  （可选，布尔值）若为 `true`，常用词匹配不区分大小写。默认为 `false`。

- `query_mode`

  （可选，布尔值）若为 `true`，过滤器会从输出中排除以下词元：常用词本身的一元词元；后接常用词的词项的一元词元。默认为 `false`。**建议在搜索分析器中启用此参数。** 例如：启用此参数并将 `is`、`the` 指定为常用词后，词元 `[the, quick, fox, is, brown]` 会被转换为 `[the_quick, quick, fox_is, is_brown]`。

## 自定义

要自定义 `common_grams` 过滤器，可复制它作为新自定义词元过滤器的基础，并通过其可配置参数进行修改。

例如，以下请求创建一个 `ignore_case` 和 `query_mode` 均设为 `true` 的自定义 `common_grams` 过滤器：

```bash
PUT /common_grams_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "index_grams": {
          "tokenizer": "whitespace",
          "filter": [ "common_grams_query" ]
        }
      },
      "filter": {
        "common_grams_query": {
          "type": "common_grams",
          "common_words": [ "a", "is", "the" ],
          "ignore_case": true,
          "query_mode": true
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-common-grams-tokenfilter.html)
