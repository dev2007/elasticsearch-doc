# 检索选定字段（Retrieve selected fields from a search）

默认情况下，搜索响应中的每个 hit 都包含文档的 `_source`，即索引文档时提供的整个 JSON 对象。有两种推荐方法可以从搜索查询中检索选定字段：

- 使用 `fields` 选项提取索引映射中存在的字段值。
- 如果需要访问索引时传入的原始数据，使用 `_source` 选项。

可以同时使用这两种方法，但通常优先使用 `fields` 选项，因为它会同时考虑文档数据和索引映射。某些情况下，你可能需要使用其他数据检索方法。

## `fields` 选项

要在搜索响应中检索特定字段，请使用 `fields` 参数。因为 `fields` 会参考索引映射，所以与直接引用 `_source` 相比有多个优势：

- 以与映射类型匹配的标准化方式返回每个值。
- 接受 multifield 和字段别名。
- 格式化日期和空间数据类型。
- 检索运行字段（runtime field）的值。
- 返回索引时由脚本计算的字段。
- 使用 lookup runtime fields 返回关联索引中的字段。

其他映射选项也会生效，包括 `ignore_above`、`ignore_malformed` 和 `null_value`。

`fields` 选项以 Elasticsearch 索引字段的方式返回值。对于标准字段，这意味着 `fields` 会在 `_source` 中查找值，然后使用映射对其进行解析和格式化。在 `_source` 中找不到的所选字段会被跳过。

### 检索特定字段

以下搜索请求使用 `fields` 参数检索 `user.id` 字段、所有以 `http.response.` 开头的字段以及 `@timestamp` 字段的值。

使用对象表示法时，可以传入 `format` 参数来自定义返回日期或地理空间值的格式：

```bash
POST my-index-000001/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "fields": [
    "user.id",
    "http.response.*",
    {
      "field": "@timestamp",
      "format": "epoch_millis"
    }
  ],
  "_source": false
}
```

完整字段名和通配符模式都可接受。

使用 `format` 参数可对字段值应用自定义格式。

默认情况下，当请求的 `fields` 选项使用如 `*` 这样的通配符模式时，不会返回 `_id` 或 `_index` 等文档元数据字段。但当使用字段名显式请求时，可以检索 `_id`、`_routing`、`_ignored`、`_index` 和 `_version` 元数据字段。

### 响应始终返回数组

`fields` 响应对每个字段始终返回值的数组，即使 `_source` 中只有一个值。这是因为 Elasticsearch 没有专门的数组类型，任何字段都可能包含多个值。`fields` 参数也不保证按特定顺序返回数组值。

响应在每个 hit 的 `fields` 部分以扁平列表形式包含值。由于 `fields` 参数不会获取整个对象，因此只返回叶子字段：

```json
{
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "0",
        "_score": 1.0,
        "fields": {
          "user.id": [
            "kimchy"
          ],
          "@timestamp": [
            "4098435132000"
          ],
          "http.response.bytes": [
            1070000
          ],
          "http.response.status_code": [
            200
          ]
        }
      }
    ]
  }
}
```

### 检索 nested 字段

`nested` 字段的 `fields` 响应与常规 object 字段略有不同。常规 `object` 字段中的叶子值以扁平列表返回，而 `nested` 字段中的值会被分组，以保持原始 nested 数组中每个对象的独立性。对于 nested 字段数组中的每个条目，值仍以扁平列表返回，除非父 nested 对象内还有其他 nested 字段，此时会对更深层的 nested 字段重复相同处理。

给定以下 mapping，其中 `user` 是 nested 字段，在索引文档后检索 `user` 字段下的所有字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "group": {
        "type": "keyword"
      },
      "user": {
        "type": "nested",
        "properties": {
          "first": {
            "type": "keyword"
          },
          "last": {
            "type": "keyword"
          }
        }
      }
    }
  }
}

PUT my-index-000001/_doc/1?refresh=true
{
  "group": "fans",
  "user": [
    {
      "first": "John",
      "last": "Smith"
    },
    {
      "first": "Alice",
      "last": "White"
    }
  ]
}

POST my-index-000001/_search
{
  "fields": [
    "*"
  ],
  "_source": false
}
```

响应会将 `first` 和 `last` 名字分组返回，而不是以扁平列表返回：

```json
{
  "took": 2,
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
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": 1.0,
        "fields": {
          "group": [
            "fans"
          ],
          "user": [
            {
              "first": [
                "John"
              ],
              "last": [
                "Smith"
              ]
            },
            {
              "first": [
                "Alice"
              ],
              "last": [
                "White"
              ]
            }
          ]
        }
      }
    ]
  }
}
```

无论使用什么模式检索，nested 字段都会按其 nested 路径分组。例如，如果只查询上例中的 `user.first` 字段：

```bash
POST my-index-000001/_search
{
  "fields": [
    "user.first"
  ],
  "_source": false
}
```

响应只返回用户的名字，但仍保持 nested `user` 数组的结构：

```json
{
  "took": 2,
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
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": 1.0,
        "fields": {
          "user": [
            {
              "first": [
                "John"
              ]
            },
            {
              "first": [
                "Alice"
              ]
            }
          ]
        }
      }
    ]
  }
}
```

但是，当 `fields` 模式直接指向 nested `user` 字段时，不会返回任何值，因为该模式不匹配任何叶子字段。

### 检索未映射字段

默认情况下，`fields` 参数只返回已映射字段的值。但 Elasticsearch 允许在 `_source` 中存储未映射的字段，例如将动态字段映射设为 `false`，或使用 `enabled: false` 的 object 字段。这些选项禁用了对对象内容的解析和索引。

要从 `_source` 中检索对象里的未映射字段，请在 `fields` 部分使用 `include_unmapped` 选项：

```bash
PUT my-index-000001
{
  "mappings": {
    "enabled": false
  }
}

