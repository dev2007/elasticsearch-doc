# 分析 API

对文本字符串执行[分析](/text_analysis/text_analysis)并返回结果 token（标记）。

```bash
GET /_analyze
{
  "analyzer" : "standard",
  "text" : "Quick Brown Foxes!"
}
```

## 请求

`GET /_analyze`

`POST /_analyze`

`GET /<index>/_analyze`

`POST /<index>/_analyze`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对指定索引必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 路径参数

- `<index>`

（可选，字符串）用于产生分析器的索引。

如果指定，`<analyzer>` 或 `<field>` 将覆盖此值。

如果没有指定分析器或字段，则分析 API 将为索引使用默认分析器。

如果没有指定索引或索引没有默认分析器，则分析 API 使用[标准分析器](/text_analysis/built-in_analyzer_reference/standard)。

## 查询参数

-`analyzer`

（可选，字符串）将用于提供的 `text` 的分析器的名称。这可以是一个[内置分析器](/text_analysis/built-in_analyzer_reference/text_analysis/built-in_analyzer_reference)，也可以是在索引中配置的分析器。

如果未指定此参数，则分析 API 将使用该字段映射中定义的分析器。

如果没有指定字段，分析 API 将对索引使用默认分析器。

如果没有指定索引，或者索引没有默认分析器，则分析 API 使用[标准分析器](/text_analysis/built-in_analyzer_reference/standard)。

- `attributes`

（可选，字符串数组）用于过滤 `explain` 参数输出的 token（标记）属性数组。

- `char_filter`

（可选，字符串数组）在 tokenizer（标记器）之前，预处理字符的字符过滤器数组。参阅[字符过滤器参考](/text_analysis/character_filters_reference/character_filters_reference)获知一系列的字符过滤器。

- `explain`

（可选，布尔值）如果为 `true`，响应包含标记的属性和更多详情。默认为 `false`。【*更多详情信息的格式在 Lucene 中被标记为实验性的，将来可能会改变。*】

- `field`

（可选，字符串）用于导出分析器的字段。要使用该参数，必须指定一个索引。

如果指定，参数 `analyzer` 将覆盖此值。

如果没有指定字段，分析 API 将对索引使用默认分析器。

如果没有指定索引或索引没有默认分析器，则分析 API 使用[标准分析器](/text_analysis/built-in_analyzer_reference/standard)。

- `filter`

（可选，字符串数组）用于在标记器之后应用的标记过滤器数组。参阅[标记过滤器参考](/text_analysis/text_filter_reference/text_filter_reference)获知一系列的标记过滤器。

- `normalizer`

（可选，字符串）用于将文本转换为单个标记的规范化器。参阅[规范化器](/text_analysis/normalizers/normalizers)获知一系列的规范化器。

- `text`

（必需，字符串或字符串数组）待分析的文本。如果是字符串数组，会作为多值字段分析。

- `tokenizer`

（可选，字符串）标记器，用于将文本转换为标记。参阅[标记器](/text_analysis/tokenizer_reference/tokenizer_reference)获知一系列的标记器。

## 示例

### 未指定索引

你可以对文本串应用任何内置分析器，不用指定索引的。

```bash
GET /_analyze
{
  "analyzer" : "standard",
  "text" : "this is a test"
}
```

### 文本串数组

如果参数 `text` 以字符串数组形式提供，它会作为多值字段分析。

```bash
GET /_analyze
{
  "analyzer" : "standard",
  "text" : ["this is a test", "the second text"]
}
```

### 自定义分析器

你可以使用分析 API 来测试从标记器、标记过滤器和字符过滤器构建的自定义 transient（瞬态）分析器。标记过滤器使用 `filter` 参数:

```bash
GET /_analyze
{
  "tokenizer" : "keyword",
  "filter" : ["lowercase"],
  "text" : "this is a test"
}
```

```bash
GET /_analyze
{
  "tokenizer" : "keyword",
  "filter" : ["lowercase"],
  "char_filter" : ["html_strip"],
  "text" : "this is a <b>test</b>"
}
```

