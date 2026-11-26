# Match phrase prefix 查询（Match phrase prefix query）

`match_phrase_prefix` 查询返回这样的文档：文档中包含所提供文本的词项，且这些词项的顺序与提供文本中的顺序一致。文本的最后一个词项会被当作**前缀**处理，可以匹配任何以该前缀开头的词。

例如查询短语开头为 `quick brown f` 的内容时：

- 可以匹配 `quick brown fox`
- 可以匹配 `two quick brown ferrets`
- 不会匹配 `fox is quick and brown`

## 示例

```bash
GET /_search
{
  "query": {
    "match_phrase_prefix": {
      "message": {
        "query": "quick brown f"
      }
    }
  }
}
```

## 参数

顶层参数：

- `<field>`：（必需，object）要搜索的字段。

`<field>` 的参数：

- `query`

  （必需，字符串）要在指定字段中查找的文本。`match_phrase_prefix` 在搜索前分析文本并拆分为词项，最后一个词项作为前缀匹配以它开头的词。例如 `quick brown f` 中，`quick`、`brown` 按短语顺序匹配，`f` 作为前缀匹配 `fox`、`ferrets` 等。

- `analyzer`

  （可选，字符串）用于将 `query` 文本转换为词项的分析器。默认使用字段映射中配置的索引时分析器；如果字段未配置分析器，则使用索引的默认分析器。

- `slop`

  （可选，整数）允许匹配词项之间存在的最大位置间隔，默认 `0`（词项必须严格相邻且顺序一致）。词项位置调换需要 `slop` 为 `2`。

- `max_expansions`

  （可选，整数）最后一个词项可以扩展到的最大词项数量，默认 `50`。例如最后一个词项是 `f`，Elasticsearch 会在排序后的词项字典中查找前 50 个以 `f` 开头的词项并加入短语查询。

- `zero_terms_query`

  （可选，字符串）当分析器移除所有词项（例如使用 stop filter）时是否返回文档：

  - `none`：默认值，不返回任何文档。
  - `all`：返回所有文档，类似 `match_all` 查询。

## 用于搜索自动补全的注意事项

虽然 `match_phrase_prefix` 很容易设置，但用于自动补全时有时会产生令人困惑的结果。

以查询字符串 `quick brown f` 为例，查询的工作方式是：

1. 用 `quick` 和 `brown` 创建短语查询：`quick` 必须存在，后面必须紧跟 `brown`。
2. 在排序后的词项字典中查找前 50 个以 `f` 开头的词项。
3. 将这些词项加入短语查询。

问题在于：前 50 个以 `f` 开头的词项可能不包含 `fox`，因此 `quick brown fox` 可能不会被找到。通常这不是大问题，因为用户会继续输入更多字母直到目标词出现在候选前缀中。

对于更好的 search-as-you-type 方案，建议使用 `completion suggester` 或 `search_as_you_type` field type。

## 与 match_phrase 的区别

| 对比项 | `match_phrase` | `match_phrase_prefix` |
|---|---|---|
| 匹配方式 | 按短语顺序匹配完整词项 | 按短语顺序匹配词项，但最后一个词项按前缀匹配 |
| 最后一个词项 | 作为完整词项匹配 | 作为前缀匹配，如 `f` 匹配 `fox`、`ferrets` |
| 特有参数 | 无 `max_expansions` | 有 `max_expansions`，默认扩展前 50 个词项 |
| 适用场景 | 精确短语匹配 | 短语匹配 + 最后一个词自动补全式匹配 |
| 潜在问题 | 不做前缀扩展 | 前 `max_expansions` 个前缀词可能不包含目标词，导致漏匹配 |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-match-query-phrase-prefix.html)
