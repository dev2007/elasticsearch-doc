# HTML Strip 字符过滤器

从文本中剥离 HTML 元素，并将 HTML 实体替换为其解码后的值（例如将 `&amp;` 替换为 `&`）。

::::note 提示
`html_strip` 过滤器使用 Lucene 的 `HTMLStripCharFilter`。
::::

## 示例

以下 `analyze` API 请求使用 `html_strip` 过滤器将文本 `<p>I&apos;m so <b>happy</b>!</p>` 更改为 `\nI'm so happy!\n`。

```bash
GET /_analyze
{
  "tokenizer": "keyword",
  "char_filter": [ "html_strip" ],
  "text": "<p>I&apos;m so <b>happy</b>!</p>"
}
```

该过滤器产出以下文本：

```text
[ \nI'm so happy!\n ]
```

## 添加到分析器

以下创建索引 API 请求使用 `html_strip` 过滤器配置一个新的自定义分析器。

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "char_filter": [ "html_strip" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `escaped_tags`

  （可选，字符串数组）*不含*尖括号（`< >`）的 HTML 元素数组。从文本中剥离 HTML 时，该过滤器会跳过这些 HTML 元素。例如，值 `[ "p" ]` 会跳过 `<p>` HTML 元素。

## 自定义

要自定义 `html_strip` 过滤器，可以复制它以创建新自定义字符过滤器的基础。你可以使用其可配置参数修改该过滤器。

以下创建索引 API 请求使用自定义的 `html_strip` 过滤器 `my_custom_html_strip_char_filter` 配置一个新的自定义分析器。`my_custom_html_strip_char_filter` 过滤器跳过对 `<b>` HTML 元素的移除。

```bash
PUT my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "keyword",
          "char_filter": [ "my_custom_html_strip_char_filter" ]
        }
      },
      "char_filter": {
        "my_custom_html_strip_char_filter": {
          "type": "html_strip",
          "escaped_tags": [ "b" ]
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-htmlstrip-charfilter.html)
