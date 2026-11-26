# Intervals 查询（Intervals query）

`intervals` 查询根据匹配词项的顺序和邻近程度返回文档。

该查询使用由一组少量定义构造出的匹配规则，然后将这些规则应用到指定字段中的词项上。

这些定义会生成一系列最小间隔（minimal intervals），覆盖文本正文中的词项。随后，这些间隔可以进一步组合，并通过父级 source 进行过滤。

## 示例

以下 `intervals` 搜索返回这样的文档：

- `my_text` 字段中包含短语 `my favorite food`，且词项之间没有间隔；
- 后面跟着 `hot water` 或 `cold porridge`。

该搜索会匹配 `my favorite food is cold porridge`，但不会匹配 `it's cold my favorite food is porridge`：

```bash
POST _search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "all_of" : {
          "ordered" : true,
          "intervals" : [
            {
              "match" : {
                "query" : "my favorite food",
                "max_gaps" : 0,
                "ordered" : true
              }
            },
            {
              "any_of" : {
                "intervals" : [
                  { "match" : { "query" : "hot water" } },
                  { "match" : { "query" : "cold porridge" } }
                ]
              }
            }
          ]
        }
      }
    }
  }
}
```

## 顶层参数

- `<field>`

  （必需，rule object）要搜索的字段。该参数的值是一个规则对象，用于根据匹配词项、顺序和邻近程度匹配文档。

  有效规则：`match`、`prefix`、`wildcard`、`regexp`、`fuzzy`、`range`、`all_of`、`any_of`。

## 规则参数

### match 规则

`match` 规则匹配经过分析的文本。

- `query`：（必需，字符串）要在指定字段中查找的文本。
- `max_gaps`：（可选，整数）匹配词项之间允许的最大位置间隔数，默认 `-1`。超过该距离的词项不会被视为匹配；`-1` 表示没有宽度限制，`0` 表示词项必须相邻。
- `ordered`：（可选，布尔值）匹配词项是否必须按指定顺序出现，默认 `false`。
- `analyzer`：（可选，字符串）用于分析查询中词项的分析器，默认使用顶层 `<field>` 的分析器。
- `filter`：（可选，interval filter rule object）可选的 interval 过滤器。
- `use_field`：（可选，字符串）如果指定，则从该字段匹配 interval 而不是顶层 `<field>`，词项使用该字段的 search analyzer 分析。用途：可以像搜索同一个字段一样跨多个字段搜索。例如把同一文本索引到词干化和非词干化字段中，然后搜索靠近非词干化词项的词干化词项。

### prefix 规则

`prefix` 规则匹配以指定字符集合开头的词项。

前缀最多可以扩展匹配 `indices.query.bool.max_clause_count` 搜索设置所允许的词项数量，超出会返回错误。可以使用字段映射中的 `index-prefixes` 选项避免该限制。

- `prefix`：（必需，字符串）要在顶层 `<field>` 中查找的词项起始字符。
- `analyzer`：（可选，字符串）用于规范化前缀的分析器，默认顶层 `<field>` 的分析器。
- `use_field`：（可选，字符串）从该字段匹配 interval；除非单独指定 `analyzer`，前缀使用该字段的 search analyzer 规范化。

### wildcard 规则

`wildcard` 规则使用通配符模式匹配词项。模式最多可扩展匹配 `indices.query.bool.max_clause_count` 允许的词项数量，超出会返回错误。

- `pattern`：（必需，字符串）通配符模式。支持 `?`（匹配任意单个字符）和 `*`（匹配零个或多个字符）。建议避免以 `*` 或 `?` 开头的模式，这会增加查找匹配词项的迭代次数并降低性能。
- `analyzer`：（可选，字符串）用于规范化模式的分析器，默认顶层 `<field>` 的分析器。
- `use_field`：（可选，字符串）从该字段匹配 interval。

### regexp 规则

`regexp` 规则使用正则表达式模式匹配词项。模式最多可扩展匹配 `indices.query.bool.max_clause_count` 允许的词项数量，超出会返回错误。

- `pattern`：（必需，字符串）正则模式，支持 Regular expression syntax 中的操作符。建议避免类似 `.*` 或 `.*?+` 的通配模式，这会降低性能。
- `analyzer`：（可选，字符串）用于规范化模式的分析器，默认顶层 `<field>` 的分析器。
- `use_field`：（可选，字符串）从该字段匹配 interval。

### fuzzy 规则

`fuzzy` 规则匹配与提供词项相似的词项，相似度由编辑距离决定。如果模糊扩展匹配超过 `indices.query.bool.max_clause_count` 允许的词项数量，会返回错误。

- `term`：（必需，字符串）要匹配的词项。
- `prefix_length`：（可选，整数）创建扩展时保持不变的起始字符数量，默认 `0`。
- `transpositions`：（可选，布尔值）编辑操作是否包括相邻字符交换（如 `ab → ba`），默认 `true`。
- `fuzziness`：（可选，字符串）允许的最大编辑距离，默认 `auto`。
- `analyzer`：（可选，字符串）用于规范化词项的分析器，默认顶层 `<field>` 的分析器。
- `use_field`：（可选，字符串）从该字段匹配 interval。

### range 规则

`range` 规则匹配包含在指定范围内的词项。范围最多可扩展匹配 `indices.query.bool.max_clause_count` 允许的词项数量，超出会返回错误。

- `gt`：（可选，字符串）大于。
- `gte`：（可选，字符串）大于等于。
- `lt`：（可选，字符串）小于。
- `lte`：（可选，字符串）小于等于。

