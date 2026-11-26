# Function score 查询（Function score query）

`function_score` 允许你修改由查询检索到的文档的分值。这在以下场景中很有用：某个评分函数计算成本较高，而只在经过过滤的文档集合上计算分值已经足够。

使用 `function_score` 时，用户必须定义：

1. 一个查询 `query`
2. 一个或多个函数 `functions`，用于为查询返回的每个文档计算新的分值

## 示例

使用一个函数：

```bash
GET /_search
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "boost": "5",
      "random_score": {},
      "boost_mode": "multiply"
    }
  }
}
```

也可以组合多个函数。此时可以选择仅在文档匹配给定过滤查询时应用某个函数：

```bash
GET /_search
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "boost": "5",
      "functions": [
        {
          "filter": {
            "match": {
              "test": "bar"
            }
          },
          "random_score": {},
          "weight": 23
        },
        {
          "filter": {
            "match": {
              "test": "cat"
            }
          },
          "weight": 42
        }
      ],
      "max_boost": 42,
      "score_mode": "max",
      "boost_mode": "multiply",
      "min_score": 42
    }
  }
}
```

- `boost` 是对整个查询的 boost。
- 每个函数的过滤查询所产生的分值不重要。
- 如果某个函数没有指定 `filter`，等价于指定 `"match_all": {}`。

## 核心参数

- `query`

  基础查询。`function_score` 会对该查询返回的文档计算或调整分值。

- `functions`

  函数数组。每个函数可以有：

  - `filter`：可选，指定该函数适用于哪些文档
  - 一个评分函数，例如 `random_score`、`field_value_factor`、`script_score`、`gauss`、`linear`、`exp`
  - `weight`：可选权重

  如果只有一个函数，也可以直接写在 `function_score` 下而不使用 `functions` 数组。

- `boost`

  对整个查询的 boost。

- `score_mode`

  指定多个函数产生的分值如何合并。可选值：

  | 值 | 说明 |
  |---|---|
  | `multiply` | 分值相乘，默认值 |
  | `sum` | 分值相加 |
  | `avg` | 分值取平均 |
  | `first` | 应用第一个具有匹配过滤条件的函数 |
  | `max` | 使用最大分值 |
  | `min` | 使用最小分值 |

  由于不同函数的分值可能处于不同量级（例如 decay 函数通常在 `0` 到 `1` 之间，而 `field_value_factor` 可以是任意数值），可以用 `weight` 调整每个函数的分值。`weight` 在 `functions` 数组中定义，并与对应函数计算出的分值相乘。

  如果只给出 `weight` 而没有声明其他函数，那么 `weight` 本身会作为一个函数，简单返回该权重值。

  当 `score_mode` 为 `avg` 时，会使用**加权平均**。例如两个函数返回分值 `1` 和 `2`，权重分别是 `3` 和 `4`，则合并方式为：

  ```text
  (1*3 + 2*4) / (3 + 4)
  ```

  而不是：

  ```text
  (1*3 + 2*4) / 2
  ```

- `max_boost`

  用于限制新计算出的分值不超过某个上限。默认值为 `FLT_MAX`。

- `boost_mode`

  指定新计算出的函数分值与原始查询分值如何合并。可选值：

  | 值 | 说明 |
  |---|---|
  | `multiply` | 查询分值与函数分值相乘，默认值 |
  | `replace` | 只使用函数分值，忽略查询分值 |
  | `sum` | 查询分值与函数分值相加 |
  | `avg` | 查询分值与函数分值取平均 |
  | `max` | 查询分值与函数分值取最大值 |
  | `min` | 查询分值与函数分值取最小值 |

- `min_score`

  默认情况下，修改分值不会改变哪些文档匹配查询。如果要排除低于某个分值阈值的文档，可以使用 `min_score`。

  注意：为让 `min_score` 生效，查询返回的所有文档都必须先被评分，然后再逐个过滤掉不符合阈值的文档。

## 可用函数

本页列出的评分函数：

- `script_score`
- `weight`
- `random_score`
- `field_value_factor`
- 衰减函数（decay functions）：`gauss`、`linear`、`exp`

### script_score

`script_score` 允许包装另一个查询，并使用脚本表达式自定义评分，脚本可以基于文档中的其他数值字段进行计算：

```bash
GET /_search
{
  "query": {
    "function_score": {
      "query": {
        "match": {
          "message": "elasticsearch"
        }
      },
      "script_score": {
        "script": {
          "source": "Math.log(2 + doc['my-int'].value)"
        }
      }
    }
  }
}
```

注意事项：

