# Sort 处理器

对数组的元素进行升序或降序排序。纯数字的同质数组按数值排序；字符串数组或字符串与数字混合的数组按字典序排序。当字段不是数组时会抛出错误。

| 参数 | 必填 | 默认值 | 描述 |
|:--|:--|:--|:--|
| `field` | 是 | - | 要排序的字段。 |
| `order` | 否 | `"asc"` | 使用的排序顺序。接受 `"asc"` 或 `"desc"`。 |
| `target_field` | 否 | `field` | 排序后的值写入的字段。默认原地更新 `field`。 |
| `description` | 否 | - | 处理器的描述。有助于说明该处理器或其配置的用途。 |
| `if` | 否 | - | 有条件地执行处理器。参阅[有条件地运行处理器](/ingest_pipelines/ingest_pipelines#有条件地运行处理器)。 |
| `ignore_failure` | 否 | `false` | 忽略处理器的失败。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `on_failure` | 否 | - | 处理器的失败处理。参阅[处理管道失败](/ingest_pipelines/ingest_pipelines#处理管道失败)。 |
| `tag` | 否 | - | 处理器的标识符。有助于调试和指标统计。 |

示例：

```json
{
  "sort": {
    "field": "array_field_to_sort",
    "order": "desc"
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/sort-processor.html)
