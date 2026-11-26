# Lowercase 词元过滤器

将词元文本转换为小写。例如，可以使用 lowercase 过滤器将 `THE Lazy DoG` 转换为 `the lazy dog`。

除了默认过滤器之外，lowercase 词元过滤器还提供对 Lucene 特定语言小写过滤器的访问，支持希腊语（Greek）、爱尔兰语（Irish）和土耳其语（Turkish）。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用默认的 lowercase 过滤器将 `THE Quick FoX JUMPs` 转换为小写：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [ "lowercase" ],
  "text": "THE Quick FoX JUMPs"
}
```

该过滤器产生以下词元：

```text
[ the, quick, fox, jumps ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 lowercase 过滤器配置一个新的自定义分析器：

```bash
PUT lowercase_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_lowercase": {
          "tokenizer": "whitespace",
          "filter": [ "lowercase" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `language`

  （可选，字符串值）要使用的特定语言小写词元过滤器。可用值为：

  - `greek` — Lucene 的 GreekLowerCaseFilter。
  - `irish` — Lucene 的 IrishLowerCaseFilter。
  - `turkish` — Lucene 的 TurkishLowerCaseFilter。

  如果未指定此参数，则默认使用 Lucene 的 LowerCaseFilter。

## 自定义并添加到分析器

要自定义 lowercase 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下创建索引 API 请求使用自定义的希腊语（Greek）lowercase 过滤器配置一个新的自定义分析器：

```bash
PUT custom_lowercase_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "greek_lowercase_example": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [ "greek_lowercase" ]
        }
      },
      "filter": {
        "greek_lowercase": {
          "type": "lowercase",
          "language": "greek"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-lowercase-tokenfilter.html)
