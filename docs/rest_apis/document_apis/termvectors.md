# 词向量 API

检索特定文档字段中词（term）的信息和统计数据。

```bash
GET /my-index-000001/_termvectors/1
```

## 请求

`GET /<index>/_termvectors/<_id>`

## 前置条件

- 如果启用了 Elasticsearch 安全功能，则必须拥有目标索引或索引别名的 `read` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 描述

你可以检索索引中存储的文档或请求体中传递的*人工*文档的词向量。

你可以通过 `fields` 参数或在请求体中添加字段来指定你感兴趣的字段。

```bash
GET /my-index-000001/_termvectors/1?fields=message
```

可使用通配符指定字段，类似于[多重匹配查询](/query_dsl/full_text_queries/multi_match)。

词向量默认是[实时的](/rest_apis/document_apis/get#实时)，而不是接近实时的。可以通过将 `realtime` 参数设置为 `false` 来更改。

你可以请求三种类型的值：`词信息`、`词统计`和`字段统计`。默认情况下，会返回所有字段的所有词信息和字段统计信息，但词统计信息不包括在内。

### 词信息

- 字段中的词频（总是返回）
- 词位置（`position` : true）
- 开始和结束偏移量（`offsets` ：true）
- 词的有效载荷（`payloads` : true），以 base64 编码字节形式返回

如果所请求的信息没有存储在索引中，则会在可能的情况下即时计算。此外，词向量还可以针对不在索引中，而由用户提供的文档进行计算。

:::caution 警告
开始和结束偏移量假定使用的是 UTF-16 编码。如果要使用这些偏移量来获取生成此标记（token）的原始文本，则应确保所获取的子字符串也是使用 UTF-16 编码的。
:::

### 词统计

将 `term_statistics` 设置为 `true`（默认为 `false`）将返回

- 总词频（词在所有文档中出现的频率）
- 文档频率（包含当前词的文档数量）

默认情况下不返回这些值，因为词统计会严重影响性能。

### 字段统计

将 `field_statistics` 设置为 `false`（默认为 `true`）将省略 ：

- 文档计数（有多少文档包含此字段）
- 文档频率合计（该字段中所有术语的文档频率总和）
- 总词频合计（该字段中每个词的总词频总和）

### 词过滤

利用参数 `filter`，还可以根据术语的 tf-idf 分数对返回的词进行过滤。这对于找出文档的良好特征向量非常有用。该功能的工作方式类似[类似于此查询](/query_dsl/specialized_queries/more_like_this)的[第二阶段](/query_dsl/specialized_queries/more_like_this#术语选择参数)。用法见[示例 5](#示例)。

支持以下子参数：

|                   |                                                            |
| ----------------- | ---------------------------------------------------------- |
| `max_num_terms`   | 每个字段必须返回的最大词数。默认为 `25`。                  |
| `min_term_freq`   | 忽略源文档中频率低于此值的单词。默认为 `1`。               |
| `max_term_freq`   | 忽略源文档中频率超过此值的单词。默认为无限制。             |
| `min_doc_freq`    | 忽略至少在这么多文档中没有出现的词。默认为 `1`。           |
| `max_doc_freq`    | 忽略在超过此数量的文档中出现的单词。默认为无限制。         |
| `min_word_length` | 最小单词长度，低于此长度的词将被忽略。默认为 `0`。         |
| `max_word_length` | 最大单词长度，超过此长度的词将被忽略。默认为无约束 (`0`)。 |

## 行为

词和字段统计不准确。未考虑已删除的文档。只检索请求文档所在分区的信息。因此，词和字段统计数据只能作为相对指标，绝对的数字在此情况下没有任何意义。默认情况下，在请求人工文档的词向量时，会随机选择一个分区来获取统计数据。请仅使用 `routing` 来选择特定的分区。

## 路径参数

- `<index>`

  (必填，字符串）包含文档的索引名称。

- `<_id>`

  (可选，字符串） 文档的唯一标识符。

## 查询参数

- `fields`

  (可选，字符串） 用逗号分隔的字段列表或通配符表达式，这些字段将包含在统计信息中。

  除非在 `completion_fields` 或 `fielddata_fields` 参数中提供了特定字段列表，否则将作为默认列表使用。

- `field_statistics`

  (可选，布尔值） 如果为 `true`，响应将包括文档计数、文档频率总和以及词总频率总和。默认为 `true`。

- `<offsets>`

  (可选，布尔值） 如果为 `true`，则响应包括词偏移。默认为 `true`。

- `payloads`

  (可选，布尔值） 如果为 `true`，则响应包括词有效载荷。默认为 `true`。

- `positions`

  (可选，布尔值） 如果为 `true`，则响应包括词位置。默认为 `true`。

- `preference`

  (可选，字符串） 指定应在哪个节点或分片上执行操作。默认为随机。

- `routing`

  (可选，字符串） 用于将操作路由到特定分区的自定义值。

- `realtime`

  (可选，布尔值） 如果为 `true`，则表示请求是实时的，而不是近实时的。默认为 `true`。参阅[实时](/docs/rest_apis/document_apis/get#实时)。

- `term_statistics`

  (可选，布尔值）如果为 `true`，则响应包括词频和文档频率。默认为 `false`。

- `version`

  (可选，布尔值） 如果为 `true`，则返回作为命中一部分的文档版本。

- `version_type`

  (可选，枚举值） 特定版本类型：`external`、`external_gte`。

## 示例

### 返回存储的词向量

首先，我们创建一个索引，用于存储词向量、有效载荷等：

```bash
PUT /my-index-000001
{ "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "term_vector": "with_positions_offsets_payloads",
        "store" : true,
        "analyzer" : "fulltext_analyzer"
       },
       "fullname": {
        "type": "text",
        "term_vector": "with_positions_offsets_payloads",
        "analyzer" : "fulltext_analyzer"
      }
    }
  },
  "settings" : {
    "index" : {
      "number_of_shards" : 1,
      "number_of_replicas" : 0
    },
    "analysis": {
      "analyzer": {
        "fulltext_analyzer": {
          "type": "custom",
          "tokenizer": "whitespace",
          "filter": [
            "lowercase",
            "type_as_payload"
          ]
        }
      }
    }
  }
}
```

其次，我们添加一些文件：

```bash
PUT /my-index-000001/_doc/1
{
  "fullname" : "John Doe",
  "text" : "test test test "
}

PUT /my-index-000001/_doc/2?refresh=wait_for
{
  "fullname" : "Jane Doe",
  "text" : "Another test ..."
}
```

以下请求将返回文档 `1`（John Doe）中字段文本的所有信息和统计数据：

```bash
GET /my-index-000001/_termvectors/1
{
  "fields" : ["text"],
  "offsets" : true,
  "payloads" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true
}
```

响应：

```json
{
  "_index": "my-index-000001",
  "_id": "1",
  "_version": 1,
  "found": true,
  "took": 6,
  "term_vectors": {
    "text": {
      "field_statistics": {
        "sum_doc_freq": 4,
        "doc_count": 2,
        "sum_ttf": 6
      },
      "terms": {
        "test": {
          "doc_freq": 2,
          "ttf": 4,
          "term_freq": 3,
          "tokens": [
            {
              "position": 0,
              "start_offset": 0,
              "end_offset": 4,
              "payload": "d29yZA=="
            },
            {
              "position": 1,
              "start_offset": 5,
              "end_offset": 9,
              "payload": "d29yZA=="
            },
            {
              "position": 2,
              "start_offset": 10,
              "end_offset": 14,
              "payload": "d29yZA=="
            }
          ]
        }
      }
    }
  }
}
```

### 即时生成词向量

未明确存储在索引中的词向量会自动计算。下面的请求会返回文档 `1` 中字段的所有信息和统计数据，即使这些词没有明确存储在索引中。请注意，对于字段文本，不会重新生成词。

```bash
GET /my-index-000001/_termvectors/1
{
  "fields" : ["text", "some_field_without_term_vectors"],
  "offsets" : true,
  "positions" : true,
  "term_statistics" : true,
  "field_statistics" : true
}
```

### 人工文档

术语向量也可以为人工文档（即索引中不存在的文档）生成。例如，以下请求将返回与例 1 相同的结果。使用的映射由 `index` 决定。

**如果开启了动态映射（默认），则将动态创建原始映射中没有的文档字段。**

```bash
GET /my-index-000001/_termvectors
{
  "doc" : {
    "fullname" : "John Doe",
    "text" : "test test test"
  }
}
```

#### 每字段分析器

此外，还可以使用 `per_field_analyzer` 参数提供与字段分析器不同的分析器。这对于以任何方式生成词向量都很有用，尤其是在使用人工文档时。当为一个已经存储了词向量的字段提供分析器时，词向量将被重新生成。

```bash
GET /my-index-000001/_termvectors
{
  "doc" : {
    "fullname" : "John Doe",
    "text" : "test test test"
  },
  "fields": ["fullname"],
  "per_field_analyzer" : {
    "fullname": "keyword"
  }
}
```

响应：

```json
{
  "_index": "my-index-000001",
  "_version": 0,
  "found": true,
  "took": 6,
  "term_vectors": {
    "fullname": {
      "field_statistics": {
        "sum_doc_freq": 2,
        "doc_count": 4,
        "sum_ttf": 4
      },
      "terms": {
        "John Doe": {
          "term_freq": 1,
          "tokens": [
            {
              "position": 0,
              "start_offset": 0,
              "end_offset": 8
            }
          ]
        }
      }
    }
  }
}
```

### 词过滤

最后，可以根据 tf-idf 分数对返回的术语进行筛选。在下面的示例中，我们从具有给定 “plot” 字段值的人工文档中获取了三个最“有趣”的关键词。请注意，关键词 “Tony” 或任何停止词都不在响应之列，因为它们的 tf-idf 分数必然过低。

```bash
GET /imdb/_termvectors
{
  "doc": {
    "plot": "When wealthy industrialist Tony Stark is forced to build an armored suit after a life-threatening incident, he ultimately decides to use its technology to fight against evil."
  },
  "term_statistics": true,
  "field_statistics": true,
  "positions": false,
  "offsets": false,
  "filter": {
    "max_num_terms": 3,
    "min_term_freq": 1,
    "min_doc_freq": 1
  }
}
```

响应：

```json
{
   "_index": "imdb",
   "_version": 0,
   "found": true,
   "term_vectors": {
      "plot": {
         "field_statistics": {
            "sum_doc_freq": 3384269,
            "doc_count": 176214,
            "sum_ttf": 3753460
         },
         "terms": {
            "armored": {
               "doc_freq": 27,
               "ttf": 27,
               "term_freq": 1,
               "score": 9.74725
            },
            "industrialist": {
               "doc_freq": 88,
               "ttf": 88,
               "term_freq": 1,
               "score": 8.590818
            },
            "stark": {
               "doc_freq": 44,
               "ttf": 47,
               "term_freq": 1,
               "score": 9.272792
            }
         }
      }
   }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-termvectors.html)
