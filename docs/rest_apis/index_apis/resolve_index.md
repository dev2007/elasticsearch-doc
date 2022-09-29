# 解析索引 API

解析索引、别名和数据流的指定名称和（或）索引模式。

支持多种模式以及远程集群。

```bash
GET /_resolve/index/my-index-*
```

## 请求

`GET /_resolve/index/<name>`

## 前置条件

- 如果 Elasticsearch 安全特性启用，你对目标数据流、索引或索引别名必须有 `view_index_metadata` 或 `manage` [索引权限](/secure_the_elastic_statck/user_authorization/security_privileges#索引权限)。

## 路径参数

`<name>`

（必需，字符串）逗号分隔的待解析的索引、别名及数据流的名字或索引模式。在[远程集群](/set_up_elasticsearch/remote_clusters)上的资源可以通过语法 `<cluster>:<name>` 指定。

## 查询参数

- `expand_wildcards`
（可选，字符串）通配符表达式可以匹配的索引类型。如果请求可以数据流为目标，则此参数确定通配符表达式是否匹配隐藏的数据流。支持逗号分隔的值，如 `open,hidden`。有效的值有：

1. `all`
匹配任何数据流或索引，包括 [hidden](/rest_apis/api_convention/multi_target_syntax#隐藏数据流和索引)（隐藏的）。
2. `open`
匹配 open（开启）、非隐藏的索引。也匹配任何非隐藏的数据流。
3. `closed`
匹配 closed（关闭）、非隐藏的索引。也匹配任何非隐藏的数据流。数据流不能关闭。
4. `hidden`
匹配隐藏数据流和隐藏索引。必须与 `open`、`closed` 或一起使用。
5. `none`
不接受通配符表达式。

默认为 `open`。

## 示例

```bash
GET /_resolve/index/f*,remoteCluster1:bar*?expand_wildcards=all
```

API 返回以下响应：

```bash
{
  "indices": [
    {
      "name": "foo_closed",
      "attributes": [
        "closed"
      ]
    },
    {
      "name": "freeze-index",
      "aliases": [
        "f-alias"
      ],
      "attributes": [
        "frozen",
        "open"
      ]
    },
    {
      "name": "remoteCluster1:bar-01",
      "attributes": [
        "open"
      ]
    }
  ],
  "aliases": [
    {
      "name": "f-alias",
      "indices": [
        "freeze-index",
        "my-index-000001"
      ]
    }
  ],
  "data_streams": [
    {
      "name": "foo",
      "backing_indices": [
        ".ds-foo-2099.03.07-000001"
      ],
      "timestamp_field": "@timestamp"
    }
  ]
}
```

- `indices` 与提供的名字或表达式匹配的所有索引
- `aliases` 与提供的名字或表达式匹配的所有别名
- `data_streams` 与提供的名字或表达式匹配的所有数据流

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-resolve-index-api.html)
