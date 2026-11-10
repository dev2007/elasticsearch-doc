# _doc_count 字段

桶聚合（bucket aggregation）总是返回一个名为 `doc_count` 的字段，显示在每个桶中聚合和分区的文档数量。`doc_count` 值的计算非常简单：对于收集到每个桶中的每个文档，`doc_count` 递增 1。

虽然这种简单方法在计算单个文档的聚合时很有效，但它无法准确表示存储预聚合数据（例如 `histogram` 或 `aggregate_metric_double` 字段）的文档，因为一个汇总字段可能代表多个文档。

为了在处理预聚合数据时能够正确计算文档数量，我们引入了一个名为 `_doc_count` 的元数据字段类型。`_doc_count` 必须始终是一个正整数，表示聚合在单个汇总字段中的文档数量。

当字段 `_doc_count` 被添加到文档中时，所有桶聚合都会尊重它的值，并将桶的 `doc_count` 递增该字段的值。如果文档不包含任何 `_doc_count` 字段，则默认隐含 `_doc_count = 1`。

- 每个文档的 `_doc_count` 字段只能存储一个正整数。不允许嵌套数组。
- 如果文档不包含 `_doc_count` 字段，聚合器将递增 1，这是默认行为。

## 示例

以下[创建索引](/rest_apis/index_apis/create_index) API 请求创建一个带有以下字段映射的新索引：

- `my_histogram`，用于存储百分位数据的 `histogram` 字段
- `my_text`，用于存储直方图标题的 `keyword` 字段

```bash
PUT my_index
{
  "mappings": {
    "properties": {
      "my_histogram": {
        "type": "histogram"
      },
      "my_text": {
        "type": "keyword"
      }
    }
  }
}
```

以下[索引](/rest_apis/document_apis/docs_index) API 请求存储两个直方图 `histogram_1` 和 `histogram_2` 的预聚合数据。

```bash
PUT my_index/_doc/1
{
  "my_text": "histogram_1",
  "my_histogram": {
    "values": [0.1, 0.2, 0.3, 0.4, 0.5],
    "counts": [3, 7, 23, 12, 6]
  },
  "_doc_count": 45
}

PUT my_index/_doc/2
{
  "my_text": "histogram_2",
  "my_histogram": {
    "values": [0.1, 0.25, 0.35, 0.4, 0.45, 0.5],
    "counts": [8, 17, 8, 7, 6, 2]
  },
  "_doc_count": 62
}
```

字段 `_doc_count` 必须是一个正整数，存储生成每个直方图所聚合的文档数量。

如果我们在 `my_index` 上运行以下 [terms 聚合](/aggregations/bucket/terms_aggregation)：

```bash
GET /_search
{
  "aggs": {
    "histogram_titles": {
      "terms": {
        "field": "my_text"
      }
    }
  }
}
```

我们将得到以下响应：

```json
{
  ...
  "aggregations": {
    "histogram_titles": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "histogram_2",
          "doc_count": 62
        },
        {
          "key": "histogram_1",
          "doc_count": 45
        }
      ]
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-doc-count-field.html)
