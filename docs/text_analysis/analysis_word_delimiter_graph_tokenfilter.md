# Word delimiter graph 词元过滤器

word_delimiter_graph 过滤器会在非字母数字字符处拆分词元，并可基于一组规则执行可选的词元归一化。

默认情况下，该过滤器使用以下规则：

- 在非字母数字字符处拆分词元，这些字符被用作分隔符。例如：`Super-Duper` → `Super`、`Duper`。
- 移除每个词元开头或结尾的分隔符。例如：`XL---42+'Autocoder'` → `XL`、`42`、`Autocoder`。
- 在字母大小写转换处拆分词元。例如：`PowerShot` → `Power`、`Shot`。
- 在字母与数字转换处拆分词元。例如：`XL500` → `XL`、`500`。
- 移除每个词元结尾的英文所有格 `'s`。例如：`Neil's` → `Neil`。

此过滤器使用 Lucene 的 WordDelimiterGraphFilter。

word_delimiter_graph 过滤器设计用于移除复杂标识符中的标点，例如产品 ID 或零件号。对于这些用例，建议将其与 `keyword` 分词器配合使用。

:::::tip 提示
避免使用该过滤器拆分带连字符的词（例如 `wi-fi`）。因为用户通常会同时使用带连字符和不带连字符的形式搜索这些词，建议使用 [synonym_graph 过滤器](/text_analysis/analysis_synonym_graph_tokenfilter)。
:::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 word_delimiter_graph 过滤器，按默认规则拆分 `Neil's-Super-Duper-XL500--42+AutoCoder`：

```bash
GET /_analyze
{
  "tokenizer": "keyword",
  "filter": [ "word_delimiter_graph" ],
  "text": "Neil's-Super-Duper-XL500--42+AutoCoder"
}
```

该过滤器产生以下词元：

```text
[ Neil, Super, Duper, XL, 500, 42, Auto, Coder ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 word_delimiter_graph 过滤器配置一个新的自定义分析器：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "filter": [ "word_delimiter_graph" ]
        }
      }
    }
  }
}
```

:::::warning 警告
避免将 word_delimiter_graph 与会移除标点的分词器（例如 `standard` 分词器）一起使用。这可能阻止过滤器正确拆分词元，也可能干扰 `catenate_all` 或 `preserve_original` 等参数。建议使用 `keyword` 或 `whitespace` 分词器。
:::::

## 可配置参数

- `adjust_offsets`

  （可选，布尔值）如果为 `true`，过滤器会调整拆分或连接词元的偏移量，以更好地反映它们在词元流中的实际位置。默认为 `true`。

  如果分析器使用了会在不改变偏移量的情况下改变词元长度的过滤器（例如 [trim 过滤器](/text_analysis/analysis_trim_tokenfilter)），应将 `adjust_offsets` 设为 `false`。否则，word_delimiter_graph 过滤器可能产生非法偏移量。

- `catenate_all`

  （可选，布尔值）如果为 `true`，过滤器会为由非字母分隔符分隔的字母数字字符链生成连接后的词元。例如：`super-duper-xl-500` → `[ superduperxl500, super, duper, xl, 500 ]`。默认为 `false`。

  :::::warning 警告
  设置为 `true` 会产生多位置词元，而索引不支持多位置词元。如果为 `true`，请避免在索引分析时使用此过滤器，或在此过滤器之后使用 [flatten_graph 过滤器](/text_analysis/analysis_flatten_graph_tokenfilter)使词元流适合索引。

  用于搜索分析时，连接词元可能导致 `match_phrase` 查询及其他依赖词元位置的查询出现问题。
  ::::

- `catenate_numbers`

  （可选，布尔值）如果为 `true`，过滤器会为由非字母分隔符分隔的数字字符链生成连接后的词元。例如：`01-02-03` → `[ 010203, 01, 02, 03 ]`。默认为 `false`。

  与 `catenate_all` 相同：会产生多位置词元，索引分析时需谨慎使用。

- `catenate_words`

  （可选，布尔值）如果为 `true`，过滤器会为由非字母分隔符分隔的字母字符链生成连接后的词元。例如：`super-duper-xl` → `[ superduperxl, super, duper, xl ]`。默认为 `false`。

  与 `catenate_all` 相同：会产生多位置词元，索引分析时需谨慎使用。

- `generate_number_parts`

  （可选，布尔值）如果为 `true`，过滤器会在输出中包含仅由数字字符组成的词元。默认为 `true`。

- `generate_word_parts`

  （可选，布尔值）如果为 `true`，过滤器会在输出中包含仅由字母字符组成的词元。默认为 `true`。

- `ignore_keywords`

  （可选，布尔值）如果为 `true`，过滤器会跳过带有 `keyword` 属性且属性值为 `true` 的词元。默认为 `false`。

