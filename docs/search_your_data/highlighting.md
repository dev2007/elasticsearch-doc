# 高亮（Highlighting）

高亮器（highlighter）可以从搜索结果中的一个或多个字段里找出最匹配的高亮片段，让用户看到查询的匹配位置。当你请求高亮时，响应中的每个搜索命中都会包含一个额外的 `highlight` 元素，其中有被高亮的字段和高亮片段。

高亮器在提取要高亮的词项时**不会反映查询的布尔逻辑**。因此，对于某些复杂布尔查询（如嵌套布尔查询、使用 minimum_should_match 的查询等），可能出现与查询匹配无关的文档片段被高亮的情况。

高亮需要字段的真实内容。如果字段没有被存储（mapping 中未设置 `store: true`），则会加载实际的 `_source`，并从中提取相关字段。

例如，以下请求使用默认高亮器为每个搜索命中的 `content` 字段获取高亮，只需在请求体中加入 `highlight` 对象并指定该字段：

```bash
GET /_search
{
  "query": {
    "match": { "content": "kimchy" }
  },
  "highlight": {
    "fields": {
      "content": {}
    }
  }
}
```

## 高亮器类型

Elasticsearch 支持三种用于 text 和 keyword 字段的高亮器：unified、plain 和 fvh（fast vector highlighter），以及用于 semantic_text 字段的语义高亮器。可以为每个字段指定要使用的高亮器类型，也可以依赖字段类型的默认高亮器。

### unified 高亮器

unified 高亮器使用 Lucene 的 Unified Highlighter。它将文本拆分为句子，并使用 BM25 算法像给文档打分一样给句子打分。它还支持精确的短语和多词项（模糊、前缀、正则）高亮。unified 高亮器可以将多个字段的匹配合并为一个结果（参阅 `matched_fields`）。

这是所有 text 和 keyword 字段的默认高亮器。

### semantic 高亮器

semantic 高亮器专为 [semantic_text 字段](/mapping/field_data_types/semantic_text)设计。它基于查询与每个片段之间的语义相似度，识别并提取字段中最相关的片段。

默认情况下，semantic_text 字段使用 semantic 高亮器。

### plain 高亮器

plain 高亮器使用标准的 Lucene 高亮器。它尝试在理解词的重要性和短语查询中的词位置条件的基础上反映查询匹配逻辑。

plain 高亮器最适合在单个字段中高亮简单查询匹配。为了准确反映查询逻辑，它会创建一个微小的内存索引，并通过 Lucene 的查询执行计划器重新运行原始查询条件，以获取当前文档的底层匹配信息。这对每个需要高亮的字段和文档都会重复执行。如果要在大量文档上用复杂查询高亮大量字段，建议对 postings 或 term_vector 字段使用 unified 高亮器。

### fvh 高亮器

fvh 高亮器使用 Lucene 的 Fast Vector highlighter。此高亮器可用于 mapping 中 `term_vector` 设为 `with_positions_offsets` 的字段。fvh 高亮器：

- 可以通过 `boundary_scanner` 自定义。
- 需要将 `term_vector` 设置为 `with_positions_offsets`，这会增大索引体积。
- 可以将多个字段的匹配合并为一个结果（参阅 `matched_fields`）。
- 可以为不同位置的匹配分配不同权重，例如在高亮 Boosting 查询时让短语匹配排在词项匹配之前。

fvh 高亮器不支持 span 查询。如果需要支持 span 查询，请使用其他高亮器，例如 unified 高亮器。

## 偏移量策略

要从被查询的词项创建有意义的搜索片段，高亮器需要知道原文中每个词的起止字符偏移量。这些偏移量可以来自：

