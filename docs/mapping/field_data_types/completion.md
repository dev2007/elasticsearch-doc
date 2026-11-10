# completion 字段类型

要使用补全建议器（completion suggester），请将要从中生成建议的字段映射为 `completion` 类型。这会索引字段值以实现快速补全。

```bash
PUT music
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion"
      }
    }
  }
}
```

## completion 字段的参数

`completion` 字段接受以下参数：

- `analyzer`
  （可选，字符串）要使用的索引分析器，默认为 `simple`。
- `search_analyzer`
  （可选，字符串）要使用的搜索分析器，默认为 `analyzer` 的值。
- `preserve_separators`
  （可选，Boolean）保留分隔符，默认为 `true`。如果禁用，当你以 `foof` 作为建议输入时，可能会找到以 `Foo Fighters` 开头的字段。
- `preserve_position_increments`
  （可选，Boolean）启用位置增量，默认为 `true`。如果禁用并使用停用词分析器，当你以 `b` 作为建议输入时，可能会得到以 `The Beatles` 开头的字段。注意：如果你能够丰富数据，也可以通过索引两个输入 `Beatles` 和 `The Beatles` 来实现这一点，而无需更改简单的分析器。
- `max_input_length`
  （可选，整数）限制单个输入的长度，默认为 `50` 个 UTF-16 码点。此限制仅在索引时使用，用于减少每个输入字符串的总字符数，防止大量输入撑爆底层数据结构。大多数用例不会受默认值影响，因为前缀补全很少会超出几个字符以上的前缀长度。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/completion.html)