必须同时提供 `gt` 或 `gte` 之一，以及 `lt` 或 `lte` 之一。

- `analyzer`：（可选，字符串）用于规范化模式的分析器，默认顶层 `<field>` 的分析器。
- `use_field`：（可选，字符串）从该字段匹配 interval。

### all_of 规则

`all_of` 规则返回跨越多个其他规则组合的匹配。

- `intervals`：（必需，规则对象数组）要组合的规则数组。文档中所有规则都必须产生匹配，整体 source 才会匹配。
- `max_gaps`：（可选，整数）匹配词项之间允许的最大位置间隔数，默认 `-1`（无宽度限制），`0` 表示必须相邻。

  内部 interval 可以有自己的 `max_gaps`。处理顺序为：先根据内部规则找到内部 interval；再组合这些 interval；最后检查内部 interval 之间的间隔是否满足外层 `max_gaps`。

- `ordered`：（可选，布尔值）规则产生的 interval 是否应按指定顺序出现，默认 `false`。为 `false` 时 interval 可以按任意顺序出现，甚至相互重叠。
- `filter`：（可选，interval filter rule object）过滤返回的 interval。

### any_of 规则

`any_of` 规则返回其任一子规则产生的 interval。

- `intervals`：（必需，规则对象数组）要匹配的规则数组。
- `filter`：（可选，interval filter rule object）过滤返回的 interval。

### filter 规则

`filter` 规则根据查询返回 interval：

- `after`：（可选，query object）返回位于 filter 规则 interval 之后的 interval。
- `before`：（可选，query object）返回位于其之前的 interval。
- `contained_by`：（可选，query object）返回被其包含的 interval。
- `containing`：（可选，query object）返回包含其的 interval。
- `not_contained_by`：（可选，query object）返回未被其包含的 interval。
- `not_containing`：（可选，query object）返回不包含其的 interval。
- `not_overlapping`：（可选，query object）返回不与其重叠的 interval。
- `overlapping`：（可选，query object）返回与其重叠的 interval。
- `script`：（可选，script object）用于返回匹配文档的脚本，必须返回布尔值 `true` 或 `false`。

## Filter 示例

以下搜索返回这样的文档：`hot` 和 `porridge` 在 10 个位置以内，且二者之间不包含 `salty`：

```bash
POST _search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "match" : {
          "query" : "hot porridge",
          "max_gaps" : 10,
          "filter" : {
            "not_containing" : {
              "match" : {
                "query" : "salty"
              }
            }
          }
        }
      }
    }
  }
}
```

## Script filters

可以使用脚本根据 interval 的起始位置、结束位置和内部间隔数量过滤 interval。以下脚本使用 `interval` 变量的 `start`、`end` 和 `gaps` 方法：

```bash
POST _search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "match" : {
          "query" : "hot porridge",
          "filter" : {
            "script" : {
              "source" : "interval.start > 10 && interval.end < 20 && interval.gaps == 0"
            }
          }
        }
      }
    }
  }
}
```

## Minimization（最小化）

`intervals` 查询始终会最小化 interval，以确保查询可以线性时间运行。这有时会产生令人意外的结果，尤其是在使用 `max_gaps` 限制或过滤器时。

例如以下查询搜索被短语 `hot porridge` 包含的 `salty`：

```bash
POST _search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "match" : {
          "query" : "salty",
          "filter" : {
            "contained_by" : {
              "match" : {
                "query" : "hot porridge"
              }
            }
          }
        }
      }
    }
  }
}
```

该查询不会匹配包含 `hot porridge is salty porridge` 的文档，因为 `hot porridge` 的 match 查询返回的 interval 只覆盖开头的两个词项，不与覆盖 `salty` 的 interval 重叠。

## all_of 中有序与无序规则下的 max_gaps

### 有序示例

以下查询要求：`my favorite food` 词项间无间隔、后面跟着 `cold porridge`（二者之间最多 4 个 token）、两个内部 interval 在外层 `all_of` 中最多只能有 1 个间隔。由于 `ordered` 为 `true`，内部 interval 必须按给定顺序出现：

```bash
POST _search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "all_of" : {
          "ordered" : true,     
          "max_gaps": 1,
          "intervals" : [
            {
              "match" : {
                "query" : "my favorite food",
                "max_gaps" : 0,
                "ordered" : true
              }
            },
            {
              "match" : {
                "query" : "cold porridge",
                "max_gaps" : 4,
                "ordered" : true
              }
            }
          ]
        }
      }
    }
  }
}
```

该搜索匹配 `my favorite food is cold porridge`，但不匹配 `it's cold my favorite food is porridge`。

### 无序示例

同一个查询但 `ordered` 设为 `false`：

```bash
POST _search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "all_of" : {
          "ordered" : false, 
          "max_gaps": 1,
          "intervals" : [
            {
              "match" : {
                "query" : "my favorite food",
                "max_gaps" : 0,
                "ordered" : true
              }
            },
            {
              "match" : {
                "query" : "cold porridge",
                "max_gaps" : 4,
                "ordered" : true
              }
            }
          ]
        }
      }
    }
  }
}
```

此时 interval 可以按任意顺序出现甚至相互重叠，因此两个文本都会被匹配。在 `it's cold my favorite food is porridge` 中，`cold .... porridge` interval 与 `my favorite food` interval 重叠。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/query-dsl-intervals-query.html)
