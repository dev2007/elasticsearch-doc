# 分析 API

::: danger 警告
分析 API 是一种调试工具，为搜索执行增加了大量开销。
:::

## 描述

分析 API 让用户能够深入了解搜索请求是如何在较低级别执行的，这样用户就可以理解某些请求速度慢的原因，并采取措施加以改进。请注意，配置文件 API 并没有测量网络延迟、请求在队列中花费的时间或在协调节点上合并分片响应所花费的时间。

分析 API 的输出非常冗长，尤其是对于跨多个碎分执行的复杂请求。建议打印响应以帮助理解输出。

## 示例

可以通过添加顶级 `profile` 参数来分析任何 `_search` 请求：

```bash
GET /my-index-000001/_search
{
  "profile": true,
  "query" : {
    "match" : { "message" : "GET /search" }
  }
}
```

1. `"profile": true,`： 将顶层 `profile` 参数设置为 `true` 将启用搜索分析。

此 API 返回以下结果：

```bash
{
  "took": 25,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 5,
      "relation": "eq"
    },
    "max_score": 0.17402273,
    "hits": [...] 
  },
  "profile": {
    "shards": [
      {
        "id": "[2aE02wS1R8q_QFnYu6vDVQ][my-index-000001][0]",
        "searches": [
          {
            "query": [
              {
                "type": "BooleanQuery",
                "description": "message:get message:search",
                "time_in_nanos" : 11972972,
                "breakdown" : {
                  "set_min_competitive_score_count": 0,
                  "match_count": 5,
                  "shallow_advance_count": 0,
                  "set_min_competitive_score": 0,
                  "next_doc": 39022,
                  "match": 4456,
                  "next_doc_count": 5,
                  "score_count": 5,
                  "compute_max_score_count": 0,
                  "compute_max_score": 0,
                  "advance": 84525,
                  "advance_count": 1,
                  "score": 37779,
                  "build_scorer_count": 2,
                  "create_weight": 4694895,
                  "shallow_advance": 0,
                  "create_weight_count": 1,
                  "build_scorer": 7112295
                },
                "children": [
                  {
                    "type": "TermQuery",
                    "description": "message:get",
                    "time_in_nanos": 3801935,
                    "breakdown": {
                      "set_min_competitive_score_count": 0,
                      "match_count": 0,
                      "shallow_advance_count": 3,
                      "set_min_competitive_score": 0,
                      "next_doc": 0,
                      "match": 0,
                      "next_doc_count": 0,
                      "score_count": 5,
                      "compute_max_score_count": 3,
                      "compute_max_score": 32487,
                      "advance": 5749,
                      "advance_count": 6,
                      "score": 16219,
                      "build_scorer_count": 3,
                      "create_weight": 2382719,
                      "shallow_advance": 9754,
                      "create_weight_count": 1,
                      "build_scorer": 1355007
                    }
                  },
                  {
                    "type": "TermQuery",
                    "description": "message:search",
                    "time_in_nanos": 205654,
                    "breakdown": {
                      "set_min_competitive_score_count": 0,
                      "match_count": 0,
                      "shallow_advance_count": 3,
                      "set_min_competitive_score": 0,
                      "next_doc": 0,
                      "match": 0,
                      "next_doc_count": 0,
                      "score_count": 5,
                      "compute_max_score_count": 3,
                      "compute_max_score": 6678,
                      "advance": 12733,
                      "advance_count": 6,
                      "score": 6627,
                      "build_scorer_count": 3,
                      "create_weight": 130951,
                      "shallow_advance": 2512,
                      "create_weight_count": 1,
                      "build_scorer": 46153
                    }
                  }
                ]
              }
            ],
            "rewrite_time": 451233,
            "collector": [
              {
                "name": "SimpleTopScoreDocCollector",
                "reason": "search_top_hits",
                "time_in_nanos": 775274
              }
            ]
          }
        ],
        "aggregations": [],
        "fetch": {
          "type": "fetch",
          "description": "",
          "time_in_nanos": 660555,
          "breakdown": {
            "next_reader": 7292,
            "next_reader_count": 1,
            "load_stored_fields": 299325,
            "load_stored_fields_count": 5
          },
          "debug": {
            "stored_fields": ["_id", "_routing", "_source"]
          },
          "children": [
            {
              "type": "FetchSourcePhase",
              "description": "",
              "time_in_nanos": 20443,
              "breakdown": {
                "next_reader": 745,
                "next_reader_count": 1,
                "process": 19698,
                "process_count": 5
              },
              "debug": {
                "fast_path": 5
              }
            }
          ]
        }
      }
    ]
  }
}
```

