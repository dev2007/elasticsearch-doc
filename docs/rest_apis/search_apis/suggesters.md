# 建议器

通过使用建议器，可基于提供的文本建议类似的词语。

```bash
POST my-index-000001/_search
{
  "query" : {
    "match": {
      "message": "tring out Elasticsearch"
    }
  },
  "suggest" : {
    "my-suggestion" : {
      "text" : "tring out Elasticsearch",
      "term" : {
        "field" : "message"
      }
    }
  }
}
```

## 请求

建议功能通过使用建议器，基于提供的文本建议类似的词语。建议请求部分与 `_search` 请求中的查询部分一起定义。如果省略了查询部分，则只返回建议。

## 示例

每个请求可以指定多个建议。每个建议都有一个任意的名称。在下面的例子中，需要两条建议。`my-suggest-1` 和 `my-suggest-2` 建议都使用 `term` 建议器，但不同于 `text`。

```bash
POST _search
{
  "suggest": {
    "my-suggest-1" : {
      "text" : "tring out Elasticsearch",
      "term" : {
        "field" : "message"
      }
    },
    "my-suggest-2" : {
      "text" : "kmichy",
      "term" : {
        "field" : "user.id"
      }
    }
  }
}
```

下面的建议响应示例包括 `my-suggest-1` 和 `my-suggest-2` 的建议响应。每个建议部分都包含条目。每个条目实际上是建议文本中的一个标记，包含建议条目文本、建议文本中的原始起始偏移量和长度，如果找到，还包含任意数量的选项。

```bash
{
  "_shards": ...
  "hits": ...
  "took": 2,
  "timed_out": false,
  "suggest": {
    "my-suggest-1": [ {
      "text": "tring",
      "offset": 0,
      "length": 5,
      "options": [ {"text": "trying", "score": 0.8, "freq": 1 } ]
    }, {
      "text": "out",
      "offset": 6,
      "length": 3,
      "options": []
    }, {
      "text": "elasticsearch",
      "offset": 10,
      "length": 13,
      "options": []
    } ],
    "my-suggest-2": ...
  }
}
```

每个选项数组都包含一个选项对象，其中包括建议文本、其文档频率以及与建议条目文本相比的分数。分数的意义取决于所用的建议词。术语建议者的分数基于编辑距离。

## 全局建议文本

为了避免重复建议文本，可以定义一个全局文本。在下面的示例中，建议文本是全局定义的，适用于 `my-suggest-1` 和 `my-suggest-2` 建议。

```bash
POST _search
{
  "suggest": {
    "text" : "tring out Elasticsearch",
    "my-suggest-1" : {
      "term" : {
        "field" : "message"
      }
    },
    "my-suggest-2" : {
       "term" : {
        "field" : "user"
       }
    }
  }
}
```

上述示例中的建议文本也可以指定为建议特定选项。建议级别上指定的建议文本将覆盖全局级别上的建议文本。

## 词语建议器

`term` 建议器根据编辑距离建议词语。在建议词语之前，先分析所提供的建议文本。建议条款根据分析的建议文本标记提供。`term` 建议器不考虑作为请求一部分的查询。

### 常见建议选项

|||
|--|--|
|`text`|建议文本。建议文本是一个必需选项，需要在全局范围内或根据建议进行设置。|
|`field`|获取候选人建议的字段。这是一个必需的选项，需要在全局范围内或根据建议进行设置。|
|`analyzer`|分析人员用以分析建议文本。默认为“建议”字段的搜索分析器。|
|`size`|每个建议文本标记返回的最大更正。|
|`sort`|定义每个建议文本项的建议排序方式。两个可能的值：`score`：首先按分数排序，然后记录频率，然后是术语本身。`frequency`：首先按文档频率排序，然后按相似度得分排序，然后按词语本身排序。|
|`suggest_mode`|建议模式控制包含哪些建议，或控制建议文本的内容、建议应被建议。可以指定三个可能的值：`missing`：仅为索引中没有的建议文本词语提供建议。这是默认设置。`popular`：仅建议出现在比原始建议文本词更多文档中的建议。`always`：根据建议文本中的词语提出任何匹配建议。|

### 其他词语建议选项

