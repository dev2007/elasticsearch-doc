# percolator 字段类型

`percolator` 字段类型将 JSON 结构解析为原生查询并存储该查询，以便 [`percolate` 查询](/query_dsl/specialized_queries/percolate)可以使用它来匹配提供的文档。

任何包含 JSON 对象的字段都可以配置为 percolator 字段。percolator 字段类型没有设置。只需配置 `percolator` 字段类型，就足以指示 Elasticsearch 将字段视为查询。

如果以下映射为 `query` 字段配置了 `percolator` 字段类型：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "field": {
        "type": "text"
      }
    }
  }
}
```

那么你就可以索引一个查询：

```bash
PUT my-index-000001/_doc/match_value
{
  "query": {
    "match": {
      "field": "value"
    }
  }
}
```

percolator 查询中引用的字段必须**已经**存在于与用于渗透（percolation）的索引关联的映射中。为确保这些字段存在，请通过[创建索引](/rest_apis/index_apis/create_index)或[更新映射](/rest_apis/index_apis/update_mapping) API 添加或更新映射。

## 重新索引你的 percolator 查询

为了受益于新版本中对 `percolator` 字段类型的改进，有时需要重新索引 percolator 查询。

可以使用[重索引 API](/rest_apis/document_apis/reindex) 重新索引 percolator 查询。让我们看下面这个带有 percolator 字段类型的索引：

```bash
# 始终建议为你的索引定义别名，这样在重新索引时，系统/应用程序不需要更改即可知道 percolator 查询现在位于不同的索引中
PUT index
{
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "body": {
        "type": "text"
      }
    }
  }
}

POST _aliases
{
  "actions": [
    {
      "add": {
        "index": "index",
        "alias": "queries"
      }
    }
  ]
}

PUT queries/_doc/1?refresh
{
  "query": {
    "match": {
      "body": "quick brown fox"
    }
  }
}
```

假设你准备升级到新的主版本，为了让新的 Elasticsearch 版本仍然能够读取你的查询，你需要将查询重新索引到当前 Elasticsearch 版本上的一个新索引中：

```bash
# 如果你有别名，不要忘记将它指向新索引
PUT new_index
{
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "body": {
        "type": "text"
      }
    }
  }
}

POST /_reindex?refresh
{
  "source": {
    "index": "index"
  },
  "dest": {
    "index": "new_index"
  }
}

POST _aliases
{
  "actions": [
    {
      "remove": {
        "index": "index",
        "alias": "queries"
      }
    },
    {
      "add": {
        "index": "new_index",
        "alias": "queries"
      }
    }
  ]
}
```

通过 `queries` 别名执行 `percolate` 查询：

```bash
GET /queries/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "body": "fox jumps over the lazy dog"
      }
    }
  }
}
```

现在会返回来自新索引的匹配：

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.13076457,
    "hits": [
      {
        "_index": "new_index",
        "_id": "1",
        "_score": 0.13076457,
        "_source": {
          "query": {
            "match": {
              "body": "quick brown fox"
            }
          }
        },
        "fields": {
          "_percolator_document_slot": [0]
        }
      }
    ]
  }
}
```

1. percolator 查询命中现在从新索引呈现。

## 优化查询时文本分析

当 percolator 验证一个 percolator 候选匹配时，它会解析、执行查询时文本分析，并实际在被渗透的文档上运行 percolator 查询。这是针对每个候选匹配执行的，并且每次 `percolate` 查询执行时都会进行。如果查询时文本分析是查询解析中相对昂贵的部分，那么文本分析可能成为渗透时耗时最多的因素。当 percolator 最终需要验证许多候选 percolator 查询匹配时，这种查询解析开销会变得明显。

为了避免渗透时文本分析中最昂贵的部分，可以选择在索引 percolator 查询时就完成文本分析中昂贵的部分。这需要使用两个不同的分析器。第一个分析器实际执行需要进行的文本分析（昂贵的部分）。第二个分析器（通常是 whitespace 分析器）只是拆分第一个分析器产生的词元。然后，在索引 percolator 查询之前，应使用分析 API 用较昂贵的分析器分析查询文本。分析 API 的结果（词元）应用于替换 percolator 查询中的原始查询文本。重要的是，查询现在应配置为覆盖映射中的分析器，只使用第二个分析器。大多数基于文本的查询都支持 `analyzer` 选项（`match`、`query_string`、`simple_query_string`）。使用这种方法，昂贵的文本分析只需执行一次，而不是多次。