- Elasticsearch 中所有文档分值都是正的 32 位浮点数。
- 如果 `script_score` 产生更高精度的分值，会被转换为最近的 32 位浮点数。
- 分值必须是非负数，否则 Elasticsearch 会返回错误。
- 脚本中可以使用 `_score` 参数获取被包装查询的分值。
- 脚本编译会被缓存以提高执行速度。如果脚本需要参数，建议复用同一个脚本并通过 `params` 传参。

带参数的示例：

```bash
GET /_search
{
  "query": {
    "function_score": {
      "query": {
        "match": {
          "message": "elasticsearch"
        }
      },
      "script_score": {
        "script": {
          "params": {
            "a": 5,
            "b": 1.2
          },
          "source": "params.a / Math.pow(params.b, doc['my-int'].value)"
        }
      }
    }
  }
}
```

与 `custom_score` 查询不同，`function_score` 中查询分值会与脚本评分结果相乘。如果不希望相乘，需要设置：

```json
"boost_mode": "replace"
```

### weight

`weight` 允许将分值乘以给定的权重：

```json
"weight": number
```

`number` 类型为 float。某些情况下需要使用 `weight`，因为特定查询上设置的 boost 会被规范化，而 `weight` 评分函数不会。

### random_score

`random_score` 生成从 `0` 到但不包括 `1` 之间均匀分布的随机分值。

默认情况下，它使用内部 Lucene doc id 作为随机性来源。这种方式非常高效，但不可复现，因为文档可能因 merge 操作被重新编号。

如果需要可复现的随机分值，可以提供 `seed` 和 `field`。最终分值会基于：

- seed
- 所考虑文档的 `field` 最小值
- 基于索引名和 shard id 计算出的 salt

这样，即使不同索引中有相同字段值，也会得到不同分值。

注意：

- 同一 shard 中、`field` 值相同的文档会得到相同分值。
- 通常应使用对所有文档都唯一的字段，常见选择是 `_seq_no`。
- `_seq_no` 的缺点是文档更新后其值会变化，因此分值也会变化。
- 以前可以只设置 `seed` 而不设置 `field`，但这种方式已被废弃，因为它需要在 `_id` 字段上加载 fielddata，会消耗大量内存。

```bash
GET /_search
{
  "query": {
    "function_score": {
      "random_score": {
        "seed": 10,
        "field": "_seq_no"
      }
    }
  }
}
```

### field_value_factor

`field_value_factor` 允许使用文档中的某个字段影响分值。它类似于 `script_score`，但避免了脚本执行的开销。如果用于多值字段，只使用字段的第一个值参与计算。

```bash
GET /_search
{
  "query": {
    "function_score": {
      "field_value_factor": {
        "field": "my-int",
        "factor": 1.2,
        "modifier": "sqrt",
        "missing": 1
      }
    }
  }
}
```

对应评分公式：

```text
sqrt(1.2 * doc['my-int'].value)
```

参数：

| 参数 | 说明 |
|---|---|
| `field` | 要从文档中提取的字段 |
| `factor` | 可选，字段值相乘的因子，默认 `1` |
| `modifier` | 可选，应用到字段值的修饰符，默认 `none` |
| `missing` | 文档缺少该字段时使用的值；factor 和 modifier 仍会应用到 missing 值 |

`modifier` 可选值：

| 值 | 含义 |
|---|---|
| `none` | 不应用任何修饰符 |
| `log` | 取字段值的常用对数 |
| `log1p` | 字段值加 1 后取常用对数 |
| `log2p` | 字段值加 2 后取常用对数 |
| `ln` | 取自然对数 |
| `ln1p` | 字段值加 1 后取自然对数 |
| `ln2p` | 字段值加 2 后取自然对数 |
| `square` | 平方 |
| `sqrt` | 平方根 |
| `reciprocal` | 倒数，即 `1/x` |

注意：

- `field_value_factor` 产生的分值必须是非负数，否则会抛出错误。
- `log` 和 `ln` 在值介于 `0` 和 `1` 之间时会产生负值。
- `log(0)` 是非法操作，对负数取平方根也是非法操作。
- 可以用 range filter 限制字段值，或者改用 `log1p`、`ln1p`。

### 衰减函数（Decay functions）

Decay 函数根据文档数值字段值与给定 `origin` 的距离进行评分。它类似于 range query，但边缘是平滑的而非硬边界。

要对数值字段使用距离评分，需要为每个字段定义 `origin`（距离计算的“中心点”）和 `scale`（衰减速率）。

通用语法：

```json
"DECAY_FUNCTION": {
  "FIELD_NAME": {
    "origin": "11, 12",
    "scale": "2km",
    "offset": "0km",
    "decay": 0.33
  }
}
```

