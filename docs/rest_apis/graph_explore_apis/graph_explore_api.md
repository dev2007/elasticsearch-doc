# 图探索 API

:::::info 新版 API 参考

有关最新的 API 详情，请参阅 [图探索 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-graph-explore)。

:::::

图探索 API 使你能够提取和汇总有关 Elasticsearch 数据流或索引中文档和词项的信息。

理解此 API 行为的最简单方式是使用 Graph UI 来探索连接。你可以从「最近请求」面板查看提交到 `_explore` 端点的最近请求。有关更多信息，请参阅 [Graph 入门](https://www.elastic.co/guide/en/kibana/8.18/graph.html)。

有关使用探索 API 的其他信息，请参阅 [Graph 故障排除和限制](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/graph-troubleshooting.html)主题。

图探索 API 默认启用。要禁用对图探索 API 和 Kibana Graph UI 的访问，请在 `elasticsearch.yml` 中添加 `xpack.graph.enabled: false`。

## 请求

```bash
POST <target>/_graph/explore
```

## 描述

对 `_explore` API 的初始请求包含一个种子查询，用于标识感兴趣的文档，并指定定义要包含在图中的顶点和连接的字段。后续的 `_explore` 请求使你能够从一个或多个感兴趣的顶点向外扩展。你可以排除已经返回的顶点。

## 请求体

- `query`

  标识感兴趣文档的种子查询。可以是任何有效的 Elasticsearch 查询。例如：

  ```json
  "query": {
    "bool": {
      "must": {
        "match": {
          "query.raw": "midi"
        }
      },
      "filter": [
        {
          "range": {
            "query_time": {
              "gte": "2015-10-01 00:00:00"
            }
          }
        }
      ]
    }
  }
  ```

- `vertices`

  指定一个或多个包含要作为顶点包含在图中的词项的字段。例如：

  ```json
  "vertices": [
    {
      "field": "product"
    }
  ]
  ```

  顶点属性：

  - `field`

    标识感兴趣文档中的字段。

  - `include`

    标识形成你想要扩展的起点的感兴趣词项。如果指定了 `include` 子句，则无需指定种子查询。`include` 子句会隐式查询包含所列任意词项的文档。除了指定简单的字符串数组外，你还可以传递带有 `term` 和 `boost` 值的对象，以提升特定词项的匹配权重。

  - `exclude`

    `exclude` 子句阻止指定词项被包含在结果中。

  - `size`

    指定每个字段返回的顶点词项的最大数量。默认为 5。

  - `min_doc_count`

    指定在一对词项被认为是有用的连接之前，必须有多少文档包含该词项对。此设置充当确定性阈值。默认为 3。

  - `shard_min_doc_count`

    此高级设置控制特定分片上必须有多少文档包含一对词项，该连接才会被返回以供全局考虑。默认为 2。

- `connections`

  指定一个或多个字段，从中提取与指定顶点关联的词项。例如：

  ```json
  "connections": {  
    "vertices": [
      {
        "field": "query.raw"
      }
    ]
  }
  ```

  连接可以嵌套在 `connections` 对象内，以探索数据中的其他关系。每一层嵌套被视为一跳，图中的邻近性通常以跳数深度来描述。

  连接属性：

  - `query`

    一个可选的引导查询，在探索连接词项时约束 Graph API。例如，你可能希望通过指定标识最近文档的查询来引导 Graph API 忽略较旧的数据。

  - `vertices`

    包含你感兴趣的字段。例如：

    ```json
    "vertices": [
      {
        "field": "query.raw",
        "size": 5,
        "min_doc_count": 10,
        "shard_min_doc_count": 3
      }
    ]
    ```

- `controls`

  指导 Graph API 如何构建图。

  控制属性：

  - `use_significance`

    `use_significance` 标志过滤关联词项，只包含与你的查询显著关联的词项。有关用于计算显著性的算法的信息，请参阅 [significant_terms 聚合](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-aggregations-bucket-significantterms-aggregation.html)。默认为 `true`。

  - `sample_size`

    每一跳考虑每个分片上最佳匹配文档的样本。使用样本可以提高执行速度并使探索集中在有意义的连接词项上。非常小的值（小于 50）可能无法提供足够的证据权重来识别词项之间的显著连接。非常大的样本大小可能会降低结果质量并增加执行时间。默认为 100 个文档。

  - `timeout`

    探索将被中止并返回目前为止收集的结果的时间长度（毫秒）。此超时基于尽力而为。例如，如果在为字段加载 FieldData 时遇到长时间暂停，执行可能会超过此超时。

  - `sample_diversity`

    为避免最佳匹配文档样本被单一来源的结果主导，有时需要请求样本的多样性。你可以通过选择一个单值字段并为该字段设置每个值的最大文档数来实现。例如：

    ```json
    "sample_diversity": {
      "field": "category.raw",
      "max_docs_per_value": 500
    }
    ```

## 示例

### 基本探索

初始搜索通常以查询开始，以识别强关联的词项。

```json
POST clicklogs/_graph/explore
{
  "query": {                  
    "match": {
      "query.raw": "midi"
    }
  },
  "vertices": [               
    {
      "field": "product"
    }
  ],
  "connections": {            
    "vertices": [
      {
        "field": "query.raw"
      }
    ]
  }
}
```

1. 使用查询为探索设置种子。此示例在 clicklogs 中搜索搜索词为 "midi" 的人。
2. 标识要包含在图中的顶点。此示例寻找与 "midi" 搜索显著关联的产品代码。
3. 查找连接。此示例寻找引导人们点击与 "midi" 搜索关联的产品的其他搜索词。

探索 API 的响应如下所示：

```json
{
   "took": 0,
   "timed_out": false,
   "failures": [],
   "vertices": [ 
      {
         "field": "query.raw",
         "term": "midi cable",
         "weight": 0.08745858139552132,
         "depth": 1
      },
      {
         "field": "product",
         "term": "8567446",
         "weight": 0.13247784285434397,
         "depth": 0
      },
      {
         "field": "product",
         "term": "1112375",
         "weight": 0.018600718471158982,
         "depth": 0
      },
      {
         "field": "query.raw",
         "term": "midi keyboard",
         "weight": 0.04802242866755111,
         "depth": 1
      }
   ],
   "connections": [ 
      {
         "source": 0,
         "target": 1,
         "weight": 0.04802242866755111,
         "doc_count": 13
      },
      {
         "source": 2,
         "target": 3,
         "weight": 0.08120623870976627,
         "doc_count": 23
      }
   ]
}
```

1. 包含所有发现的顶点的数组。顶点是一个已索引的词项，因此提供了字段和词项值。`weight` 属性指定显著性得分。`depth` 属性指定首次遇到该词项的跳数级别。
2. 顶点数组中顶点之间的连接。`source` 和 `target` 属性是顶点数组中的索引，指示在探索过程中哪个顶点词项导致了另一个顶点。`doc_count` 值指示样本集中有多少文档包含此词项对（这不是数据流或索引中所有文档的全局计数）。

### 可选控制

默认设置旨在消除噪声数据并从数据中获取「全局概览」。此示例展示如何指定额外参数来影响图的构建方式。

有关在每份文档都可能重要的详细取证评估中调整设置的提示，请参阅[故障排除指南](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/graph-troubleshooting.html)。

```json
POST clicklogs/_graph/explore
{
  "query": {
    "match": {
      "query.raw": "midi"
    }
  },
  "controls": {
    "use_significance": false,        
    "sample_size": 2000,              
    "timeout": 2000,                  
    "sample_diversity": {             
      "field": "category.raw",
      "max_docs_per_value": 500
    }
  },
  "vertices": [
    {
      "field": "product",
      "size": 5,                      
      "min_doc_count": 10,            
      "shard_min_doc_count": 3        
    }
  ],
  "connections": {
    "query": {                        
      "bool": {
        "filter": [
          {
            "range": {
              "query_time": {
                "gte": "2015-10-01 00:00:00"
              }
            }
          }
        ]
      }
    },
    "vertices": [
      {
        "field": "query.raw",
        "size": 5,
        "min_doc_count": 10,
        "shard_min_doc_count": 3
      }
    ]
  }
}
```

1. 禁用 `use_significance` 以包含所有关联词项，而不仅仅是与查询显著关联的词项。
2. 增加样本大小以考虑每个分片上更大的文档集。
3. 限制图请求在返回结果之前运行的时间。
4. 通过在特定单值字段（如类别字段）中设置每个值的最大文档数来确保样本的多样性。
5. 控制每个字段返回的顶点词项的最大数量。
6. 设置确定性阈值，指定必须有多少文档包含一对词项才将其视为有用的连接。
7. 指定分片上必须有多少文档包含一对词项，该连接才会被返回以供全局考虑。
8. 在探索连接词项时限制考虑哪些文档。

### 扩展操作

初始搜索后，你通常需要选择感兴趣的顶点并查看连接了哪些额外顶点。用图论术语来说，此操作被称为「扩展」（spidering）。通过提交一系列请求，你可以逐步构建相关信息图。

要进行扩展，你需要指定两件事：

- 你想要查找额外连接的顶点集合
- 你已经知道并希望从扩展操作结果中排除的顶点集合

你使用 `include` 和 `exclude` 子句指定此信息。例如，以下请求从产品 1854873 开始，向外扩展查找与该产品关联的额外搜索词。词项 "midi"、"midi keyboard" 和 "synth" 被排除在结果之外。

```json
POST clicklogs/_graph/explore
{
   "vertices": [
      {
         "field": "product",
         "include": [ "1854873" ] 
      }
   ],
   "connections": {
      "vertices": [
         {
            "field": "query.raw",
            "exclude": [ 
               "midi keyboard",
               "midi",
               "synth"
            ]
         }
      ]
   }
}
```

1. 你想要作为起点的顶点在 `include` 子句中指定为词项数组。
2. `exclude` 子句阻止你已经知道的词项被包含在结果中。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/graph-explore-api.html)
