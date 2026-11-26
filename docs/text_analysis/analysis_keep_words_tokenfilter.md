# Keep words 词元过滤器

仅保留包含在指定单词列表中的词元。

此过滤器使用 Lucene 的 KeepWordFilter。

:::::tip 提示
如果要从词元流中移除一组单词而不是保留它们，请使用 [stop 词元过滤器](/text_analysis/analysis_stop_tokenfilter)。
:::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 keep 过滤器仅保留文本 `the quick fox jumps over the lazy dog` 中的 `fox` 和 `dog` 词元：

```bash
GET _analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "keep",
      "keep_words": [ "dog", "elephant", "fox" ]
    }
  ],
  "text": "the quick fox jumps over the lazy dog"
}
```

该过滤器产生以下词元：

```text
[ fox, dog ]
```

## 可配置参数

- `keep_words`

  （必需*，字符串数组）要保留的单词列表。只有与列表中单词匹配的词元才会包含在输出中。

  必须指定此参数或 `keep_words_path` 参数。

- `keep_words_path`

  （必需*，字符串）指向包含要保留单词列表的文件的路径。只有与文件中单词匹配的词元才会包含在输出中。

  此路径必须是绝对路径，或相对于 `config` 位置的相对路径。文件必须是 UTF-8 编码，且每个单词以换行符分隔。

  必须指定此参数或 `keep_words` 参数。

- `keep_words_case`

  （可选，布尔值）如果为 `true`，则将所有保留单词转为小写。默认为 `false`。

## 自定义并添加到分析器

要自定义 keep 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用两个自定义 keep 过滤器配置了两个新的自定义分析器：

- `standard_keep_word_array`：使用带内联单词数组的自定义 keep 过滤器 `keep_word_array`。
- `standard_keep_word_file`：使用带保留单词文件的自定义 keep 过滤器 `keep_word_file`。

```bash
PUT keep_words_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_keep_word_array": {
          "tokenizer": "standard",
          "filter": [ "keep_word_array" ]
        },
        "standard_keep_word_file": {
          "tokenizer": "standard",
          "filter": [ "keep_word_file" ]
        }
      },
      "filter": {
        "keep_word_array": {
          "type": "keep",
          "keep_words": [ "one", "two", "three" ]
        },
        "keep_word_file": {
          "type": "keep",
          "keep_words_path": "analysis/example_word_list.txt"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-keep-words-tokenfilter.html)
