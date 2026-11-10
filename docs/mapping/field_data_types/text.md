# text 类型族

`text` 类型族包括以下字段类型：

- `text`：用于全文内容（如电子邮件正文或产品描述）的传统字段类型。
- `match_only_text`：`text` 的一种节省空间的变体，它禁用评分，并且在需要位置的查询上执行速度较慢。它最适合用于索引日志消息。

## text 字段类型

用于索引全文值的字段，例如电子邮件正文或产品描述。这些字段会被分析，也就是说，在索引之前，它们会通过分析器将字符串转换为单个词元的列表。分析过程使 Elasticsearch 能够在每个全文搜索字段内搜索单个单词。text 字段不用于排序，也很少用于聚合（尽管 significant text 聚合是一个显著的例外）。

`text` 字段最适合非结构化但人类可读的内容。如果你需要索引非结构化的机器生成内容，参阅[映射非结构化内容](/mapping/field_data_types/keyword#映射非结构化内容)。

如果你需要索引结构化内容，例如电子邮件地址、主机名、状态码或标签，你可能应该改用 [keyword](/mapping/field_data_types/keyword) 字段。

以下是 text 字段的映射示例：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "full_name": {
        "type":  "text"
      }
    }
  }
}
```

## 将字段同时用作 text 和 keyword

有时，对同一个字段同时拥有全文（`text`）和关键字（[`keyword`](/mapping/field_data_types/keyword)）版本会很有用：一个用于全文搜索，另一个用于聚合和排序。这可以通过[多字段](/mapping/mapping_parameters/fields)来实现。

## text 字段的参数

text 字段接受以下参数：

- `analyzer`
  （可选，字符串）应用于 `text` 字段的分析器，在索引时和搜索时使用（除非被 `search_analyzer` 覆盖）。默认为索引的默认分析器，或 `standard` 分析器。
- `eager_global_ordinals`
  （可选，Boolean）是否应该在刷新时立即加载全局序号？接受 `true` 或 `false`（默认）。对于经常用于（significant）terms 聚合的字段，启用此项是个好主意。
- `fielddata`
  （可选，Boolean）该字段是否可以使用内存中的 fielddata 进行排序、聚合或脚本操作？接受 `true` 或 `false`（默认）。
- `fielddata_frequency_filter`
  （可选，对象）专家级设置，用于决定在启用 fielddata 时将哪些值加载到内存中。默认加载所有值。
- `fields`
  （可选，对象）多字段允许以多种方式为不同目的索引相同的字符串值，例如一个字段用于搜索，多字段用于排序和聚合，或者使用不同的分析器分析相同的字符串值。
- `index`
  （可选，Boolean）该字段是否应该可搜索？接受 `true`（默认）或 `false`。
- `index_options`
  （可选，枚举）应在索引中存储哪些信息，用于搜索和高亮显示。默认为 `positions`。
- `index_prefixes`
  （可选，对象）如果启用，2 到 5 个字符的词元前缀会被索引到一个单独的字段。这使前缀搜索运行得更高效，但代价是更大的索引。
- `index_phrases`
  （可选，Boolean）如果启用，两个词的组合（shingles）会被索引到一个单独的字段中。这使精确短语查询（无 slop）运行得更高效，但代价是更大的索引。注意，当不移除停用词时效果最好，因为包含停用词的短语不会使用辅助字段，而会回退到标准短语查询。接受 `true` 或 `false`（默认）。
- `norms`
  （可选，Boolean）在为查询评分时是否应考虑字段长度。接受 `true`（默认）或 `false`。
- `position_increment_gap`
  （可选，整数）应在字符串数组的每个元素之间插入的虚拟词元位置数量。默认为分析器上配置的 `position_increment_gap`，后者默认为 100。选择 100 是因为它可以防止具有合理较大 slop（小于 100）的短语查询跨字段值匹配词元。
- `store`
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 `_source` 字段检索。接受 `true` 或 `false`（默认）。
- `search_analyzer`
  （可选，字符串）`text` 字段在搜索时应使用的分析器。默认为 `analyzer` 设置。
- `search_quote_analyzer`
  （可选，字符串）搜索时遇到短语应使用的分析器。默认为 `search_analyzer` 设置。
- `similarity`
  （可选，字符串）应使用哪种评分算法或相似性。默认为 `BM25`。
- `term_vector`
  （可选，枚举）是否应为该字段存储词向量。默认为 `no`。
- `meta`
  （可选，对象）关于该字段的元数据。

## 合成 _source

`text` 字段在其拥有支持合成 `_source` 的 keyword 子字段，或将 `store` 设置为 `true` 时，支持合成 `_source`。无论哪种方式，它都不能有 `copy_to`。

如果使用子 keyword 字段，则值的排序方式与 keyword 字段值的排序方式相同。默认情况下，这意味着排序并删除重复项。所以：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "fields": {
          "raw": {
            "type": "keyword"
          }
        }
      }
    }
  }
}

PUT idx/_doc/1
{
  "text": [
    "the quick brown fox",
    "the quick brown fox",
    "jumped over the lazy dog"
  ]
}
```