PUT my-index-000001/_doc/1?refresh=true
{
  "user_id": "kimchy",
  "session_data": {
    "object": {
      "some_field": "some_value"
    }
  }
}

POST my-index-000001/_search
{
  "fields": [
    "user_id",
    {
      "field": "session_data.object.*",
      "include_unmapped": true
    }
  ],
  "_source": false
}
```

- `PUT my-index-000001` 禁用所有映射。
- `include_unmapped: true` 包含与该字段模式匹配的未映射字段。

响应将在 `session_data.object.*` 路径下包含字段结果，即使这些字段未映射。`user_id` 字段也是未映射的，但不会包含在响应中，因为该字段模式没有设置 `include_unmapped: true`：

```json
{
  "took": 2,
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
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": 1.0,
        "fields": {
          "session_data.object.some_field": [
            "some_value"
          ]
        }
      }
    ]
  }
}
```

### 被忽略的字段值

响应的 `fields` 部分只返回索引时有效的值。如果搜索请求查询的字段曾因格式错误或值过大而忽略某些值，这些值会在单独的 `ignored_field_values` 部分返回。

以下示例中，索引的文档有一个被忽略、未加入索引的值，因此在搜索结果中单独显示：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "my-small": {
        "type": "keyword",
        "ignore_above": 2
      },
      "my-large": {
        "type": "keyword"
      }
    }
  }
}

PUT my-index-000001/_doc/1?refresh=true
{
  "my-small": [
    "ok",
    "bad"
  ],
  "my-large": "ok content"
}

POST my-index-000001/_search
{
  "fields": [
    "my-*"
  ],
  "_source": false
}
```

响应将在 `ignored_field_values` 路径下包含被忽略的字段值。这些值从文档原始 JSON source 检索得到，是原始值，不会像 `fields` 部分中成功索引的字段那样被格式化或处理：

```json
{
  "took": 2,
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
    "max_score": 1.0,
    "hits": [
      {
        "_index": "my-index-000001",
        "_id": "1",
        "_score": 1.0,
        "_ignored": [
          "my-small"
        ],
        "fields": {
          "my-large": [
            "ok content"
          ],
          "my-small": [
            "ok"
          ]
        },
        "ignored_field_values": {
          "my-small": [
            "bad"
          ]
        }
      }
    ]
  }
}
```

## `_source` 选项

可以使用 `_source` 参数选择返回 source 的哪些字段，这称为 source filtering（source 过滤）。

以下搜索 API 请求将 `_source` 请求体参数设为 `false`，响应中不包含文档 source：

