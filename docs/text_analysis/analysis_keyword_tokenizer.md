# keyword 分词器

`keyword` 分词器是一个“noop”分词器，它接受给定的任何文本，并输出完全相同的文本作为单个词项。它可以与词元过滤器组合以规范化输出，例如将电子邮件地址小写化。

## 示例输出

```bash
POST _analyze
{
  "tokenizer": "keyword",
  "text": "New York"
}
```

产出的词项：

```text
[ New York ]
```

## 与词元过滤器组合

你可以将 `keyword` 分词器与词元过滤器组合，以规范化结构化数据，例如产品 ID 或电子邮件地址。

例如，以下 [`analyze` API](/rest_apis/indices_apis/analyze) 请求使用 `keyword` 分词器和 [`lowercase`](/text_analysis/analysis_lowercase_tokenfilter) 过滤器将电子邮件地址转换为小写。

```bash
POST _analyze
{
  "tokenizer": "keyword",
  "filter": [ "lowercase" ],
  "text": "john.SMITH@example.COM"
}
```

产出的词元：

```text
[ john.smith@example.com ]
```

## 配置

`keyword` 分词器接受以下参数：

| 参数 | 描述 |
|:--|:--|
| `buffer_size` | 单次读取到词项缓冲区中的字符数。默认为 `256`。词项缓冲区会按此大小增长，直到所有文本被读取完毕。**建议不要更改此设置。** |

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-keyword-tokenizer.html)
