# meta

附加到字段的元数据。这些元数据对 Elasticsearch 是不透明的，只对在相同索引上工作的多个应用共享关于字段的元信息（例如单位）有用。

```bash
PUT my-index-000001
{
  "mappings": {
    "properties": {
      "latency": {
        "type": "long",
        "meta": {
          "unit": "ms"
        }
      }
    }
  }
}
```

字段元数据最多强制 5 个条目，键的长度必须小于等于 20，值是长度小于等于 50 的字符串。

字段元数据可以通过提交映射更新来更新。更新的元数据将覆盖现有字段的元数据。

object 或 nested 字段不支持字段元数据。

Elastic 产品对字段使用以下标准元数据条目。你可以遵循相同的元数据约定，以获得更好的开箱即用体验。

- `unit`
  （可选，字符串）与数值字段关联的单位："percent"、"byte" 或时间单位。默认情况下，字段没有单位。仅对数值字段有效。百分比的约定是使用值 1 表示 100%。
- `metric_type`
  （可选，字符串）数值字段的指标类型："gauge" 或 "counter"。gauge 是可以随时间上升或下降的单值测量值，例如温度。counter 是只增不减（或重置为 0）的单值累积计数器，例如 Web 服务器处理的请求数。默认情况下，字段不关联指标类型。仅对数值字段有效。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-field-meta.html)
