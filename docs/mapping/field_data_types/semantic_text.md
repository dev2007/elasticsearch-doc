# semantic_text 字段类型

`semantic_text` 字段类型使用推理端点自动为文本内容生成向量嵌入。较长的文本会自动分块为较小的片段，以便处理更大的文本语料库。

`semantic_text` 字段类型指定一个将用于生成向量嵌入的推理端点标识符。你可以使用[创建推理 API](/rest_apis/inference_api/create_inference) 创建推理端点。此字段类型与 [semantic 查询](/query_dsl/specialized_queries/semantic)类型使你可以更简单地对数据执行语义搜索。`semantic_text` 字段类型也可以使用 `match`、`sparse_vector` 或 `knn` 查询进行查询。

如果你不指定推理端点，`inference_id` 字段默认为 `.elser-2-elasticsearch`，这是为 elasticsearch 服务预配置的端点。

使用 `semantic_text`，你无需指定如何为数据生成向量嵌入，也无需指定如何索引它。推理端点会自动确定要使用的嵌入生成方式、索引方式和查询方式。

如果你使用预配置的 `.elser-2-elasticsearch` 端点，可以使用以下 API 请求设置 `semantic_text`：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "inference_field": {
        "type": "semantic_text"
      }
    }
  }
}
```

要使用自定义推理端点而不是默认的 `.elser-2-elasticsearch`，你必须使用创建推理 API，并在设置 `semantic_text` 字段类型时指定其 `inference_id`。

```bash
PUT my-index-000002
{
  "mappings": {
    "properties": {
      "inference_field": {
        "type": "semantic_text",
        "inference_id": "my-openai-endpoint"
      }
    }
  }
}
```

1. 用于生成向量嵌入的推理端点的 `inference_id`。

使用 `semantic_text` 的推荐方式是为摄取和搜索使用专用的推理端点。这可以确保搜索速度不受摄取工作负载的影响，反之亦然。在为两者都创建了专用推理端点之后，你可以在为使用 `semantic_text` 字段的索引设置索引映射时，通过 `inference_id` 和 `search_inference_id` 参数引用它们。

```bash
PUT my-index-000003
{
  "mappings": {
    "properties": {
      "inference_field": {
        "type": "semantic_text",
        "inference_id": "my-elser-endpoint-for-ingest",
        "search_inference_id": "my-elser-endpoint-for-search"
      }
    }
  }
}
```

## semantic_text 字段的参数

- `inference_id`
  （可选，字符串）将用于为该字段生成向量嵌入的推理端点。默认使用 `.elser-2-elasticsearch`。此参数不能更新。使用创建推理 API 创建端点。如果指定了 `search_inference_id`，则该推理端点只在索引时使用。
- `search_inference_id`
  （可选，字符串）查询时将用于生成向量嵌入的推理端点。你可以使用更新映射 API 更新此参数。使用创建推理 API 创建端点。如果未指定，`inference_id` 定义的推理端点将同时用于索引和查询。

## 推理端点校验

`inference_id` 在创建映射时不会校验，而是在文档被摄取到索引时校验。当第一个文档被索引时，`inference_id` 将用于为该字段生成底层的索引结构。

删除推理端点会导致将 `semantic_text` 字段的 `inference_id` 定义为该推理端点的索引在文档摄取和语义查询时失败。尝试删除在 `semantic_text` 字段上使用的推理端点会返回错误。

## 文本分块

推理端点对可处理的文本量有限制。为了允许在语义搜索中使用大量文本，`semantic_text` 会在需要时自动生成较小的文本段落，称为块（chunk）。

每个块引用一段文本以及由其生成的对应向量嵌入。查询时，系统会自动搜索每个文档的各个片段，并使用最相关的片段来计算分数。

有关分块以及如何配置分块设置的更多详细信息，参阅推理 API 文档中的[配置分块](/rest_apis/inference_api/create_inference#配置分块)。

参阅[本教程](/solutions/search/semantic_search)了解有关使用 `semantic_text` 和 semantic 查询进行语义搜索的更多信息。

## 从语义文本中提取相关片段

你可以使用搜索 API 的 `highlight` 参数从语义文本字段中提取最相关的片段。

```bash
POST test-index/_search
{
    "query": {
        "match": {
            "my_semantic_field": "Which country is Paris in?"
        }
    },
    "highlight": {
        "fields": {
            "my_semantic_field": {
                "number_of_fragments": 2,
                "order": "score"
            }
        }
    }
}
```

1. 指定要返回的最大片段数量。
2. 设置为 `score` 时按分数对高亮片段排序。默认情况下，片段按它们在字段中出现的顺序输出（`order: none`）。

要使用语义高亮器以索引顺序查看块而不进行评分，请使用 `match_all` 查询按它们在文档中出现的顺序检索它们：

```bash
POST test-index/_search
{
    "query": {
        "match_all": {}
    },
    "highlight": {
        "fields": {
            "my_semantic_field": {
                "number_of_fragments": 5
            }
        }
    }
}
```

这将返回前 5 个块，将此数字设置得更高可以检索更多的块。

`semantic_text` 以外的字段也支持高亮显示。但是，如果你想将高亮限制为语义高亮器，并且当字段不是 `semantic_text` 类型时不返回片段，可以在查询中显式强制使用语义高亮器：

```bash
PUT test-index
{
    "query": {
        "match": {
            "my_field": "Which country is Paris in?"
        }
    },
    "highlight": {
        "fields": {
            "my_field": {
                "type": "semantic",
                "number_of_fragments": 2,
                "order": "score"
            }
        }
    }
}
```

1. 确保高亮只应用于 `semantic_text` 字段。

## 自定义 semantic_text 索引

`semantic_text` 根据指定的推理端点使用默认值索引数据。它通过提供自动推理和专用查询让你快速启动语义搜索，因此你无需提供更多细节。

如果你想自定义数据索引，请使用 `sparse_vector` 或 `dense_vector` 字段类型，并创建一个带有 inference 处理器的摄取管道来生成向量嵌入。[本教程](/solutions/search/semantic_search)将引导你完成此过程。在这些情况下——当你使用 `sparse_vector` 或 `dense_vector` 字段类型而不是 `semantic_text` 字段类型来自定义索引时——不支持使用 semantic 查询来查询字段数据。

## semantic_text 字段的更新

对于包含 `semantic_text` 字段的索引，使用脚本的更新具有以下行为：

- 通过更新 API 支持。
- 通过批量 API 不支持且会失败。即使脚本针对的是非 `semantic_text` 字段，当索引包含 `semantic_text` 字段时，更新也会失败。

## copy_to 和多字段支持

`semantic_text` 字段类型可以用作 `copy_to` 字段的目标、作为多字段结构的一部分，或在内部包含多字段。这意味着你可以使用单个字段收集其他字段的值用于语义搜索。

例如，以下映射：

```bash
PUT test-index
{
    "mappings": {
        "properties": {
            "source_field": {
                "type": "text",
                "copy_to": "infer_field"
            },
            "infer_field": {
                "type": "semantic_text",
                "inference_id": ".elser-2-elasticsearch"
            }
        }
    }
}
```

也可以声明为多字段：

```bash
PUT test-index
{
    "mappings": {
        "properties": {
            "source_field": {
                "type": "text",
                "fields": {
                    "infer_field": {
                        "type": "semantic_text",
                        "inference_id": ".elser-2-elasticsearch"
                    }
                }
            }
        }
    }
}
```

## 限制

`semantic_text` 字段类型有以下限制：

- `semantic_text` 字段目前不支持作为 `nested` 字段的元素。
- `semantic_text` 字段目前不能设置为[动态模板](/mapping/dynamic_template)的一部分。
- `semantic_text` 字段目前不支持跨集群搜索（CCS）或跨集群复制（CCR）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/semantic-text.html)
