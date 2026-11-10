# edge_ngram 分词器

`edge_ngram` 分词器在遇到指定字符列表中的任意字符时先将文本拆分为单词，然后产出每个单词的 [N-gram](https://en.wikipedia.org/wiki/N-gram)，其中 N-gram 的开头锚定在单词的开头。

Edge N-Gram 适用于“输入即搜”（search-as-you-type）查询。

当需要对具有广为人知顺序的文本（如电影或歌曲标题）进行“输入即搜”时，[completion suggester](/search_your_data/search_suggesters#completion-suggester) 是比 edge N-gram 高效得多的选择。当尝试自动补全可能以任意顺序出现的单词时，Edge N-gram 更具优势。

## 示例输出

使用默认设置时，`edge_ngram` 分词器将初始文本视为单个词元，并产出最小长度为 `1`、最大长度为 `2` 的 N-gram：

```bash
POST _analyze
{
  "tokenizer": "edge_ngram",
  "text": "Quick Fox"
}
```

上述句子会产出以下词项：

```text
[ Q, Qu ]
```

这些默认的 gram 长度几乎毫无用处。你需要在使用前配置 `edge_ngram` 分词器。

## 配置

`edge_ngram` 分词器接受以下参数：

- `min_gram`

  gram 中字符的最小长度。默认为 `1`。

- `max_gram`

  gram 中字符的最大长度。默认为 `2`。

  参阅 [`max_gram` 参数的限制](#max_gram-参数的限制)。

- `token_chars`

  应包含在词元中的字符类。Elasticsearch 会在不属于指定类的字符处拆分。默认为 `[]`（保留所有字符）。

  字符类可以是以下任意一种：

  - `letter`——例如 `a`、`b`、`ï` 或 `京`
  - `digit`——例如 `3` 或 `7`
  - `whitespace`——例如 `" "` 或 `"\n"`
  - `punctuation`——例如 `!` 或 `"`
  - `symbol`——例如 `$` 或 `√`
  - `custom`——需要通过 `custom_token_chars` 设置的自定义字符。

- `custom_token_chars`

  应被视为词元一部分的自定义字符。例如，将其设置为 `+-_` 会使分词器将加号、减号和下划线视为词元的一部分。

## `max_gram` 参数的限制

`edge_ngram` 分词器的 `max_gram` 值限制词元的字符长度。当 `edge_ngram` 分词器与索引分析器一起使用时，这意味着长于 `max_gram` 长度的搜索词可能无法匹配任何已索引的词项。

例如，如果 `max_gram` 为 `3`，搜索 `apple` 将无法匹配已索引的词项 `app`。

为解决这个问题，你可以将 [`truncate`](/text_analysis/analysis_truncate_tokenfilter) 词元过滤器与搜索分析器配合使用，将搜索词缩短到 `max_gram` 字符长度。不过，这可能会返回不相关的结果。

例如，如果 `max_gram` 为 `3` 且搜索词被截断为三个字符，那么搜索词 `apple` 会被缩短为 `app`。这意味着搜索 `apple` 会返回所有匹配 `app` 的已索引词项，例如 `apply`、`approximate` 和 `apple`。

我们建议对这两种方法都进行测试，以确定哪种最适合你的用例和期望的搜索体验。

## 配置示例

在本示例中，我们配置 `edge_ngram` 分词器将字母和数字视为词元字符，并产出最小长度为 `2`、最大长度为 `10` 的 gram：

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "my_tokenizer"
        }
      },
      "tokenizer": {
        "my_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": [ "letter", "digit" ]
        }
      }
    }
  }
}

POST my-index-000001/_analyze
{
  "analyzer": "my_analyzer",
  "text": "2 Quick Foxes."
}
```

上面的示例产出以下词项：

```text
[ Qu, Qui, Quic, Quick, Fo, Fox, Foxe, Foxes ]
```

通常我们建议在索引时和搜索时使用同一个 `analyzer`。但对于 `edge_ngram` 分词器，建议有所不同。只在索引时使用 `edge_ngram` 分词器才有意义，以确保索引中存在可供匹配的部分单词。在搜索时，只需搜索用户输入的词项，例如 `Quick Fo`。

下面是一个如何为“输入即搜”设置字段的示例。

注意，索引分析器的 `max_gram` 值为 `10`，这会将已索引的词项限制在 10 个字符以内。搜索词不会被截断，这意味着长于 10 个字符的搜索词可能无法匹配任何已索引的词项。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "autocomplete": {
          "tokenizer": "autocomplete",
          "filter": [ "lowercase" ]
        },
        "autocomplete_search": {
          "tokenizer": "lowercase"
        }
      },
      "tokenizer": {
        "autocomplete": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": [ "letter" ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "autocomplete",
        "search_analyzer": "autocomplete_search"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "title": "Quick Foxes"
}

POST my-index-000001/_refresh

GET my-index-000001/_search
{
  "query": {
    "match": {
      "title": {
        "query": "Quick Fo",
        "operator": "and"
      }
    }
  }
}
```

1. `autocomplete` 分析器索引词项 `[qu, qui, quic, quick, fo, fox, foxe, foxes]`。
2. `autocomplete_search` 分析器搜索词项 `[quick, fo]`，两者都出现在索引中。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-edgengram-tokenizer.html)
