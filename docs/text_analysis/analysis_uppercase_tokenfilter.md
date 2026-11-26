# Uppercase 词元过滤器

将词元文本转换为大写。例如，可以使用 uppercase 过滤器将 `the Lazy DoG` 改为 `THE LAZY DOG`。

此过滤器使用 Lucene 的 UpperCaseFilter。

:::::warning 警告
根据语言不同，大写字符可能映射到多个小写字符。使用 uppercase 过滤器可能导致小写字符信息丢失。若要避免这种信息丢失，同时仍保持一致的字母大小写，请改用 [lowercase 过滤器](/text_analysis/analysis_lowercase_tokenfilter)。
:::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用默认的 uppercase 过滤器将 `the Quick FoX JUMPs` 转换为大写：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": ["uppercase"],
  "text": "the Quick FoX JUMPs"
}
```

该过滤器产生以下词元：

```text
[ THE, QUICK, FOX, JUMPS ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 uppercase 过滤器配置一个新的自定义分析器：

```bash
PUT uppercase_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_uppercase": {
          "tokenizer": "whitespace",
          "filter": ["uppercase"]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-uppercase-tokenfilter.html)
