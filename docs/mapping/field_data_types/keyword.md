# keyword 类型族

`keyword` 类型族包括以下字段类型：

- [`keyword`](#keyword-字段类型)，用于结构化内容，例如 ID、电子邮件地址、主机名、状态码、邮政编码或标签。
- [`constant_keyword`](#constant-keyword-字段类型)，用于始终包含相同值的关键字字段。
- [`wildcard`](#wildcard-字段类型)，用于非结构化的机器生成内容。`wildcard` 类型针对具有较大值或高基数的字段进行了优化。

关键字字段通常用于[排序](/search/search_your_data/sort_search_results)、[聚合](/aggregations/aggregations)和[词条级查询](/query_dsl/term_level_queries/term_level_queries)，例如 [`term`](/query_dsl/term_level_queries/term)。

避免将关键字字段用于全文搜索。请改用 [`text`](/mapping/field_data_types/text) 字段类型。

## keyword 字段类型

以下是一个基本 `keyword` 字段的映射示例：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "tags": {
        "type": "keyword"
      }
    }
  }
}
```

### 映射数值标识符

并非所有数值数据都应该映射为 [numeric](/mapping/field_data_types/numeric) 字段数据类型。Elasticsearch 针对 [`range`](/query_dsl/term_level_queries/range) 查询优化了 `integer` 或 `long` 等数值字段。不过，[`keyword`](/mapping/field_data_types/keyword) 字段更适合 [`term`](/query_dsl/term_level_queries/term) 和其他[词条级](/query_dsl/term_level_queries/term_level_queries)查询。

诸如 ISBN 或产品 ID 之类的标识符很少用于 `range` 查询，但经常通过词条级查询来检索。

在以下情况下，考虑将数值标识符映射为 `keyword`：

- 你不打算使用 [`range`](/query_dsl/term_level_queries/range) 查询来搜索标识符数据。
- 快速检索很重要。在 `keyword` 字段上执行 `term` 查询搜索通常比在数值字段上执行 `term` 搜索更快。

如果不确定该用哪种，可以使用[多字段](/mapping/mapping_parameters/fields)将数据同时映射为 `keyword` 和数值数据类型。

### 基本 keyword 字段的参数

`keyword` 字段接受以下参数：

- [`doc_values`](/mapping/mapping_parameters/doc_values)
  （可选，Boolean）是否应该将该字段以列式方式存储在磁盘上，以便之后可用于排序、聚合或脚本？接受 `true`（默认）或 `false`。
- [`eager_global_ordinals`](/mapping/mapping_parameters/eager_global_ordinals)
  （可选，Boolean）是否应该在刷新时立即加载全局序号？接受 `true` 或 `false`（默认）。对于经常用于 terms 聚合的字段，启用此项是个好主意。
- [`fields`](/mapping/mapping_parameters/fields)
  （可选，对象）多字段允许以多种方式为不同目的索引相同的字符串值，例如一个字段用于搜索，多字段用于排序和聚合。
- [`ignore_above`](/mapping/mapping_parameters/ignore_above)
  （可选，整数）不要索引长于此值的字符串。在标准索引中默认为 `2147483647`（即接受所有值），在 logsdb 索引中默认为 `8191`，以防止超出 Lucene 的词元字节长度限制 `32766`。但请注意，默认的动态映射规则会创建一个子 `keyword` 字段，通过设置 `ignore_above: 256` 覆盖此默认值。
- [`index`](/mapping/mapping_parameters/index)
  （可选，Boolean）该字段是否应该可以快速搜索？接受 `true`（默认）和 `false`。只启用 [`doc_values`](/mapping/mapping_parameters/doc_values) 的 `keyword` 字段仍然可以查询，只是速度较慢。
- [`index_options`](/mapping/mapping_parameters/index_options)
  （可选，枚举）应在索引中存储哪些信息以用于评分。默认为 `docs`，但也可以设置为 `freqs`，以便在计算分数时考虑词元频率。
- [`meta`](/mapping/mapping_parameters/meta)
  （可选，对象）关于该字段的元数据。
- [`norms`](/mapping/mapping_parameters/norms)
  （可选，Boolean）在为查询评分时是否应考虑字段长度。接受 `true` 或 `false`（默认）。
- [`null_value`](/mapping/mapping_parameters/null_value)
  （可选，字符串）接受一个字符串值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。注意，如果使用了 `script` 参数，则无法设置此项。
- `on_script_error`
  （可选，枚举）定义当 `script` 参数定义的脚本在索引时抛出错误时该怎么办。接受 `fail`（默认），它会导致整个文档被拒绝；以及 `continue`，它会将该字段记录到文档的 [`_ignored`](/mapping/metadata_fields/ignored) 元数据字段中并继续索引。只有同时设置了 `script` 字段时才能设置此参数。
- `script`
  （可选，字符串）如果设置了此参数，则该字段将索引由此脚本生成的值，而不是直接从源中读取值。如果输入文档中为该字段设置了值，文档将被拒绝并返回错误。脚本的格式与其[运行时字段等效格式](/mapping/runtime_fields/map_runtime_field)相同。脚本输出的值会照常进行标准化，如果长度超过 `ignore_above` 设置的值，则会被忽略。
- [`store`](/mapping/mapping_parameters/store)
  （可选，Boolean）是否应该单独存储字段值，使其可以独立于 [`_source`](/mapping/metadata_fields/source) 字段检索。接受 `true` 或 `false`（默认）。
- [`similarity`](/mapping/mapping_parameters/similarity)
  （可选，字符串）应使用哪种评分算法或相似性。默认为 `BM25`。
- [`normalizer`](/mapping/mapping_parameters/normalizer)
  （可选，字符串）如何在索引之前对关键字进行预处理。默认为 `null`，表示关键字保持原样。
- `split_queries_on_whitespace`
  （可选，Boolean）[全文查询](/query_dsl/full_text_queries/full_text_queries)在为此字段构建查询时是否应按空白符拆分输入。接受 `true` 或 `false`（默认）。
- `time_series_dimension`
  （可选，Boolean）将字段标记为[时序维度](/data_management/data_tiers#时序维度)。默认为 `false`。

  [`index.mapping.dimension_fields.limit`](/set_up_elasticsearch/configuring_elasticsearch/tsds_index_settings#index-mapping-dimension-fields-limit) 索引设置限制索引中的维度数量。

  维度字段具有以下约束：

  - `doc_values` 和 `index` 映射参数必须为 `true`。
  - 维度值用于标识文档的时序。如果在索引期间以任何方式更改了维度值，文档将被存储为属于与预期不同的时序。因此还有额外的约束：该字段不能使用 [`normalizer`](/mapping/mapping_parameters/normalizer)。

## 合成 _source

合成 source 可能会对 `keyword` 字段的值进行排序并删除重复项。例如：

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
      "kwd": { "type": "keyword" }
    }
  }
}

PUT idx/_doc/1
{
  "kwd": ["foo", "foo", "bar", "baz"]
}
```