1. `"hits": [...]`：将返回搜索结果，但为了简洁起见，此处省略了搜索结果。

即使对于一个简单的查询，响应也相对复杂。在转到更复杂的示例之前，让我们将其逐一分解。

分析响应的总体结构如下：

```bash
{
   "profile": {
        "shards": [
           {
              "id": "[2aE02wS1R8q_QFnYu6vDVQ][my-index-000001][0]",  
              "searches": [
                 {
                    "query": [...],
                    "rewrite_time": 51443,
                    "collector": [...]
                 }
              ],
              "aggregations": [...],
              "fetch": {...}
           }
        ]
     }
}
```

1. `"id": "[2aE02wS1R8q_QFnYu6vDVQ][my-index-000001][0]"`：将为参与响应的每个分片返回一个分析，并由唯一 ID 标识。
2. `"query": [...]`：查询计时和其他调试信息。
3. `"rewrite_time": 51443`：累计重写时间。
4. `"collector": [...]`：每个收集器的名称和调用计时。
5. `"aggregations": [...]`：聚合计时、调用计数和调试信息。
6. `"fetch": {...} `：获取计时和调试信息。

因为搜索请求可以针对索引中的一个或多个分片执行，并且搜索可以覆盖一个或多个索引，所以概要文件响应中的顶级元素是 `shard` 对象的数组。每个分片对象列出其唯一标识分片的 `id`。ID 格式为 `[nodeID][indexName][shardID]`。

概要文件本身可能包含一个或多个“搜索”，其中搜索是针对基础 Lucene 索引执行的查询。用户提交的大多数搜索请求只会对 Lucene 索引执行一次 `search`。但有时会执行多个搜索，例如包括全局聚合（需要对全局上下文执行辅助“match_all”查询）。

在每个搜索对象中，将有两个概要信息数组：一个 `query` 数组和一个 `collector` 数组。`search` 对象旁边是一个 `aggregations` 对象，其中包含聚合的概要信息。将来，可能会添加更多的部分，如 `suggest`、`highlight` 等。

还将有一个 `rewrite` 度量，显示重写查询所花费的总时间（以纳秒为单位）。

::: tip 提示
与其他统计 API 一样，分析 API支持人类可读的输出。可以通过给查询字符串添加 `?human=true`。在这种情况下，输出包含包含四舍五入的人类可读定时信息的附加 `time` 字段（如："time": "391,9ms", "time": "123.3micros"）。
:::

## 分析查询

::: tip 提示
分析 API 提供的细节直接公开了 Lucene 类名和概念，这意味着对结果的完整解释需要相当高级的 Lucene 知识。本页试图提供 Lucene 如何执行查询的速成课程，以便你可以使用分析 API 成功诊断和调试查询，但这只是一个概述。要完全理解，请参阅Lucene的文档和代码。
尽管如此，修复缓慢的查询通常不需要完全理解。例如，只需看到查询的某个特定组件运行缓慢，而不必了解该查询的高级阶段是什么原因，这通常就足够了。
:::

### `query` 部分

`query` 部分包含 Lucene 在特定切分上执行查询树的详细计时。此查询树的整体结构将类似于你原来的 Elasticsearch 查询，但可能略有不同（有时非常不同）。它还将使用类似但并不总是相同的命名。使用前面的 `match` 查询示例，让我们分析 `query` 部分：

```bash
"query": [
    {
       "type": "BooleanQuery",
       "description": "message:get message:search",
       "time_in_nanos": "11972972",
       "breakdown": {...},
       "children": [
          {
             "type": "TermQuery",
             "description": "message:get",
             "time_in_nanos": "3801935",
             "breakdown": {...}
          },
          {
             "type": "TermQuery",
             "description": "message:search",
             "time_in_nanos": "205654",
             "breakdown": {...}
          }
       ]
    }
]
```

1. `"breakdown": {...},`：为了简单起见，省略了细化计时。