让我们通过一个简化的示例来演示这个工作流程。

假设我们要索引以下 percolator 查询：

```json
{"query":{"match":{"body":{"query":"missing bicycles"}}}}
```

使用以下设置和映射：

```bash
# 就本例而言，此分析器被视为昂贵的分析器
PUT /test_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": ["lowercase", "porter_stem"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "body": {
        "type": "text",
        "analyzer": "my_analyzer"
      }
    }
  }
}
```

首先，我们需要在索引之前使用分析 API 执行文本分析：

```bash
POST /test_index/_analyze
{
  "analyzer": "my_analyzer",
  "text": "missing bicycles"
}
```

这会产生以下响应：

```json
{
  "tokens": [
    {
      "token": "miss",
      "start_offset": 0,
      "end_offset": 7,
      "type": "<ALPHANUM>",
      "position": 0
    },
    {
      "token": "bicycl",
      "start_offset": 8,
      "end_offset": 16,
      "type": "<ALPHANUM>",
      "position": 1
    }
  ]
}
```

返回顺序中的所有词元都需要替换 percolator 查询中的查询文本：

```bash
# 在这里选择 whitespace 分析器很重要，否则将使用映射中定义的分析器，这就违背了使用此工作流程的初衷。注意 whitespace 是内置分析器；如果需要使用其他分析器，需要先在索引的设置中进行配置
PUT /test_index/_doc/1?refresh
{
  "query": {
    "match": {
      "body": {
        "query": "miss bicycl",
        "analyzer": "whitespace"
      }
    }
  }
}
```

在索引 percolator 查询之前先使用分析 API 的流程，应该对每个 percolator 查询执行。

在渗透时无需任何更改，可以正常定义 `percolate` 查询：

```bash
GET /test_index/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "body": "Bycicles are missing"
      }
    }
  }
}
```

这会产生类似这样的响应：

```json
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.13076457,
    "hits": [
      {
        "_index": "test_index",
        "_id": "1",
        "_score": 0.13076457,
        "_source": {
          "query": {
            "match": {
              "body": {
                "query": "miss bicycl",
                "analyzer": "whitespace"
              }
            }
          }
        },
        "fields": {
          "_percolator_document_slot": [0]
        }
      }
    ]
  }
}
```

## 优化通配符查询

对于 percolator 来说，通配符查询比其他查询更昂贵，尤其是当通配符表达式很大时。

对于带有前缀通配符表达式的 `wildcard` 查询，或只是 `prefix` 查询，可以使用 `edge_ngram` 词元过滤器，将这些查询替换为对配置了 `edge_ngram` 词元过滤器的字段的常规 `term` 查询。

创建一个带有自定义分析设置的索引：

```bash
# 此分析器仅在索引时生成前缀词元
# 根据你的前缀搜索需求，增加 min_gram 并减小 max_gram 设置
# 应使用此多字段执行前缀搜索，用 term 或 match 查询代替 prefix 或 wildcard 查询
PUT my_queries1
{
  "settings": {
    "analysis": {
      "analyzer": {
        "wildcard_prefix": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "wildcard_edge_ngram"]
        }
      },
      "filter": {
        "wildcard_edge_ngram": {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 32
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "my_field": {
        "type": "text",
        "fields": {
          "prefix": {
            "type": "text",
            "analyzer": "wildcard_prefix",
            "search_analyzer": "standard"
          }
        }
      }
    }
  }
}
```

然后，不要索引以下查询：

```json
{"query":{"wildcard":{"my_field":"abc*"}}}
```

而应索引下面这个查询：

```bash
PUT /my_queries1/_doc/1?refresh
{
  "query": {
    "term": {
      "my_field.prefix": "abc"
    }
  }
}
```

这样处理第二个查询会比第一个查询更高效。

以下搜索请求将与之前索引的 percolator 查询匹配：

```bash
GET /my_queries1/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "my_field": "abcd"
      }
    }
  }
}
```

