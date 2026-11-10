# copy_to

`copy_to` 参数允许你将多个字段的值复制到一个组字段中，然后可以将该组字段作为一个单一字段进行查询。

如果你经常搜索多个字段，可以通过使用 `copy_to` 搜索更少的字段来提高搜索速度。参阅[尽可能少的搜索字段](/search/search_your_data/search_multiple_data_streams_and_indices)。

例如，`first_name` 和 `last_name` 字段可以按如下方式复制到 `full_name` 字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "first_name": {
        "type": "text",
        "copy_to": "full_name"
      },
      "last_name": {
        "type": "text",
        "copy_to": "full_name"
      },
      "full_name": {
        "type": "text"
      }
    }
  }
}

# first_name 和 last_name 字段的值被复制到 full_name 字段
PUT my-index-000001/_doc/1
{
  "first_name": "John",
  "last_name": "Smith"
}

GET my-index-000001/_search
{
  "query": {
    "match": {
      "full_name": {
        "query": "John Smith",
        "operator": "and"
      }
    }
  }
}
```

`first_name` 和 `last_name` 字段仍然可以分别用于查询名字和姓氏，而 `full_name` 字段可以同时查询名字和姓氏。

一些要点：

- 复制的是字段值，而不是词元（词元是分析过程的结果）。
- 原始 `_source` 字段不会被修改以显示复制的值。
- 可以使用 `"copy_to": [ "field_1", "field_2" ]` 将相同的值复制到多个字段。
- 不能使用中间字段进行递归复制。以下配置不会将数据从 `field_1` 复制到 `field_3`：

```bash
PUT bad_example_index
{
  "mappings": {
    "properties": {
      "field_1": {
        "type": "text",
        "copy_to": "field_2"
      },
      "field_2": {
        "type": "text",
        "copy_to": "field_3"
      },
      "field_3": {
        "type": "text"
      }
    }
  }
}
```

相反，应该从源字段复制到多个字段：

```bash
PUT good_example_index
{
  "mappings": {
    "properties": {
      "field_1": {
        "type": "text",
        "copy_to": ["field_2", "field_3"]
      },
      "field_2": {
        "type": "text"
      },
      "field_3": {
        "type": "text"
      }
    }
  }
}
```

`copy_to` 不支持值为对象形式的字段类型，例如 `date_range`。

## 动态映射

在动态映射中使用 `copy_to` 时，请考虑以下几点：

- 如果目标字段在索引映射中不存在，则适用通常的动态映射行为。默认情况下，当 `dynamic` 设置为 `true` 时，不存在的目标字段将被动态添加到索引映射中。
- 如果 `dynamic` 设置为 `false`，目标字段不会被添加到索引映射中，值也不会被复制。
- 如果 `dynamic` 设置为 `strict`，复制到不存在的字段会导致错误。
  - 如果目标字段是嵌套的，那么 `copy_to` 字段必须指定嵌套字段的完整路径。省略完整路径会导致 `strict_dynamic_mapping_exception`。使用 `"copy_to": ["parent_field.child_field"]` 来正确定位嵌套字段。

例如：

```bash
PUT /test_index
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "description": {
        "properties": {
          "notes": {
            "type": "text",
            "copy_to": [ "description.notes_raw"],
            "analyzer": "standard",
            "search_analyzer": "standard"
          },
          "notes_raw": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

1. `notes` 字段被复制到 `notes_raw` 字段。只定位 `notes_raw` 而不是 `description.notes_raw` 会导致 `strict_dynamic_mapping_exception`。

在此示例中，`notes_raw` 没有定义在映射的根级别，而是定义在 `description` 字段之下。如果没有完全限定的路径，Elasticsearch 会将 `copy_to` 目标解释为根级别字段，而不是 `description` 下的嵌套字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/copy-to.html)