- **postings 列表**。如果 mapping 中 `index_options` 设为 `offsets`，unified 高亮器使用该信息高亮文档，无需重新分析文本。它直接在 postings 上重新运行原始查询并从索引中提取匹配的偏移量，将收集范围限制在被高亮的文档上。这对大字段很重要，因为不需要重新分析文本；也比使用 term_vectors 更省磁盘空间。
- **Term vectors**。如果 mapping 中 `term_vector` 设为 `with_positions_offsets`，unified 高亮器会自动使用 term_vector 来高亮字段。这对大字段（大于 1MB）和高亮多词项查询（如前缀或通配符）尤其快，因为它可以访问每个文档的词项字典。fvh 高亮器始终使用 term vectors。
- **普通高亮（plain highlighting）**。在没有其他选择时，unified 高亮器使用此模式。它会创建一个微小的内存索引并通过 Lucene 的查询执行计划器重新运行原始查询条件，以获取当前文档的底层匹配信息。这对每个需要高亮的字段和文档都会重复执行。plain 高亮器始终使用普通高亮。

对大文本进行普通高亮可能消耗大量时间和内存。为防止这种情况，被分析的文本字符数上限默认为 1000000。该默认限制可以通过索引设置 `index.highlight.max_analyzed_offset` 为特定索引修改。

## 高亮设置

高亮设置可以在全局层面设置，并在字段级别覆盖。

- `boundary_chars`

  包含每个边界字符的字符串。默认为 `.,!? \t\n`。

- `boundary_max_scan`

  扫描边界字符的距离。默认为 `20`。

- `boundary_scanner`

  指定如何拆分高亮片段：`chars`、`sentence` 或 `word`。仅对 unified 和 fvh 高亮器有效。unified 高亮器默认为 `sentence`，fvh 高亮器默认为 `chars`。

  - `chars`：使用 `boundary_chars` 指定的字符作为高亮边界。`boundary_max_scan` 控制扫描边界字符的距离。仅对 fvh 高亮器有效。
  - `sentence`：在下一个句子边界处拆分高亮片段，由 Java 的 BreakIterator 决定。可以用 `boundary_scanner_locale` 指定使用的语言环境。与 unified 高亮器一起使用时，句子扫描器会把大于 `fragment_size` 的句子在 `fragment_size` 之后的第一个单词边界处拆分。将 `fragment_size` 设为 `0` 可永不拆分句子。
  - `word`：在下一个单词边界处拆分高亮片段，由 Java 的 BreakIterator 决定。可以用 `boundary_scanner_locale` 指定使用的语言环境。

- `boundary_scanner_locale`

  控制搜索句子和单词边界时使用的语言环境。此参数采用语言标签的形式，例如 `"en-US"`、`"fr-FR"`、`"ja-JP"`。默认值为 `Locale.ROOT`。

- `encoder`

  指示片段是否应进行 HTML 编码：`default`（不编码）或 `html`（对片段文本进行 HTML 转义，然后插入高亮标签）。

- `fields`

  指定要获取高亮的字段。可以使用通配符指定字段。例如，可以指定 `comment_*` 来获取所有以 `comment_` 开头的 text、match_only_text 和 keyword 字段的高亮。

  使用通配符时只会高亮 text、match_only_text 和 keyword 字段。如果使用了自定义映射并仍想高亮某个字段，必须显式指定该字段名。

- `fragmenter`

  指定在高亮片段中如何拆分文本：`simple` 或 `span`。仅对 plain 高亮器有效。默认为 `span`。

  - `simple`：将文本拆分为大小相同的片段。
  - `span`：将文本拆分为大小相同的片段，但尽量避免在高亮词项之间拆分文本。这在查询短语时很有帮助。

- `fragment_offset`

  控制开始高亮的边距。仅在使用 fvh 高亮器时有效。

- `fragment_size`

  高亮片段的字符大小。默认为 `100`。

- `highlight_query`

  高亮除搜索查询之外的其他查询的匹配。这在使用 rescore 查询时特别有用，因为默认情况下高亮不会考虑 rescore 查询。

  Elasticsearch 不会以任何方式验证 `highlight_query` 是否包含搜索查询，因此有可能定义出导致合法查询结果不被高亮的情况。通常，应将搜索查询作为 `highlight_query` 的一部分。

