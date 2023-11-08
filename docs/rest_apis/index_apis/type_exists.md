# 类型存在 API

:::caution 警告
**7.0.0 废弃** 类型不推荐，且后续会被移除。参阅[移除映射类型](/mapping/removal_of_mapping_types)。
:::

检查[映射类型](/mapping/metadata_fields/_type_field)是否存在。

```bash
HEAD my-index-000001/_mapping/message
```

## 请求

`HEAD /<index>/_mapping/<type>`

## 路径参数

`<index>`
（可选，字符串）用于限制请求的，逗号分隔的索引名字列表或通配符。

`<type>`
（可选，字符串）用于限制请求的，逗号分隔类型列表或通配符。

## 响应码

`200`
表明所有指定映射类型存在。

`404`
表明一个或多个指定映射类型不存在。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-types-exists.html)
