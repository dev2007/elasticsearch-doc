# 创建或更新索引别名 API

创建或更新索引别名。

索引别名是一个或多个索引的第二个名字。大多数 Elasticsearch API 都支持索引别名代替索引名称。

```bash
PUT /my-index-000001/_alias/alias1
```

## 请求

`PUT /<index>/_alias/<alias>`

`POST /<index>/_alias/<alias>`

`PUT /<index>/_aliases/<alias>`

`POST /<index>/_aliases/<alias>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对所有索引和索引别名必须有 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 路径参数

- `<index>`
（必需的，字符串）待添加别名的，逗号分隔列表或通配符的索引名。

为了向集群中的所有索引添加别名，使用值 `_all`。

?> 你不能给[数据流](/datastreams/datastreams)添加索引别名。

- `<alias>`
（必需的，字符串）待创建或升级的索引别名的名字。支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

## 查询参数

- `master_timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待连接到主节点的时间。如果在超时过期前没有收到响应，则请求失败并返回错误。默认为 `30s`。

- `timeout`
（可选，[时间单位](/rest_apis/api_convention/common_options?id=时间单位)）等待响应的时间。如果在超时过期之前没有收到响应，则请求失败并返回错误。默认为 `30s`。

## 请求体

- `filter`
（可选，查询对象）[过滤器查询](/query_dsl/compound_queries/boolean)用于限制索引别名。
如果指定，索引别名仅用于过滤器返回的文档。

- `routing`
（可选，字符串）用于路由操作到指定分片的自定义值。

## 示例

索引别名支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

### 添加一个基于时间的别名

以下的请求为索引 `logs_20302801` 创建一个别名 `2030`。

```bash
PUT /logs_20302801/_alias/2030
```

### 添加一个基于用户的别名

首先，创建一个带有 `user_id` 字段映射的索引 `users`：

```bash
PUT /users
{
  "mappings" : {
    "properties" : {
      "user_id" : {"type" : "integer"}
    }
  }
}
```

接着，为特定用户 `user_12` 添加索引别名：

```bash
PUT /users/_alias/user_12
{
  "routing" : "12",
  "filter" : {
    "term" : {
      "user_id" : 12
    }
  }
}
```

### 在索引创建时添加一个别名

你可以使用[创建索引 API](/rest_apis/index_apis/create_index)在索引创建时添加一个索引别名。

```bash
PUT /logs_20302801
{
  "mappings": {
    "properties": {
      "year": { "type": "integer" }
    }
  },
  "aliases": {
    "current_day": {},
    "2030": {
      "filter": {
        "term": { "year": 2030 }
      }
    }
  }
}
```

创建索引 API 在索引别名的名字中也支持[日期数学](/rest_apis/api_convention/date_math_support_in_index_names)。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-add-alias.html)