- `matched_fields`

  合并多个字段上的匹配来高亮单个字段。这对以不同方式分析同一字符串的 multifield 最直观。对 unified 和 fvh 高亮器有效，但此选项的行为因高亮器而异。

  对于 unified 高亮器：

  - `matched_fields` 数组不应包含要高亮的原始字段。原始字段会被自动添加到 `matched_fields` 中，且无法在高亮时排除其匹配。
  - `matched_fields` 和原始字段可以使用不同的索引策略（有无 offsets、有无 term_vectors）。
  - 只加载合并匹配到的原始字段，因此只有该字段能从设置 `store` 中获益。

  对于 fvh 高亮器：

  - `matched_fields` 数组可以根据需要包含或不包含原始字段。如果想在高亮中包含原始字段的匹配，请将其添加到 `matched_fields` 数组中。
  - 所有 `matched_fields` 必须将 `term_vector` 设置为 `with_positions_offsets`。
  - 只加载合并匹配到的原始字段，因此只有该字段能从设置 `store` 中获益。

- `no_match_size`

  如果没有可高亮的匹配片段，则从字段开头返回的文本长度。默认为 `0`（不返回任何内容）。

- `number_of_fragments`

  要返回的最大片段数。如果设置为 `0`，则不返回片段，而是高亮并返回整个字段内容。这在需要高亮标题或地址等短文本而不需要分片时非常方便。当 `number_of_fragments` 为 `0` 时，`fragment_size` 会被忽略。默认为 `5`。

- `order`

  设置为 `score` 时按分数对高亮片段排序。默认情况下，片段按它们在字段中出现的顺序输出（`order: none`）。设置为 `score` 会先输出最相关的片段。每个高亮器都有自己的相关性分数计算逻辑。

- `phrase_limit`

  控制文档中被考虑的匹配短语的数量。防止 fvh 高亮器分析过多短语并消耗过多内存。使用 `matched_fields` 时，每个匹配字段考虑 `phrase_limit` 个短语。提高限制会增加查询时间并消耗更多内存。仅 fvh 高亮器支持。默认为 `256`。

- `pre_tags` / `post_tags`

  配合使用，定义用于高亮文本的 HTML 标签。默认情况下，高亮文本会被 `<em>` 和 `</em>` 标签包裹。指定为字符串数组。

- `require_field_match`

  默认情况下，只高亮包含查询匹配的字段。将 `require_field_match` 设为 `false` 可以高亮所有字段。默认为 `true`。

- `max_analyzed_offset`

  默认情况下，高亮请求分析的最大字符数受 `index.highlight.max_analyzed_offset` 设置限制，超过该限制会返回错误。如果将此查询参数设置为正值，高亮会在该上限处停止，其余文本不处理、不高亮，且不返回错误。如果设置为 `-1`，则使用 `index.highlight.max_analyzed_offset` 的值。小于 `-1` 或为 `0` 时会返回错误。此查询设置不会覆盖比它更低（更保守）的 `index.highlight.max_analyzed_offset`。

- `tags_schema`

  设置为 `styled` 以使用内置标签 schema。`styled` schema 定义以下 `pre_tags`，并将 `post_tags` 定义为 `</em>`：

  ```text
  <em class="hlt1">, <em class="hlt2">, <em class="hlt3">,
  <em class="hlt4">, <em class="hlt5">, <em class="hlt6">,
  <em class="hlt7">, <em class="hlt8">, <em class="hlt9">,
  <em class="hlt10">
  ```

- `type`

  使用的高亮器：`unified`、`plain` 或 `fvh`。默认为 `unified`。

## 高亮示例

### 覆盖全局设置