```bash
GET /_search
{
  "_source": false,
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

要只返回 source 字段的子集，可在 `_source` 参数中指定通配符（`*`）模式。以下请求只返回 `obj` 字段及其属性的 source：

```bash
GET /_search
{
  "_source": "obj.*",
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

也可以在 `_source` 字段中指定通配符模式数组。以下请求只返回 `obj1` 和 `obj2` 字段及其属性的 source：

```bash
GET /_search
{
  "_source": [
    "obj1.*",
    "obj2.*"
  ],
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  }
}
```

为了更精细地控制，可以在 `_source` 参数中指定一个包含 `includes` 和 `excludes` 模式数组的对象。

如果指定了 `includes` 属性，只返回与其某个模式匹配的 source 字段。可以使用 `excludes` 属性从这个子集中排除字段。

如果未指定 `includes` 属性，则返回整个文档 source，但排除任何匹配 `excludes` 中模式的字段。

以下请求只返回 `obj1` 和 `obj2` 字段及其属性的 source，并排除任何子级的 `description` 字段：

```bash
GET /_search
{
  "_source": {
    "includes": [
      "obj1.*",
      "obj2.*"
    ],
    "excludes": [
      "*.description"
    ]
  },
  "query": {
    "term": {
      "user.id": "kimchy"
    }
  }
}
```

## 其他数据检索方法

通常优先使用 `fields` 选项。以下选项通常不是必需的，除非确实需要强制加载 stored 字段或 `docvalue_fields`。

文档的 `_source` 在 Lucene 中作为单个字段存储。这意味着即使只请求其中一部分，也必须加载并解析整个 `_source` 对象。为避免这一限制，可以尝试以下加载字段的选项：

- 使用 `docvalue_fields` 参数获取所选字段的值。当返回数量较少且支持 doc values 的字段（如 keyword 和日期）时，这是一个不错的选择。
- 使用 `stored_fields` 参数获取特定 stored 字段（使用 `store` 映射选项的字段）的值。

Elasticsearch 总是尝试从 `_source` 加载值。这与 source filtering 有相同的影响：为检索一个字段，需要加载并解析整个 `_source`。

### Doc value fields

可以使用 `docvalue_fields` 参数在搜索响应中返回一个或多个字段的 doc values。

Doc values 存储与 `_source` 相同的值，但采用针对排序和聚合优化的磁盘列式结构。由于每个字段单独存储，Elasticsearch 只读取请求的字段值，可以避免加载整个文档 `_source`。

支持的字段默认存储 doc values。但 `text` 和 `text_annotated` 字段不支持 doc values。

以下请求使用 `docvalue_fields` 参数检索 `user.id` 字段、所有以 `http.response.` 开头的字段以及 `@timestamp` 字段的 doc values：

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "user.id": "kimchy"
    }
  },
  "docvalue_fields": [
    "user.id",
    "http.response.*",
    {
      "field": "date",
      "format": "epoch_millis"
    }
  ]
}
```

完整字段名和通配符模式都可接受。

使用对象表示法时，可以传入 `format` 参数，为字段的 doc values 应用自定义格式。日期字段支持日期 `format`，数值字段支持 DecimalFormat 模式。其他字段数据类型不支持 `format` 参数。

不能使用 `docvalue_fields` 参数检索 nested 对象的 doc values。如果指定 nested 对象，搜索会为该字段返回空数组（`[]`）。要访问 nested 字段，请使用 `inner_hits` 参数的 `docvalue_fields` 属性。

### Stored fields

也可以使用 `store` 映射选项存储单个字段的值，并使用 `stored_fields` 参数在搜索响应中包含这些存储值。

`stored_fields` 参数适用于映射中显式标记为 stored 的字段，默认关闭且通常不推荐使用。建议使用 source filtering 选择要返回的原始 source 文档子集。

该参数允许为搜索命中表示的每个文档选择性地加载特定 stored 字段：

```bash
GET /_search
{
  "stored_fields": [
    "user",
    "postDate"
  ],
  "query": {
    "term": {
      "user": "kimchy"
    }
  }
}
```

`*` 可用于加载文档中的所有 stored 字段。

空数组会导致每个 hit 只返回 `_id` 和 `_type`：

```bash
GET /_search
{
  "stored_fields": [],
  "query": {
    "term": {
      "user": "kimchy"
    }
  }
}
```

如果请求的字段没有被存储（`store` 映射设为 `false`），它们会被忽略。

从文档本身获取的 stored 字段值始终以数组形式返回；相反，`_routing` 等元数据字段永远不会以数组形式返回。

`stored_fields` 选项也只能返回叶子字段。如果指定了 object 字段，它会被忽略。

`stored_fields` 本身不能用于加载 nested 对象中的字段——如果字段路径中包含 nested 对象，该 stored 字段不会返回任何数据。要访问 nested 字段，必须在 `inner_hits` 块内使用 `stored_fields`。

要完全禁用 stored 字段（和元数据字段），使用 `_none_`：

```bash
GET /_search
{
  "stored_fields": "_none_",
  "query": {
    "term": {
      "user": "kimchy"
    }
  }
}
```

如果使用 `_none_`，则不能启用 `_source` 和 `version` 参数。

### Script fields

可以使用 `script_fields` 参数为每个 hit 检索脚本求值结果（基于不同字段）。例如：

```bash
GET /_search
{
  "query": {
    "match_all": {}
  },
  "script_fields": {
    "test1": {
      "script": {
        "lang": "painless",
        "source": "doc['price'].value * 2"
      }
    },
    "test2": {
      "script": {
        "lang": "painless",
        "source": "doc['price'].value * params.factor",
        "params": {
          "factor": 2.0
        }
      }
    }
  }
}
```

Script fields 可以处理未存储的字段（上例中的 `price`），并允许返回自定义值（脚本的求值结果）。

Script fields 也可以访问实际的 `_source` 文档，并通过 `params['_source']` 提取特定元素返回：

```bash
GET /_search
{
  "query": {
    "match_all": {}
  },
  "script_fields": {
    "test1": {
      "script": "params['_source']['message']"
    }
  }
}
```

注意这里的 `_source` 关键字用于导航类似 JSON 的模型。

理解 `doc['my_field'].value` 与 `params['_source']['my_field']` 的区别很重要：

- 前者使用 `doc` 关键字，会使该字段的词项被加载到内存（并缓存），执行更快但内存消耗更多。
- `doc[...]` 表示法只允许简单值字段（不能返回 JSON 对象），且只对未分析或基于单个词项的字段有意义。
- 尽管如此，只要可能，仍推荐使用 `doc` 访问文档值，因为每次使用 `_source` 都必须加载和解析它。使用 `_source` 非常慢。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/search-fields.html)
