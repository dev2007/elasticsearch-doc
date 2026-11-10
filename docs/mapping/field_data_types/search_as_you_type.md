# search_as_you_type 字段类型

`search_as_you_type` 字段类型是一种类似文本的字段，经过优化以提供开箱即用的支持，服务于边输入边补全用例的查询。它会创建一系列子字段，这些子字段经过分析以索引词元，从而可以被部分匹配整个索引文本值的查询高效匹配。同时支持前缀补全（即匹配以输入开头的词元）和中缀补全（即匹配输入中任意位置的词元）。

向映射添加此类型的字段时：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_field": {
        "type": "search_as_you_type"
      }
    }
  }
}
```

这会创建以下字段：

- `my_field`
  按映射中的配置进行分析。如果未配置分析器，则使用索引的默认分析器。
- `my_field._2gram`
  使用 shingle 大小为 2 的 shingle 词元过滤器包装 `my_field` 的分析器。
- `my_field._3gram`
  使用 shingle 大小为 3 的 shingle 词元过滤器包装 `my_field` 的分析器。
- `my_field._index_prefix`
  使用 edge ngram 词元过滤器包装 `my_field._3gram` 的分析器。

子字段中 shingle 的大小可以通过 `max_shingle_size` 映射参数进行配置。默认值为 3，此参数的有效值为 2 到 4（含）之间的整数值。系统会为从 2 到 max_shingle_size（含）的每个 shingle 大小创建 shingle 子字段。`my_field._index_prefix` 子字段在构建自己的分析器时，始终使用具有 max_shingle_size 的 shingle 子字段的分析器。

增大 `max_shingle_size` 会改善包含更多连续词元的查询的匹配效果，但代价是更大的索引体积。默认的 `max_shingle_size` 通常就足够了。

当被索引的文档对根字段 `my_field` 有值时，相同的输入文本会自动以其各自不同的分析链索引到上述每个字段中：

```bash
PUT my-index-000001/_doc/1?refresh
{
  "my_field": "quick brown fox jump lazy dog"
}
```

服务于边输入边搜索用例的最有效查询方式，通常是针对根 `search_as_you_type` 字段及其 shingle 子字段的 `bool_prefix` 类型的 `multi_match` 查询。它可以用任意顺序匹配查询词元，但如果文档在 shingle 子字段中按顺序包含这些词元，则会获得更高的得分。

```bash
GET my-index-000001/_search
{
  "query": {
    "multi_match": {
      "query": "brown f",
      "type": "bool_prefix",
      "fields": [
        "my_field",
        "my_field._2gram",
        "my_field._3gram"
      ]
    }
  },
  "highlight": {
    "fields": {
      "my_field": {
        "matched_fields": ["my_field._index_prefix"]
      }
    }
  }
}
```

将 `my_field._index_prefix` 添加到 `matched_fields` 可以基于来自 `my_field._index_prefix` 字段的匹配来高亮 `my_field`。

```json
{
  "took" : 44,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.8630463,
    "hits" : [
      {
        "_index" : "my-index-000001",
        "_id" : "1",
        "_score" : 0.8630463,
        "_source" : {
          "my_field" : "quick brown fox jump lazy dog"
        },
        "highlight": {
          "my_field": [
            "quick <em>brown fox jump lazy</em> dog"
          ]
        }
      }
    ]
  }
}
```

要搜索严格按顺序匹配查询词元的文档，或使用短语查询的其他特性进行搜索，请在根字段上使用 `match_phrase_prefix` 查询。如果最后一个词元应精确匹配而不是作为前缀匹配，也可以使用 `match_phrase` 查询。使用短语查询可能比使用 `match_bool_prefix` 查询效率更低。

```bash
GET my-index-000001/_search
{
  "query": {
    "match_phrase_prefix": {
      "my_field": "brown f"
    }
  }
}
```

## search_as_you_type 字段特有的参数

`search_as_you_type` 字段的映射接受以下参数，它们是该字段类型特有的：

- `max_shingle_size`
  （可选，整数）要创建的最大 shingle 大小。有效值为 2（含）到 4（含）。默认为 3。

  系统会为 2 到此值之间的每个整数创建一个子字段。例如，值为 3 会创建两个子字段：`my_field._2gram` 和 `my_field._3gram`。

  更多子字段支持更具体的查询，但会增加索引大小。

## 作为文本类字段的参数

由于 `search_as_you_type` 字段本质上是文本类字段，其映射还接受以下参数，它们的行为与配置 `text` 数据类型字段时类似。除非另有说明，这些选项以相同的方式配置根字段及其子字段。

- `analyzer`
  （可选，字符串）`text` 字段在索引时和搜索时应使用的分析器（除非被 `search_analyzer` 覆盖）。默认为索引的默认分析器，或 `standard` 分析器。
- `index`
  （可选，Boolean）该字段是否应该可搜索？接受 `true`（默认）或 `false`。
- `index_options`
  （可选，枚举）应在索引中存储哪些信息，用于搜索和高亮显示。默认为 `positions`。
- `norms`
  （可选，Boolean）在为查询评分时是否应考虑字段长度。接受 `true` 或 `false`。此选项配置根字段和 shingle 子字段，其默认值为 `true`。它不配置前缀子字段，后者的默认值为 `false`。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。此选项只配置根字段，不配置任何子字段。
- `search_analyzer`
  （可选，字符串）`text` 字段在搜索时应使用的分析器。默认为 `analyzer` 设置。
- `search_quote_analyzer`
  （可选，字符串）搜索时遇到短语应使用的分析器。默认为 `search_analyzer` 设置。
- `similarity`
  （可选，字符串）应使用哪种评分算法或相似性。默认为 `BM25`。
- `term_vector`
  （可选，枚举）是否应为该字段存储词向量。默认为 `no`。此选项配置根字段和 shingle 子字段，但不配置前缀子字段。

## 前缀查询的优化

对根字段或其任何子字段执行前缀查询时，查询会被重写为对 `._index_prefix` 子字段的 term 查询。这比通常对 `text` 字段执行前缀查询的效率更高，因为每个 shingle 在一定长度内的前缀会直接作为词元索引到 `._index_prefix` 子字段中。

`._index_prefix` 子字段的分析器稍微修改了 shingle 构建行为，还会对字段值末尾的词元（通常不会生成为 shingle）建立前缀索引。例如，如果值 `quick brown fox` 被索引到 `max_shingle_size` 为 3 的 `search_as_you_type` 字段中，那么 `brown fox` 和 `fox` 的前缀也会被索引到 `._index_prefix` 子字段中，即使它们不会作为词元出现在 `._3gram` 子字段中。这允许对字段输入中的所有词元进行补全。

## 合成 _source

`search_as_you_type` 字段在其默认配置下支持合成 `_source`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-as-you-type.html)