可以全局指定高亮器设置，并为个别字段选择性地覆盖：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "number_of_fragments" : 3,
    "fragment_size" : 150,
    "fields" : {
      "body" : { "pre_tags" : ["<em>"], "post_tags" : ["</em>"] },
      "blog.title" : { "number_of_fragments" : 0 },
      "blog.author" : { "number_of_fragments" : 0 },
      "blog.comment" : { "number_of_fragments" : 5, "order" : "score" }
    }
  }
}
```

### 指定高亮查询

可以指定 `highlight_query`，在高亮时考虑额外信息。例如，以下查询在 `highlight_query` 中同时包含了搜索查询和 rescore 查询。如果没有 `highlight_query`，高亮只会考虑搜索查询：

```bash
GET /_search
{
  "query": {
    "match": {
      "comment": {
        "query": "foo bar"
      }
    }
  },
  "rescore": {
    "window_size": 50,
    "query": {
      "rescore_query": {
        "match_phrase": {
          "comment": {
            "query": "foo bar",
            "slop": 1
          }
        }
      },
      "rescore_query_weight": 10
    }
  },
  "_source": false,
  "highlight": {
    "order": "score",
    "fields": {
      "comment": {
        "fragment_size": 150,
        "number_of_fragments": 3,
        "highlight_query": {
          "bool": {
            "must": {
              "match": {
                "comment": {
                  "query": "foo bar"
                }
              }
            },
            "should": {
              "match_phrase": {
                "comment": {
                  "query": "foo bar",
                  "slop": 1,
                  "boost": 10.0
                }
              }
            },
            "minimum_should_match": 0
          }
        }
      }
    }
  }
}
```

### 设置高亮器类型

`type` 字段允许强制使用特定的高亮器类型。可用值为 `unified`、`plain` 和 `fvh`。以下示例强制使用 plain 高亮器：

```bash
GET /_search
{
  "query": {
    "match": { "user.id": "kimchy" }
  },
  "highlight": {
    "fields": {
      "comment": { "type": "plain" }
    }
  }
}
```

### 配置高亮标签

默认情况下，高亮文本会被 `<em>` 和 `</em>` 包裹。可以通过设置 `pre_tags` 和 `post_tags` 控制，例如：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "pre_tags" : ["<tag1>"],
    "post_tags" : ["</tag1>"],
    "fields" : {
      "body" : {}
    }
  }
}
```

使用 fast vector 高亮器时，可以指定额外标签，且“重要性”按顺序排列：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "pre_tags" : ["<tag1>", "<tag2>"],
    "post_tags" : ["</tag1>", "</tag2>"],
    "fields" : {
      "body" : {}
    }
  }
}
```

也可以使用内置的 styled 标签 schema：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "tags_schema" : "styled",
    "fields" : {
      "comment" : {}
    }
  }
}
```

### 高亮所有字段

