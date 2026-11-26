# Match 查询（Match query）

`match` 查询返回与提供的文本、数字、日期或布尔值匹配的文档。提供的文本会在匹配前被分析。

`match` 查询是执行全文搜索的标准查询，并包含模糊匹配等选项。

`match` 也适用于 `semantic_text` 字段；但当对 `semantic_text` 字段执行 `match` 查询时，专门针对词法搜索的选项（例如 `fuzziness` 或 `analyzer`）会被忽略。

## 示例

```bash
GET /_search
{
  "query": {
    "match": {
      "message": {
        "query": "this is a test"
      }
    }
  }
}
```

## 参数

顶层参数：

- `<field>`：（必需，对象）要搜索的字段。

`<field>` 的参数：

- `query`

  （必需）要在指定字段中查找的文本、数字、布尔值或日期。`match` 查询会在搜索前分析提供的文本，因此可以搜索文本字段中经过分析的 token，而不是精确 term。

- `analyzer`

  （可选，字符串）用于将查询值中的文本转换为 token 的分析器。默认使用字段映射配置的索引时分析器；如果字段没有映射分析器，则使用索引的默认分析器。

- `auto_generate_synonyms_phrase_query`

  （可选，布尔值）如果为 `true`，会为多词同义词自动创建 `match phrase` 查询。默认 `true`。

- `boost`

  （可选，浮点数）降低或提高查询的相关性分数，默认 `1.0`。`0` 到 `1.0` 会降低分数，大于 `1.0` 会提高分数。

- `fuzziness`

  （可选，字符串）允许的最大编辑距离。

- `max_expansions`

  （可选，整数）查询扩展到的最大 term 数量，默认 `50`。

- `prefix_length`

  （可选，整数）模糊匹配时保持不变的起始字符数量，默认 `0`。

- `fuzzy_transpositions`

  （可选，布尔值）模糊匹配中的编辑操作是否包括相邻字符交换（如 `ab → ba`），默认 `true`。

- `fuzzy_rewrite`

  （可选，字符串）用于重写查询的方法。如果 `fuzziness` 不为 `0`，`match` 查询默认使用 `top_terms_blended_freqs_${max_expansions}`。

- `lenient`

  （可选，布尔值）如果为 `true`，会忽略基于格式的错误（例如向数字字段提供文本查询值），默认 `false`。

- `operator`

  （可选，字符串）解释查询值中文本的布尔逻辑：

  - `OR`（默认）：`capital of Hungary` 解释为 `capital OR of OR Hungary`
  - `AND`：`capital of Hungary` 解释为 `capital AND of AND Hungary`

- `minimum_should_match`

  （可选，字符串）文档被返回前必须匹配的 clause 最小数量。

- `zero_terms_query`

  （可选，字符串）当分析器移除所有 token 时（例如使用 stop filter）的行为：

  - `none`（默认）：不返回任何文档。
  - `all`：返回所有文档，类似 `match_all` 查询。

## 简短语法

可以组合 `<field>` 和 `query` 简写：

```bash
GET /_search
{
  "query": {
    "match": {
      "message": "this is a test"
    }
  }
}
```

## match 查询的工作原理

`match` 查询是 boolean 类型：提供的文本被分析，分析过程基于文本构造 boolean 查询。`operator` 可设为 `or` 或 `and`（默认 `or`），控制 boolean clause；`minimum_should_match` 可设置必须匹配的 optional `should` clause 最小数量。

```bash
GET /_search
{
  "query": {
    "match": {
      "message": {
        "query": "this is a test",
        "operator": "and"
      }
    }
  }
}
```

## match 查询中的 fuzziness

`fuzziness` 允许基于被查询字段类型进行模糊匹配。`prefix_length` 和 `max_expansions` 控制模糊过程。如果设置了 fuzzy 选项，查询使用 `top_terms_blended_freqs_${max_expansions}` 作为重写方法；`fuzzy_rewrite` 可控制重写方式。

Fuzzy transpositions（`ab → ba`）默认允许，可通过 `fuzzy_transpositions: false` 禁用。

模糊匹配不会应用于：

- 带同义词的 term
- 分析过程在同一位置产生多个 token 的情况

这些 term 会在底层扩展为特殊的 synonym query，混合 term frequency 但不支持模糊扩展。

```bash
GET /_search
{
  "query": {
    "match": {
      "message": {
        "query": "this is a testt",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

## Zero terms query

如果分析器移除了查询中的所有 token（例如 stop filter 的行为），默认不匹配任何文档。可通过 `zero_terms_query` 改变：接受 `none`（默认）或 `all`（对应 `match_all`）：

```bash
GET /_search
{
  "query": {
    "match": {
      "message": {
        "query": "to be or not to be",
        "operator": "and",
        "zero_terms_query": "all"
      }
    }
  }
}
```

## Synonyms

`match` 查询支持使用 `synonym_graph` token filter 进行多词同义词扩展。使用该 filter 时，解析器为每个多词同义词创建 phrase 查询。

例如同义词 `ny, new york` 会产生：

```text
(ny OR ("new york"))
```

也可以使用 conjunction 匹配多词同义词：

```bash
GET /_search
{
   "query": {
       "match" : {
           "message": {
               "query" : "ny city",
               "auto_generate_synonyms_phrase_query" : false
           }
       }
   }
}
```

上面的示例创建 boolean 查询：

```text
(ny OR (new AND york)) city
```

它匹配包含 term `ny` 或 conjunction `new AND york` 的文档。`auto_generate_synonyms_phrase_query` 默认 `true`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-match-query.html)
