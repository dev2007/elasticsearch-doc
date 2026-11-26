# Classic 词元过滤器

对由 [classic 分词器](/text_analysis/analysis_classic_tokenizer)生成的词元执行可选的后处理。它会：

- 移除英文所有格（词尾的 `'s`）
- 移除缩略词中的点号

底层使用 Lucene 的 [ClassicFilter](https://lucene.apache.org/core/10_0_0/analysis/common/org/apache/lucene/analysis/standard/ClassicFilter.html)。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求演示了 `classic` 词元过滤器的工作方式：

```bash
GET /_analyze
{
  "tokenizer" : "classic",
  "filter" : ["classic"],
  "text" : "The 2 Q.U.I.C.K. Brown-Foxes jumped over the lazy dog's bone."
}
```

该过滤器产生以下词元：

```text
[ The, 2, QUICK, Brown, Foxes, jumped, over, the, lazy, dog, bone ]
```

`Q.U.I.C.K.` 被处理为 `QUICK`，`dog's` 被处理为 `dog`。

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 Classic 词元过滤器配置一个新的自定义分析器：

```bash
PUT /classic_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "classic_analyzer": {
          "tokenizer": "classic",
          "filter": [ "classic" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-classic-tokenfilter.html)
