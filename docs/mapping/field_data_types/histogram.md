# histogram 字段类型

用于存储表示直方图的预聚合数值数据的字段。此数据使用两个成对的数组定义：

- 一个由 [double](/mapping/field_data_types/numeric) 数字组成的 `values` 数组，表示直方图的桶。这些值必须按升序提供。
- 一个对应的由 [long](/mapping/field_data_types/numeric) 数字组成的 `counts` 数组，表示落入每个桶的值的数量。这些数字必须为正数或零。

由于 `values` 数组中的元素与 `count` 数组中相同位置的元素对应，这两个数组的长度必须相同。

- `histogram` 字段在每个文档中只能存储一对 `values` 和 `counts` 数组。不支持嵌套数组。
- `histogram` 字段不支持排序。

## 用途

`histogram` 字段主要用于聚合。为了使其更易于聚合访问，`histogram` 字段数据以二进制 [doc values](/mapping/mapping_parameters/doc_values) 形式存储，而不是被索引。其字节大小最多为 `13 * numValues`，其中 `numValues` 是所提供数组的长度。

由于数据未被索引，你只能将 `histogram` 字段用于以下聚合和查询：

- [min](/aggregations/metrics/min_aggregation#直方图字段) 聚合
- [max](/aggregations/metrics/max_aggregation#直方图字段) 聚合
- [sum](/aggregations/metrics/sum_aggregation#直方图字段) 聚合
- [value_count](/aggregations/metrics/value_count_aggregation#直方图字段) 聚合
- [avg](/aggregations/metrics/avg_aggregation#直方图字段) 聚合
- [percentiles](/aggregations/metrics/percentile_aggregation) 聚合
- [percentile ranks](/aggregations/metrics/percentile_rank_aggregation) 聚合
- [boxplot](/aggregations/metrics/boxplot_aggregation) 聚合
- [histogram](/aggregations/bucket/histogram_aggregation#直方图字段) 聚合
- [range](/aggregations/bucket/range_aggregation#直方图字段) 聚合
- [exists](/query_dsl/term_level_queries/exists) 查询

## 构建直方图

当在聚合中使用直方图时，结果的准确性取决于直方图的构建方式。重要的是要考虑将用于构建它的百分位聚合模式。一些可能性包括：

- 对于 [T-Digest](/aggregations/metrics/percentile_aggregation) 模式，`values` 数组表示平均质心位置，`counts` 数组表示归因于每个质心的值的数量。如果算法已经开始近似百分位，这种不准确性会被带入直方图。
- 对于[高动态范围（HDR）直方图](/aggregations/metrics/percentile_rank_aggregation#hdr-直方图)模式，`values` 数组表示每个桶区间的固定上限，`counts` 数组表示归因于每个区间的值的数量。此实现保持固定的最坏情况百分比误差（以有效数字个数指定），因此生成直方图时使用的值就是聚合时能达到的最大精度。

直方图字段是"算法无关"的，不存储 T-Digest 或 HDRHistogram 特定的数据。虽然这意味着该字段在技术上可以用任一算法进行聚合，但在实践中，用户应选择一种算法并按该方式索引数据（例如 T-Digest 使用质心，HDRHistogram 使用区间），以确保最佳精度。

## 合成 `_source`

`histogram` 字段在其默认配置下支持[合成 `_source`](/mapping/metadata_fields/source)。

为了节省空间，计数为零的桶不会存储在直方图 doc values 中。因此，在启用了合成 source 的索引中索引直方图字段时，索引包含零计数桶的直方图会导致取回直方图时缺少这些桶。

## 示例

以下[创建索引](/rest_apis/index_apis/create_index) API 请求创建一个带有两个字段映射的新索引：

- `my_histogram`，用于存储百分位数据的 `histogram` 字段
- `my_text`，用于存储直方图标题的 `keyword` 字段

```bash
PUT my-index-000001
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
PUT my-index-000001/_doc/1
{
  "my_text": "histogram_1",
  "my_histogram": {
    "values": [0.1, 0.2, 0.3, 0.4, 0.5],
    "counts": [3, 7, 23, 12, 6]
  }
}

PUT my-index-000001/_doc/2
{
  "my_text": "histogram_2",
  "my_histogram": {
    "values": [0.1, 0.25, 0.35, 0.4, 0.45, 0.5],
    "counts": [8, 17, 8, 7, 6, 2]
  }
}
```

1. 每个桶的值。数组中的值被视为 double 类型，并且必须按递增顺序给出。对于 [T-Digest](/aggregations/metrics/percentile_aggregation#百分位是近似的) 直方图，此值表示平均值。对于 HDR 直方图，它表示迭代到的值。
2. 每个桶的计数。数组中的值被视为 long 整数，必须为正数或零。负值将被拒绝。桶与计数之间的关系由它们在数组中的位置确定。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/histogram.html)
