# doc_values

大多数字段默认会被索引，这使得它们可搜索。倒排索引允许查询在唯一排序列表中查找搜索词，并从中立即访问包含该词的文档列表。

排序、聚合以及在脚本中访问字段值需要不同的数据访问模式。我们不是查找词并找到文档，而是需要能够查找文档并找出它在某个字段中拥有的词。

`doc_values` 字段是一种在索引时构建的磁盘数据结构，支持高效的数据访问。它存储与 `_source` 相同的值，但采用更适合排序和聚合的面向列的格式。

大多数字段类型都支持 doc values，`text` 和 `annotated_text` 字段除外。另参阅[禁用 doc values](#禁用-doc-values)。

## 仅 doc-values 字段

数值类型、日期类型、boolean 类型、ip 类型、geo_point 类型和 keyword 类型即使不被索引、只启用了 doc values，也可以被查询。基于 doc values 的查询性能比基于索引结构的查询慢得多，但对于很少被查询且查询性能不那么重要的字段，它在磁盘占用和查询性能之间提供了一个有趣的折衷。这使得仅 doc-values 字段非常适合不期望通常用于过滤的字段，例如指标数据上的仪表（gauge）或计数器（counter）。

可以按如下方式配置仅 doc-value 字段：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      # status_code 字段是一个普通的 long 字段
      "status_code": {
        "type":  "long"
      },
      # session_id 字段禁用了 index，因此是一个仅 doc-value 的 long 字段，因为 doc values 默认是启用的
      "session_id": {
        "type":  "long",
        "index": false
      }
    }
  }
}
```

## 禁用 doc values

对于支持它们的所有字段，doc values 默认是启用的。在某些字段类型（例如 `search_as_you_type`）中，doc_values 会出现在 API 响应中，但无法配置。为这些字段设置 doc_values 可能会导致错误或没有任何效果。

如果你确定不需要对某个字段进行排序或聚合、也不需要从脚本中访问其值，可以禁用 doc_values 以节省磁盘空间：

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      # status_code 字段默认启用 doc_values
      "status_code": {
        "type":       "keyword"
      },
      # session_id 禁用了 doc_values，但仍然可以查询
      "session_id": {
        "type":       "keyword",
        "doc_values": false
      }
    }
  }
}
```

你不能禁用 wildcard 字段的 doc values。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/doc-values.html)
