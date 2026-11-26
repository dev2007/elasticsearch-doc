# 检索内部命中（Retrieve inner hits）

`parent-join` 和 `nested` 特性允许返回在不同作用域中发生匹配的文档：

- 在 parent/child 场景中：
  - 可以根据子文档中的匹配返回父文档；
  - 也可以根据父文档中的匹配返回子文档。
- 在 nested 场景中：
  - 可以根据嵌套内部对象中的匹配返回文档。

在这两种场景中，导致文档被返回的“不同作用域中的实际匹配项”默认是隐藏的。很多情况下，了解是哪些嵌套对象、子文档或父文档导致结果返回非常有用。

`inner_hits` 特性可以解决这个问题：它会在每个 search hit 中返回额外的 inner hits，用于说明哪些内部对象或父/子文档导致了该搜索命中。

`inner_hits` 可以定义在以下 query / filter 上：

- `nested`
- `has_child`
- `has_parent`

结构如下：

```json
"<query>": {
  "inner_hits": {
    <inner_hits_options>
  }
}
```

如果 `inner_hits` 定义在支持它的 query 上，则每个 search hit 会包含一个 `inner_hits` JSON 对象，结构如下：

```json
"hits": [
  {
    "_index": ...,
    "_type": ...,
    "_id": ...,
    "inner_hits": {
      "<inner_hits_name>": {
        "hits": {
          "total": ...,
          "hits": [
            {
              "_id": ...,
              ...
            },
            ...
          ]
        }
      }
    },
    ...
  },
  ...
]
```

## inner_hits 选项

| 选项 | 说明 |
|---|---|
| `from` | 每个 inner_hits 中，从第一个要获取的 hit 开始的偏移量。 |
| `size` | 每个 inner_hits 返回的最大 hit 数。默认返回前三个匹配 hit。 |
| `sort` | 每个 inner_hits 中 inner hits 的排序方式。默认按 `_score` 排序。 |
| `name` | 该 inner hit 定义在响应中的名称。当单个搜索请求定义多个 inner hits 时很有用。默认值取决于定义它的 query：对于 `has_child` query/filter，默认是 child type；对于 `has_parent` query/filter，默认是 parent type；对于 `nested` query/filter，默认是 nested path。 |

此外，inner hits 还支持以下 per-document features（每文档特性）：

- 高亮（Highlighting）
- Explain
- 搜索字段（Search fields，即 `fields`）
- Source filtering（即 `_source`）
- Script fields
- Doc value fields
- Include versions
- Include Sequence Numbers and Primary Terms

## Nested inner hits

`nested` 的 `inner_hits` 可用于将嵌套内部对象作为 search hit 的 inner hits 返回。

### 创建索引并写入文档

```bash
PUT test
{
  "mappings": {
    "properties": {
      "comments": {
        "type": "nested"
      }
    }
  }
}

PUT test/_doc/1?refresh
{
  "title": "Test title",
  "comments": [
    {
      "author": "kimchy",
      "number": 1
    },
    {
      "author": "nik9000",
      "number": 2
    }
  ]
}
```

### 查询：nested + inner_hits

```bash
POST test/_search
{
  "query": {
    "nested": {
      "path": "comments",
      "query": {
        "match": {
          "comments.number": 2
        }
      },
      "inner_hits": {}
    }
  }
}
```

这里的 `inner_hits: {}` 是定义在 nested query 中的 inner hit 定义。无需定义其他选项。

### 响应示例

```json
{
  ...,
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "test",
        "_id": "1",
        "_score": 1.0,
        "_source": ...,
        "inner_hits": {
          "comments": {
            "hits": {
              "total": {
                "value": 1,
                "relation": "eq"
              },
              "max_score": 1.0,
              "hits": [
                {
                  "_index": "test",
                  "_id": "1",
                  "_nested": {
                    "field": "comments",
                    "offset": 1
                  },
                  "_score": 1.0,
                  "_source": {
                    "author": "nik9000",
                    "number": 2
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}
```

- `inner_hits.comments` 中的 `comments` 是响应中使用的 inner hit 名称，默认来自 nested path。可通过 `name` 选项自定义名称。
- `_nested` 元数据非常重要，因为它标识该 inner hit 来自哪个嵌套内部对象：
  - `field`：嵌套对象数组字段名；
  - `offset`：相对于 `_source` 中该字段位置的偏移量。
- 由于排序和评分，`inner_hits` 中 hit 的实际位置通常与 nested 对象在原始 `_source` 中的位置不同。
- 默认情况下，`inner_hits` 中的 hit 会返回 `_source`。可以通过 `_source` filtering 返回部分 source，或禁用 `_source`。如果在 nested 层级定义了 stored fields，也可以通过 `fields` feature 返回。
- 重要默认行为：inner hits 中返回的 `_source` 相对于 `_nested` 元数据。也就是说，上面的例子只返回匹配的 comment 部分，而不是整个顶层文档的 `_source`。

