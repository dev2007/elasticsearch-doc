# join 字段类型

`join` 数据类型是一种特殊字段，用于在同一索引的文档之间创建父/子关系。`relations` 部分定义文档内一组可能的关系，每个关系是一个父名称和一个子名称。

我们不建议使用多级关系来复制关系模型。每一级关系都会在查询时增加内存和计算方面的开销。为了获得更好的搜索性能，应该对数据进行反规范化（denormalize）。

父/子关系可以按如下方式定义：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_id": {
        "type": "keyword"
      },
      "my_join_field": {
        "type": "join",
        "relations": {
          "question": "answer"
        }
      }
    }
  }
}
```

1. 字段的名称。
2. 定义一个单一关系，`question` 是 `answer` 的父文档。

要索引带有 join 的文档，必须在 `_source` 中提供关系名称以及文档的可选父文档。例如，以下示例在 `question` 上下文中创建两个父文档：

```bash
# 该文档是一个 question 文档
PUT my-index-000001/_doc/1?refresh
{
  "my_id": "1",
  "text": "This is a question",
  "my_join_field": {
    "name": "question"
  }
}

PUT my-index-000001/_doc/2?refresh
{
  "my_id": "2",
  "text": "This is another question",
  "my_join_field": {
    "name": "question"
  }
}
```

索引父文档时，你可以选择只指定关系名称作为简写，而不必使用常规的对象表示法：

```bash
# 父文档的更简写法，直接使用关系名称
PUT my-index-000001/_doc/1?refresh
{
  "my_id": "1",
  "text": "This is a question",
  "my_join_field": "question"
}

PUT my-index-000001/_doc/2?refresh
{
  "my_id": "2",
  "text": "This is another question",
  "my_join_field": "question"
}
```

索引子文档时，必须在 `_source` 中添加关系名称以及文档的父文档 id。

父文档的谱系必须索引在同一个分片中，因此你必须始终使用其更高层级父文档的 id 来路由子文档。

例如，以下示例展示如何索引两个子文档：

```bash
# 路由值是必需的，因为父文档和子文档必须索引在同一个分片上
# answer 是该文档的 join 名称
# 该子文档的父文档 id
PUT my-index-000001/_doc/3?routing=1&refresh
{
  "my_id": "3",
  "text": "This is an answer",
  "my_join_field": {
    "name": "answer",
    "parent": "1"
  }
}

PUT my-index-000001/_doc/4?routing=1&refresh
{
  "my_id": "4",
  "text": "This is another answer",
  "my_join_field": {
    "name": "answer",
    "parent": "1"
  }
}
```

## 父/子 join 与性能

join 字段不应像关系型数据库中的 join 那样使用。在 Elasticsearch 中，良好性能的关键是将数据反规范化到文档中。每个 join 字段、`has_child` 或 `has_parent` 查询都会给你的查询性能带来显著的损耗。它还可能触发[全局序号](/mapping/mapping_parameters/eager_global_ordinals)的构建。

join 字段唯一有意义的使用场景是：你的数据包含一对多关系，且其中一个实体的数量明显多于另一个实体。例如，有一个产品及产品报价的用例。如果报价数量明显多于产品数量，那么将产品建模为父文档、报价建模为子文档是有意义的。

## 父/子 join 的限制

- 每个索引只允许一个 `join` 字段映射。
- 父文档和子文档必须索引在同一个分片上。这意味着在[获取](/rest_apis/document_apis/get)、[删除](/rest_apis/document_apis/delete)或[更新](/rest_apis/document_apis/update)子文档时，需要提供相同的 `routing` 值。
- 一个元素可以有多个子文档，但只能有一个父文档。
- 可以向现有的 `join` 字段添加新关系。
- 也可以向现有元素添加子文档，但前提是该元素已经是父文档。

## 使用父/子 join 进行搜索

父/子 join 会创建一个字段来索引文档中的关系名称（`my_parent`、`my_child` 等）。

它还会为每个父/子关系创建一个字段。该字段的名称是 `join` 字段的名称，后跟 `#` 和关系中的父名称。例如，对于 `my_parent` → [`my_child`, `another_child`] 关系，`join` 字段会创建一个名为 `my_join_field#my_parent` 的额外字段。

如果文档是子文档（`my_child` 或 `another_child`），此字段包含该文档链接的父文档 `_id`；如果文档是父文档（`my_parent`），此字段包含文档自身的 `_id`。

搜索包含 `join` 字段的索引时，这两个字段始终会返回在搜索响应中：

```bash
GET my-index-000001/_search
{
  "query": {
    "match_all": {}
  },
  "sort": ["my_id"]
}
```

将返回：

