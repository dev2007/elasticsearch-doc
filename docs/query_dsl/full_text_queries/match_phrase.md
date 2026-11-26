# Match phrase 查询（Match phrase query）

`match_phrase` 查询会对文本进行分析，并基于分析后的文本创建一个 `phrase` query。

## 示例

```bash
GET /_search
{
  "query": {
    "match_phrase": {
      "message": "this is a test"
    }
  }
}
```

## `<field>` 参数

- `query`

  （必需）希望在该字段中查找的文本、数字、布尔值或日期。

- `analyzer`

  （可选，字符串）用于将 `query` 值中的文本转换为 token 的分析器。默认使用字段映射中配置的索引时分析器；如果字段未配置分析器，则使用索引的默认分析器。也可通过 `analyzer` 控制分析查询文本时使用的分析器。

- `slop`

  （可选，整数）匹配 token 之间允许的最大位置数，默认 `0`。词项位置颠倒时需要 `slop` 为 `2`。

- `zero_terms_query`

  （可选，字符串）当分析器移除所有 token（例如使用 `stop` filter）时是否返回文档：

  - `none`：默认值，不返回任何文档。
  - `all`：返回所有文档，效果类似 `match_all` query。

## 短语匹配机制

短语查询根据可配置的 `slop` 匹配词项，默认 `0`，即要求词项按顺序且位置相邻匹配。允许 slop 时词项可存在位置间隔；词项顺序颠倒时需要 slop 为 `2`。

`match_phrase` 会先分析查询文本，再基于分析结果构造 phrase query。

## 使用自定义 analyzer

```bash
GET /_search
{
  "query": {
    "match_phrase": {
      "message": {
        "query": "this is a test",
        "analyzer": "my_analyzer"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-match-query-phrase.html)
