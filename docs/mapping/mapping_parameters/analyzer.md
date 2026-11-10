# analyzer

只有 `text` 字段支持 `analyzer` 映射参数。

`analyzer` 参数指定在索引或搜索 `text` 字段时用于文本分析的分析器。

除非被 `search_analyzer` 映射参数覆盖，此分析器同时用于索引分析和搜索分析。参阅[指定分析器](/text_analysis/text_analysis#指定字段的分析器)。

我们建议在生产环境使用分析器之前先对其进行测试。参阅[测试分析器](/text_analysis/test_analyzer)。

`analyzer` 设置不能使用更新映射 API 在现有字段上更新。

## search_quote_analyzer

`search_quote_analyzer` 设置允许你为短语指定一个分析器，这在处理短语查询禁用停用词时特别有用。

要对短语禁用停用词，需要为字段配置三个分析器设置：

1. 一个 `analyzer` 设置，用于索引包括停用词在内的所有词元
2. 一个 `search_analyzer` 设置，用于非短语查询，会移除停用词
3. 一个 `search_quote_analyzer` 设置，用于短语查询，不移除停用词

```bash
PUT my-index-000001
{
   "settings":{
      "analysis":{
         "analyzer":{
            "my_analyzer":{
               "type":"custom",
               "tokenizer":"standard",
               "filter":[
                  "lowercase"
               ]
            },
            "my_stop_analyzer":{
               "type":"custom",
               "tokenizer":"standard",
               "filter":[
                  "lowercase",
                  "english_stop"
               ]
            }
         },
         "filter":{
            "english_stop":{
               "type":"stop",
               "stopwords":"_english_"
            }
         }
      }
   },
   "mappings":{
       "properties":{
          "title": {
             "type":"text",
             "analyzer":"my_analyzer",
             "search_analyzer":"my_stop_analyzer",
             "search_quote_analyzer":"my_analyzer"
         }
      }
   }
}

PUT my-index-000001/_doc/1
{
   "title":"The Quick Brown Fox"
}

PUT my-index-000001/_doc/2
{
   "title":"A Quick Brown Fox"
}

GET my-index-000001/_search
{
   "query":{
      "query_string":{
         "query":"\"the quick brown fox\""
      }
   }
}
```

1. `my_analyzer` 分析器，对所有词元（包括停用词）进行词元化
2. `my_stop_analyzer` 分析器，移除停用词
3. 指向 `my_analyzer` 分析器的 `analyzer` 设置，将在索引时使用
4. 指向 `my_stop_analyzer` 的 `search_analyzer` 设置，为非短语查询移除停用词
5. 指向 `my_analyzer` 分析器的 `search_quote_analyzer` 设置，确保停用词不会从短语查询中移除

由于查询被引号包裹，它被检测为短语查询，因此 `search_quote_analyzer` 生效，确保停用词不会从查询中移除。然后 `my_analyzer` 分析器将返回词元 `[the, quick, brown, fox]`，它会匹配其中一个文档。与此同时，词条查询将使用 `my_stop_analyzer` 分析器进行分析，该分析器会过滤掉停用词。因此搜索 `The quick brown fox` 或 `A quick brown fox` 都会返回两个文档，因为两个文档都包含词元 `[quick, brown, fox]`。如果没有 `search_quote_analyzer`，将无法对短语查询进行精确匹配，因为短语查询中的停用词会被移除，导致两个文档都匹配。

`search_quote_analyzer` 设置可以使用更新映射 API 在现有字段上更新。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analyzer.html)
