# Keep types 词元过滤器

保留或移除指定类型的词元。例如，可以使用此过滤器将 `3 quick foxes` 转换为 `quick foxes`，即只保留 `<ALPHANUM>`（字母数字）类型的词元。

此过滤器使用 Lucene 的 TypeTokenFilter。

## 词元类型

词元类型由分词器在将字符转换为词元时设置，不同的分词器可能产生不同的词元类型。

例如，standard 分词器可以产生多种词元类型，包括 `<ALPHANUM>`、`<HANGUL>` 和 `<NUM>`；而较简单的分词器（如 lowercase 分词器）只会产生 `word` 类型。

某些词元过滤器也会添加词元类型。例如，synonym 过滤器可以添加 `<SYNONYM>` 类型。

:::::warning 警告
某些分词器不支持此过滤器，包括 `keyword`、`simple_pattern` 和 `simple_pattern_split` 分词器，因为它们不支持设置词元类型属性。
:::::

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 keep_types 过滤器仅保留文本 `1 quick fox 2 lazy dogs` 中的数字词元：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "keep_types",
      "types": [ "<NUM>" ]
    }
  ],
  "text": "1 quick fox 2 lazy dogs"
}
```

该过滤器产生以下词元：

```text
[ 1, 2 ]
```

要移除指定类型的词元而不是保留它们，可以使用 `mode` 参数。例如，以下请求使用 `mode` 为 `exclude` 的 keep_types 过滤器移除数字词元：

```bash
GET _analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "keep_types",
      "types": [ "<NUM>" ],
      "mode": "exclude"
    }
  ],
  "text": "1 quick fox 2 lazy dogs"
}
```

该过滤器产生以下词元：

```text
[ quick, fox, lazy, dogs ]
```

## 可配置参数

- `types`

  （必需，字符串数组）要保留或移除的词元类型列表。

- `mode`

  （可选，字符串值）指示是保留还是移除指定类型的词元。可用值为：

  - `include`（默认）— 仅保留指定类型的词元。
  - `exclude` — 移除指定类型的词元。

## 自定义并添加到分析器

要自定义 keep_types 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用自定义的 keep_types 过滤器配置一个新的自定义分析器。该 keep_types 过滤器仅保留 `<ALPHANUM>`（字母数字）词元：

```bash
PUT keep_types_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "filter": [ "extract_alpha" ]
        }
      },
      "filter": {
        "extract_alpha": {
          "type": "keep_types",
          "types": [ "<ALPHANUM>" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-keep-types-tokenfilter.html)