根据概要文件结构，我们可以看到我们的 `match` 查询被 Lucene 重写为一个带有两个子句的 BooleanQuery（都包含一个 TermQuery）。`type` 字段显示 Lucene 类名，并且通常与 Elasticsearch 中的等效名称对齐。`description` 字段显示查询的 Lucene 解释文本，并可用于帮助区分查询的各个部分（例如，`message:get` 和 `message:search` 都是 TermQuery 的，否则会完全相同。

`time_in_nanos` 字段显示，整个 BooleanQuery 执行此查询大约需要11.9ms。记录的时间包括所有子代。

`breakdown` 字段将提供有关时间花费情况的详细统计信息，我们稍后将对此进行研究。最后，`children` 数组列出可能存在的所有子查询。因为我们搜索了两个值（“get search”），所以 BooleanQuery 包含两个子项 TermQuery。它们具有相同的信息（类型、时间、故障等）。子代可以有自己的子代。

## 细化计时

`breakdown` 组件列出了有关低级别 Lucene 执行的详细计时统计信息：

```bash
"breakdown": {
  "set_min_competitive_score_count": 0,
  "match_count": 5,
  "shallow_advance_count": 0,
  "set_min_competitive_score": 0,
  "next_doc": 39022,
  "match": 4456,
  "next_doc_count": 5,
  "score_count": 5,
  "compute_max_score_count": 0,
  "compute_max_score": 0,
  "advance": 84525,
  "advance_count": 1,
  "score": 37779,
  "build_scorer_count": 2,
  "create_weight": 4694895,
  "shallow_advance": 0,
  "create_weight_count": 1,
  "build_scorer": 7112295
}
```

计时以挂钟纳秒为单位列出，完全不规范化。所有关于全部 `time_in_nanos` 的警告都适用于此处。分解的目的是让你感觉 A）Lucene 中的什么机器实际上在消耗时间，B）不同组件之间的时间差异的大小。与总时间一样，细分也包括所有子时间。

统计数据的含义如下：

**所有参数：**
|||
|--|--|
|`create_weight`|Lucene 中的查询必须能够跨多个索引搜索器重用（将其视为针对特定 Lucene 索引执行搜索的引擎）。这让 Lucene 陷入了一个棘手的境地，因为许多查询需要积累与它所针对的索引相关联的临时状态/统计信息，但查询契约要求它必须是不可变的。<br>为了解决这个问题，Lucene 要求每个查询生成一个权重对象，该对象充当临时上下文对象，以保存与这个特定（IndexSearcher，query）元组关联的状态。`weight` 指标显示此过程所需的时间|
|`build_scorer`|此参数显示为查询构建记分器所需的时间。记分器是一种在匹配的文档上迭代并为每个文档生成分数的机制（例如，“foo” 与文档的匹配程度如何？）。注意，这记录了生成记分器对象所需的时间，而不是对文档进行实际记分。有些查询的记分器初始化速度更快或更慢，具体取决于优化、复杂性等。<br>如果对查询启用和/或适用，这还可能显示与缓存相关的计时|
|`next_doc`|Lucene 方法 `next_doc` 返回与查询匹配的下一个文档的文档ID。此统计信息显示了确定下一个匹配的文档所需的时间，这一过程根据查询的性质有很大的不同。Next_doc 是 advance() 的一种特殊形式，对于 Lucene 中的许多查询更方便。相当于 advance(docId()+1)|
|`advance`|advance是 next_doc 的“低级”版本：它的作用与查找下一个匹配的文档相同，但需要调用查询执行额外的任务，例如识别和移动跳过的内容等。然而，并非所有查询都可以使用next\u doc，因此advance也会对这些查询进行计时。
|`advance`|advance是 next_doc 的“低级”版本：它的作用与查找下一个匹配的文档相同，但需要调用查询执行额外的任务，例如识别和移动跳过的内容等。然而，并非所有查询都可以使用 ，因此 advance 也会对这些查询进行计时。<br>连接词（例如布尔值中的must子句）是 advance 的典型使用者|
|`match`|有些查询（如短语查询）使用“两阶段”过程匹配文档。首先，文档是“大致”匹配的，如果它大致匹配，则会使用更严格（且更昂贵）的过程再次检查它。第二阶段验证是 `match` 统计度量的内容。<br>例如，短语查询首先通过确保短语中的所有术语都存在于文档中来大致检查文档。如果所有术语都存在，则执行第二阶段验证，以确保术语能够形成短语，这比仅检查术语的存在相对更昂贵。<br>由于这两个阶段的过程仅由少数查询使用，因此 `match` 统计信息通常为零|
|`score`|这记录了通过特定文档的记分器对其进行记分所需的时间|
|`*_count`|记录特定方法的调用次数。例如，`"next_doc_count": 2` 表示对两个不同的文档调用了 `nextDoc()` 方法。通过比较不同查询组件之间的计数，这可以帮助判断查询的选择性。|

