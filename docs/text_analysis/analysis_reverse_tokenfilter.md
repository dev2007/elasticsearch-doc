# Reverse 词元过滤器

反转词元流中的每个词元。例如，可以使用 reverse 过滤器将 `cat` 变为 `tac`。

反转后的词元对基于后缀的搜索很有用，例如查找以 `-ion` 结尾的单词，或通过扩展名搜索文件名。

此过滤器使用 Lucene 的 ReverseStringFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 reverse 过滤器反转 `quick fox jumps` 中的每个词元：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [ "reverse" ],
  "text": "quick fox jumps"
}
```

该过滤器产生以下词元：

```text
[ kciuq, xof, spmuj ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 reverse 过滤器配置一个新的自定义分析器：

```bash
PUT reverse_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_reverse": {
          "tokenizer": "whitespace",
          "filter": [ "reverse" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-reverse-tokenfilter.html)
