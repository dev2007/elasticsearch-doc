# Word delimiter 词元过滤器

:::::warning 警告
建议优先使用 [word_delimiter_graph 词元过滤器](/text_analysis/analysis_word_delimiter_graph_tokenfilter)，而不是 word_delimiter 过滤器：

- word_delimiter 过滤器可能产生无效的词元图（token graph）。
- word_delimiter 使用 Lucene 的 `WordDelimiterFilter`，而该过滤器已被标记为弃用（deprecated）。
:::::

word_delimiter 过滤器会在非字母数字字符处拆分词元，并可基于一组规则执行可选的词元归一化。

默认情况下，该过滤器使用以下规则：

1. 在非字母数字字符处拆分词元，这些字符被用作分隔符。例如：`Super-Duper` → `Super`、`Duper`。
2. 移除每个词元开头或结尾的分隔符。例如：`XL---42+'Autocoder'` → `XL`、`42`、`Autocoder`。
3. 在字母大小写转换处拆分词元。例如：`PowerShot` → `Power`、`Shot`。
4. 在字母与数字转换处拆分词元。例如：`XL500` → `XL`、`500`。
5. 移除每个词元结尾的英文所有格 `'s`。例如：`Neil's` → `Neil`。

word_delimiter 过滤器最初设计用于移除复杂标识符中的标点，例如产品 ID 或零件号。对于这类用例，建议将 word_delimiter 与 `keyword` 分词器配合使用。

:::::tip 提示
避免使用该过滤器拆分带连字符的词（例如 `wi-fi`）。因为用户通常会同时搜索带连字符和不带连字符的形式，建议使用 [synonym_graph 过滤器](/text_analysis/analysis_synonym_graph_tokenfilter)。
:::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 word_delimiter 过滤器，按默认规则拆分 `Neil's-Super-Duper-XL500--42+AutoCoder`：

```bash
GET /_analyze
{
  "tokenizer": "keyword",
  "filter": [ "word_delimiter" ],
  "text": "Neil's-Super-Duper-XL500--42+AutoCoder"
}
```

该过滤器产生以下词元：

```text
[ Neil, Super, Duper, XL, 500, 42, Auto, Coder ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 word_delimiter 过滤器配置一个新的自定义分析器：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "filter": [ "word_delimiter" ]
        }
      }
    }
  }
}
```

:::::warning 警告
避免将 word_delimiter 与会移除标点的分词器（例如 `standard` 分词器）一起使用。这可能阻止 word_delimiter 正确拆分词元，也可能干扰 `catenate_all` 或 `preserve_original` 等可配置参数。建议使用 `keyword` 或 `whitespace` 分词器。
:::::

## 可配置参数

- `catenate_all`

  （可选，布尔值）如果为 `true`，过滤器会为由非字母分隔符分隔的字母数字字符链生成连接后的词元。例如：`super-duper-xl-500` → `[ super, superduperxl500, duper, xl, 500 ]`。

  用于搜索分析时，连接词元可能导致 `match_phrase` 等依赖词元位置匹配的查询出现问题。如果计划使用这些查询，请避免设置为 `true`。

- `catenate_numbers`

  （可选，布尔值）如果为 `true`，过滤器会为由非字母分隔符分隔的数字字符链生成连接后的词元。例如：`01-02-03` → `[ 01, 010203, 02, 03 ]`。同样可能影响 `match_phrase` 等基于词元位置的查询。

- `catenate_words`

  （可选，布尔值）如果为 `true`，过滤器会为由非字母分隔符分隔的字母字符链生成连接后的词元。例如：`super-duper-xl` → `[ super, superduperxl, duper, xl ]`。同样可能影响 `match_phrase` 等基于词元位置的查询。

- `generate_number_parts`

  （可选，布尔值）如果为 `true`，过滤器会在输出中包含仅由数字字符组成的词元。默认为 `true`。

- `generate_word_parts`

  （可选，布尔值）如果为 `true`，过滤器会在输出中包含仅由字母字符组成的词元。默认为 `true`。

- `preserve_original`

  （可选，布尔值）如果为 `true`，过滤器会在输出中包含被拆分词元的原始版本（包含非字母数字分隔符）。例如：`super-duper-xl-500` → `[ super-duper-xl-500, super, duper, xl, 500 ]`。默认为 `false`。

- `protected_words`

  （可选，字符串数组）过滤器不会拆分的词元数组。

- `protected_words_path`

  （可选，字符串）指向包含“不会被拆分的词元”列表的文件路径。此路径必须是绝对路径，或相对于 `config` 位置。文件必须为 UTF-8 编码，每个词元以换行符分隔。

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

`type_table_path` 文件示例：

```text
# Map the $, %, '.', and ',' characters to DIGIT
# This might be useful for financial data.
$ => DIGIT
% => DIGIT
. => DIGIT
\\u002C => DIGIT

# in some cases you might not want to split on ZWJ
# this also tests the case where we need a bigger byte[]
# see https://en.wikipedia.org/wiki/Zero-width_joiner
\\u200D => ALPHANUM
```

## 自定义并添加到分析器

要自定义 word_delimiter 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

以下示例创建一个 word_delimiter 过滤器，使用以下规则：

1. 在非字母数字字符处拆分词元，但连字符 `-` 除外。
2. 移除每个词元开头或结尾的分隔符。
3. 不在字母大小写转换处拆分词元。
4. 不在字母与数字转换处拆分词元。
5. 移除每个词元结尾的英文所有格 `'s`。

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "filter": [ "my_custom_word_delimiter_filter" ]
        }
      },
      "filter": {
        "my_custom_word_delimiter_filter": {
          "type": "word_delimiter",
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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-word-delimiter-tokenfilter.html)
