# Delimited payload 词元过滤器

::::warning 警告
旧名称 `delimited_payload_filter` 已被弃用，新索引不应使用。请改用 `delimited_payload`。
::::

根据指定的分隔符，将词元流拆分为词元（token）和载荷（payload）。

例如，可以使用带 `|` 分隔符的 `delimited_payload` 过滤器，把 `the|1 quick|2 fox|3` 拆分为词元 `the`、`quick`、`fox`，其对应的载荷分别为 `1`、`2`、`3`。

此过滤器使用 Lucene 的 DelimitedPayloadTokenFilter。

## 载荷

**载荷（payload）** 是与词元位置关联的用户定义二进制数据，以 base64 编码字节形式存储。

Elasticsearch 默认**不存储**词元载荷。要存储载荷，你必须：

- 将存储载荷的字段的 `term_vector` [映射参数](/mapping/mapping_parameters)设置为 `with_positions_payloads` 或 `with_positions_offsets_payloads`；
- 使用包含 `delimited_payload` 过滤器的索引分析器。

可以使用 [term vectors API](/rest_apis/document_apis/termvectors) 查看已存储的载荷。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用默认 `|` 分隔符的 `delimited_payload` 过滤器，将 `the|0 brown|10 fox|5 is|0 quick|10` 拆分为词元和载荷：

```bash
GET _analyze
{
  "tokenizer": "whitespace",
  "filter": ["delimited_payload"],
  "text": "the|0 brown|10 fox|5 is|0 quick|10"
}
```

该过滤器产生以下词元：

```text
[ the, brown, fox, is, quick ]
```

::::note 提示
analyze API **不会返回**已存储的载荷。要查看包含返回载荷的示例，参阅[返回已存储的载荷](#返回已存储的载荷)。
::::

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `delimited_payload` 过滤器配置一个新的自定义分析器：

```bash
PUT delimited_payload
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_delimited_payload": {
          "tokenizer": "whitespace",
          "filter": [ "delimited_payload" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `delimiter`

  （可选，字符串）用于分隔词元与载荷的字符。默认为 `|`。

- `encoding`

  （可选，字符串）存储载荷的数据类型。有效值：`float`（默认）、`identity`（字符）、`int`（整数）。

## 自定义并添加到分析器

要自定义 `delimited_payload` 过滤器，需复制它以创建新自定义词元过滤器的基础，然后使用其可配置参数进行修改。

例如，以下创建索引 API 请求使用自定义的 `delimited_payload` 过滤器配置新的自定义分析器。该自定义过滤器使用 `+` 作为词元与载荷的分隔符，载荷编码为整数：

```bash
PUT delimited_payload_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_plus_delimited": {
          "tokenizer": "whitespace",
          "filter": [ "plus_delimited" ]
        }
      },
      "filter": {
        "plus_delimited": {
          "type": "delimited_payload",
          "delimiter": "+",
          "encoding": "int"
        }
      }
    }
  }
}
```

## 返回已存储的载荷

使用创建索引 API 创建一个索引，要求：

- 包含一个存储带载荷词元向量（term vectors）的字段；
- 使用带有 `delimited_payload` 过滤器的自定义索引分析器。

创建索引：

```bash
PUT text_payloads
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "term_vector": "with_positions_payloads",
        "analyzer": "payload_delimiter"
      }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "payload_delimiter": {
          "tokenizer": "whitespace",
          "filter": [ "delimited_payload" ]
        }
      }
    }
  }
}
```

添加包含载荷的文档：

```bash
POST text_payloads/_doc/1
{
  "text": "the|0 brown|3 fox|4 is|0 quick|10"
}
```

使用 [term vectors API](/rest_apis/document_apis/termvectors) 返回文档的词元和 base64 编码载荷：

```bash
GET text_payloads/_termvectors/1
{
  "fields": [ "text" ],
  "payloads": true
}
```

响应包含每个词元位置上的 base64 编码载荷，例如 `brown` 词元的载荷为 `QEAAAA==`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-delimited-payload-tokenfilter.html)