### `collectors` 部分

响应的收集器部分显示高级执行详细信息。Lucene 的工作方式是定义一个“收集器”，负责协调匹配文档的遍历、评分和收集。收集器也是单个查询记录聚合结果、执行非范围“全局”查询、执行查询后过滤器等的方式。

查看前面的示例：

```bash
"collector": [
  {
    "name": "SimpleTopScoreDocCollector",
    "reason": "search_top_hits",
    "time_in_nanos": 775274
  }
]
```

我们看到一个名为 `SimpleTopScoreDocCollector` 的收集器包装到 `CancelableCollector` 中。`SimpleTopScoreDocCollector` 是 Elasticsearch 使用的默认“评分和排序” `Collector`。`reason` 字段尝试提供类名的纯英语描述。`time_in_nanos` 类似于查询树中的时间：包含所有子级的挂钟时间。类似地，`children` 列出所有子收集器。Elasticsearch 使用包装 `SimpleTopScoreDocCollector` 的 `CancelableCollector` 来检测当前搜索是否已取消，并在当前搜索发生时立即停止收集文档。

应该注意的是，收集器时间**独立**于查询时间。它们是独立计算、组合和归一化的！由于 Lucene 执行的性质，不可能将采集器中的时间“合并”到查询部分，因此它们会显示在单独的部分中。

作为参考，各种收集原因如下：

|||
|--|--|
|`search_sorted`|对文档进行评分和排序的收集器。这是最常见的收集器，将在最简单的搜索中看到。|
|`search_count`|一种收集器，只统计与查询匹配的文档数，而不提取源。当指定 `size: 0` 时，会看到这种情况。|
|`search_terminate_after_count`|在找到 `n` 个匹配文档后终止搜索执行的收集器。当指定了查询参数 `terminate_after_count` 时，就会看到这种情况。|
|`search_min_score`|仅返回得分大于 `n` 的匹配文档的收集器。当指定了顶级参数 `min_score` 时，就会看到这种情况。|
|`search_multi`|包装其他几个收集器的收集器。当搜索、聚合、全局聚合和 post_filters 组合在一个搜索中时，就会看到这种情况。|
|`search_timeout`|在指定时间段后停止执行的收集器。当指定了 `timeout` 顶级参数时，就会看到这种情况。|
|`aggregation`|Elasticsearch 用于对查询范围运行聚合的收集器。单个 `aggregation` 收集器用于收集所有聚合的文档，因此你将看到名称中的聚合列表。|
|`global_aggregation`|针对全局查询范围而不是指定查询执行聚合的收集器。由于全局范围必然不同于已执行的查询，因此它必须执行自己的match\u all查询（你将看到该查询已添加到查询部分）以收集整个数据集|

### `rewrite` 部分

Lucene 中的所有查询都会经历一个“重写”过程。查询（及其子查询）可能会被重写一次或多次，并且该过程将继续，直到查询停止更改为止。此过程允许 Lucene 执行优化，例如删除冗余子句，替换一个查询以获得更高效的执行路径，等等。例如 Boolean → Boolean → TermQuery 可以重写为 TermQuery，因为在这种情况下，所有布尔值都是不必要的。

重写过程很复杂，很难显示，因为查询可能会发生剧烈的变化。总重写时间只显示为一个值（以纳秒为单位），而不是显示中间结果。该值是累积的，包含所有查询被重写的总时间。

### 一个更复杂的例子

为了演示稍微复杂一点的查询和关联结果，我们可以分析以下查询：

```bash
GET /my-index-000001/_search
{
  "profile": true,
  "query": {
    "term": {
      "user.id": {
        "value": "elkbee"
      }
    }
  },
  "aggs": {
    "my_scoped_agg": {
      "terms": {
        "field": "http.response.status_code"
      }
    },
    "my_global_agg": {
      "global": {},
      "aggs": {
        "my_level_agg": {
          "terms": {
            "field": "http.response.status_code"
          }
        }
      }
    }
  },
  "post_filter": {
    "match": {
      "message": "search"
    }
  }
}
```