```json
{
  ...,
  "hits": {
    "total": {
      "value": 4,
      "relation": "eq"
    },
    "max_score": null,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": null,
        "_source": {
          "my_id": "1",
          "text": "This is a question",
          "my_join_field": "question"
        },
        "sort": ["1"]
      },
      {
        "_index": "my-index-000001",
        "_id": "2",
        "_score": null,
        "_source": {
          "my_id": "2",
          "text": "This is another question",
          "my_join_field": "question"
        },
        "sort": ["2"]
      },
      {
        "_index": "my-index-000001",
        "_id": "3",
        "_score": null,
        "_routing": "1",
        "_source": {
          "my_id": "3",
          "text": "This is an answer",
          "my_join_field": {
            "name": "answer",
            "parent": "1"
          }
        },
        "sort": ["3"]
      },
      {
        "_index": "my-index-000001",
        "_id": "4",
        "_score": null,
        "_routing": "1",
        "_source": {
          "my_id": "4",
          "text": "This is another answer",
          "my_join_field": {
            "name": "answer",
            "parent": "1"
          }
        },
        "sort": ["4"]
      }
    ]
  }
}
```

1. 此文档属于 `question` join。
2. 此文档属于 `question` join。
3. 此文档属于 `answer` join。
4. 子文档链接的父文档 id。

## 父/子 join 查询和聚合

更多信息参阅 [`has_child`](/query_dsl/joining_queries/has_child) 和 [`has_parent`](/query_dsl/joining_queries/has_parent) 查询、[`children`](/aggregations/bucket/children_aggregation) 聚合以及[内部命中](/search/search_your_data/inner_hits#父子文档的内部命中)。

`join` 字段的值可以在聚合和脚本中访问，并且可以使用 [`parent_id` 查询](/query_dsl/joining_queries/parent_id)进行查询：

```bash
# 查询 parent id 字段（另参阅 has_parent 查询和 has_child 查询）
# 在 parent id 字段上进行聚合（另参阅 children 聚合）
# 在脚本中访问 parent id 字段
GET my-index-000001/_search
{
  "query": {
    "parent_id": {
      "type": "answer",
      "id": "1"
    }
  },
  "aggs": {
    "parents": {
      "terms": {
        "field": "my_join_field#question",
        "size": 10
      }
    }
  },
  "runtime_mappings": {
    "parent": {
      "type": "long",
      "script": """
        emit(Integer.parseInt(doc['my_join_field#question'].value))
      """
    }
  },
  "fields": [
    {"field": "parent"}
  ]
}
```

## 全局序号

`join` 字段使用[全局序号](/mapping/mapping_parameters/eager_global_ordinals)来加速 join。分片发生任何更改后，都需要重建全局序号。分片中存储的父 id 值越多，重建 `join` 字段的全局序号所需的时间就越长。

默认情况下，全局序号会立即构建：如果索引发生了变化，`join` 字段的全局序号将作为刷新的一部分进行重建。这会给刷新增加大量时间。但在大多数情况下，这是正确的权衡，否则全局序号会在第一个父/子 join 查询或聚合使用时才重建。这会给用户带来显著的延迟尖峰，而且通常更糟，因为在大量写入发生时，单个刷新间隔内可能会尝试重建多个 `join` 字段的全局序号。

当 `join` 字段使用不频繁且写入频繁时，禁用立即加载可能更合理：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_join_field": {
        "type": "join",
        "relations": {
          "question": "answer"
        },
        "eager_global_ordinals": false
      }
    }
  }
}
```

可以按父关系检查全局序号使用的堆内存量，如下所示：

```bash
# 每个索引
GET _stats/fielddata?human&fields=my_join_field#question

# 每个节点的每索引
GET _nodes/stats/indices/fielddata?human&fields=my_join_field#question
```

## 每个父文档有多个子文档

也可以为单个父文档定义多个子文档：

```bash
# question 是 answer 和 comment 的父文档
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_join_field": {
        "type": "join",
        "relations": {
          "question": ["answer", "comment"]
        }
      }
    }
  }
}
```

## 多级父/子 join

我们不建议使用多级关系来复制关系模型。每一级关系都会在查询时增加内存和计算方面的开销。为了获得更好的搜索性能，应该对数据进行反规范化。

多级父/子关系：

```bash
# question 是 answer 和 comment 的父文档
# answer 是 vote 的父文档
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my_join_field": {
        "type": "join",
        "relations": {
          "question": ["answer", "comment"],
          "answer": "vote"
        }
      }
    }
  }
}
```

上面的映射表示以下树：

```
   question
    /    \
   /      \
comment  answer
           |
           |
          vote
```

索引孙辈文档需要一个等于祖父文档（谱系中更高层级的父文档）的 `routing` 值：

```bash
# 该子文档必须与其祖父文档和父文档位于同一个分片上
# 该文档的父文档 id（必须指向一个 answer 文档）
PUT my-index-000001/_doc/3?routing=1&refresh
{
  "text": "This is a vote",
  "my_join_field": {
    "name": "vote",
    "parent": "2"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/parent-join.html)
