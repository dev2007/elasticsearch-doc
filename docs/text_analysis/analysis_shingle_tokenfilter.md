# Shingle 词元过滤器

通过连接相邻词元，向词元流添加 shingle（即词 n-gram）。默认情况下，shingle 过滤器输出双词 shingle 和单词元（unigram）。

例如，许多分词器会将 `the lazy dog` 转换为 `[ the, lazy, dog ]`。你可以使用 shingle 过滤器向该词元流添加双词 shingle：`[ the, the lazy, lazy, lazy dog, dog ]`。

Shingle 通常用于帮助加快短语查询（如 `match_phrase`）的速度。不过，我们建议你在相应的 text 字段上使用 `index_phrases` 映射参数，而不是使用 shingle 过滤器创建 shingle。

:::::tip 提示
`index_phrases` 映射参数可在不生成 shingle 的情况下加速短语查询，应优先考虑使用。
:::::

此过滤器使用 Lucene 的 ShingleFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 shingle 过滤器为 `quick brown fox jumps` 的词元流添加双词 shingle：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [ "shingle" ],
  "text": "quick brown fox jumps"
}
```

该过滤器产生以下词元：

```text
[ quick, quick brown, brown, brown fox, fox, fox jumps, jumps ]
```

要生成 2 到 3 个词的 shingle，可在请求中添加 `min_shingle_size` 和 `max_shingle_size` 参数：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "shingle",
      "min_shingle_size": 2,
      "max_shingle_size": 3
    }
  ],
  "text": "quick brown fox jumps"
}
```

该过滤器产生以下词元：

```text
[ quick, quick brown, quick brown fox, brown, brown fox, brown fox jumps, fox, fox jumps, jumps ]
```

要在输出中只包含 shingle，可将 `output_unigrams` 参数设为 `false`：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": [
    {
      "type": "shingle",
      "min_shingle_size": 2,
      "max_shingle_size": 3,
      "output_unigrams": false
    }
  ],
  "text": "quick brown fox jumps"
}
```

该过滤器产生以下词元：

```text
[ quick brown, quick brown fox, brown fox, brown fox jumps, fox jumps ]
```

## 可配置参数

- `max_shingle_size`

  （可选，整数）创建 shingle 时连接的最大词元数。默认为 `2`。

  此值不能低于 `min_shingle_size` 参数（默认值为 `2`）。此值与 `min_shingle_size` 的差值不能超过索引级设置 `index.max_shingle_diff`（默认值为 `3`）。

- `min_shingle_size`

  （可选，整数）创建 shingle 时连接的最小词元数。默认为 `2`。

  此值不能超过 `max_shingle_size`（默认值为 `2`）。`max_shingle_size` 与此值的差值不能超过索引级设置 `index.max_shingle_diff`（默认值为 `3`）。

- `output_unigrams`

  （可选，布尔值）如果为 `true`，输出包含原始输入词元。如果为 `false`，输出只包含 shingle，原始输入词元会被移除。默认为 `true`。

- `output_unigrams_if_no_shingles`

  （可选，布尔值）如果为 `true`，只有在没有生成 shingle 时，输出才包含原始输入词元；如果生成了 shingle，则输出只包含 shingle。默认为 `false`。

  如果此参数和 `output_unigrams` 都为 `true`，则只使用 `output_unigrams` 参数。

- `token_separator`

  （可选，字符串）用于连接相邻词元以形成 shingle 的分隔符。默认为空格 `" "`。

- `filler_token`

  （可选，字符串）在 shingle 中用于替换不包含词元的空位置的字符串。该填充词元只用于 shingle，不用于原始单词元。默认为下划线 `_`。

  某些词元过滤器（例如 stop 过滤器）在移除停用词时会创建空位置，尤其是当位置增量大于 1 时。在以下请求中，stop 过滤器从 `fox jumps a lazy dog` 中移除了停用词 `a`，创建了一个空位置。随后的 shingle 过滤器在 shingle 中用加号（`+`）替换该空位置：

  ```bash
  GET /_analyze
  {
    "tokenizer": "whitespace",
    "filter": [
      {
        "type": "stop",
        "stopwords": [ "a" ]
      },
      {
        "type": "shingle",
        "filler_token": "+"
      }
    ],
    "text": "fox jumps a lazy dog"
  }
  ```

  该过滤器产生以下词元：

  ```text
  [ fox, fox jumps, jumps, jumps +, + lazy, lazy, lazy dog, dog ]
  ```

## 自定义并添加到分析器

要自定义 shingle 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义 shingle 过滤器 `my_shingle_filter` 配置一个新的自定义分析器。该过滤器的 `min_shingle_size` 为 `2`、`max_shingle_size` 为 `5`，即生成 2 到 5 个词的 shingle；同时其 `output_unigrams` 参数为 `false`，因此输出中只包含 shingle：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "en": {
          "tokenizer": "standard",
          "filter": [ "my_shingle_filter" ]
        }
      },
      "filter": {
        "my_shingle_filter": {
          "type": "shingle",
          "min_shingle_size": 2,
          "max_shingle_size": 5,
          "output_unigrams": false
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-shingle-tokenfilter.html)
