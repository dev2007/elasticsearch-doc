# 动态映射

Elasticsearch 最重要的特性之一，就是它尽量不碍事，让你能够尽快开始探索数据。要索引一个文档，你不必先创建索引、定义映射类型、定义字段——只需直接索引文档，索引、类型和字段就会自动显示：

```bash
PUT data/_doc/1
{
  "count": 5
}
```

上面的请求创建了 `data` 索引、`_doc` 映射类型，以及一个名为 `count`、数据类型为 `long` 的字段。

自动检测并添加新字段的行为称为**动态映射**（dynamic mapping）。你可以通过以下方式自定义动态映射规则，以满足你的需求：

- [动态字段映射](/mapping/dynamic_field_mapping)：控制动态字段检测的规则。
- [动态模板](/mapping/dynamic_template)：用于配置动态添加字段映射的自定义规则。

[索引模板](/index_templates/index_templates)允许你为新索引配置默认的映射、设置和别名，无论这些索引是自动创建还是显式创建的。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/dynamic-mapping.html)