默认情况下，只高亮包含查询匹配的字段。将 `require_field_match` 设为 `false` 可以高亮所有字段：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "require_field_match": false,
    "fields" : {
      "body" : { "pre_tags" : ["<em>"], "post_tags" : ["</em>"] }
    }
  }
}
```

### 合并多个字段上的匹配

支持 unified 和 fvh 高亮器。它们可以合并多个字段上的匹配来高亮单个字段，这对以不同方式分析同一字符串的 multifield 最直观。

在以下 unified 高亮器示例中，`comment` 由 standard 分析器分析，`comment.english` 由 english 分析器分析：

```bash
PUT index1
{
  "mappings": {
    "properties": {
      "comment": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "english": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}

PUT index1/_bulk?refresh=true
{"index": {"_id": "doc1" }}
{"comment": "run with scissors"}
{ "index" : {"_id": "doc2"} }
{"comment": "running with scissors"}
```

以下请求同时匹配 `run with scissors` 和 `running with scissors`，会高亮 `running` 和 `scissors`，但不会高亮 `run`：

```bash
GET index1/_search
{
  "query": {
    "query_string": {
      "query": "running with scissors",
      "fields": ["comment", "comment.english"]
    }
  },
  "highlight": {
    "order": "score",
    "fields": {
      "comment": {}
    }
  }
}
```

响应中 `doc2` 的高亮为 `"<em>running</em> <em>with</em> <em>scissors</em>"`，`doc1` 的高亮为 `"run <em>with</em> <em>scissors</em>"`。如果两个短语都出现在大文档中，`running with scissors` 会因匹配更多而排在 `run with scissors` 前面。

以下请求会同时高亮 `run`、`running` 和 `scissors`，因为 `matched_fields` 参数指示高亮时合并 `comment.english` 字段与原始 `comment` 字段的匹配：

```bash
GET index1/_search
{
  "query": {
    "query_string": {
      "query": "running with scissors",
      "fields": ["comment", "comment.english"]
    }
  },
  "highlight": {
    "order": "score",
    "fields": {
      "comment": {
        "matched_fields": ["comment.english"]
      }
    }
  }
}
```

对于 fvh 高亮器，`matched_fields` 数组可以包含原始字段，且所有匹配字段都必须将 `term_vector` 设置为 `with_positions_offsets`。

设置 `matched_fields` 为非空数组会有少量开销，因此总是优先使用：

```json
"highlight": {
  "fields": {
    "comment": {}
  }
}
```

而不是：

```json
"highlight": {
  "fields": {
    "comment": {
      "matched_fields": ["comment"],
      "type" : "fvh"
    }
  }
}
```

从技术上讲，也可以向 `matched_fields` 添加与合并目标字段不共享同一底层字符串的字段，但结果可能没有意义；如果某个匹配超出了文本末尾，整个查询都会失败。

### 显式指定高亮字段的顺序

Elasticsearch 会按照字段发送的顺序进行高亮，但根据 JSON 规范，对象是无序的。如果需要显式指定字段高亮的顺序，请将字段指定为数组：

```bash
GET /_search
{
  "highlight": {
    "fields": [
      { "title": {} },
      { "text": {} }
    ]
  }
}
```

Elasticsearch 内置的高亮器都不关心字段高亮的顺序，但插件可能会。

### 控制高亮片段

每个被高亮的字段都可以控制高亮片段的字符大小（默认 `100`）和返回的最大片段数（默认 `5`）：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "fields" : {
      "comment" : {"fragment_size" : 150, "number_of_fragments" : 3}
    }
  }
}
```

还可以指定按分数对高亮片段排序：

```bash
GET /_search
{
  "query" : {
    "match": { "user.id": "kimchy" }
  },
  "highlight" : {
    "order" : "score",
    "fields" : {
      "comment" : {"fragment_size" : 150, "number_of_fragments" : 3}
    }
  }
}
```

如果 `number_of_fragments` 设为 `0`，则不产生片段，而是返回整个字段内容（当然是高亮过的）。这非常适合高亮文档标题或地址等短文本而不需要分片的场景。注意此时 `fragment_size` 会被忽略。

当使用 fvh 时，可以使用 `fragment_offset` 参数控制开始高亮的边距。

如果没有可高亮的匹配片段，默认不返回任何内容。此时可以将 `no_match_size`（默认 `0`）设置为希望返回的文本长度，从而返回字段开头的一段文本。实际长度可能比指定值更短或更长，因为它会尽量在单词边界处截断：

```bash
GET /_search
{
  "query": {
    "match": { "user.id": "kimchy" }
  },
  "highlight": {
    "fields": {
      "comment": {
        "fragment_size": 150,
        "number_of_fragments": 3,
        "no_match_size": 150
      }
    }
  }
}
```

### 使用 postings 列表高亮

以下示例在索引 mapping 中设置 `comment` 字段以允许使用 postings 高亮：

```bash
PUT /example
{
  "mappings": {
    "properties": {
      "comment" : {
        "type": "text",
        "index_options" : "offsets"
      }
    }
  }
}
```

以下示例设置 `comment` 字段以允许使用 term_vectors 高亮（这会增大索引体积）：

```bash
PUT /example
{
  "mappings": {
    "properties": {
      "comment" : {
        "type": "text",
        "term_vector" : "with_positions_offsets"
      }
    }
  }
}
```

### 为 plain 高亮器指定 fragmenter

使用 plain 高亮器时，可以在 `simple` 和 `span` fragmenter 之间选择：

```bash
GET my-index-000001/_search
{
  "query": {
    "match_phrase": { "message": "number 1" }
  },
  "highlight": {
    "fields": {
      "message": {
        "type": "plain",
        "fragment_size": 15,
        "number_of_fragments": 3,
        "fragmenter": "simple"
      }
    }
  }
}
```

`fragmenter: simple` 的响应片段可能在不理想的位置断开：

```json
{
  "highlight": {
    "message": [
      " with the <em>number</em>",
      " <em>1</em>"
    ]
  }
}
```

而 `fragmenter: span` 会尽量避免在高亮词项之间拆分：

```bash
GET my-index-000001/_search
{
  "query": {
    "match_phrase": { "message": "number 1" }
  },
  "highlight": {
    "fields": {
      "message": {
        "type": "plain",
        "fragment_size": 15,
        "number_of_fragments": 3,
        "fragmenter": "span"
      }
    }
  }
}
```

响应片段为：

```json
{
  "highlight": {
    "message": [
      " with the <em>number</em> <em>1</em>"
    ]
  }
}
```

如果 `number_of_fragments` 设为 `0`，会使用不进行任何分片的 NullFragmenter。这对于高亮文档或字段的全部内容很有用。

## 高亮器的内部工作原理

给定一个查询和一段文本（文档字段的内容），高亮器的目标是为该查询找到最佳文本片段，并在找到的片段中高亮查询词项。为此，高亮器需要解决几个问题：如何将文本拆分为片段？如何在所有片段中找到最佳片段？如何在片段中高亮查询词项？

### 如何将文本拆分为片段？

相关设置：`fragment_size`、`fragmenter`、高亮器类型、`boundary_chars`、`boundary_max_scan`、`boundary_scanner`、`boundary_scanner_locale`。

plain 高亮器先使用给定的分析器分析文本并创建词元流，然后用非常简单的算法将词元流拆分为片段：遍历词元流中的词项，每当当前词项的 `end_offset` 超过 `fragment_size` 乘以已创建片段数时，就创建一个新片段。使用 span fragmenter 时会多做一点计算以避免在高亮词项之间拆分文本。总体而言，由于拆分仅由 `fragment_size` 决定，某些片段可能比较怪异，例如以标点符号开头。

unified 或 fvh 高亮器利用 Java 的 BreakIterator 更好地将文本拆分为片段，只要 `fragment_size` 允许，就能保证片段是完整的句子。

### 如何找到最佳片段？

相关设置：`number_of_fragments`。

要找到最佳、最相关的片段，高亮器需要根据给定查询对每个片段打分。目标是只对参与生成该文档命中的词项打分。

plain 高亮器从当前词元流创建内存索引，并通过 Lucene 的查询执行计划器重新运行原始查询条件，以获取当前文本的底层匹配信息。对于较复杂的查询，原始查询可能被转换为 span 查询，因为 span 查询能更准确地处理短语。然后使用获得的底层匹配信息对每个片段打分。plain 高亮器的打分方法很简单：每个片段的分数是其中找到的唯一查询词项数量，每个词项的分数等于其 boost 值（默认为 1）。因此默认情况下，包含一个唯一查询词项的片段得分为 1，包含两个的得分为 2，以此类推。片段随后按分数排序，得分最高的片段先输出。

fvh 不需要分析文本并构建内存索引，它使用预先索引的文档 term vectors，并从中找到与查询对应的词项。fvh 按片段中找到的查询词项数量打分。与 plain 高亮器类似，每个词项的分数等于其 boost 值；不同之处在于 fvH 计数所有查询词项，而不仅是唯一词项。

unified 高亮器可以使用预先索引的 term vectors 或预先索引的词项 offsets（如果可用）；否则，与 plain 高亮器类似，它必须从文本创建内存索引。unified 高亮器使用 BM25 打分模型为片段打分。

### 如何在片段中高亮查询词项？

相关设置：`pre_tags`、`post_tags`。

目标是只高亮参与生成该文档命中的词项。对于某些复杂布尔查询，这仍在改进中，因为高亮器不反映查询的布尔逻辑，只提取叶子查询（词项、短语、前缀等）。

plain 高亮器根据词元流和原始文本重新组合原始文本，只高亮词元流中包含在上一步底层匹配信息结构中的词项。

fvh 和 unified 高亮器使用中间数据结构以原始形式表示片段，然后用实际文本填充。

高亮器使用 `pre_tags` 和 `post_tags` 对高亮的词项进行编码。

### unified 高亮器工作示例

首先创建一个带有 text 字段 `content` 的索引，该字段使用 english 分析器索引，且不索引 offsets 或 term vectors：

```bash
PUT test_index
{
  "mappings": {
    "properties": {
      "content": {
        "type": "text",
        "analyzer": "english"
      }
    }
  }
}

PUT test_index/_doc/doc1
{
  "content" : "For you I'm only a fox like a hundred thousand other foxes. But if you tame me, we'll need each other. You'll be the only boy in the world for me. I'll be the only fox in the world for you."
}
```

运行以下带高亮请求的查询：

```bash
GET test_index/_search
{
  "query": {
    "match_phrase" : {"content" : "only fox"}
  },
  "highlight": {
    "type" : "unified",
    "number_of_fragments" : 3,
    "fields": {
      "content": {}
    }
  }
}
```

当 doc1 被找到作为该查询的命中后，该命中会被传递给 unified 高亮器以高亮文档的 `content` 字段。由于 `content` 字段没有以 offsets 或 term vectors 索引，其原始字段值会被分析，并根据与查询匹配的词项构建内存索引：

```text
{"token":"onli","start_offset":12,"end_offset":16,"position":3},
{"token":"fox","start_offset":19,"end_offset":22,"position":5},
{"token":"fox","start_offset":53,"end_offset":58,"position":11},
{"token":"onli","start_offset":117,"end_offset":121,"position":24},
{"token":"onli","start_offset":159,"end_offset":163,"position":34},
{"token":"fox","start_offset":164,"end_offset":167,"position":35}
```

复杂短语查询会被转换为 span 查询 `spanNear([text:onli, text:fox], 0, true)`，即在给定顺序下查找相距 0 的词项 `onli` 和 `fox`。该 span 查询会在之前创建的内存索引上运行，找到以下匹配：

```text
{"term":"onli", "start_offset":159, "end_offset":163},
{"term":"fox", "start_offset":164, "end_offset":167}
```

在本例中只有一个匹配，但也可能有多个。根据匹配结果，unified 高亮器将字段文本拆分为所谓“段落”（passages）。每个段落必须包含至少一个匹配。unified 高亮器借助 Java 的 BreakIterator 确保每个段落都是完整的句子（只要不超过 `fragment_size`）。本例得到一个具有以下属性的段落（仅显示部分属性）：

```text
Passage:
    startOffset: 147
    endOffset: 189
    score: 3.7158387
    matchStarts: [159, 164]
    matchEnds: [163, 167]
    numMatches: 2
```

注意段落具有使用专为段落调整的 BM25 打分公式计算的分数。当可用段落数多于用户请求的 `number_of_fragments` 时，分数可用于选择得分最高的段落；如果用户请求，也可以按 `order: "score"` 排序。

最后，unified 高亮器会从字段文本中提取每个段落对应的字符串，并使用段落的 matchStarts 和 matchEnds 信息为字符串中的所有匹配加上 `<em>` 和 `</em>` 标签：

```text
I'll be the <em>only</em> <em>fox</em> in the world for you.
```

这种格式化的字符串就是高亮器返回给用户的最终结果。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/highlighting.html)
