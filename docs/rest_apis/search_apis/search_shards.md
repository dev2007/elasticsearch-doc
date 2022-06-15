# 搜索分片 API

返回将对其执行搜索请求的索引和分片。

```bash
GET /my-index-000001/_search_shards
```

## 请求

`GET /<target>/_search_shards`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你必须对目标数据流、索引或别名有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges?id=索引权限)。

## 描述

搜索分片 API 返回将针对其执行搜索请求的索引和碎片。这可以为解决问题或规划具有路由和分片首选项的优化提供有用的反馈。使用过滤别名时，过滤器将作为索引部分的一部分返回。

## 路径参数

- `<target>`
  （可选，字符串）用于限制请求的，逗号分隔的数据流、索引。也支持通配符表达式（*）。为了搜索所有数据流和索引，忽略此参数或使用 `*` 或 `_all`。

## 查询参数

- `allow_no_indices`
  （可选，布尔值）如果为 `false`，任何通配符、[索引别名](/rest_apis/index_apis/bulk_index_alias)或 `_all` 值只针对丢失或关闭的索引，请求将返回一个错误。即使请求以其他开启索引为目标，此行为也适用。例如，如果一个索引以 `foo` 开头，而没有索引以 `bar` 开头，则以 `foo*,bar*` 为目标的请求将返回错误。

  默认为 `true`。

- `expand_wildcards`
  （可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

  1. `all`
  匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax?id=隐藏数据流和索引)（隐藏的）。
  2. `open`
  匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
  3. `closed`
  匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
  4. `hidden`
  匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
  5. `none`
  不接受通配符表达式。

  默认为 `open`。

- `ignore_unavailable`
  （可选，布尔值）如果为 `true`，丢失的或关闭的索引不包含在响应中。默认为 `false`。

- `local`
  （可选，布尔值）如果为 `true`，请求只从本地节点获取信息。默认为 `false`，意味着信息从主节点获取。

- `preference`
  （可选，字符串）用于执行搜索的节点或分片。默认随机。

- `routing`
  （可选，字符串）用于路由操作到指定分片的自定义值。

## 示例

```bash
GET /my-index-000001/_search_shards
```

此 API 返回以下结果：

```bash
{
  "nodes": ...,
  "indices" : {
    "my-index-000001": { }
  },
  "shards": [
    [
      {
        "index": "my-index-000001",
        "node": "JklnKbD7Tyqi9TP3_Q_tBg",
        "primary": true,
        "shard": 0,
        "state": "STARTED",
        "allocation_id": {"id":"0TvkCyF7TAmM1wHP4a42-A"},
        "relocating_node": null
      }
    ],
    [
      {
        "index": "my-index-000001",
        "node": "JklnKbD7Tyqi9TP3_Q_tBg",
        "primary": true,
        "shard": 1,
        "state": "STARTED",
        "allocation_id": {"id":"fMju3hd1QHWmWrIgFnI4Ww"},
        "relocating_node": null
      }
    ],
    [
      {
        "index": "my-index-000001",
        "node": "JklnKbD7Tyqi9TP3_Q_tBg",
        "primary": true,
        "shard": 2,
        "state": "STARTED",
        "allocation_id": {"id":"Nwl0wbMBTHCWjEEbGYGapg"},
        "relocating_node": null
      }
    ],
    [
      {
        "index": "my-index-000001",
        "node": "JklnKbD7Tyqi9TP3_Q_tBg",
        "primary": true,
        "shard": 3,
        "state": "STARTED",
        "allocation_id": {"id":"bU_KLGJISbW0RejwnwDPKw"},
        "relocating_node": null
      }
    ],
    [
      {
        "index": "my-index-000001",
        "node": "JklnKbD7Tyqi9TP3_Q_tBg",
        "primary": true,
        "shard": 4,
        "state": "STARTED",
        "allocation_id": {"id":"DMs7_giNSwmdqVukF7UydA"},
        "relocating_node": null
      }
    ]
  ]
}
```

由于指定的路由值，搜索只针对两个分片执行。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-shards.html)
