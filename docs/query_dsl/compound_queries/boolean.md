# Boolean 查询（Boolean query）

`bool` query 是一种通过其他查询的布尔组合来匹配文档的查询，映射到 Lucene 的 `BooleanQuery`。

`bool` query 由一个或多个 boolean clauses 构成，每个 clause 都有一个 typed occurrence（出现类型）。

## must / should / filter / must_not 参数

| Occur | 说明 |
|---|---|
| `must` | 查询子句必须出现在匹配文档中，并且会参与评分。`must` 下的每个查询相当于逻辑 **AND**，只返回匹配所有指定查询的文档。 |
| `should` | 查询子句应该出现在匹配文档中。`should` 下的每个查询相当于逻辑 **OR**，返回匹配任意指定查询的文档。 |
| `filter` | 查询子句必须出现在匹配文档中，但评分会被忽略。`filter` clauses 在过滤上下文中执行，会被考虑用于缓存；每个查询相当于逻辑 **AND**，只返回匹配所有指定查询的文档。 |
| `must_not` | 查询子句不得出现在匹配文档中。`must_not` clauses 在过滤上下文中执行，评分被忽略并会被考虑用于缓存；由于评分被忽略，分数以 `0` 返回。每个查询相当于逻辑 **NOT**，只返回不匹配任何指定查询的文档。 |

补充说明：

- `must` 和 `should` clauses 分别作为逻辑 AND、OR 操作符，并且会影响评分；其结果不会被缓存。
- `filter` 和 `must_not` clauses 用于包含或排除结果，不影响评分，除非它们被用在 `constant_score` query 中。
- `bool` query 使用 “more-matches-is-better” 方式：每个匹配的 `must` 或 `should` clause 的分数会相加，形成最终的 `_score`。

## 综合示例

```bash
POST _search
{
  "query": {
    "bool": {
      "must": {
        "term": {
          "user.id": "kimchy"
        }
      },
      "filter": {
        "term": {
          "tags": "production"
        }
      },
      "must_not": {
        "range": {
          "age": {
            "gte": 10,
            "lte": 20
          }
        }
      },
      "should": [
        {
          "term": {
            "tags": "env1"
          }
        },
        {
          "term": {
            "tags": "deployed"
          }
        }
      ],
      "minimum_should_match": 1,
      "boost": 1.0
    }
  }
}
```

## 使用 minimum_should_match

可以使用 `minimum_should_match` 参数指定返回文档必须匹配的 `should` clauses 数量或百分比。

- 如果 `bool` query 至少包含一个 `should` clause，且没有 `must` 或 `filter` clauses，则默认值为 `1`。
- 否则，默认值为 `0`。

其他有效值参见 `minimum_should_match` 参数文档。

## 嵌套 bool 查询

可以在其他 `bool` queries 中嵌套 `bool` queries，以创建复杂逻辑结构：

```bash
GET /_search
{
  "query": {
    "bool": {
      "must": [
        {
          "bool": {
            "should": [
              {
                "match": {
                  "user.id": "kimchy"
                }
              },
              {
                "match": {
                  "user.id": "banon"
                }
              }
            ]
          }
        },
        {
          "match": {
            "tags": "production"
          }
        }
      ],
      "should": [
        {
          "bool": {
            "must": [
              {
                "match": {
                  "status": "active"
                }
              },
              {
                "match": {
                  "title": "quick brown fox"
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

- 只有匹配 `must` 部分所有条件的文档才会返回。文档必须在 `user.id` 字段匹配 `"kimchy"` 或 `"banon"`，并在 `tags` 字段匹配 `"production"`。语义等价于：

  ```text
  (user.id="kimchy" OR user.id="banon") AND tags="production"
  ```

- `should` clauses 中的匹配是可选的，只会提升已满足必需 `must` 条件文档的相关性评分，不会向结果集中添加新文档：

  ```text
  (status="active" AND title="quick brown fox")
  ```

- 可以使用 `minimum_should_match` 参数要求匹配 `should` clauses。
- 虽然嵌套 `bool` queries 很强大，但也可能导致查询复杂且缓慢。为获得最佳性能，应尽量保持查询扁平。

## bool.filter 的评分

`filter` 元素下指定的查询对评分没有影响，分数返回为 `0`。

以下三个查询都会返回所有 `status` 字段包含 term `active` 的文档。

### 只有 filter，所有文档分数为 0

```bash
GET _search
{
  "query": {
    "bool": {
      "filter": {
        "term": {
          "status": "active"
        }
      }
    }
  }
}
```

### bool query 中使用 match_all，所有文档分数为 1.0

```bash
GET _search
{
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "term": {
          "status": "active"
        }
      }
    }
  }
}
```

### constant_score query

`constant_score` query 的行为与上一示例完全相同，为所有被 filter 匹配的文档分配 `1.0` 分：

```bash
GET _search
{
  "query": {
    "constant_score": {
      "filter": {
        "term": {
          "status": "active"
        }
      }
    }
  }
}
```

## 命名查询（Named queries）

每个 query 都可以在其顶层定义中接受 `_name`。可以使用命名查询跟踪哪些 queries 匹配了返回的文档。如果使用命名查询，响应中每个 hit 会包含 `matched_queries` 属性。

:::::warning 警告
在同一个请求中提供重复的 `_name` 值会导致未定义行为，名称重复的 queries 可能互相覆盖。在单个请求中，query names 被假定为唯一。
:::::

```bash
GET /_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name.first": {
              "query": "shay",
              "_name": "first"
            }
          }
        },
        {
          "match": {
            "name.last": {
              "query": "banon",
              "_name": "last"
            }
          }
        }
      ],
      "filter": {
        "terms": {
          "name.last": [
            "banon",
            "kimchy"
          ],
          "_name": "test"
        }
      }
    }
  }
}
```

### include_named_queries_score

请求参数 `include_named_queries_score` 控制是否返回与匹配 queries 关联的分数。设置后，响应包含一个 `matched_queries` map：key 为匹配的 query 名称，value 为该 query 关联的分数。

注意：该分数可能没有贡献到文档的最终评分。例如，命名查询出现在 `filter` 或 `must_not` 上下文中，或出现在会忽略/修改评分的子句中（如 `constant_score`、`function_score`），就可能出现这种情况。

```bash
GET /_search?include_named_queries_score
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "name.first": {
              "query": "shay",
              "_name": "first"
            }
          }
        },
        {
          "match": {
            "name.last": {
              "query": "banon",
              "_name": "last"
            }
          }
        }
      ],
      "filter": {
        "terms": {
          "name.last": [
            "banon",
            "kimchy"
          ],
          "_name": "test"
        }
      }
    }
  }
}
```

该功能会对搜索响应中的每个 hit 重新运行每个命名查询。通常只会增加少量开销，但如果在大量 hit 上使用计算成本高的命名查询，可能产生显著开销。例如，命名查询与许多 buckets 上的 `top_hits` 聚合结合使用时，可能导致响应时间变长。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-bool-query.html)
