# 获取脚本语言 API

检索支持的脚本语言及其上下文的列表。

```txt
GET _script_language
```

## 前置条件

- 如果启用了 Elasticsearch 安全功能，你必须具有 `manage` [集群权限](../security_privileges/cluster_privileges)才能使用此 API。

## 响应体

`language_contexts`

（数组）包含支持的脚本语言和上下文。

`language_contexts` 中对象的属性

`language`

（字符串）脚本语言的名称。

`contexts`

（数组）包含该语言支持的上下文。

`types_allowed`

（数组）包含该语言允许的脚本类型。有效值为：`inline`、`stored`。

## 示例

```txt
GET _script_language
```

响应示例：

```json
{
  "language_contexts": [
    {
      "language": "expression",
      "contexts": [
        "aggregation_selector",
        "bucket_aggregation",
        "aggs",
        "field_value_factor",
        "score",
        "terms_set",
        "template"
      ],
      "types_allowed": [ "inline", "stored" ]
    },
    {
      "language": "mustache",
      "contexts": [
        "template"
      ],
      "types_allowed": [ "inline", "stored" ]
    },
    {
      "language": "painless",
      "contexts": [
        "aggregation_selector",
        "aggs",
        "boolean_field",
        "...",
        "score"
      ],
      "types_allowed": [ "inline", "stored" ]
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/get-script-languages-api.html)