|||
|--|--|
|`max_edits`|候选建议可以具有的最大编辑距离可以被视为建议。只能是介于 1 和 2 之间的值。任何其他值都会导致抛出错误的请求错误。默认值为 2。|
|`prefix_length`|必须匹配的最小前缀字符数，才能作为建议的候选字符。默认值为 1。增加这个数字可以提高拼写检查性能。通常拼写错误不会发生在词语开头。|
|`min_word_length`|建议文本词语必须包含的最小长度。默认为 4。|
|`shard_size`|要从每个建议集检索的最大建议数。在收缩（reduce）阶段，根据 `size` 选项只返回前 N 个建议。默认为 `size` 选项。为了以性能为代价获得更准确的拼写更正文档频率，将该值设置为大于 `size` 值会很有用。由于词语是在分片之间划分的，分片级别的文档拼写更正频率可能不精确。增加该值将使这些文档频率更精确。|
|`max_inspections`|一个用于与 `shards_size` 相乘的因子，以便在分片级别检查更多候选拼写更正。可以以牺牲性能为代价提高准确性。默认为 5。|
|`min_doc_freq`|建议应出现在其中的文档数的最小阈值。这可以指定为绝对数，也可以指定为文档数的相对百分比。这可以通过建议高频项来提高质量。默认为 0f 且未启用。如果指定的值大于 1，则该数字不能是小数。分片级别的文档频率用于此选项。|
|`max_term_freq`|建议文本标记可以存在以包含在其中的文档数的最大阈值。可以是相对百分比（例如，0.4）或绝对数来表示文档频率。如果指定的值大于1，则不能指定分数。默认值为 0.01f。这可用于排除高频项——通常拼写正确的——避免被拼写检查。这也提高了拼写检查的性能。分片级别的文档频率用于此选项。|
|`string_distance`|使用哪个字符串距离实现来比较建议术语的相似程度。可以指定五个可能的值：`internal`：默认值基于damerau_levenshtein，但经过高度优化，用于比较索引内术语的字符串距离。`damerau_levenshtein`：基于 damerau levenshtein 算法的字符串距离算法。`levenshtein`：基于 levenshtein 编辑距离算法的字符串距离算法。`jaro_winkler`：基于 jaro winkler 算法的字符串距离算法。`ngram`：基于字符 n-grams 的字符串距离算法。|

## 短语建议器

`term` 建议器提供了一个非常方便的 API，可以在一定的字符串距离内以每个标记为基础访问单词替代项。API 允许单独访问流中的每个令牌，而建议选择留给 API 使用者。然而，通常需要预先选择的建议才能呈现给最终用户。`phrase` 建议器在 `term` 建议器的基础上添加了额外的逻辑，以选择完整的已更正短语，而不是基于 `ngram-language` 模型加权的单个标记。在实践中，这个建议器将能够根据共现和频率更好地决定选择哪些记号。

### API 示例

一般来说，`phrase` 建议器需要在工作前进行特殊映射。本页上的 `phrase` 提示示例需要以下映射才能工作。`reverse` 分析器仅在最后一个示例中使用。

```bash
PUT test
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "analysis": {
        "analyzer": {
          "trigram": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase","shingle"]
          },
          "reverse": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["lowercase","reverse"]
          }
        },
        "filter": {
          "shingle": {
            "type": "shingle",
            "min_shingle_size": 2,
            "max_shingle_size": 3
          }
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "trigram": {
            "type": "text",
            "analyzer": "trigram"
          },
          "reverse": {
            "type": "text",
            "analyzer": "reverse"
          }
        }
      }
    }
  }
}
POST test/_doc?refresh=true
{"title": "noble warriors"}
POST test/_doc?refresh=true
{"title": "nobel prize"}
```

一旦设置了分析器和映射，就可以在使用 `term` 建议器的同一位置使用 `phrase` 建议器：

```bash
POST test/_search
{
  "suggest": {
    "text": "noble prize",
    "simple_phrase": {
      "phrase": {
        "field": "title.trigram",
        "size": 1,
        "gram_size": 3,
        "direct_generator": [ {
          "field": "title.trigram",
          "suggest_mode": "always"
        } ],
        "highlight": {
          "pre_tag": "<em>",
          "post_tag": "</em>"
        }
      }
    }
  }
}
```

回复中包含的建议由最有可能的拼写更正者首先评分。在这种情况下，我们收到了预期的更正“nobel prize”。

```bash
{
  "_shards": ...
  "hits": ...
  "timed_out": false,
  "took": 3,
  "suggest": {
    "simple_phrase" : [
      {
        "text" : "noble prize",
        "offset" : 0,
        "length" : 11,
        "options" : [ {
          "text" : "nobel prize",
          "highlighted": "<em>nobel</em> prize",
          "score" : 0.48614594
        }]
      }
    ]
  }
}
```

### 基本短语建议 API 参数