此例子有这些东西：
- 一个查询
- 一个范围聚合
- 一个全局聚合
- 一个 post_filter

此 API 返回以下响应：

```bash
{
  ...
  "profile": {
    "shards": [
      {
        "id": "[P6-vulHtQRWuD4YnubWb7A][my-index-000001][0]",
        "searches": [
          {
            "query": [
              {
                "type": "TermQuery",
                "description": "message:search",
                "time_in_nanos": 141618,
                "breakdown": {
                  "set_min_competitive_score_count": 0,
                  "match_count": 0,
                  "shallow_advance_count": 0,
                  "set_min_competitive_score": 0,
                  "next_doc": 0,
                  "match": 0,
                  "next_doc_count": 0,
                  "score_count": 0,
                  "compute_max_score_count": 0,
                  "compute_max_score": 0,
                  "advance": 3942,
                  "advance_count": 4,
                  "score": 0,
                  "build_scorer_count": 2,
                  "create_weight": 38380,
                  "shallow_advance": 0,
                  "create_weight_count": 1,
                  "build_scorer": 99296
                }
              },
              {
                "type": "TermQuery",
                "description": "user.id:elkbee",
                "time_in_nanos": 163081,
                "breakdown": {
                  "set_min_competitive_score_count": 0,
                  "match_count": 0,
                  "shallow_advance_count": 0,
                  "set_min_competitive_score": 0,
                  "next_doc": 2447,
                  "match": 0,
                  "next_doc_count": 4,
                  "score_count": 4,
                  "compute_max_score_count": 0,
                  "compute_max_score": 0,
                  "advance": 3552,
                  "advance_count": 1,
                  "score": 5027,
                  "build_scorer_count": 2,
                  "create_weight": 107840,
                  "shallow_advance": 0,
                  "create_weight_count": 1,
                  "build_scorer": 44215
                }
              }
            ],
            "rewrite_time": 4769,
            "collector": [
              {
                "name": "MultiCollector",
                "reason": "search_multi",
                "time_in_nanos": 1945072,
                "children": [
                  {
                    "name": "FilteredCollector",
                    "reason": "search_post_filter",
                    "time_in_nanos": 500850,
                    "children": [
                      {
                        "name": "SimpleTopScoreDocCollector",
                        "reason": "search_top_hits",
                        "time_in_nanos": 22577
                      }
                    ]
                  },
                  {
                    "name": "MultiBucketCollector: [[my_scoped_agg, my_global_agg]]",
                    "reason": "aggregation",
                    "time_in_nanos": 867617
                  }
                ]
              }
            ]
          }
        ],
        "aggregations": [...],
        "fetch": {...}
      }
    ]
  }
}
```

1. `"aggregations": [...]`：“`aggregations（聚合）`”部分已被省略，因为它将在下一节中介绍。

如你所见，输出比以前要详细得多。查询的所有主要部分都表示为：

1. 第一个 `TermQuery`（user.id:elkbee）表示主 `term` 查询。
2. 第二个 `TermQuery`（message:search）表示 `post_filter` 查询。

收集器树非常简单，它显示了单个 CancelableCollector 如何包装多个收集器，多个收集器也包装 FilteredCollector 以执行 post_filter （并反过来包装正常的评分 SimpleCollector），BucketCollector 如何运行所有范围的聚合。

### 了解 MultiTermQuery 的输出

需要特别注意 `MultiTermQuery` 查询类。这包括通配符、正则表达式和模糊查询。这些查询发出非常详细的响应，并且没有过度结构化。

从本质上讲，这些查询在每个段的基础上重写自己。如果你设想通配符查询 `b*`，从技术上讲，它可以匹配以字母“b”开头的任何标记。不可能枚举所有可能的组合，因此 Lucene 会在被评估段的上下文中重写查询，例如，一个段可能包含标记 `[bar，baz]`，因此查询会重写为“bar”和“baz”的布尔查询组合。另一段可能只有标记 `[bakery]`，因此查询将重写为“bakery”的单个 TermQuery。

由于这种动态的逐段重写，干净的树结构变得扭曲，不再遵循显示一个查询如何重写到下一个查询的干净“沿袭”。目前，我们所能做的就是道歉，如果太令人困惑，建议您折叠查询子项的详细信息。幸运的是，所有的计时统计信息都是正确的，只是响应中的物理布局不正确，因此，如果您发现细节太复杂而无法解释，只分析顶级 MultiTermQuery 并忽略其子项就足够了。

