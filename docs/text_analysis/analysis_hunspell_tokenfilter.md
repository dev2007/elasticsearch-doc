# Hunspell 词元过滤器

基于提供的 Hunspell 词典进行词典词干提取。`hunspell` 过滤器需要配置一个或多个特定语言的 Hunspell 词典。

此过滤器使用 Lucene 的 HunspellStemFilter。

::::tip 提示
如果可用，我们建议在使用 hunspell 词元过滤器之前，先尝试针对你的语言的算法词干提取器。实践中，算法词干提取器通常优于词典词干提取器。参阅[词典词干提取器](/text_analysis/stemming#词典词干提取器)。
::::

## 配置 Hunspell 词典

Hunspell 词典存储在文件系统上一个专用的 `hunspell` 目录中并进行检测：`<$ES_PATH_CONF>/hunspell`。每个词典应拥有自己的目录，以其关联的语言和区域设置命名（例如 `pt_BR`、`en_GB`）。此词典目录应包含一个 `.aff` 文件和一个或多个 `.dic` 文件，它们都会被自动获取。例如，以下目录布局将定义 `en_US` 词典：

```text
- config
    |-- hunspell
    |    |-- en_US
    |    |    |-- en_US.dic
    |    |    |-- en_US.aff
```

每个词典可以使用以下设置进行配置：

- `ignore_case`

  （静态，布尔值）如果为 `true`，词典匹配将不区分大小写。默认为 `false`。

此设置可以在 `elasticsearch.yml` 中通过 `indices.analysis.hunspell.dictionary.ignore_case` 全局配置。

要为特定区域设置配置该设置，请使用 `indices.analysis.hunspell.dictionary.<locale>.ignore_case` 设置（例如，对于 `en_US`（美式英语）区域设置，该设置为 `indices.analysis.hunspell.dictionary.en_US.ignore_case`）。

你还可以在词典目录下添加一个 `settings.yml` 文件来保存这些设置。这会覆盖在 `elasticsearch.yml` 中定义的任何其他 `ignore_case` 设置。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 hunspell 过滤器将 `the foxes jumping quickly` 词干提取为 `the fox jump quick`。

该请求指定 `en_US` 区域设置，这意味着使用 `<$ES_PATH_CONF>/hunspell/en_US` 目录中的 `.aff` 和 `.dic` 文件作为 Hunspell 词典：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "hunspell",
      "locale": "en_US"
    }
  ],
  "text": "the foxes jumping quickly"
}
```

该过滤器产生以下词元：

```text
[ the, fox, jump, quick ]
```

## 可配置参数

- `dictionary`

  （可选，字符串或字符串数组）用于 Hunspell 词典的一个或多个 `.dic` 文件（例如 `en_US.dic`、`my_custom.dic`）。

  默认情况下，hunspell 过滤器使用 `lang`、`language` 或 `locale` 参数指定的 `<$ES_PATH_CONF>/hunspell/<locale>` 目录中的所有 `.dic` 文件。

- `dedup`

  （可选，布尔值）如果为 `true`，则从过滤器的输出中移除重复词元。默认为 `true`。

- `lang`

  （必需*，字符串）`locale` 参数的别名。

  如果未指定此参数，则必须指定 `language` 或 `locale` 参数。

- `language`

  （必需*，字符串）`locale` 参数的别名。

  如果未指定此参数，则必须指定 `lang` 或 `locale` 参数。

- `locale`

  （必需*，字符串）用于指定 Hunspell 词典的 `.aff` 和 `.dic` 文件的区域设置目录。参阅[配置 Hunspell 词典](#配置-hunspell-词典)。

  如果未指定此参数，则必须指定 `lang` 或 `language` 参数。

- `longest_only`

  （可选，布尔值）如果为 `true`，输出中仅包含每个词元的最长词干提取版本。如果为 `false`，则包含该词元的所有词干提取版本。默认为 `false`。

## 自定义并添加到分析器

要自定义 hunspell 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义的 hunspell 过滤器 `my_en_US_dict_stemmer` 配置一个新的自定义分析器。

`my_en_US_dict_stemmer` 过滤器使用 `en_US` 区域设置，这意味着使用 `<$ES_PATH_CONF>/hunspell/en_US` 目录中的 `.aff` 和 `.dic` 文件。该过滤器还包含 `dedup` 参数 `false`，这意味着从词典添加的重复词元不会从过滤器的输出中移除：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "en": {
          "tokenizer": "standard",
          "filter": [ "my_en_US_dict_stemmer" ]
        }
      },
      "filter": {
        "my_en_US_dict_stemmer": {
          "type": "hunspell",
          "locale": "en_US",
          "dedup": false
        }
      }
    }
  }
}
```

## 设置

除了 `ignore_case` 设置之外，你还可以使用 `elasticsearch.yml` 为 hunspell 过滤器配置以下全局设置：

- `indices.analysis.hunspell.dictionary.lazy`

  （静态，布尔值）如果为 `true`，Hunspell 词典的加载会延迟到词典被使用时进行。如果为 `false`，节点启动时会检查词典目录并自动加载所有词典。默认为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-hunspell-tokenfilter.html)