|||
|--|--|
|`field`|用于对语言模型进行 n-gram 查找的字段的名称，建议者将使用此字段获取统计信息以对更正进行评分。此字段为必填字段。|
|`gram_size`|设置 `field` 中 n-grams（shingle）的最大大小。如果该字段不包含 n-grams（shingle），则应忽略该字段或将其设置为 `1`。请注意，Elasticsearch 尝试根据指定 `field` 检测 gram 大小。如果该字段使用 `shingle` 过滤器，如果未明确设置，则将 `gram_size` 设置为 `max_shingle_size`。|
|`real_word_error_likelihood`|即使词典中存在某个词语，该词语拼写错误的可能性。默认值为 `0.95`，这意味着 5% 的真实单词拼写错误。|
|`confidence`|置信度定义了一个应用于输入短语得分的因子，该因子用作其他推荐候选词的阈值。只有得分高于阈值的候选人才会被纳入结果。例如，置信度为 `1.0` 只会返回得分高于输入短语的建议。如果设置为 `0.0`，则返回前 N 名候选项。默认值为 `1.0`。|
|`max_errors`|为了形成更正，被认为拼写错误的术语的最大百分比。此方法接受范围内的浮点值 `[0..1）`作为实际查询词的一小部分，或一个 `>=1` 的数字作为查询词的绝对数。默认值设置为 `1.0`，这意味着只返回最多一个拼写错误的词的更正。请注意，设置得太高可能会对性能产生负面影响。建议使用 `1` 或 `2` 这样的小值，否则将花费时间在建议调用中可能超过查询执行所花费的时间。|
|`separator`|用于分隔双字符字段中的术语的分隔符。如果未设置，则空格字符用作分隔符。|
|`size`|为每个查询项生成的候选项数。`3` 或 `5` 这样的小数字通常会产生好的结果。提高这个值可以带来编辑距离更大的术语。默认值为 `5`。|
|`analyzer`|将要分析的分析器设置为使用建议文本。默认为通过 `field` 传递的建议字段的搜索分析器。|
|`shard_size`|设置从每个碎片中检索的建议术语的最大数量。在收缩（reduce）阶段，根据 `size` 选项只返回前 N 个建议。默认值为 `5`。|
|`text`|设置要为其提供建议的文本/查询。|
|`highlight`|设置建议高亮。如果未提供，则不会返回 `highlighted` 字段。如果提供，则必须准确地包含 `pre_tag` 和 `post_tag`，这两个包裹在已更改的标记（token）周围。如果一行中有多个标记被更改，那么更改的标记的整个短语将被包装，而不是每个标记。|
|`collate`|根据指定的 `query` 检查每个建议，以删除索引中不存在匹配文档的建议。建议的collate查询仅在从中生成建议的本地分片上运行。必须指定 `query`，并且可以对其进行模板化。参阅[搜索模板](/search_your_data/search_templates)。当前建议将自动作为 `{{suggestion}}` 变量提供，该变量应在查询中使用。你仍然可以指定自己的模板 `params` — `suggestion` 值将添加到你指定的变量中。此外，你可以指定一个 `prune` 来控制是否返回所有短语建议；当设置为 `true` 时，建议将有一个附加选项 `collate_match`，如果找到匹配短语的文档，则该选项为 `true`，否则为 `false`。`prune` 的默认值为 `false`。|

```bash
POST test/_search
{
  "suggest": {
    "text" : "noble prize",
    "simple_phrase" : {
      "phrase" : {
        "field" :  "title.trigram",
        "size" :   1,
        "direct_generator" : [ {
          "field" :            "title.trigram",
          "suggest_mode" :     "always",
          "min_word_length" :  1
        } ],
        "collate": {
          "query": {
            "source" : {
              "match": {
                "{{field_name}}" : "{{suggestion}}"
              }
            }
          },
          "params": {"field_name" : "title"},
          "prune": true
        }
      }
    }
  }
}
```

1. `"query"`：此查询将针对每个建议运行一次。
2. `"{{field_name}}" : "{{suggestion}}"`：`{{suggestion}}` 变量将被每个建议的文本替换。
3. `"params": {"field_name" : "title"}`：`params` 中指定了一个额外的 `field_name` 变量，用于 `match` 查询。
4. `"prune": true`：所有建议都将返回一个额外的 `collate_match` 选项，指示生成的短语是否与任何文档匹配。

### 平滑模型

`phrase` 建议器支持多个平滑模型来平衡不频繁的 grams（grams（shingles）在索引中不存在）和频繁 grams（在索引中至少出现一次）之间的权重。通过将 `smoothing` 参数设置为以下选项之一，可以选择平滑模型。每个平滑模型都支持可以配置的特定属性。

|||
|--|--|
|`stupid_backoff`|一个简单的退避模型，如果高阶计数为 `0`，则退避到低阶 n-gram 模型，并通过常数因子对低阶 n-gram 模型进行低估。默认折扣为 `0.4`Stupid Backoff 是默认模式。|
|`laplace`|一种使用加法平滑的平滑模型，其中向所有计数添加一个常数（通常为 `1.0` 或更小）以平衡权重。默认 `alpha` 为 `0.5`。|
|`linear_interpolation`|一种平滑模型，根据用户提供的权重（lambdas），对单图、双图和三联图进行加权平均。线性插值没有任何默认值。必须提供所有参数（`trigram_lambda`、`bigram_lambda`、`unigram_lambda`）。|

```bash
POST test/_search
{
  "suggest": {
    "text" : "obel prize",
    "simple_phrase" : {
      "phrase" : {
        "field" : "title.trigram",
        "size" : 1,
        "smoothing" : {
          "laplace" : {
            "alpha" : 0.7
          }
        }
      }
    }
  }
}
```