```json
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.18864399,
    "hits": [
      {
        "_index": "my_queries1",
        "_id": "1",
        "_score": 0.18864399,
        "_source": {
          "query": {
            "term": {
              "my_field.prefix": "abc"
            }
          }
        },
        "fields": {
          "_percolator_document_slot": [0]
        }
      }
    ]
  }
}
```

同样的技术也可以用来加速后缀通配符搜索。方法是在 `edge_ngram` 词元过滤器之前使用 `reverse` 词元过滤器。

```bash
# 搜索时也需要一个自定义分析器，否则查询词元不会被反转，将无法与反转的后缀词元匹配
PUT my_queries2
{
  "settings": {
    "analysis": {
      "analyzer": {
        "wildcard_suffix": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "reverse", "wildcard_edge_ngram"]
        },
        "wildcard_suffix_search_time": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "reverse"]
        }
      },
      "filter": {
        "wildcard_edge_ngram": {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 32
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "query": {
        "type": "percolator"
      },
      "my_field": {
        "type": "text",
        "fields": {
          "suffix": {
            "type": "text",
            "analyzer": "wildcard_suffix",
            "search_analyzer": "wildcard_suffix_search_time"
          }
        }
      }
    }
  }
}
```

然后，不要索引以下查询：

```json
{"query":{"wildcard":{"my_field":"*xyz"}}}
```

而应索引下面这个查询：

```bash
# 应使用 match 查询而不是 term 查询，因为文本分析需要反转查询词元
PUT /my_queries2/_doc/2?refresh
{
  "query": {
    "match": {
      "my_field.suffix": "xyz"
    }
  }
}
```

以下搜索请求将与之前索引的 percolator 查询匹配：

```bash
GET /my_queries2/_search
{
  "query": {
    "percolate": {
      "field": "query",
      "document": {
        "my_field": "wxyz"
      }
    }
  }
}
```

## 专用 Percolator 索引

percolate 查询可以添加到任何索引。可以将这些查询添加到一个专用索引，而不是添加到数据所在的索引中。这样做的好处是，这个专用的 percolator 索引可以拥有自己的索引设置（例如主分片和副本分片的数量）。如果选择使用专用的 percolate 索引，你需要确保普通索引的映射在 percolate 索引上也可用。否则 percolate 查询可能会被错误解析。

## 强制将未映射字段作为字符串处理

在某些情况下，你不知道会注册什么样的 percolator 查询。如果 percolator 查询引用的字段没有字段映射，则添加 percolator 查询会失败。这意味着需要更新映射以使字段具有适当的设置，然后才能添加 percolator 查询。但有时，将所有未映射字段当作默认 text 字段处理就足够了。在这些情况下，可以将 `index.percolator.map_unmapped_fields_as_text` 设置配置为 `true`（默认为 `false`），这样当 percolator 查询中引用的字段不存在时，它将被视为默认的 text 字段处理，从而添加 percolator 查询不会失败。

## 限制

### 父/子文档

由于 `percolate` 查询一次只处理一个文档，它不支持针对子文档运行的查询和过滤器，例如 `has_child` 和 `has_parent`。

### 获取查询

有一些查询会在查询解析期间通过 get 调用获取数据。例如，使用词条查找（terms lookup）时的 `terms` 查询、使用已索引脚本时的 `template` 查询，以及使用预索引形状时的 `geo_shape`。当这些查询被 `percolator` 字段类型索引时，get 调用会执行一次。因此每次 `percolator` 查询评估这些查询时，使用的都是索引时获取的词条、形状等。需要注意的重要一点是，这些查询进行的词条获取在 percolator 查询被索引到主分片和副本分片时都会发生，因此如果在索引期间源索引发生了变化，实际索引的词条在分片副本之间可能会不同。

### 脚本查询

`script` 查询内的脚本只能访问 doc values 字段。`percolate` 查询将提供的文档索引到一个内存索引中。此内存索引不支持存储字段，因此 `_source` 字段和其他存储字段不会被存储。这就是为什么在 `script` 查询中 `_source` 和其他存储字段不可用的原因。

### 字段别名

包含[字段别名](/mapping/field_data_types/alias)的 percolator 查询可能并不总是按预期运行。特别是，如果注册了一个包含字段别名的 percolator 查询，然后该别名在映射中被更新为指向另一个字段，存储的查询仍将指向原始目标字段。要使字段别名的更改生效，必须显式地重新索引 percolator 查询。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/percolator.html)