将变为：

```json
{"kwd":["bar","baz","foo"]}
```

如果 `keyword` 字段将 `store` 设置为 `true`，则会保留顺序和重复项。例如：

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
      "kwd": { "type": "keyword", "store": true }
    }
  }
}

PUT idx/_doc/1
{
  "kwd": ["foo", "foo", "bar", "baz"]
}
```

将变为：

```json
{"kwd":["foo","foo","bar","baz"]}
```

超过 `ignore_above` 的值会被保留，但会排到最后。例如：

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
      "kwd": { "type": "keyword", "ignore_above": 3 }
    }
  }
}

PUT idx/_doc/1
{
  "kwd": ["foo", "foo", "bang", "bar", "baz"]
}
```

将变为：

```json
{"kwd":["bar","baz","foo","bang"]}
```

## constant_keyword 字段类型

constant_keyword 是 `keyword` 字段的一种特化，适用于索引中所有文档都具有相同值的情况。

```bash
PUT logs-debug
{
  "mappings": {
    "properties": {
      "@timestamp": {
        "type": "date"
      },
      "message": {
        "type": "text"
      },
      "level": {
        "type": "constant_keyword",
        "value": "debug"
      }
    }
  }
}
```

`constant_keyword` 支持与 `keyword` 字段相同的查询和聚合，但利用所有文档在每个索引中具有相同值这一事实来更高效地执行查询。

允许提交没有该字段值的文档，或提交的值等于映射中配置值的文档。以下两个索引请求是等价的：

```bash
POST logs-debug/_doc
{
  "@timestamp": "2019-12-12",
  "message": "Starting up Elasticsearch",
  "level": "debug"
}

POST logs-debug/_doc
{
  "@timestamp": "2019-12-12",
  "message": "Starting up Elasticsearch"
}
```

但是，不允许提供与映射中配置的值不同的值。

如果在映射中没有提供 `value`，字段将根据第一个被索引文档中包含的值自动配置自身。虽然此行为很方便，但请注意，这意味着一个“有毒”的文档如果携带了错误的值，可能导致所有其他文档被拒绝。

在提供值之前（无论是通过映射还是来自文档），对该字段的查询将不会匹配任何文档。这包括 [`exists`](/query_dsl/term_level_queries/exists) 查询。

字段的 `value` 在设置之后无法更改。

### constant_keyword 字段的参数

接受以下映射参数：

- [`meta`](/mapping/mapping_parameters/meta)
  （可选，对象）关于该字段的元数据。
- `value`
  （可选，字符串）要与索引中所有文档关联的值。如果未提供此参数，则会根据第一个被索引的文档来设置。

