# Match boolean prefix 查询（Match boolean prefix query）

`match_bool_prefix` 查询会分析输入文本，并根据分析得到的词项构造一个 `bool` 查询。

- 除最后一个词项外，每个词项用于 `term` 查询。
- 最后一个词项用于 `prefix` 查询。

例如：

```bash
GET /_search
{
  "query": {
    "match_bool_prefix" : {
      "message" : "quick brown f"
    }
  }
}
```

如果分析器将输入文本分析为 `quick`、`brown` 和 `f` 三个词项，那么它类似于下面的 `bool` 查询：

```bash
GET /_search
{
  "query": {
    "bool" : {
      "should": [
        { "term": { "message": "quick" }},
        { "term": { "message": "brown" }},
        { "prefix": { "message": "f"}}
      ]
    }
  }
}
```

## 工作原理

`match_bool_prefix` 与 `match_phrase_prefix` 的重要区别：

- `match_phrase_prefix` 将其词项作为短语匹配，要求词项顺序和邻近关系符合短语要求。
- `match_bool_prefix` 可以在任意位置匹配这些词项，不要求相邻或保持原始顺序。

因此，上面的 `match_bool_prefix` 查询 `quick brown f` 既可以匹配包含 `quick brown fox` 的字段，也可以匹配包含 `brown fox quick` 的字段；还可以匹配包含 `quick`、`brown` 以及任意位置上一个以 `f` 开头词项的字段。

## 参数

- `query`

  要查询并由分析器分析的输入文本。可以使用简写形式：

  ```bash
  GET /_search
  {
    "query": {
      "match_bool_prefix" : {
        "message" : "quick brown f"
      }
    }
  }
  ```

  也可以使用对象形式并结合其他参数：

  ```bash
  GET /_search
  {
    "query": {
      "match_bool_prefix": {
        "message": {
          "query": "quick brown f",
          "analyzer": "keyword"
        }
      }
    }
  }
  ```

- `analyzer`

  默认情况下，输入文本使用被查询字段映射中指定的分析器分析。可通过 `analyzer` 参数指定不同的搜索分析器。

- `minimum_should_match`

  说明与 `match` 查询相同，会应用到构造出的 `bool` 查询上。该 `bool` 查询的子句数量在大多数情况下等于查询文本分析后产生的词项数量。

- `operator`

  说明与 `match` 查询相同，同样应用到构造出的 `bool` 查询上。

- `fuzziness`、`prefix_length`、`max_expansions`

  这些参数（以及 `fuzzy_transpositions`、`fuzzy_rewrite`）可应用到除最后一个词项外、由分析器生成的所有词项所对应的 `term` 子查询上，**不会**作用于最后一个词项构造出的 `prefix` 查询。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-match-bool-prefix-query.html)