- `DECAY_FUNCTION` 必须是 `linear`、`exp` 或 `gauss`。
- 指定字段必须是 numeric、date 或 geopoint 字段。
- 对于 `geo_point` 字段：`origin` 可使用 geo 格式，`scale` 和 `offset` 必须带单位。
- 对于 date 字段：`scale` 和 `offset` 可使用天、周等单位。

日期示例：

```bash
GET /_search
{
  "query": {
    "function_score": {
      "gauss": {
        "@timestamp": {
          "origin": "2013-09-17",
          "scale": "10d",
          "offset": "5d",
          "decay": 0.5
        }
      }
    }
  }
}
```

- `origin` 的日期格式取决于字段 mapping 中定义的 `format`。如果不定义 `origin`，则使用当前时间。
- `offset` 和 `decay` 是可选参数。

衰减函数参数：

| 参数 | 说明 |
|---|---|
| `origin` | 计算距离的原点。numeric 字段必须是数字，date 字段必须是日期，geo 字段必须是 geo point。geo 和 numeric 字段必填；date 字段默认是 `now`。支持日期数学表达式如 `now-1h` |
| `scale` | 所有类型必填。定义距离 `origin + offset` 多远时分值等于 `decay`。geo 字段可用 `1km`、`12m`（默认米）；date 字段可用 `1h`、`10d`（默认毫秒）；numeric 字段可使用任意数字 |
| `offset` | 可选。如果定义，则只对距离大于该 `offset` 的文档计算衰减函数。默认 `0` |
| `decay` | 定义在距离等于 `scale` 时的分值。如果未定义，距离为 `scale` 的文档分值为 `0.5` |

例如“距离目标位置 2km 时，分值降低到三分之一”，`scale` 会被自动调整以确保 2km 处的分值函数为 `0.33`。在日期示例中，`2013-09-12` 到 `2013-09-22` 之间的文档权重为 `1.0`，距离该日期 15 天的文档权重为 `0.5`。

支持的 decay 函数：

| 函数 | 说明 |
|---|---|
| `gauss` | 正态衰减 |
| `exp` | 指数衰减 |
| `linear` | 线性衰减 |

`gauss`、`exp`、`linear` 的参数都会经过计算，以确保在距离 `origin + offset` 为 `scale` 时分值等于 `decay`。与 `gauss` 和 `exp` 不同，`linear` 在字段值超过用户给定 `scale` 的两倍时会将分值设为 `0`。

#### 多值字段

如果用于计算衰减的字段包含多个值，默认选择距离 `origin` 最近的值来确定距离。可以通过 `multi_value_mode` 改变：

| 值 | 说明 |
|---|---|
| `min` | 使用最小距离 |
| `max` | 使用最大距离 |
| `avg` | 使用平均距离 |
| `sum` | 使用所有距离之和 |

示例语法：

```json
"DECAY_FUNCTION": {
  "FIELD_NAME": {
    "origin": "...",
    "scale": "..."
  },
  "multi_value_mode": "avg"
}
```

#### 衰减函数详细示例

假设要搜索某个城镇中的酒店：预算有限、希望靠近市中心、距离目标位置越远入住可能性越低，查询条件类似 `hotel, Nancy, non-smoker`，结果需要根据距离市中心和价格评分。

- 位置字段：`origin` 是市中心，`scale` 约为 `2km`（愿意步行约 2km）
- 价格字段：更便宜的酒店更优先，`origin` 是 `0` 欧元，`scale` 是 `20` 欧元

完整请求：

```bash
GET /_search
{
  "query": {
    "function_score": {
      "functions": [
        {
          "gauss": {
            "price": {
              "origin": "0",
              "scale": "20"
            }
          }
        },
        {
          "gauss": {
            "location": {
              "origin": "11, 12",
              "scale": "2km"
            }
          }
        }
      ],
      "query": {
        "match": {
          "properties": "balcony"
        }
      },
      "score_mode": "multiply"
    }
  }
}
```

使用 `gauss` 时，假设原始搜索结果匹配三家酒店：`Backback Nap`、`Drink n Drive`、`BnB Bellevue`。`Drink n Drive` 距离目标位置较远（将近 2km）且价格约 13 欧元，乘数因子较低（`0.56`）；`BnB Bellevue` 和 `Backback Nap` 都离目标位置较近，而 `BnB Bellevue` 更便宜，乘数为 `0.86`，`Backpack Nap` 的乘数为 `0.66`。

#### 衰减函数支持字段与字段缺失

decay 函数只支持 numeric、date 和 geopoint 字段类型。如果文档缺少用于计算的 numeric 字段，函数会返回 `1`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-function-score-query.html)
