# index_prefixes

`index_prefixes` 参数启用词元前缀索引，以加快前缀搜索。它接受以下可选设置：

- `min_chars`
  （可选，整数）要索引的最小前缀长度。必须大于 0，默认为 2。该值包含在内。
- `max_chars`
  （可选，整数）要索引的最大前缀长度。必须小于 20，默认为 5。该值包含在内。

此示例使用默认前缀长度设置创建一个 text 字段：

```bash
# 空设置对象将使用默认的 min_chars 和 max_chars 设置
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "body_text": {
        "type": "text",
        "index_prefixes": { }
      }
    }
  }
}
```

此示例使用自定义前缀长度设置：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "full_name": {
        "type": "text",
        "index_prefixes": {
          "min_chars" : 1,
          "max_chars" : 10
        }
      }
    }
  }
}
```

`index_prefixes` 参数指示 Elasticsearch 创建一个子字段 `"._index_prefix"`。此字段将用于执行快速前缀查询。进行高亮显示时，将 `"._index_prefix"` 子字段添加到 `matched_fields` 参数中，以便基于前缀字段的匹配结果高亮主字段，如下面的请求所示：

```bash
GET my-index-000001/_search
{
  "query": {
    "prefix": {
      "full_name": {
        "value": "ki"
      }
    }
  },
  "highlight": {
    "fields": {
      "full_name": {
        "matched_fields": ["full_name._index_prefix"]
      }
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/index-prefixes.html)
