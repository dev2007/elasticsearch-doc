# Fingerprint 词元过滤器

对词元流进行排序并去除重复词元，然后将该流拼接为单个输出词元。

例如，该过滤器对 `[ the, fox, was, very, very, quick ]` 词元流的处理过程如下：

1. 将词元按字母顺序排序为 `[ fox, quick, the, very, very, was ]`
2. 去除重复的 `very` 词元。
3. 将词元流拼接为单个输出词元：`[ fox quick the very was ]`

此过滤器产生的输出词元适用于对文本主体进行指纹识别和聚类，如 [OpenRefine 项目](https://openrefine.org/)所述。

此过滤器使用 Lucene 的 [FingerprintFilter](https://lucene.apache.org/core/9_12_1/analysis/common/org/apache/lucene/analysis/miscellaneous/FingerprintFilter.html)。

## 示例

以下 [analyze API](/rest_apis/index_apis/analyze) 请求使用 `fingerprint` 过滤器为文本 `zebra jumps over resting resting dog` 创建单个输出词元：

```bash
GET _analyze
{
  "tokenizer" : "whitespace",
  "filter" : ["fingerprint"],
  "text" : "zebra jumps over resting resting dog"
}
```

该过滤器产生以下词元：

```text
[ dog jumps over resting zebra ]
```

## 添加到分析器

以下[创建索引 API](/rest_apis/index_apis/create_index) 请求使用 `fingerprint` 过滤器配置一个新的自定义分析器：

```bash
PUT fingerprint_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_fingerprint": {
          "tokenizer": "whitespace",
          "filter": [ "fingerprint" ]
        }
      }
    }
  }
}
```

## 可配置参数

- `max_output_size`

  （可选，整数）输出词元的最大字符长度（含空白字符）。默认为 `255`。拼接后的词元超过此长度时将不产生任何词元输出。

- `separator`

  （可选，字符串）用于拼接词元流输入的字符。默认为空格。

## 自定义

要自定义 `fingerprint` 过滤器，请复制它以创建新的自定义词元过滤器的基础。你可以使用其可配置参数修改该过滤器。

例如，以下请求创建一个使用 `+` 拼接词元流的自定义 fingerprint 过滤器。该过滤器还将输出词元限制为不超过 100 个字符：

```bash
PUT custom_fingerprint_example
{
  "settings": {
    "analysis": {
      "analyzer": {
        "whitespace_": {
          "tokenizer": "whitespace",
          "filter": [ "fingerprint_plus_concat" ]
        }
      },
      "filter": {
        "fingerprint_plus_concat": {
          "type": "fingerprint",
          "max_output_size": 100,
          "separator": "+"
        }
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-fingerprint-tokenfilter.html)
