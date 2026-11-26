# 过滤搜索结果（Filter search results）

有两种方法可以过滤搜索结果：

1. **使用带 `filter` 子句的布尔查询**：过滤条件同时作用于搜索命中和聚合。
2. **使用搜索 API 的 `post_filter` 参数**：只作用于搜索命中，不影响聚合。

使用 `post_filter`，可以先基于更宽的结果集计算聚合，再用它进一步收窄搜索结果。此外，还可以在 post_filter 之后对命中结果进行重打分（rescore），以改善相关性并重新排序。

:::::warning 警告
使用 `post_filter` 时，搜索命中是在聚合计算完成之后才被过滤的，post_filter 对聚合结果没有任何影响。
:::::

## post_filter 与 bool filter 的区别

| 维度 | bool query 的 filter 子句 | post_filter |
|---|---|---|
| 作用范围 | 搜索命中**和**聚合 | **仅**搜索命中 |
| 聚合影响 | 聚合基于过滤后的结果集计算 | 聚合基于过滤前的（更宽的）结果集计算 |
| 执行时机 | 在聚合之前 | 在聚合之后 |

## 示例

### 建立索引并写入数据

```bash
PUT /shirts
{
  "mappings": {
    "properties": {
      "brand": { "type": "keyword" },
      "color": { "type": "keyword" },
      "model": { "type": "keyword" }
    }
  }
}

PUT /shirts/_doc/1?refresh
{
  "brand": "gucci",
  "color": "red",
  "model": "slim"
}
```

### 常规做法：bool filter 查询

```bash
GET /shirts/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "color": "red" } },
        { "term": { "brand": "gucci" } }
      ]
    }
  }
}
```

### 配合聚合

如果要返回红色 Gucci 衬衫的型号统计，可以在查询中加入 terms 聚合：

```bash
GET /shirts/_search
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "color": "red" } },
        { "term": { "brand": "gucci" } }
      ]
    }
  },
  "aggs": {
    "models": {
      "terms": { "field": "model" }
    }
  }
}
```

### post_filter 用法

在分面导航场景中，如果直接把颜色过滤加进主查询的 bool filter，color 的 terms 聚合只会返回 red 一个桶，无法告诉用户还有哪些其他颜色的 Gucci 衬衫可选。

正确做法是：主查询只保留品牌等“宽”过滤条件，让聚合覆盖更宽的结果集；将用户当前点击的筛选（如 color:red）放入 `post_filter`，只收窄搜索命中。如需“红色 Gucci 衬衫的型号”聚合，同时又要展示全部颜色的统计，可以使用过滤型子聚合（`color_red`）实现：

```bash
GET /shirts/_search
{
  "query": {
    "bool": {
      "filter": {
        "term": { "brand": "gucci" }
      }
    }
  },
  "aggs": {
    "colors": {
      "terms": { "field": "color" }
    },
    "color_red": {
      "filter": {
        "term": { "color": "red" }
      },
      "aggs": {
        "models": {
          "terms": { "field": "model" }
        }
      }
    }
  },
  "post_filter": {
    "term": { "color": "red" }
  }
}
```

该请求的执行逻辑：

1. 主查询找到所有 Gucci 衬衫（不限颜色）。
2. `colors` 聚合返回 Gucci 衬衫的热门颜色列表。
3. `color_red` 聚合将 models 子聚合限制为红色 Gucci 衬衫。
4. `post_filter` 最终从搜索命中中移除非红色的结果。

## 重打分（Rescore）

重打分通过对查询和 post_filter 阶段返回的顶部文档（如 100–500 条）应用二次（通常更昂贵的）算法来提高精度，而不是对全索引应用。重打分请求在每个分片上执行，之后才由协调节点统一排序。

目前只有一种实现：query rescorer，它使用查询来调整打分。如果提供了除 `_score` 降序以外的显式排序，会抛出错误。

:::::warning 警告
向用户暴露分页时，不要在翻页过程中改变 `window_size`，否则顶部命中会变化，导致结果在翻页时混乱地“跳动”。
:::::

### Query rescorer

query rescorer 仅对查询和 post_filter 阶段返回的 top-K 结果执行二次查询，每个分片检查的文档数由 `window_size` 控制（默认 `10`）。默认将原始查询分数与 rescore 查询分数线性组合为最终 `_score`，可用 `query_weight`（默认 `1`）和 `rescore_query_weight`（默认 `1`）控制两者相对权重：

```bash
POST /_search
{
   "query" : {
      "match" : {
         "message" : {
            "operator" : "or",
            "query" : "the quick brown"
         }
      }
   },
   "rescore" : {
      "window_size" : 50,
      "query" : {
         "rescore_query" : {
            "match_phrase" : {
               "message" : {
                  "query" : "the quick brown",
                  "slop" : 2
               }
            }
         },
         "query_weight" : 0.7,
         "rescore_query_weight" : 1.2
      }
   }
}
```

分数合并方式由 `score_mode` 参数控制：

| 模式 | 说明 |
|---|---|
| `total` | 原始分数 + rescore 分数相加（默认） |
| `multiply` | 相乘，适用于 function query rescore |
| `avg` | 取平均 |
| `max` | 取两者最大值 |
| `min` | 取两者最小值 |

### 多重重打分

可以按顺序执行多个 rescore：第二个 rescore 接收第一个的结果，依此类推。第二个 rescore“看到”的是第一个 rescore 的排序结果，因此可以用较大的第一窗口把文档拉入较小的第二窗口：

```bash
POST /_search
{
   "query" : {
      "match" : {
         "message" : {
            "operator" : "or",
            "query" : "the quick brown"
         }
      }
   },
   "rescore" : [ {
      "window_size" : 100,
      "query" : {
         "rescore_query" : {
            "match_phrase" : {
               "message" : {
                  "query" : "the quick brown",
                  "slop" : 2
               }
            }
         },
         "query_weight" : 0.7,
         "rescore_query_weight" : 1.2
      }
   }, {
      "window_size" : 10,
      "query" : {
         "score_mode": "multiply",
         "rescore_query" : {
            "function_score" : {
               "script_score": {
                  "script": {
                    "source": "Math.log10(doc.count.value + 2)"
                  }
               }
            }
         }
      }
   } ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/filter-search-results.html)
