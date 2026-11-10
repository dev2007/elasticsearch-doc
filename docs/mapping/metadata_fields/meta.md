# _meta 字段

映射类型可以关联自定义元数据。这些元数据完全不会被 Elasticsearch 使用，但可用于存储应用程序特定的元数据，例如文档所属的类：

```bash
PUT my-index-000001
{
  "mappings": {
    "_meta": {
      "class": "MyApp::User",
      "version": {
        "min": "1.0",
        "max": "1.3"
      }
    }
  }
}
```

这些 `_meta` 信息可以通过获取映射 API 检索。

可以使用更新映射 API 在现有类型上更新 `_meta` 字段：

```bash
PUT my-index-000001/_mapping
{
  "_meta": {
    "class": "MyApp2::User3",
    "version": {
      "min": "1.3",
      "max": "1.5"
    }
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/mapping-meta-field.html)
