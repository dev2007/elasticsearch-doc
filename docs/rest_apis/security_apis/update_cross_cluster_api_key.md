# 更新跨集群 API 密钥 API

更新用于基于 API 密钥的远程集群访问的现有跨集群 API 密钥。

```txt
PUT /_security/cross_cluster/api_key/<id>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` 集群权限。
- 用户只能更新自己创建的 API 密钥。要更新其他用户的 API 密钥，必须使用 run as 功能代表该用户提交请求。
- 不能将 API 密钥用作此 API 的身份验证凭据 — 必须使用属主用户的凭据。

## 描述

只有由创建跨集群 API 密钥 API 创建的跨集群 API 密钥才能被更新。

无法更新已过期的 API 密钥，或已通过使 REST API 密钥失效 API 使其失效的 API 密钥。

支持更新 API 密钥的访问范围、元数据和过期时间。

每次调用时都会自动更新属主用户的信息（例如用户名、realm）。

不能更新 REST API 密钥 — 这些密钥必须通过更新 REST API 密钥 API 或批量更新 REST API 密钥 API 进行更新。

## 路径参数

`id`

（必需，字符串）要更新的 API 密钥的 ID。

## 请求体

所有参数都是可选的，但不能全部缺省：

`access`

（可选，对象）授予此 API 密钥的访问权限，由**跨集群搜索**和**跨集群复制**的权限组成。必须至少指定其中一种。指定时，新的访问权限会**完全替换**之前分配的访问权限。结构与创建跨集群 API 密钥 API 的同名参数相同：

- `search`：用于跨集群搜索的索引模式条目数组，例如指定 `logs*` 时，会生成具有 `cross_cluster_search` 集群权限以及 `read`、`read_cross_cluster`、`view_index_metadata` 索引权限的角色描述符。
- `replication`：用于跨集群复制的索引模式条目数组，例如指定 `archive` 时，会生成具有 `cross_cluster_replication` 集群权限以及 `cross_cluster_replication`、`cross_cluster_replication_internal` 索引权限的角色描述符。

`metadata`

（可选，对象）任意用户元数据；支持嵌套结构。以 `_` 开头的顶层键保留供系统使用。指定时，会**完全替换**之前关联的元数据。

`expiration`

（可选，字符串）API 密钥的过期时间。默认情况下，API 密钥永不过期。可以省略以保持不变。

## 响应体

`updated`

（布尔值）如果 API 密钥已更新则为 `true`；如果未检测到任何更改则为 `false`。

## 示例

以下示例首先创建一个仅具有搜索访问权限（`logs*`）的跨集群 API 密钥：

```txt
POST /_security/cross_cluster/api_key
{
  "name" : "my-cross-cluster-api-key",
  "access" : {
    "search" : [
      {
        "names" : [ "logs*" ]
      }
    ]
  },
  "metadata" : {
    "application" : "search"
  }
}
```

API 返回以下响应：

```json
{
  "id": "VuaCfGcBCdbkQm-e5aOx",
  "name": "my-cross-cluster-api-key",
  "api_key": "ui2lp2axTNmsyakw9tvNnw",
  "encoded": "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw=="
}
```

以下示例通过获取 API 密钥 API 检查该 API 密钥的更新前状态：其 `role_descriptors` 包含一个名为 `cross_cluster` 的角色描述符，具有 `cross_cluster_search` 集群权限，以及针对 `logs*` 的 `read`、`read_cross_cluster`、`view_index_metadata` 索引权限；`access` 字段与创建时指定的值一致。

以下示例更新该 API 密钥的访问范围（从搜索访问改为复制访问）和元数据：

```txt
PUT /_security/cross_cluster/api_key/VuaCfGcBCdbkQm-e5aOx
{
  "access" : {
    "replication" : [
      {
        "names" : [ "archive" ]
      }
    ]
  },
  "metadata" : {
    "application" : "replication"
  }
}
```

API 返回以下响应：

```json
{
  "updated": true
}
```

以下示例再次通过获取 API 密钥 API 验证更新后的状态：`role_descriptors` 中的 `cross_cluster` 角色描述符已更新为具有 `cross_cluster_replication` 集群权限，以及针对 `archive*` 的 `cross_cluster_replication`、`cross_cluster_replication_internal` 索引权限；`metadata` 已更新为 `{"application": "replication"}`；`access` 已相应更新为复制访问权限。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-update-cross-cluster-api-key.html)
