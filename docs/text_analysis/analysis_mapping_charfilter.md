# Mapping 字符过滤器

`mapping` 字符过滤器接受一个键值映射。每当它遇到与某个键相同的字符串时，就会将其替换为与该键关联的值。

匹配是贪婪的；在给定点上匹配的最长模式获胜。替换内容允许为空字符串。

`mapping` 过滤器使用 Lucene 的 [MappingCharFilter](https://lucene.apache.org/core/9_12_1/analysis/common/org/apache/lucene/analysis/charfilter/MappingCharFilter.html)。

## 示例

以下 analyze API 请求使用 `mapping` 过滤器将印度-阿拉伯数字（٠‎١٢٣٤٥٦٧٨‎٩‎）转换为其对应的阿拉伯-拉丁数字（0123456789），将文本 `My license plate is ٢٥٠١٥` 更改为 `My license plate is 25015`。

```bash
GET /_analyze
{
  "tokenizer": "keyword",
  "char_filter": [
    {
      "type": "mapping",
      "mappings": [
        "٠ => 0", "١ => 1", "٢ => 2", "٣ => 3", "٤ => 4",
        "٥ => 5", "٦ => 6", "٧ => 7", "٨ => 8", "٩ => 9"
      ]
    }
  ],
  "text": "My license plate is ٢٥٠١٥"
}
```

该过滤器产出以下文本：

```text
[My license plate is25015]
```

## 可配置参数

- `mappings`

  （必需\*，字符串数组）映射数组，每个元素的格式为 `key => value`。

  此参数与 `mappings_path` 参数必须指定其一。

- `mappings_path`

  （必需\*，字符串）包含 `key => value` 映射的文件的路径。

  此路径必须是绝对路径或相对于 `config` 位置的路径，并且文件必须采用 UTF-8 编码。文件中的每个映射必须用换行符分隔。

  此参数与 `mappings` 参数必须指定其一。

## 自定义并添加到分析器

要自定义 `mappings` 过滤器，可以复制它以创建新自定义字符过滤器的基础。你可以使用其可配置参数修改该过滤器。

以下创建索引 API 请求使用自定义的 `mappings` 过滤器 `my_mappings_char_filter` 配置一个新的自定义分析器。

`my_mappings_char_filter` 过滤器将 `:)` 和 `:(` 表情符号替换为对应的文本。

```bash
PUT /my-index-000001
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "tokenizer": "standard",
          "char_filter": [ "my_mappings_char_filter" ]
        }
      },
      "char_filter": {
        "my_mappings_char_filter": {
          "type": "mapping",
          "mappings": [ ":) => _happy_", ":( => _sad_" ]
        }
      }
    }
  }
}
```

以下 analyze API 请求使用自定义的 `my_mappings_char_filter` 过滤器将文本 `I'm delighted about it :(` 中的 `:(` 替换掉。

```bash
GET /my-index-000001/_analyze
{
  "tokenizer": "keyword",
  "char_filter": [ "my_mappings_char_filter" ],
  "text": "I'm delighted about it :("
}
```

该过滤器产出以下文本：

```text
[ I'm delighted about it _sad_ ]
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-mapping-charfilter.html)
