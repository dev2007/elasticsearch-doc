# ASCII folding 词元过滤器

将不在 Basic Latin Unicode 块（前 127 个 ASCII 字符）中的字母、数字和符号字符转换为其 ASCII 等价形式（如果存在）。例如，该过滤器将 `à` 更改为 `a`。

此过滤器使用 Lucene 的 [ASCIIFoldingFilter](https://lucene.apache.org/core/9_12_1/analysis/common/org/apache/lucene/analysis/miscellaneous/ASCIIFoldingFilter.html)。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `asciifolding` 过滤器去除 `açaí à la carte` 中的变音符号：

```bash
GET /_analyze
{
  "tokenizer" : "standard",
  "filter" : ["asciifolding"],
  "text" : "açaí à la carte"
}
```

该过滤器产生以下词元：

```text
[ acai, a, la, carte ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `asciifolding` 过滤器配置一个新的[自定义分析器](/text_analysis/analysis_custom_analyzer)：

```bash
PUT /asciifold_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_asciifolding": {
          "tokenizer": "standard",
          "filter": [ "asciifolding" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `preserve_original`

  （可选，布尔值）如果为 `true`，则同时输出原始词元和折叠后的词元。默认为 `false`。

## 自定义

要自定义 `asciifolding` 过滤器，请复制它以创建新的自定义词元过滤器的基础。你可以使用其[可配置参数](#可配置参数)修改该过滤器。

例如，以下请求创建一个将 `preserve_original` 设置为 `true` 的自定义 `asciifolding` 过滤器：

```bash
PUT /asciifold_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_asciifolding": {
          "tokenizer": "standard",
          "filter": [ "my_ascii_folding" ]
        }
      },
      "filter": {
        "my_ascii_folding": {
          "type": "asciifolding",
          "preserve_original": true
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-asciifolding-tokenfilter.html)