将变为：

```json
{
  "text": [
    "jumped over the lazy dog",
    "the quick brown fox"
  ]
}
```

重新排序 text 字段可能会影响短语和 span 查询。更多细节参阅关于 [`position_increment_gap`](/mapping/mapping_parameters/position_increment_gap) 的讨论。你可以通过确保短语查询的 `slop` 参数低于 `position_increment_gap` 来避免这种情况。这是默认情况。

如果 text 字段将 `store` 设置为 `true`，则会保留顺序和重复项：

```bash
PUT idx
{
  "settings": {
    "index": {
      "mapping": {
        "source": {
          "mode": "synthetic"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": { "type": "text", "store": true }
    }
  }
}

PUT idx/_doc/1
{
  "text": [
    "the quick brown fox",
    "the quick brown fox",
    "jumped over the lazy dog"
  ]
}
```

将变为：

```json
{
  "text": [
    "the quick brown fox",
    "the quick brown fox",
    "jumped over the lazy dog"
  ]
}
```

## fielddata 映射参数

`text` 字段默认可搜索，但默认不可用于聚合、排序或脚本。如果你尝试对 text 字段进行排序、聚合或使用脚本访问其值，你会看到一个异常，提示 text 字段默认禁用了 fielddata。要在内存中加载字段数据，请在字段上设置 `fielddata=true`。

在内存中加载字段数据可能会消耗大量内存。

字段数据是在聚合、排序或脚本中访问全文搜索字段的分析后词元的唯一方法。例如，像 `New York` 这样的全文搜索字段会被分析为 `new` 和 `york`。对这些词元进行聚合就需要字段数据。

### 启用 fielddata 之前

在 text 字段上启用 fielddata 通常没有意义。字段数据与字段数据缓存一起存储在堆中，因为它的计算成本很高。计算字段数据可能导致延迟尖峰，增加堆使用量是集群性能问题的一个原因。

大多数想对 text 字段做更多操作的用户会使用多字段映射：同时拥有一个用于全文搜索的 `text` 字段和一个未分析、用于聚合的 [`keyword`](/mapping/field_data_types/keyword) 字段，如下所示：

```bash
# 使用 my_field 字段进行搜索
# 使用 my_field.keyword 字段进行聚合、排序或在脚本中使用
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_field": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

### 在 text 字段上启用 fielddata

你可以使用更新映射 API 在现有的 text 字段上启用 fielddata，如下所示：

```bash
# 为 my_field 指定的映射应该由该字段的现有映射加上 fielddata 参数组成
PUT my-index-000001/_mapping
{
  "properties": {
    "my_field": {
      "type":     "text",
      "fielddata": true
    }
  }
}
```

## fielddata_frequency_filter 映射参数

字段数据过滤可用于减少加载到内存中的词元数量，从而减少内存使用。词元可以按频率过滤：

频率过滤器允许你只加载文档频率介于最小值和最大值之间的词元，这些值可以表示为绝对数字（当数字大于 1.0 时）或百分比（例如 0.01 是 1%，1.0 是 100%）。频率按分段（segment）计算。百分比基于具有该字段值的文档数量，而不是分段中的所有文档。

通过使用 `min_segment_size` 指定分段应包含的最小文档数，可以完全排除较小的分段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "tag": {
        "type": "text",
        "fielddata": true,
        "fielddata_frequency_filter": {
          "min": 0.001,
          "max": 0.1,
          "min_segment_size": 500
        }
      }
    }
  }
}
```

## match_only_text 字段类型

`text` 的一种变体，以评分和位置查询的效率换取空间效率。此字段实际上以与仅索引文档（`index_options: docs`）并禁用 norms（`norms: false`）的 `text` 字段相同的方式存储数据。词条查询的执行速度与在 `text` 字段上一样快甚至更快，但需要位置的查询（例如 `match_phrase` 查询）执行速度较慢，因为它们需要查看 `_source` 文档来验证短语是否匹配。所有查询都返回等于 1.0 的恒定分数。

分析不可配置：文本始终使用默认分析器（默认为 `standard`）进行分析。

此字段不支持 span 查询，请改用 interval 查询，如果你绝对需要 span 查询，则使用 `text` 字段类型。

除此之外，`match_only_text` 支持与 `text` 相同的查询。与 `text` 一样，它不支持排序，并且对聚合只有有限的支持。

```bash
PUT logs
{
  "mappings": {
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "message": {
        "type": "match_only_text"
      }
    }
  }
}
```

## match-only text 字段的参数

接受以下映射参数：

- `fields`
  （可选，对象）多字段允许以多种方式为不同目的索引相同的字符串值，例如一个字段用于搜索，多字段用于排序和聚合，或者使用不同的分析器分析相同的字符串值。
- `meta`
  （可选，对象）关于该字段的元数据。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/text.html)
