# Stop 词元过滤器

从词元流中移除停用词（stop words）。

未自定义时，该过滤器默认移除以下英语停用词：

```text
a, an, and, are, as, at, be, but, by, for, if, in, into, is, it, no, not, of, on, or, such, that, the, their, then, there, these, they, this, to, was, will, with
```

除英语外，stop 过滤器还支持多种语言的预定义停用词列表。你也可以将自定义停用词指定为数组或文件。

此过滤器使用 Lucene 的 StopFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 stop 过滤器，从文本 `a quick fox jumps over the lazy dog` 中移除停用词 `a` 和 `the`：

```bash
GET /_analyze
{
  "tokenizer": "standard",
  "filter": [ "stop" ],
  "text": "a quick fox jumps over the lazy dog"
}
```

该过滤器产生以下词元：

```text
[ quick, fox, jumps, over, lazy, dog ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 stop 过滤器配置一个新的自定义分析器：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "whitespace",
          "filter": [ "stop" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `stopwords`

  （可选，字符串或字符串数组）语言值（如 `_arabic_` 或 `_thai_`），默认为 `_english_`。每个语言值对应 Lucene 中的一个预定义停用词列表。

  此参数也接受自定义停用词数组。若要使用空停用词列表，请使用 `_none_`。

- `stopwords_path`

  （可选，字符串）指向包含待移除停用词列表的文件的路径。此路径必须是绝对路径，或相对于 `config` 位置的相对路径。文件必须为 UTF-8 编码，且每个停用词以换行符分隔。

- `ignore_case`

  （可选，布尔值）如果为 `true`，停用词匹配不区分大小写。例如，若停用词是 `the`，则会匹配并移除 `The`、`THE` 或 `the`。默认为 `false`。

- `remove_trailing`

  （可选，布尔值）如果为 `true`，当词元流的最后一个词元是停用词时，会将其移除。默认为 `true`。

  当此过滤器与 completion suggester 一起使用时，应设置为 `false`。这样可以确保类似 `green a` 的查询仍能匹配并建议 `green apple`，同时仍移除其他停用词。

## 自定义并添加到分析器

要自定义 stop 过滤器，请复制它以创建新自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建一个不区分大小写的自定义停用词过滤器，使用 `_english_` 停用词列表移除停用词：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "tokenizer": "whitespace",
          "filter": [ "my_custom_stop_words_filter" ]
        }
      },
      "filter": {
        "my_custom_stop_words_filter": {
          "type": "stop",
          "ignore_case": true
        }
      }
    }
  }
}
```

也可以指定自己的停用词列表。例如，以下请求创建一个不区分大小写的自定义停用词过滤器，仅移除停用词 `and`、`is` 和 `the`：

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "tokenizer": "whitespace",
          "filter": [ "my_custom_stop_words_filter" ]
        }
      },
      "filter": {
        "my_custom_stop_words_filter": {
          "type": "stop",
          "ignore_case": true,
          "stopwords": [ "and", "is", "the" ]
        }
      }
    }
  }
}
```

## 按语言划分的停用词

以下列表包含 `stopwords` 参数支持的语言值：

- `_arabic_` — 阿拉伯语停用词
- `_armenian_` — 亚美尼亚语停用词
- `_basque_` — 巴斯克语停用词
- `_bengali_` — 孟加拉语停用词
- `_brazilian_` — 巴西葡萄牙语停用词
- `_bulgarian_` — 保加利亚语停用词
- `_catalan_` — 加泰罗尼亚语停用词
- `_cjk_` — CJK 停用词，即中文、日语和韩语
- `_czech_` — 捷克语停用词
- `_danish_` — 丹麦语停用词
- `_dutch_` — 荷兰语停用词
- `_english_` — 英语停用词
- `_estonian_` — 爱沙尼亚语停用词
- `_finnish_` — 芬兰语停用词
- `_french_` — 法语停用词
- `_galician_` — 加利西亚语停用词
- `_german_` — 德语停用词
- `_greek_` — 希腊语停用词
- `_hindi_` — 印地语停用词
- `_hungarian_` — 匈牙利语停用词
- `_indonesian_` — 印度尼西亚语停用词
- `_irish_` — 爱尔兰语停用词
- `_italian_` — 意大利语停用词
- `_latvian_` — 拉脱维亚语停用词
- `_lithuanian_` — 立陶宛语停用词
- `_norwegian_` — 挪威语停用词
- `_persian_` — 波斯语停用词
- `_portuguese_` — 葡萄牙语停用词
- `_romanian_` — 罗马尼亚语停用词
- `_russian_` — 俄语停用词
- `_serbian_` — 塞尔维亚语停用词
- `_sorani_` — 索拉尼语停用词
- `_spanish_` — 西班牙语停用词
- `_swedish_` — 瑞典语停用词
- `_thai_` — 泰语停用词
- `_turkish_` — 土耳其语停用词

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-stop-tokenfilter.html)