## wildcard 字段类型

`wildcard` 字段类型是一种专门的关键字字段，适用于你计划使用类 grep 的 [`wildcard`](/query_dsl/term_level_queries/wildcard) 和 [`regexp`](/query_dsl/term_level_queries/regexp) 查询来搜索的非结构化机器生成内容。`wildcard` 类型针对具有较大值或高基数的字段进行了优化。

### 映射非结构化内容

你可以将包含非结构化内容的字段映射为 `text` 或 keyword 类型族字段。最佳字段类型取决于内容的性质以及你计划如何搜索该字段。

在以下情况下使用 `text` 字段类型：

- 内容是人类可读的，例如电子邮件正文或产品描述。
- 你计划使用[全文查询](/query_dsl/full_text_queries/full_text_queries)搜索单个单词或短语，例如 `the brown fox jumped`。Elasticsearch 会[分析](/text_analysis/text_analysis) `text` 字段，以便为这些查询返回最相关的结果。

在以下情况下使用 keyword 类型族字段类型：

- 内容是机器生成的，例如日志消息或 HTTP 请求信息。
- 你计划使用[词条级查询](/query_dsl/term_level_queries/term_level_queries)搜索完整的精确值（例如 `org.foo.bar`）或部分字符序列（例如 `org.foo.*`）。

### 选择 keyword 类型族字段类型

如果选择 keyword 类型族字段类型，可以根据字段值的基数和大小将其映射为 `keyword` 或 `wildcard` 字段。如果你计划经常使用 [`wildcard`](/query_dsl/term_level_queries/wildcard) 或 [`regexp`](/query_dsl/term_level_queries/regexp) 查询搜索该字段，并且满足以下条件之一，请使用 `wildcard` 类型：

- 该字段包含超过一百万个唯一值，并且你计划经常使用带有前导通配符的模式（例如 `*foo` 或 `*baz`）搜索该字段。
- 该字段包含大于 32KB 的值，并且你计划经常使用任意通配符模式搜索该字段。

否则，请使用 `keyword` 字段类型，以获得更快的搜索速度、更快的索引速度和更低的存储成本。有关深入的对比和决策流程图，参阅[相关博客文章](https://www.elastic.co/blog/find-strings-within-strings-faster-with-the-new-elasticsearch-wildcard-field)。

### 从 text 字段切换到关键字字段

如果你之前使用 `text` 字段索引非结构化的机器生成内容，可以[重新索引以更新映射](/mapping/explicit_mapping#更新字段的映射)为 `keyword` 或 `wildcard` 字段。我们还建议你更新应用程序或工作流，将该字段上基于单词的[全文查询](/query_dsl/full_text_queries/full_text_queries)替换为等效的[词条级查询](/query_dsl/term_level_queries/term_level_queries)。

在内部，`wildcard` 字段使用 ngram 对整个字段值进行索引，并存储完整字符串。索引用作粗略过滤器，以减少随后通过取回并检查完整值来核对的值的数量。此字段特别适合对日志行运行类 grep 查询。存储成本通常低于 `keyword` 字段，但对完整词元的精确匹配搜索速度较慢。如果字段值共享很多前缀（例如同一网站的 URL），`wildcard` 字段的存储成本可能会高于等效的 `keyword` 字段。

你可以按如下方式索引和搜索 wildcard 字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_wildcard": {
        "type": "wildcard"
      }
    }
  }
}

PUT my-index-000001/_doc/1
{
  "my_wildcard": "This string can be quite lengthy"
}

GET my-index-000001/_search
{
  "query": {
    "wildcard": {
      "my_wildcard": {
        "value": "*quite*lengthy"
      }
    }
  }
}
```

### wildcard 字段的参数

`wildcard` 字段接受以下参数：

- [`null_value`](/mapping/mapping_parameters/null_value)
  （可选，字符串）接受一个字符串值，用于替换任何显式的 `null` 值。默认为 `null`，表示该字段被视为缺失。
- [`ignore_above`](/mapping/mapping_parameters/ignore_above)
  （可选，整数）不要索引长于此值的字符串。在标准索引中默认为 `2147483647`（即接受所有值），在 logsdb 索引中默认为 `8191`，以防止超出 Lucene 的词元字节长度限制 `32766`。

### 限制

- `wildcard` 字段与关键字字段一样不分词，因此不支持依赖单词位置的查询，例如短语查询。
- 运行 `wildcard` 查询时，任何 `rewrite` 参数都会被忽略。评分始终是恒定分数。

## 合成 _source

合成 source 可能会对 `wildcard` 字段的值进行排序。例如：

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
      "card": { "type": "wildcard" }
    }
  }
}

PUT idx/_doc/1
{
  "card": ["king", "ace", "ace", "jack"]
}
```

将变为：

```json
{"card":["ace","jack","king"]}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/keyword.html)