希望这将在未来的迭代中得到修复，但这是一个需要解决的棘手问题，仍在进行中。:)

### 分析聚合

#### `aggregations` 部分

`aggregations` 部分包含由特定分片执行的聚合树的详细计时。此聚合树的总体结构类似于你最初的 Elasticsearch 请求。让我们再次执行前面的查询，并查看这次的聚合配置文件：

```bash
GET /my-index-000001/_search
{
  "profile": true,
  "query": {
    "term": {
      "user.id": {
        "value": "elkbee"
      }
    }
  },
  "aggs": {
    "my_scoped_agg": {
      "terms": {
        "field": "http.response.status_code"
      }
    },
    "my_global_agg": {
      "global": {},
      "aggs": {
        "my_level_agg": {
          "terms": {
            "field": "http.response.status_code"
          }
        }
      }
    }
  },
  "post_filter": {
    "match": {
      "message": "search"
    }
  }
}
```

这将产生以下聚合分析输出：

```bash
{
  "profile": {
    "shards": [
      {
        "aggregations": [
          {
            "type": "NumericTermsAggregator",
            "description": "my_scoped_agg",
            "time_in_nanos": 79294,
            "breakdown": {
              "reduce": 0,
              "build_aggregation": 30885,
              "build_aggregation_count": 1,
              "initialize": 2623,
              "initialize_count": 1,
              "reduce_count": 0,
              "collect": 45786,
              "collect_count": 4,
              "build_leaf_collector": 18211,
              "build_leaf_collector_count": 1,
              "post_collection": 929,
              "post_collection_count": 1
            },
            "debug": {
              "total_buckets": 1,
              "result_strategy": "long_terms",
              "built_buckets": 1
            }
          },
          {
            "type": "GlobalAggregator",
            "description": "my_global_agg",
            "time_in_nanos": 104325,
            "breakdown": {
              "reduce": 0,
              "build_aggregation": 22470,
              "build_aggregation_count": 1,
              "initialize": 12454,
              "initialize_count": 1,
              "reduce_count": 0,
              "collect": 69401,
              "collect_count": 4,
              "build_leaf_collector": 8150,
              "build_leaf_collector_count": 1,
              "post_collection": 1584,
              "post_collection_count": 1
            },
            "debug": {
              "built_buckets": 1
            },
            "children": [
              {
                "type": "NumericTermsAggregator",
                "description": "my_level_agg",
                "time_in_nanos": 76876,
                "breakdown": {
                  "reduce": 0,
                  "build_aggregation": 13824,
                  "build_aggregation_count": 1,
                  "initialize": 1441,
                  "initialize_count": 1,
                  "reduce_count": 0,
                  "collect": 61611,
                  "collect_count": 4,
                  "build_leaf_collector": 5564,
                  "build_leaf_collector_count": 1,
                  "post_collection": 471,
                  "post_collection_count": 1
                },
                "debug": {
                  "total_buckets": 1,
                  "result_strategy": "long_terms",
                  "built_buckets": 1
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

从分析结构中，我们可以看到 `my_scoped_agg` 在内部作为 `NumericTermsAggregator` 运行（因为它正在聚合的字段 `http.response.status_code` 是一个数字字段）。在同一级别，我们看到一个来自 `my_global_agg` 的 `GlobalAggregator`。然后，该聚合有一个子 `NumericTermsAggregator`，它来自 `http.response.status_code` 上第二个词语的聚合。

`time_in_nanos` 字段显示每个聚合执行的时间，并包含所有子级。虽然总时间很有用，但 `breakdown` 字段将提供有关时间花费情况的详细统计信息。

一些聚合可能会返回专家 `debug` 信息，这些信息描述了聚合底层执行的功能，这些功能“对入侵聚合的人有用，但我们不希望在其他方面有用”。它们在版本、聚合和聚合执行策略之间可能存在很大差异。

#### 细化计时

`breakdown` 组件列出了有关低级执行的详细统计信息：

```bash
"breakdown": {
  "reduce": 0,
  "build_aggregation": 30885,
  "build_aggregation_count": 1,
  "initialize": 2623,
  "initialize_count": 1,
  "reduce_count": 0,
  "collect": 45786,
  "collect_count": 4,
  "build_leaf_collector": 18211,
  "build_leaf_collector_count": 1
}
```

`breakdown` 组件中的每个属性对应于聚合的内部方法。例如，`build_leaf_collector` 属性测量运行聚合的 `getLeafCollector()` 方法所花费的纳秒数。以 `_count` 结尾的属性记录特定方法的调用次数。例如， `"collect_count": 2` 表示对两个不同文档调用 `collect()` 的聚合。`reduce` 属性保留供将来使用，并始终返回 `0`。

计时以挂钟纳秒为单位列出，完全不规范化。关于总 `time` 的所有注意事项均适用于此处。分解的目的是让你了解 A）Elasticsearch 中的哪些机制实际上在消耗时间，以及 B）不同组件之间时间差异的大小。与总时间一样，细分也包括所有子时间。

#### 分析获取

提取的文档的所有分片在配置文件中都有一个 `fetch` 部分。让我们执行一个小搜索，并查看提取分析：

```bash
GET /my-index-000001/_search?filter_path=profile.shards.fetch
{
  "profile": true,
  "query": {
    "term": {
      "user.id": {
        "value": "elkbee"
      }
    }
  }
}
```

以下是提取的分析：

```bash
{
  "profile": {
    "shards": [
      {
        "fetch": {
          "type": "fetch",
          "description": "",
          "time_in_nanos": 660555,
          "breakdown": {
            "next_reader": 7292,
            "next_reader_count": 1,
            "load_stored_fields": 299325,
            "load_stored_fields_count": 5
          },
          "debug": {
            "stored_fields": ["_id", "_routing", "_source"]
          },
          "children": [
            {
              "type": "FetchSourcePhase",
              "description": "",
              "time_in_nanos": 20443,
              "breakdown": {
                "next_reader": 745,
                "next_reader_count": 1,
                "process": 19698,
                "process_count": 5
              },
              "debug": {
                "fast_path": 4
              }
            }
          ]
        }
      }
    ]
  }
}
```

由于这是关于 Elasticsearch 执行获取方式的调试信息，因此它可以在不同的请求和版本之间进行更改。即使是补丁版本也可能会更改此处的输出。这种不一致性使得它对调试非常有用。

无论如何 `time_in_nanos` 测量提取阶段的总时间。`breakdown` 计数和我们在 `next_reader` 中的每段准备时间，以及在 `load_stored_fields` 字段中加载存储字段所花费的时间。Debug 包含各种非计时信息，特别是 `stored_fields` 列出了提取所必须加载的存储字段。如果是空列表，则提取将完全跳过加载存储字段。

`children` 部分列出了执行实际提取工作的子阶段，`breakdown` 中包含了 `next_reader` 中每段准备和每文档提取 `process` 的计数和计时。

::: tip 提示
我们努力加载前期提取所需的所有存储字段。这往往会使 `_source` 阶段每次命中几微秒。在这种情况下，`_source` 阶段的真实成本隐藏在细分的 `load_stored_fields` 组件中。通过设置 `"_source": false, "stored_fields": ["_none_"]` ，可以完全跳过加载存储字段。
:::

#### 分析注意事项

与任何探查器一样，分析 API 为搜索执行带来了不可忽视的开销。插装低级方法调用（如 `collect`、`advance` 和 `next_doc`）的行为可能相当昂贵，因为这些方法是在紧密循环中调用的。因此，默认情况下，不应在生产设置中启用分析，也不应与未分析的查询时间进行比较。分析只是一种诊断工具。

还有一些情况下，特殊的 Lucene 优化被禁用，因为它们不适合评测。这可能会导致某些查询报告的相对时间比未分析的查询报告的相对时间要长，但与分析的查询中的其他组件相比，通常不会产生太大的影响。

#### 限制

- 分析当前无法测量网络开销。
- 分析也不考虑在队列中花费的时间、在协调节点上合并分片响应或其他工作，例如构建全局序号（用于加快搜索的内部数据结构）。
- 分析统计信息当前不可用于建议、突出显示、`dfs_query_then_fetch`。
- 聚合的收缩（reduce）阶段的分析目前不可用。
- 探查器正在检测可以在不同版本之间更改的内部构件。产生的json应该被认为是最不稳定的，尤其是在 `debug` 部分。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-profile.html)