### 候选生成器

`phrase` 建议器使用候选生成器生成给定文本中每个词语的可能词语列表。单个候选生成器类似于为文本中的每个词语调用的 `term` 建议器。生成器的输出随后与建议候选项的其他词语中的候选项一起评分。

目前只支持一种类型的候选生成器，即 `direct_generator`。短语建议 API 接受键 `direct_generator` 下的生成器列表；在原始文本中，列表中的每个生成器都是按词语调用的。

### 直接生成器

直接生成器支持以下参数：

|||
|--|--|
|`field`|获取候选建议的字段。这是一个必需的选项，需要在全局范围内或根据建议进行设置。|
|`size`|每个建议文本标记返回的最大更正。|
|`suggest_mode`|建议模式控制在每个碎片上生成的建议中包含哪些建议。除了 `always` 之外的所有值都可以被认为是一种优化，以在每个分片上生成较少的建议进行测试，并且在组合在每个碎片上生成的建议时不会重新检查。因此，`missing` 将为不包含它们的分片上的术语生成建议，即使其他分片确实包含它们。这些应该用 `confidence` 过滤掉。可以指定三个可能的值：`missing`：仅为不在碎片中的术语生成建议。这是默认设置。`popular`：只建议出现在比原始术语更多的文档中的术语。`always`：根据建议文本中的术语提出任何匹配建议。|
|`max_edits`|候选建议可以具有的最大编辑距离可以被视为建议。只能是介于 1 和 2 之间的值。任何其他值都会导致抛出错误的请求错误。默认值为 2。|
|`prefix_length`|必须匹配的最小前缀字符数才能成为候选字符。默认值为 1。增加这个数字可以提高拼写检查性能。通常拼写错误不会发生在词语开始时。|
|`min_word_length`|建议文本词语必须包含的最小长度。默认为 4。|
|`max_inspections`|一个用于与碎片大小相乘的因子，以便在碎片级别检查更多候选拼写更正。可以以牺牲性能为代价提高准确性。默认值为5。|
|`min_doc_freq`|建议应出现在其中的文档数的最小阈值。这可以指定为绝对数，也可以指定为文档数的相对百分比。这可以通过建议高频项来提高质量。默认为 0f 且未启用。如果指定的值大于 1，则该数字不能是小数。分片级别的文档频率用于此选项。|
|`max_term_freq`|建议文本标记可以存在以包含在其中的文档数的最大阈值。可以是相对百分比（例如，0.4）或绝对数来表示文档频率。如果指定的值大于1，则不能指定分数。默认值为 0.01f。这可用于排除高频项——通常拼写正确——避免被拼写检查。这也提高了拼写检查的性能。分片级别的文档频率用于此选项。|
|`pre_filter`|应用于传递到此候选生成器的每个标识的筛选器（分析器）。在生成候选标识之前，此筛选器将应用于原始标识。|
|`post_filter`|一个过滤器（分析器），在传递给实际短语记分器之前应用于每个生成的标记。|

下面的示例显示了一个带有两个生成器的短语建议调用：第一个使用包含普通索引项的字段，第二个使用使用反向过滤器索引的项的字段（标记按反向顺序索引）。这是用来克服直接生成器需要恒定前缀以提供高性能建议的限制。`pre_filter` 和 `post_filter` 选项接受普通的分析器名称。

```bash
POST test/_search
{
  "suggest": {
    "text" : "obel prize",
    "simple_phrase" : {
      "phrase" : {
        "field" : "title.trigram",
        "size" : 1,
        "direct_generator" : [ {
          "field" : "title.trigram",
          "suggest_mode" : "always"
        }, {
          "field" : "title.reverse",
          "suggest_mode" : "always",
          "pre_filter" : "reverse",
          "post_filter" : "reverse"
        } ]
      }
    }
  }
}
```

`pre_filter` 和 `post_filter` 也可用于在生成候选词后注入同义词。例如，对于 `captain usq` 查询，我们可能会为词语 `usq` 生成一个候选 `usa`，`usq` 是 `america` 的同义词。如果这个短语得分足够高，我们就可以向用户展示 `captain america`。

## 完成建议器

`completion` 建议器提供键入时自动完成/搜索功能。这是一种导航功能，可以在用户键入相关结果时引导用户，从而提高搜索精度。它不是为了拼写纠正，或者你指的是像 `term` 或 `phrase` 提示器这样的功能。

理想情况下，自动完成功能应该与用户键入的内容一样快，以提供与用户已键入内容相关的即时反馈。因此，`completion` 建议器针对速度进行了优化。建议器使用能够快速查找的数据结构，但构建成本很高，且存储在内存中。

### 映射

要使用此功能，请为此字段指定一个特殊映射，该映射为字段值建立索引，以便快速完成。