- `preserve_original`

  （可选，布尔值）如果为 `true`，过滤器会在输出中包含任何被拆分词元的原始版本（包含非字母数字分隔符）。例如：`super-duper-xl-500` → `[ super-duper-xl-500, super, duper, xl, 500 ]`。默认为 `false`。

  与 `catenate_all` 相同：会产生多位置词元，索引分析时需谨慎使用。

- `protected_words`

  （可选，字符串数组）过滤器不会拆分的词元数组。

- `protected_words_path`

  （可选，字符串）指向包含过滤器不会拆分的词元列表的文件路径。此路径必须是绝对路径，或相对于 `config` 位置。文件必须为 UTF-8 编码，每个词元以换行符分隔。

- `split_on_case_change`

  （可选，布尔值）如果为 `true`，过滤器会在字母大小写转换处拆分词元。例如：`camelCase` → `[ camel, Case ]`。默认为 `true`。

- `split_on_numerics`

  （可选，布尔值）如果为 `true`，过滤器会在字母与数字转换处拆分词元。例如：`j2se` → `[ j, 2, se ]`。默认为 `true`。

- `stem_english_possessive`

  （可选，布尔值）如果为 `true`，过滤器会移除每个词元结尾的英文所有格 `'s`。例如：`O'Neil's` → `[ O, Neil ]`。默认为 `true`。

- `type_table`

  （可选，字符串数组）自定义字符类型映射数组。可用于将非字母数字字符映射为数字或字母数字类型，从而避免在这些字符处拆分。例如：`[ "+ => ALPHA", "- => ALPHA" ]`。

- `type_table_path`

  （可选，字符串）指向包含自定义类型映射的文件的路径。路径必须是绝对路径，或相对于 `config` 位置。文件必须为 UTF-8 编码，每条映射以换行符分隔。

支持的类型：

- `ALPHA` — 字母
- `ALPHANUM` — 字母数字
- `DIGIT` — 数字
- `LOWER` — 小写字母
- `SUBWORD_DELIM` — 非字母数字分隔符
- `UPPER` — 大写字母

## 自定义并添加到分析器

要自定义 word_delimiter_graph 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

以下示例创建的过滤器在非字母数字字符处拆分词元（连字符 `-` 除外），不在大小写转换处或字母与数字转换处拆分，并移除英文所有格 `'s`：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "filter": [ "my_custom_word_delimiter_graph_filter" ]
        }
      },
      "filter": {
        "my_custom_word_delimiter_graph_filter": {
          "type": "word_delimiter_graph",
          "type_table": [ "- => ALPHA" ],
          "split_on_case_change": false,
          "split_on_numerics": false,
          "stem_english_possessive": true
        }
      }
    }
  }
}
```

## word_delimiter_graph 与 word_delimiter 的区别

当以下任一参数为 `true` 时，两个过滤器都会产生跨越多个位置的词元：

- `catenate_all`
- `catenate_numbers`
- `catenate_words`
- `preserve_original`

但是，只有 word_delimiter_graph 过滤器会为多位置词元分配 `positionLength` 属性，该属性表示词元跨越的位置数。这确保 word_delimiter_graph 过滤器始终产生有效的词元图。

word_delimiter 过滤器不会为多位置词元分配 `positionLength` 属性。这意味着当词元流包含这些词元时，它会生成无效的图。

索引不支持包含多位置词元的词元图。但是，`match_phrase` 等查询可以使用这些图，从单个查询字符串生成多个子查询。

### 示例

当 `catenate_all`、`catenate_numbers`、`catenate_words` 和 `preserve_original` 均为 `false` 时，两个过滤器都会为 `PowerShot2000` 产生相同的词元图：图中没有多位置词元，所有词元仅跨越一个位置。

当 `catenate_words` 为 `true` 时：

- word_delimiter_graph 会为 `PowerShot2000` 产生带有多位置词元的图，串联后的 `PowerShot` 词元正确地跨越两个位置。
- word_delimiter 也会产生带有多位置词元的图，但串联后的 `PowerShot` 词元在图中只跨越一个位置，因此该图是无效的。

## 索引阶段使用限制汇总

- 以下参数为 `true` 时会产生多位置词元，而索引不支持多位置词元：`catenate_all`、`catenate_numbers`、`catenate_words`、`preserve_original`。
- 如果这些参数为 `true`，应避免在索引分析器中使用该过滤器；或者在该过滤器之后使用 `flatten_graph` 过滤器，使词元流适合索引。
- 在搜索分析中使用这些连接词元时，可能影响 `match_phrase` 查询及其他依赖词元位置的查询。
- 避免与会移除标点的分词器（如 `standard` 分词器）一起使用，推荐使用 `keyword` 或 `whitespace` 分词器。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-word-delimiter-graph-tokenfilter.html)
