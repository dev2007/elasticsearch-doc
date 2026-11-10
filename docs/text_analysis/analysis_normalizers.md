# 规范化器

规范化器（Normalizer）与分析器类似，但只能输出单个词元。因此，它们没有分词器，并且只接受一部分可用的字符过滤器和词元过滤器。只允许使用按字符逐个处理的过滤器。例如，允许使用小写化过滤器，但不允许使用词干提取过滤器，因为后者需要将关键词作为一个整体来处理。

当前可在规范化器定义中使用的过滤器列表如下：

- `arabic_normalization`
- `asciifolding`
- `bengali_normalization`
- `cjk_width`
- `decimal_digit`
- `elision`
- `german_normalization`
- `hindi_normalization`
- `indic_normalization`
- `lowercase`
- `pattern_replace`
- `persian_normalization`
- `scandinavian_folding`
- `serbian_normalization`
- `sorani_normalization`
- `trim`
- `uppercase`

Elasticsearch 自带一个 `lowercase` 内置规范化器。对于其他形式的规范化，需要进行自定义配置。

## 自定义规范化器

自定义规范化器接受一个字符过滤器列表和一个词元过滤器列表。

```bash
PUT index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "quote": {
          "type": "mapping",
          "mappings": [
            "« => \"",
            "» => \""
          ]
        }
      },
      "normalizer": {
        "my_normalizer": {
          "type": "custom",
          "char_filter": [ "quote" ],
          "filter": [ "lowercase", "asciifolding" ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "foo": {
        "type": "keyword",
        "normalizer": "my_normalizer"
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/analysis-normalizers.html)
