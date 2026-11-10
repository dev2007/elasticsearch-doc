# ngram 分词器

ngram 分词器在遇到指定字符列表中的任意字符时先将文本拆分为单词，然后产出每个单词的指定长度的 N-gram。

N-gram 就像一个在单词上滑动的滑动窗口——指定长度的连续字符序列。它们适用于查询不使用空格或包含长复合词的语言，比如德语。

## 示例输出

使用默认设置时，ngram 分词器将初始文本视为单个词元，并产出最小长度为 1、最大长度为 2 的 N-gram。

```bash
POST _analyze
{
  "tokenizer": "ngram",
  "text": "Quick Fox"
}
```

上述句子产出以下词项：

```text
[ Q, Qu, u, ui, i, ic, c, ck, k, "k ", " ", " F", F, Fo, o, ox, x ]
```

## 配置

ngram 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `min_gram` | gram 中字符的最小长度。默认为 `1`。 |
| `max_gram` | gram 中字符的最大长度。默认为 `2`。 |
| `token_chars` | 应包含在词元中的字符类。Elasticsearch 会在不属于指定类的字符处拆分。默认为 `[]`（保留所有字符）。 |
| `custom_token_chars` | 应被视为词元一部分的自定义字符。例如，将其设置为 `+-_` 会使分词器将加号、减号和下划线视为词元的一部分。 |

`token_chars` 字符类：

- **letter**——例如 `a`、`b`、`ï` 或 `京`
- **digit**——例如 `3` 或 `7`
- **whitespace**——例如 `" "` 或 `"\n"`
- **punctuation**——例如 `!` 或 `"`
- **symbol**——例如 `$` 或 `√`
- **custom**——需要通过 `custom_token_chars` 设置的自定义字符。

通常将 `min_gram` 和 `max_gram` 设置为相同的值是合理的。长度越小，匹配的文档越多，但匹配质量越低。长度越长，匹配越精确。三元组（trigram，长度 3）是一个很好的起点。

::::note 提示
索引级设置 `index.max_ngram_diff` 控制 `max_gram` 与 `min_gram` 之间允许的最大差值。
::::

## 配置示例

在本示例中，我们配置 ngram 分词器将字母和数字视为词元，并产出三元组（长度为 3 的 gram）。

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
          "type": "ngram",
          "min_gram": 3,
          "max_gram": 3,
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
[ Qui, uic, ick, Fox, oxe, xes ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-ngram-tokenizer.html)