自定义标记器、标记过滤器和字符过滤器可以在请求体中指定，如下所示:

```bash
GET /_analyze
{
  "tokenizer" : "whitespace",
  "filter" : ["lowercase", {"type": "stop", "stopwords": ["a", "is", "this"]}],
  "text" : "this is a test"
}
```

### 指定索引

你也可以针对特定的索引运行分析 API:

```bash
GET /analyze_sample/_analyze
{
  "text" : "this is a test"
}
```

上面的代码将使用与索引 `analyze_sample` 相关联的默认索引分析器，对 “this is a test” 文本进行分析。也可以提供一个 `analyzer` 来使用与索引所关联不同的分析器:

```bash
GET /analyze_sample/_analyze
{
  "analyzer" : "whitespace",
  "text" : "this is a test"
}
```

### 从字段映射导出分析器

分析器可以基于字段映射来派生，例如:

```bash
GET /analyze_sample/_analyze
{
  "field" : "obj1.field1",
  "text" : "this is a test"
}
```

这将导致基于在 `obj1.field1` 映射中配置的分析器进行分析(如果没有，则为默认的索引分析器)。

### 规范化器

可以为与索引 `analyze_sample` 关联的规范化器的关键字字段提供一个 `normalizer`。

```bash
GET /analyze_sample/_analyze
{
  "normalizer" : "my_normalizer",
  "text" : "BaR"
}
```

或者通过在标记筛选器和字符过滤器中构建自定义瞬态规范化器。

```bash
GET /_analyze
{
  "filter" : ["lowercase"],
  "text" : "BaR"
}
```

### 解释分析

如果你想获得更高级的细节，请将 `explain`设置为 `true` (默认为 `false`)。它会输出每个标记的所有标记属性。你可以通过设置选项 `attributes` 来过滤你想输出的标记属性。

::: tip 提示
更多详情信息的格式在 Lucene 中被标记为实验性的，将来可能会改变。
:::

```bash
GET /_analyze
{
  "tokenizer" : "standard",
  "filter" : ["snowball"],
  "text" : "detailed output",
  "explain" : true,
  "attributes" : ["keyword"]
}
```

1. `"attributes" : ["keyword"]` 设置 “keyword” 为唯一输出的 “keyword” 属性

请求返回以下结果：

```bash
{
  "detail" : {
    "custom_analyzer" : true,
    "charfilters" : [ ],
    "tokenizer" : {
      "name" : "standard",
      "tokens" : [ {
        "token" : "detailed",
        "start_offset" : 0,
        "end_offset" : 8,
        "type" : "<ALPHANUM>",
        "position" : 0
      }, {
        "token" : "output",
        "start_offset" : 9,
        "end_offset" : 15,
        "type" : "<ALPHANUM>",
        "position" : 1
      } ]
    },
    "tokenfilters" : [ {
      "name" : "snowball",
      "tokens" : [ {
        "token" : "detail",
        "start_offset" : 0,
        "end_offset" : 8,
        "type" : "<ALPHANUM>",
        "position" : 0,
        "keyword" : false
      }, {
        "token" : "output",
        "start_offset" : 9,
        "end_offset" : 15,
        "type" : "<ALPHANUM>",
        "position" : 1,
        "keyword" : false
      } ]
    } ]
  }
}
```

1. `"keyword" : false` 由于在请求中指定了 "attributes"，只输出 "keyword" 属性。

### 设置标记限制

生成过多的标记可能会导致节点耗尽内存。下面的设置允许限制可以产生的标记的数量:

- `index.analyze.max_token_count`

通过 `_analyze` API 可以产生的标记的最大数量。默认值为 `10,000`。如果生成的标记超出这个限制，会抛出错误。没有指定索引的 `_analyze` 端点将始终使用 `10,000` 作为限制。这个设置允许你控制一个特定索引的限制:

```bash
PUT /analyze_sample
{
  "settings" : {
    "index.analyze.max_token_count" : 20000
  }
}
```

```bash
GET /analyze_sample/_analyze
{
  "text" : "this is a test"
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-analyze.html)
