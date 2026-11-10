# 指定分析器

Elasticsearch 提供多种方式来指定内置或自定义分析器：

- 按文本字段、索引或查询指定
- 为索引时或搜索时指定

::::tip 保持简单
在不同层级、为不同阶段指定分析器的灵活性很棒……但仅在需要时才使用。

在大多数情况下，最简单的方法效果最好：为每个文本字段指定一个分析器，如[为字段指定分析器](#指定字段的分析器)所述。

这种方法与 Elasticsearch 的默认行为配合良好，让你可以在索引和搜索时使用同一个分析器。它还让你可以通过[获取映射 API](/rest_apis/index_apis/get_mapping) 快速查看哪个分析器应用于哪个字段。

如果你通常不为索引创建映射，可以使用[索引模板](/index_templates/index_templates)来实现类似的效果。
::::

## Elasticsearch 如何确定索引分析器

Elasticsearch 按顺序检查以下参数来确定使用哪个索引分析器：

1. 字段的 `analyzer` 映射参数。参阅[为字段指定分析器](#指定字段的分析器)。
2. `analysis.analyzer.default` 索引设置。参阅[为索引指定默认分析器](#为索引指定默认分析器)。

如果这些参数都未指定，则使用 `standard` 分析器。

## 指定字段的分析器

在映射索引时，你可以使用 [`analyzer` 映射参数](/mapping/mapping_parameters/analyzer)为每个文本字段指定一个分析器。

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求将 `whitespace` 分析器设置为 `title` 字段的分析器。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "whitespace"
      }
    }
  }
}
```

## 为索引指定默认分析器

除了字段级分析器之外，你还可以使用 `analysis.analyzer.default` 设置设置一个兜底分析器。

以下创建索引 API 请求将 `simple` 分析器设置为 `my-index-000001` 的兜底分析器。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "simple"
        }
      }
    }
  }
}
```

## Elasticsearch 如何确定搜索分析器

::::warning 警告
在大多数情况下，无需指定不同的搜索分析器。这样做可能会对相关性产生负面影响，并导致意外的搜索结果。

如果你选择指定单独的搜索分析器，我们建议在生产环境部署之前对分析配置进行充分测试。
::::

在搜索时，Elasticsearch 按顺序检查以下参数来确定使用哪个分析器：

1. 搜索查询中的 `analyzer` 参数。参阅[为查询指定搜索分析器](#为查询指定搜索分析器)。
2. 字段的 [`search_analyzer` 映射参数](/mapping/mapping_parameters/search_analyzer)。参阅[为字段指定搜索分析器](#为字段指定搜索分析器)。
3. `analysis.analyzer.default_search` 索引设置。参阅[为索引指定默认搜索分析器](#为索引指定默认搜索分析器)。
4. 字段的 [`analyzer` 映射参数](/mapping/mapping_parameters/analyzer)。参阅[为字段指定分析器](#指定字段的分析器)。

如果这些参数都未指定，则使用 `standard` 分析器。

## 为查询指定搜索分析器

编写全文查询时，你可以使用 `analyzer` 参数指定一个搜索分析器。如果提供了该参数，它将覆盖所有其他搜索分析器。

以下搜索 API 请求将 `stop` 分析器设置为 match 查询的搜索分析器。

```bash
GET my-index-000001/_search
{
  "query": {
    "match": {
      "message": {
        "query": "Quick foxes",
        "analyzer": "stop"
      }
    }
  }
}
```

## 为字段指定搜索分析器

在映射索引时，你可以使用 [`search_analyzer` 映射参数](/mapping/mapping_parameters/search_analyzer)为每个文本字段指定一个搜索分析器。

::::note 提示
如果提供了搜索分析器，则还必须使用 `analyzer` 参数指定索引分析器。
::::

以下创建索引 API 请求将 `simple` 分析器设置为 `title` 字段的搜索分析器。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "whitespace",
        "search_analyzer": "simple"
      }
    }
  }
}
```

## 为索引指定默认搜索分析器

创建索引时，你可以使用 `analysis.analyzer.default_search` 设置默认搜索分析器。

::::note 提示
如果提供了搜索分析器，则还必须使用 `analysis.analyzer.default` 设置指定默认索引分析器。
::::

以下创建索引 API 请求将 `whitespace` 分析器设置为 `my-index-000001` 索引的默认搜索分析器。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "simple"
        },
        "default_search": {
          "type": "whitespace"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/specify-analyzer.html)