```bash
PUT music
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion"
      },
      "title": {
        "type": "keyword"
      }
    }
  }
}
```

映射支持以下参数：

|||
|--|--|
|`analyzer`|将使用的索引分析器，默认为 `simple`。|
|`search_analyzer`|将使用的搜索分析器，默认值为 `analyzer`。|
|`preserve_separators`|保留分隔符，默认为 `true`。如果禁用，假如你建议使用 `foof`，你可能会找到一个以 `Foo Fighters` 开头的字段。|
|`preserve_position_increments`|启用位置增量，默认为 `true`。如果禁用并使用 stopwords analyzer，你可以得到一个以 `The Beatles` 开始的字段，如果你建议使用 `b`。注意：你也可以通过索引两个输入，`Beatles` 和 `The Beatles` 来实现这一点，如果你能够丰富你的数据，无需更改一个简单的分析器。|
|`max_input_length`|限制单个输入的长度，默认为 `50` 个UTF-16代码点。此限制仅在索引时用于减少每个输入字符串的字符总数，以防止大量输入导致底层数据结构膨胀。大多数用例不会受到默认值的影响，因为前缀补全很少超出前缀长度超过少数字符。|

### 索引

你可以像其他领域一样索引建议。建议由输入和可选的权重属性组成。输入是建议查询所匹配的预期文本，权重决定建议的评分方式。建议如下：

```bash
PUT music/_doc/1?refresh
{
  "suggest" : {
    "input": [ "Nevermind", "Nirvana" ],
    "weight" : 34
  }
}
```

支持以下参数：

|||
|--|--|
|`input`|要存储的输入，可以是字符串数组，也可以只是字符串。此字段为必填字段。**注意** 此值不能包含以下UTF-16控制字符：`\u0000`（空） `\u001f`（信息分隔符一） `\u001e`（信息分隔符二）|
|`weight`|一个正整数或一个包含正整数的字符串，用于定义权重并允许你对建议进行排序。此字段是可选的。|

你可以为一个文档的多个建议编制索引，如下所示：

```bash
PUT music/_doc/1?refresh
{
  "suggest": [
    {
      "input": "Nevermind",
      "weight": 10
    },
    {
      "input": "Nirvana",
      "weight": 3
    }
  ]
}
```

你可以使用下面的速记形式。请注意，你不能以速记形式指定带有建议的权重。

```bash
PUT music/_doc/1?refresh
{
  "suggest" : [ "Nevermind", "Nirvana" ]
}
```

### 查询

```bash
POST music/_search?pretty
{
  "suggest": {
    "song-suggest": {
      "prefix": "nir",
      "completion": {
          "field": "suggest"  
      }
    }
  }
}
```

1. `"prefix": "nir"`：用于搜索建议的前缀
2. `"completion"`：建议类型
3. `"field": "suggest"` ：在其中搜索建议的字段名称

返回以下响应：

```bash
{
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits": ...
  "took": 2,
  "timed_out": false,
  "suggest": {
    "song-suggest" : [ {
      "text" : "nir",
      "offset" : 0,
      "length" : 3,
      "options" : [ {
        "text" : "Nirvana",
        "_index": "music",
        "_id": "1",
        "_score": 1.0,
        "_source": {
          "suggest": ["Nevermind", "Nirvana"]
        }
      } ]
    } ]
  }
}
```

::: danger 警告
`_source` 源元数据字段必须启用（这是默认行为），才能使用建议返回 `_source`。
:::

