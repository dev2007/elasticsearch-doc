# 相似性模块

相似性（评分/排序模型）定义匹配文档的评分方式。相似性是按字段设置的，这意味着可以通过映射为每个字段定义不同的相似性。

相似性仅适用于 text 类型和 keyword 类型的字段。

配置自定义相似性被认为是专家特性，内置的相似性很可能已经足够，如 [similarity](/text_analysis/similarity) 所述。

## 配置相似性

大多数现有或自定义相似性都有配置选项，可以通过索引设置进行配置，如下所示。索引选项可以在创建索引或更新索引设置时提供：

```txt
PUT /index
{
  "settings": {
    "index": {
      "similarity": {
        "my_similarity": {
          "type": "DFR",
          "basic_model": "g",
          "after_effect": "l",
          "normalization": "h2",
          "normalization.h2.c": "3.0"
        }
      }
    }
  }
}
```

这里我们配置 DFR 相似性，使其可以在映射中被引用为 `my_similarity`，如下例所示：

```txt
PUT /index/_mapping
{
  "properties": {
    "title": {
      "type": "text",
      "similarity": "my_similarity"
    }
  }
}
```

## 可用的相似性

### BM25 相似性（**默认**）

基于 TF/IDF 的相似性，具有内置的 TF 归一化，据称对短字段（如名称）效果更好。更多细节参阅 [Okapi_BM25](https://en.wikipedia.org/wiki/Okapi_BM25)。此相似性具有以下选项：

- **`k1`** — 控制非线性词条频率归一化（饱和度）。默认值为 `1.2`。
- **`b`** — 控制文档长度归一化 TF 值的程度。默认值为 `0.75`。
- **`discount_overlaps`** — 决定在计算范数时是否忽略重叠标记（位置增量为 0 的标记）。默认为 `true`，即在计算范数时不计入重叠标记。

类型名称：`BM25`

### DFR 相似性

实现[随机差异](https://lucene.apache.org/core/9_12_1/core/org/apache/lucene/search/similarities/DFRSimilarity.html)框架的相似性。此相似性具有以下选项：

- **`basic_model`** — 可能的值：`g`、`if`、`in` 和 `ine`。
- **`after_effect`** — 可能的值：`b` 和 `l`。
- **`normalization`** — 可能的值：`no`、`h1`、`h2`、`h3` 和 `z`。

除第一个选项外，所有选项都需要一个归一化值。

类型名称：`DFR`

### DFI 相似性

实现[独立性偏差](https://trec.nist.gov/pubs/trec21/papers/irra.web.nb.pdf)模型的相似性。此相似性具有以下选项：

- **`independence_measure`** — 可能的值：`standardized`、`saturated`、`chisquared`。

使用此相似性时，强烈建议**不要**移除停用词以获得良好的相关性。还要注意，频率低于预期频率的词条得分为 0。

类型名称：`DFI`

### IB 相似性

[基于信息的模型](https://lucene.apache.org/core/9_12_1/core/org/apache/lucene/search/similarities/IBSimilarity.html)。该算法基于这样一个概念：任何符号*分布*序列中的信息含量主要由其基本元素的重复使用决定。对于书面文本，这个挑战相当于比较不同作者的写作风格。此相似性具有以下选项：

- **`distribution`** — 可能的值：`ll` 和 `spl`。
- **`lambda`** — 可能的值：`df` 和 `ttf`。
- **`normalization`** — 与 `DFR` 相似性相同。

类型名称：`IB`

### LM Dirichlet 相似性

[LM Dirichlet 相似性](https://lucene.apache.org/core/9_12_1/core/org/apache/lucene/search/similarities/LMDirichletSimilarity.html)。此相似性具有以下选项：

- **`mu`** — 默认为 `2000`。

论文中的评分公式为出现次数少于语言模型预测次数的词条分配负分，这对 Lucene 来说是非法的，因此这些词条得分为 0。

类型名称：`LMDirichlet`

### LM Jelinek Mercer 相似性

[LM Jelinek Mercer 相似性](https://lucene.apache.org/core/9_12_1/core/org/apache/lucene/search/similarities/LMJelinekMercerSimilarity.html)。该算法试图捕获文本中的重要模式，同时滤除噪声。此相似性具有以下选项：

- **`lambda`** — 最优值取决于集合和查询。对于标题查询，最优值约为 `0.1`；对于长查询，约为 `0.7`。默认为 `0.1`。当值接近 `0` 时，匹配更多查询词条的文档将排在匹配较少词条的文档之前。

类型名称：`LMJelinekMercer`

### 脚本化相似性

允许你使用脚本来指定如何计算评分的相似性。例如，以下示例显示如何重新实现 TF-IDF：

```txt
PUT /index
{
  "settings": {
    "number_of_shards": 1,
    "similarity": {
      "scripted_tfidf": {
        "type": "scripted",
        "script": {
          "source": "double tf = Math.sqrt(doc.freq); double idf = Math.log((field.docCount+1.0)/(term.docFreq+1.0)) + 1.0; double norm = 1/Math.sqrt(doc.length); return query.boost * tf * idf * norm;"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "field": {
        "type": "text",
        "similarity": "scripted_tfidf"
      }
    }
  }
}

PUT /index/_doc/1
{"field": "foo bar foo"}

PUT /index/_doc/2
{"field": "bar baz"}

POST /index/_refresh

GET /index/_search?explain=true
{
  "query": {
    "query_string": {
      "query": "foo^1.7",
      "default_field": "field"
    }
  }
}
```

这会产生：

```json
{
  "took": 12,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": { "value": 1, "relation": "eq" },
    "max_score": 1.9508477,
    "hits": [
      {
        "_shard": "[index][0]",
        "_node": "OzrdjxNtQGaqs4DmioFw9A",
        "_index": "index",
        "_id": "1",
        "_score": 1.9508477,
        "_source": { "field": "foo bar foo" },
        "_explanation": {
          "value": 1.9508477,
          "description": "weight(field:foo in 0) [PerFieldSimilarity], result of:",
          "details": [
            {
              "value": 1.9508477,
              "description": "score from ScriptedSimilarity(...) computed from:",
              "details": [
                { "value": 1.0, "description": "weight", "details": [] },
                { "value": 1.7, "description": "query.boost", "details": [] },
                { "value": 2, "description": "field.docCount", "details": [] },
                { "value": 4, "description": "field.sumDocFreq", "details": [] },
                { "value": 5, "description": "field.sumTotalTermFreq", "details": [] },
                { "value": 1, "description": "term.docFreq", "details": [] },
                { "value": 2, "description": "term.totalTermFreq", "details": [] },
                { "value": 2.0, "description": "doc.freq", "details": [] },
                { "value": 3, "description": "doc.length", "details": [] }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

虽然脚本化相似性提供了很大的灵活性，但它们需要满足一组规则。不这样做可能导致 Elasticsearch 静默返回错误的顶级命中，或在搜索时因内部错误而失败：

- 返回的评分必须为正。
- 在其他变量保持不变的情况下，评分不得随 `doc.freq` 增加而减少。
- 在其他变量保持不变的情况下，评分不得随 `doc.length` 增加而增加。

你可能已经注意到，上述脚本的很大一部分依赖于对每个文档都相同的统计信息。通过提供一个 `weight_script` 可以使上述脚本稍微更高效，`weight_script` 将计算评分中与文档无关的部分，并在 `weight` 变量下可用。当没有提供 `weight_script` 时，`weight` 等于 `1`。`weight_script` 可以访问与 `script` 相同的变量（`doc` 除外），因为它应该计算评分中与文档无关的部分。

以下配置将给出相同的 tf-idf 评分，但效率更高：

```txt
PUT /index
{
  "settings": {
    "number_of_shards": 1,
    "similarity": {
      "scripted_tfidf": {
        "type": "scripted",
        "weight_script": {
          "source": "double idf = Math.log((field.docCount+1.0)/(term.docFreq+1.0)) + 1.0; return query.boost * idf;"
        },
        "script": {
          "source": "double tf = Math.sqrt(doc.freq); double norm = 1/Math.sqrt(doc.length); return weight * tf * norm;"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "field": {
        "type": "text",
        "similarity": "scripted_tfidf"
      }
    }
  }
}
```

类型名称：`scripted`

### 默认相似性

默认情况下，Elasticsearch 将使用配置为 `default` 的相似性。

你可以在[创建](/rest_apis/index_apis/create_index)索引时更改索引中所有字段的默认相似性：

```txt
PUT /index
{
  "settings": {
    "index": {
      "similarity": {
        "default": {
          "type": "boolean"
        }
      }
    }
  }
}
```

如果你想在创建索引之后更改默认相似性，你必须[关闭](/rest_apis/index_apis/close_index)索引，发送以下请求，然后再次[打开](/rest_apis/index_apis/open_index)它：

```txt
POST /index/_close
PUT /index/_settings
{
  "index": {
    "similarity": {
      "default": {
        "type": "boolean"
      }
    }
  }
}
POST /index/_open
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-modules-similarity.html)
