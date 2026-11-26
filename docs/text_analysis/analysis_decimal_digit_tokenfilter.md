# Decimal digit 词元过滤器

将 Unicode `Decimal_Number` 通用类别中的所有数字转换为 `0-9`。例如，该过滤器将孟加拉数字 `৩` 更改为 `3`。

此过滤器使用 Lucene 的 [DecimalDigitFilter](https://lucene.apache.org/core/9_12_1/analysis/common/org/apache/lucene/analysis/core/DecimalDigitFilter.html)。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `decimal_digit` 过滤器将天城文数字转换为 `0-9`：

```bash
GET /_analyze
{
  "tokenizer": "whitespace",
  "filter": ["decimal_digit"],
  "text": "१-one two-२ ३"
}
```

该过滤器产生以下词元：

```text
[ 1-one, two-2, 3 ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `decimal_digit` 过滤器配置一个新的[自定义分析器](/text_analysis/analysis_custom_analyzer)：

```bash
PUT /decimal_digit_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_decimal_digit": {
          "tokenizer": "whitespace",
          "filter": [ "decimal_digit" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-decimal-digit-tokenfilter.html)