### Nested inner hits 与 `_source`

嵌套文档没有自己的 `_source` 字段，因为整个文档的 source 存储在根文档的 `_source` 字段中。

为了只返回嵌套文档的 source，Elasticsearch 会解析根文档的 `_source`，然后只提取与匹配 nested 文档相关的部分作为 inner hit 的 source。

这会对搜索请求的执行时间产生影响，尤其是在以下值设置得较高时：

- 外层搜索的 `size`
- inner hits 的 `size`

为了避免 nested inner hits 中相对昂贵的 source 提取，可以禁用 `_source`，仅依赖 doc value fields：

```bash
PUT test
{
  "mappings": {
    "properties": {
      "comments": {
        "type": "nested"
      }
    }
  }
}

PUT test/_doc/1?refresh
{
  "title": "Test title",
  "comments": [
    {
      "author": "kimchy",
      "text": "comment text"
    },
    {
      "author": "nik9000",
      "text": "words words words"
    }
  ]
}

POST test/_search
{
  "query": {
    "nested": {
      "path": "comments",
      "query": {
        "match": {
          "comments.text": "words"
        }
      },
      "inner_hits": {
        "_source": false,
        "docvalue_fields": [
          "comments.text.keyword"
        ]
      }
    }
  }
}
```

## 多层 nested 对象字段与 inner hits

如果 mapping 中有多层 hierarchical nested object fields，可以通过点号路径访问每一层。

例如：`comments` 是 nested 字段，`comments` 中包含 `votes` nested 字段；如果希望 votes 直接与 root hits 一起返回，可以定义 path 为 `comments.votes`。

```bash
PUT test
{
  "mappings": {
    "properties": {
      "comments": {
        "type": "nested",
        "properties": {
          "votes": {
            "type": "nested"
          }
        }
      }
    }
  }
}

PUT test/_doc/1?refresh
{
  "title": "Test title",
  "comments": [
    {
      "author": "kimchy",
      "text": "comment text",
      "votes": []
    },
    {
      "author": "nik9000",
      "text": "words words words",
      "votes": [
        {
          "value": 1,
          "voter": "kimchy"
        },
        {
          "value": -1,
          "voter": "other"
        }
      ]
    }
  ]
}

POST test/_search
{
  "query": {
    "nested": {
      "path": "comments.votes",
      "query": {
        "match": {
          "comments.votes.voter": "kimchy"
        }
      },
      "inner_hits": {}
    }
  }
}
```

响应示例：

```json
{
  ...,
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.6931471,
    "hits": [
      {
        "_index": "test",
        "_id": "1",
        "_score": 0.6931471,
        "_source": ...,
        "inner_hits": {
          "comments.votes": {
            "hits": {
              "total": {
                "value": 1,
                "relation": "eq"
              },
              "max_score": 0.6931471,
              "hits": [
                {
                  "_index": "test",
                  "_id": "1",
                  "_nested": {
                    "field": "comments",
                    "offset": 1,
                    "_nested": {
                      "field": "votes",
                      "offset": 0
                    }
                  },
                  "_score": 0.6931471,
                  "_source": {
                    "value": 1,
                    "voter": "kimchy"
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}
```

这种间接引用只在 nested inner hits 中支持。

## Parent/child inner hits

parent/child 的 `inner_hits` 可用于包含父文档或子文档，支持 `has_child` 和 `has_parent`。

```bash
PUT test
{
  "mappings": {
    "properties": {
      "my_join_field": {
        "type": "join",
        "relations": {
          "my_parent": "my_child"
        }
      }
    }
  }
}

PUT test/_doc/1?refresh
{
  "number": 1,
  "my_join_field": "my_parent"
}
```

注意子文档使用父文档 id `1` 作为 routing：

```bash
PUT test/_doc/2?routing=1&refresh
{
  "number": 1,
  "my_join_field": {
    "name": "my_child",
    "parent": "1"
  }
}

POST test/_search
{
  "query": {
    "has_child": {
      "type": "my_child",
      "query": {
        "match": {
          "number": 1
        }
      },
      "inner_hits": {}
    }
  }
}
```

响应示例：

```json
{
  ...,
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "test",
        "_id": "1",
        "_score": 1.0,
        "_source": {
          "number": 1,
          "my_join_field": "my_parent"
        },
        "inner_hits": {
          "my_child": {
            "hits": {
              "total": {
                "value": 1,
                "relation": "eq"
              },
              "max_score": 1.0,
              "hits": [
                {
                  "_index": "test",
                  "_id": "2",
                  "_score": 1.0,
                  "_routing": "1",
                  "_source": {
                    "number": 1,
                    "my_join_field": {
                      "name": "my_child",
                      "parent": "1"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}
```

- 响应中的 `inner_hits.my_child` 是默认的 inner hits 名称，对应 child type。
- 子文档 hit 中包含 `_routing: "1"`，即父文档 id 作为 routing。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/inner-hits.html)