建议的配置权重作为 `_source` 返回。`text` 字段使用索引建议的 `input`。默认情况下，建议返回完整的文档 `_source`。由于磁盘提取和网络传输开销，`_source` 的大小可能会影响性能。为了节省一些网络开销，请使用[源过滤](/search_your_data/retrieve_selected_fields#_source-选项)从 `_source` 中筛选出不必要的字段，以最小化 `_source` 的大小。请注意 `_suggest` 端点不支持源过滤，但在 `_search` 端点上可以使用建议：

```bash
POST music/_search
{
  "_source": "suggest",
  "suggest": {
    "song-suggest": {
      "prefix": "nir",
      "completion": {
        "field": "suggest",
        "size": 5
      }
    }
  }
}
```

1. `"_source": "suggest"`：过滤源以仅返回 `suggest` 字段
2. `"field": "suggest"`：要在其中搜索建议的字段的名称
3. `"size": 5`：要返回的建议数

结果类似如下：

```bash
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 0,
      "relation": "eq"
    },
    "max_score": null,
    "hits": []
  },
  "suggest": {
    "song-suggest": [ {
        "text": "nir",
        "offset": 0,
        "length": 3,
        "options": [ {
            "text": "Nirvana",
            "_index": "music",
            "_id": "1",
            "_score": 1.0,
            "_source": {
              "suggest": [ "Nevermind", "Nirvana" ]
            }
          } ]
      } ]
  }
}
```

基本完成建议查询支持以下参数：

|||
|--|--|
|`field`|要在其上运行查询的字段的名称（必填）。|
|`size`|要返回的建议数（默认为 `5`）。|
|`skip_duplicates`|是否应过滤重复建议（默认为 `false`）。|

::: tip 提示
完成建议器考虑索引中的所有文档。有关如何查询文档子集的说明，参阅[上下文建议器](/rest_apis/search_apis/suggeters#上下文建议器)。
:::

::: tip 提示
如果完成查询跨越多个分片，建议分两个阶段执行，其中最后一个阶段从分片获取相关文档，这意味着针对单个分片执行完成请求的性能更高，因为当建议跨越多个分片时，文档获取开销更大。为了获得最佳的完成性能，建议将完成索引到单个分片索引中。如果由于分片大小导致堆使用率较高，仍然建议将索引拆分为多个分片，而不是优化完成性能。
:::

### 跳过重复的建议

查询可以返回来自不同文档的重复建议。可以通过将 `skip_duplicates` 设置为 `true` 来修改此行为。设置后，此选项会从结果中过滤出包含重复建议的文档。

```bash
POST music/_search?pretty
{
  "suggest": {
    "song-suggest": {
      "prefix": "nor",
      "completion": {
        "field": "suggest",
        "skip_duplicates": true
      }
    }
  }
}
```

::: danger 警告
当设置为 `true` 时，此选项会减慢搜索速度，因为需要访问更多建议才能找到前 N 个。
:::

### 模糊查询

完成建议器还支持模糊查询——这意味着你可以在搜索中输错，但仍然可以获得返回结果。

```bash
POST music/_search?pretty
{
  "suggest": {
    "song-suggest": {
      "prefix": "nor",
      "completion": {
        "field": "suggest",
        "fuzzy": {
          "fuzziness": 2
        }
      }
    }
  }
}
```

与查询 `prefix` 共享最长前缀的建议将获得更高的分数。

模糊查询可以采用特定的模糊参数。支持以下参数：

|||
|--|--|
|`fuzziness`|模糊因子默认为 `auto`。有关允许的设置，参阅[模糊性](/rest_apis/common_options#模糊性)。|
|`transpositions`|如果设置为 `true`，则换位计算为一次更改，而不是两次，默认为 `true`|
|`min_length`|返回模糊建议前输入的最小长度，默认值为 `3`|
|`prefix_length`|输入的最小长度默认为 `1`，不检查模糊选项|
|`unicode_aware`|如果为 `true`，则所有度量（如模糊编辑距离、换位和长度）都以 Unicode 码点而不是字节来度量。这比原始字节稍慢，因此默认设置为 `false`。|

::: tip 提示
如果你想坚持使用默认值，但仍然使用fuzzy，可以使用 `fuzzy:{}` 或 `fuzzy:true`。
:::

### 正则查询

完成建议器还支持正则表达式查询，这意味着你可以将前缀表示为正则表达式。

```bash
POST music/_search?pretty
{
  "suggest": {
    "song-suggest": {
      "regex": "n[ever|i]r",
      "completion": {
        "field": "suggest"
      }
    }
  }
}
```

正则查询可以采用特定的正则参数。支持以下参数：

|||
|--|--|
|`flags`|可能的标志有 `ALL`（默认）、`ANYSTRING`、`COMPLEMENT`、`EMPTY`、`INTERSECTION`、`INTERVAL` 或 `NONE`。参阅[正则表达式语法](/query_dsl/term-level_queries/regexp)了解其含义|
|`max_determinized_states`|正则表达式是危险的，因为它很容易意外地创建一个看起来无害的表达式，它需要大量内部确定的自动机状态（以及相应的 RAM 和 CPU）供 Lucene 执行。Lucene 使用 `max_determinized_states` 设置（默认值为 10000）防止这些情况发生。可以提高此限制，以允许执行更复杂的正则表达式。|

## 上下文建议器

完成建议器会考虑索引中的所有文档，但通常需要提供经过筛选和/或通过某些标准增强的建议。例如，你希望建议由某些艺术家筛选的歌曲标题，或者希望根据他们的流派增加歌曲标题。

要实现建议过滤和/或增强，可以在配置完成字段时添加上下文映射。可以为一个完成字段定义多个上下文映射。每个上下文映射都有一个唯一的名称和类型。有两种类型：`category` 和 `geo`。上下文映射在字段映射中的 `contexts` 参数下配置。

::: tip 提示
索引和查询启用上下文的完成字段时，必须提供上下文。
:::

::: tip 提示
允许的最大完成字段上下文映射数为 10。
:::

以下定义了类型，每个类型都有两个用于完成字段的上下文映射：

```bash
PUT place
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion",
        "contexts": [
          {
            "name": "place_type",
            "type": "category"
          },
          {
            "name": "location",
            "type": "geo",
            "precision": 4
          }
        ]
      }
    }
  }
}
```

1. `"type": "category"`： 定义一个名为 `place_type` 的 `category` 上下文，类别必须与建议一起发送。
2. `"type": "geo"`：定义一个名为 `location` 的 `geo` 上下文，类别必须与建议一起发送到该位置。

```bash
PUT place_path_category
{
  "mappings": {
    "properties": {
      "suggest": {
        "type": "completion",
        "contexts": [
          {
            "name": "place_type",
            "type": "category",
            "path": "cat"
          },
          {
            "name": "location",
            "type": "geo",
            "precision": 4,
            "path": "loc"
          }
        ]
      },
      "loc": {
        "type": "geo_point"
      }
    }
  }
}
```

1. `"type": "category"`：定义一个名为 `place_type` 的 `category` 上下文，从 `cat` 字段中读取类别。
2. `"type": "geo"`：定义一个名为 `location` 的 `geo` 上下文，从 `loc` 字段中读取类别。

::: tip 提示
添加上下文映射会增加完成字段的索引大小。完成索引完全驻留在堆中，你可以使用[索引统计](/rest_apis/index_apis/index_stats)信息监视完成字段索引大小。
:::

### 类别上下文

`category` 上下文允许你在索引时将一个或多个类别与建议关联。在查询时，建议可以通过其关联的类别进行过滤和增强。

映射的设置与上面的 `place_type` 字段类似。如果定义了 `path`，则从文档中的该路径读取类别，否则它们必须在建议字段中发送，如下所示：

```bash
PUT place/_doc/1
{
  "suggest": {
    "input": [ "timmy's", "starbucks", "dunkin donuts" ],
    "contexts": {
      "place_type": [ "cafe", "food" ]
    }
  }
}
```

1. `"place_type": [ "cafe", "food" ]`：这些建议将与 *cafe* 和 *food* 类别相关联。

如果映射有路径，那么以下索引请求就足以添加类别：

```bash
PUT place_path_category/_doc/1
{
  "suggest": ["timmy's", "starbucks", "dunkin donuts"],
  "cat": ["cafe", "food"]
}
```

1. `"cat": ["cafe", "food"]`： 这些建议将与 *cafe* 和 *food* 类别相关联。

::: tip 提示
如果上下文映射引用了另一个字段，并且对类别进行了显式索引，则建议将使用这两组类别进行索引。
:::

### 类别查询

建议可以按一个或多个类别过滤。以下按多个类别筛选建议：

```bash
POST place/_search?pretty
{
  "suggest": {
    "place_suggestion": {
      "prefix": "tim",
      "completion": {
        "field": "suggest",
        "size": 10,
        "contexts": {
          "place_type": [ "cafe", "restaurants" ]
        }
      }
    }
  }
}
```

::: tip 提示
如果在查询中设置了多个类别或类别上下文，它们将作为析取合并。这意味着，如果建议至少包含一个提供的上下文值，则建议匹配。
:::

某些类别的建议可以比其他类别的建议更高。以下内容按类别过滤建议，并进一步增强与某些类别相关的建议：

```bash
POST place/_search?pretty
{
  "suggest": {
    "place_suggestion": {
      "prefix": "tim",
      "completion": {
        "field": "suggest",
        "size": 10,
        "contexts": {
          "place_type": [
            { "context": "cafe" },
            { "context": "restaurants", "boost": 2 }
          ]
        }
      }
    }
  }
}
```

1. `"place_type"`：上下文查询过滤与类别咖啡馆和餐馆相关的建议，并将与餐馆相关的建议提高 2 倍

除了接受类别值外，上下文查询还可以由多个类别上下文子句组成。类别上下文子句支持以下参数：

|||
|--|--|
|`context`|要过滤/增强的类别的值。这是强制性的。|
|`boost`|建议得分的提升因子，通过将提升值乘以建议权重来计算得分，默认为 `1`|
|`prefix`|类别值是否应被视为前缀。例如，如果设置为 `true`，则可以通过指定 *type* 的类别前缀来过滤 *type1*、*type2* 等的类别。默认为 `false`|

::: tip 提示
如果一个建议条目匹配多个上下文，则最终分数将计算为任何匹配上下文产生的最大分数。
:::

### 地理位置上下文

`geo` 上下文允许你在索引时将一个或多个地理点或地理哈希与建议关联。在查询时，如果建议位于指定地理位置的特定距离内，则可以对其进行过滤和增强。

在内部，地理点被编码为具有指定精度的地理哈希。

#### 地理映射

除 `path` 设置外，`geo` 上下文映射还接受以下设置：

|||
|--|--|
|`precision`|这定义了要索引的地理哈希（geohash）的精度，可以指定为距离值（`5m`、`10km`等），也可以指定为原始地理哈希精度（`1`..`12`）。默认为原始地理哈希精度值 `6`。|

::: tip 提示
索引时间 `precision` 设置设置可在查询时使用的最大地理哈希精度。
:::

#### 索引地理上下文

 `geo` 上下文可以通过建议显式设置，或者通过 `path` 参数从文档中的地理点字段建立索引，类似于 `category` 上下文。将多个地理位置上下文与建议关联，将为每个地理位置的建议编制索引。以下索引包含两个地理位置上下文：

 ```bash
 PUT place/_doc/1
{
  "suggest": {
    "input": "timmy's",
    "contexts": {
      "location": [
        {
          "lat": 43.6624803,
          "lon": -79.3863353
        },
        {
          "lat": 43.6624718,
          "lon": -79.3873227
        }
      ]
    }
  }
}
```

### 地理位置查询

建议可以根据它们与一个或多个地理点的距离进行过滤和增强。以下过滤属于由地理点的编码地理哈希表示的区域内的建议：

```bash
POST place/_search
{
  "suggest": {
    "place_suggestion": {
      "prefix": "tim",
      "completion": {
        "field": "suggest",
        "size": 10,
        "contexts": {
          "location": {
            "lat": 43.662,
            "lon": -79.380
          }
        }
      }
    }
  }
}
```

::: tip 提示
当指定查询时精度较低的位置时，将考虑该区域内的所有建议。
:::

::: tip 提示
如果在查询中设置了多个类别或类别上下文，它们将作为析取合并。这意味着，如果建议至少包含一个提供的上下文值，则建议匹配。
:::

在地理哈希表示的区域内的建议也可以比其他建议更高，如下所示：

```bash
POST place/_search?pretty
{
  "suggest": {
    "place_suggestion": {
      "prefix": "tim",
      "completion": {
        "field": "suggest",
        "size": 10,
        "contexts": {
          "location": [
                      {
              "lat": 43.6624803,
              "lon": -79.3863353,
              "precision": 2
            },
            {
              "context": {
                "lat": 43.6624803,
                "lon": -79.3863353
              },
              "boost": 2
            }
          ]
        }
      }
    }
  }
}
```

1. `"location"`：上下文查询过滤属于地理哈希 *（43.662，-79.380）* 表示的地理位置的建议（精度为 *2*），并将属于地理哈希 *（43.6624803，-79.3863353）* 表示的建议（默认精度为 *6*）的建议提升 2 倍

::: tip 提示
如果一个建议条目匹配多个上下文，则最终分数将计算为任何匹配上下文产生的最大分数。
:::

除了接受上下文值之外，上下文查询还可以由多个上下文子句组成。`geo` 上下文子句支持以下参数：

|||
|--|--|
|`context`|用于过滤或增强建议的地理点对象或地理哈希字符串。这是强制性的。|
|`boost`|建议得分的提升因子，通过将提升值乘以建议权重来计算得分，默认为 1|
|`precision`|对查询地理点进行编码的地理哈希的精度。这可以指定为距离值（`5m`、`10km` 等），也可以指定为原始geohash精度（`1`..`12`）。默认为索引时间精度级别。|
|`neighbours`|接受一个精度值数组，在该数组中应考虑相邻的地理哈希。精度值可以是距离值（`5m`、`10km` 等）或原始geohash精度（1..12）。默认为生成索引时间精度级别的邻居。|

## 返回建议器类型

有时你需要知道建议者的确切类型，以便分析其结果。`typed_keys` 参数可用于更改响应中建议者的名称，以便以其类型作为前缀。

考虑以下两个建议 `term` 和 `phrase` 的示例：

```bash
POST _search?typed_keys
{
  "suggest": {
    "text" : "some test mssage",
    "my-first-suggester" : {
      "term" : {
        "field" : "message"
      }
    },
    "my-second-suggester" : {
      "phrase" : {
        "field" : "message"
      }
    }
  }
}
```

在回复中，建议者的名称将分别更改为 `term#my-first-suggester` 和 `phrase#my-second-suggester`，以反映每个建议的类型：

```bash
{
  "suggest": {
    "term#my-first-suggester": [ 
      {
        "text": "some",
        "offset": 0,
        "length": 4,
        "options": []
      },
      {
        "text": "test",
        "offset": 5,
        "length": 4,
        "options": []
      },
      {
        "text": "mssage",
        "offset": 10,
        "length": 6,
        "options": [
          {
            "text": "message",
            "score": 0.8333333,
            "freq": 4
          }
        ]
      }
    ],
    "phrase#my-second-suggester": [ 
      {
        "text": "some test mssage",
        "offset": 0,
        "length": 16,
        "options": [
          {
            "text": "some test message",
            "score": 0.030227963
          }
        ]
      }
    ]
  },
  ...
}
```

1. `"term#my-first-suggester"`：`my-first-suggester`的名字现在包含了 `term` 前缀。
2. `"phrase#my-second-suggester"`：`my-second-suggester` 的名字现在包含 `phrase` 前缀。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html)
