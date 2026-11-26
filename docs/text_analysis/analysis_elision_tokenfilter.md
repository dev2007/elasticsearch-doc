# Elision 词元过滤器

从词元的开头移除指定的省文撇（elision）。例如，可以使用此过滤器将 `l'avion` 转换为 `avion`。

未自定义时，过滤器默认移除以下法语省文撇：

```text
l', m', t', qu', n', s', j', d', c', jusqu', quoiqu', lorsqu', puisqu'
```

Elasticsearch 的几个内置语言分析器中包含此过滤器的自定义版本：

- [加泰罗尼亚语分析器](/text_analysis/analysis_lang_analyzer#catalan-分析器)
- [法语分析器](/text_analysis/analysis_lang_analyzer#french-分析器)
- [爱尔兰语分析器](/text_analysis/analysis_lang_analyzer#irish-分析器)
- [意大利语分析器](/text_analysis/analysis_lang_analyzer#italian-分析器)

此过滤器使用 Lucene 的 ElisionFilter。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `elision` 过滤器从 `j’examine près du wharf` 中移除 `j'`：

```bash
GET _analyze
{
  "tokenizer" : "standard",
  "filter" : ["elision"],
  "text" : "j’examine près du wharf"
}
```

该过滤器产生以下词元：

```text
[ examine, près, du, wharf ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `elision` 过滤器配置一个新的自定义分析器：

```bash
PUT /elision_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_elision": {
          "tokenizer": "whitespace",
          "filter": [ "elision" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `articles`

  （必需*，字符串数组）要移除的省文撇列表。

  要被移除，省文撇必须位于词元的开头，且其后紧跟一个撇号。省文撇和撇号都会被移除。

  对于自定义省文撇过滤器，必须指定此参数或 `articles_path` 之一。

- `articles_path`

  （必需*，字符串）指向包含要移除的省文撇列表的文件的路径。

  此路径必须是绝对路径或相对于 `config` 位置的路径，且文件必须是 UTF-8 编码。文件中的每个省文撇必须用换行符分隔。

  要被移除，省文撇必须位于词元的开头，且其后紧跟一个撇号。省文撇和撇号都会被移除。

  对于自定义省文撇过滤器，必须指定此参数或 `articles` 之一。

- `articles_case`

  （可选，布尔值）如果为 `true`，省文撇匹配不区分大小写。如果为 `false`，省文撇匹配区分大小写。默认为 `false`。

## 自定义

要自定义 `elision` 过滤器，请复制它以创建新的自定义词元过滤器的基础。可以使用其可配置参数修改过滤器。

例如，以下请求创建一个自定义的**不区分大小写**的 `elision` 过滤器，用于移除 `l'`、`m'`、`t'`、`qu'`、`n'`、`s'` 和 `j'` 省文撇：

```bash
PUT /elision_case_insensitive_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "tokenizer": "whitespace",
          "filter": [ "elision_case_insensitive" ]
        }
      },
      "filter": {
        "elision_case_insensitive": {
          "type": "elision",
          "articles": [ "l", "m", "t", "qu", "n", "s", "j" ],
          "articles_case": true
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-elision-tokenfilter.html)
