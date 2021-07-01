# 删除索引别名

删除现有的索引别名。

索引别名是一个或多个索引的第二个名字。大多数 Elasticsearch API 都支持索引别名代替索引名称。

```bash
DELETE /my-index-000001/_alias/alias1
```

## 请求

`DELETE /<index>/_alias/<alias>`

`DELETE /<index>/_aliases/<alias>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对所有索引和索引别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<index>`
（必需的，字符串）用于限制请求的逗号分隔列表或通配符的索引名。

为了包含集群中的所有索引，使用值 `_all` 或 `*`。

- `<alias>`
（必需的，字符串）用于限制请求的逗号分隔列表或通配符的索引别名。

为了获取所有索引别名的信息，使用值 `_all` 或 `*`。

## 查询参数

- `master_timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`

（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-alias.html)
