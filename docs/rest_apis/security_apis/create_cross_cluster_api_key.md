# 创建跨集群 API 密钥 API

为基于 API 密钥的远程集群访问创建一个 `cross_cluster` 类型的 API 密钥。

```txt
POST /_security/cross_cluster/api_key
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` 集群权限。
- 你必须使用一个**不是** API 密钥的凭据进行身份验证 — 即使是具有所需权限的 API 密钥也会返回错误。

## 描述

`cross_cluster` 类型的 API 密钥**不能**用于通过 REST 接口进行身份验证。反之，REST API 密钥也不能用于基于 API 密钥的远程集群访问。

跨集群 API 密钥由 Elasticsearch API 密钥服务创建，该服务自动启用（可以通过 API 密钥服务设置禁用）。

成功请求会返回一个 JSON 结构，其中包含 API 密钥、其唯一的 ID 和其名称，以及（如适用）以毫秒为单位的过期信息。默认情况下，API 密钥永不过期；可以在创建时指定过期时间。

跨集群 API 密钥只能通过更新跨集群 API 密钥 API 进行更新。通过更新 REST API 密钥 API 或批量更新 REST API 密钥 API 更新会返回错误。

可以通过获取 API 密钥 API、查询 REST API 密钥 API 检索它们的信息，并通过使 REST API 密钥失效 API 使其失效。

:::important 重要

与 REST API 密钥不同，跨集群 API 密钥**不会捕获**已通过身份验证的用户的权限。其有效权限完全由 `access` 参数指定。

:::

## 请求体

`name`

（必需，字符串）此 API 密钥的名称。

`access`

（必需，对象）授予此 API 密钥的访问权限；由跨集群搜索和跨集群复制的权限组成。必须至少指定其中一种。

`expiration`

（可选，字符串）API 密钥的过期时间。默认情况下，API 密钥永不过期。

`metadata`

（可选，对象）与 API 密钥关联的任意元数据。支持嵌套的数据结构。以 `_` 开头的键保留供系统使用。

### `access` 对象

`search`

（可选，对象数组）用于**跨集群搜索**的索引权限条目列表，每个条目包含：

- `names`（必需，字符串数组）该条目适用的索引或名称模式。
- `field_security`（可选，对象）该密钥具有读取访问权限的文档字段。**不能在定义 `replication` 的同时设置。**（参见[跨集群 API 密钥的字段和文档级安全性](/secure_the_stack/api_key_based_remote_cluster_access)）
- `query`（可选，对象）定义可读文档的搜索查询；文档必须匹配此查询才能被访问。**不能在定义 `replication` 的同时设置。**
- `allow_restricted_indices`（可选，布尔值）如果 `names` 模式应覆盖系统索引，则必须设置为 `true`（默认为 `false`）。

`replication`

（可选，对象数组）用于**跨集群复制**的索引权限条目列表，每个条目包含：

- `names`（必需，字符串数组）该条目适用的索引或名称模式。

:::note 注意

不应为 `search` 或 `replication` 显式指定权限 — 创建过程会自动将访问规范转换为具有相关权限的角色描述符。`access` 值及其对应的 `role_descriptors` 会在获取 API 密钥 API 和查询 REST API 密钥 API 的响应中返回。

:::

## 响应体

`id`

此 API 密钥的唯一 ID。

`name`

API 密钥的名称。

`expiration`

（可选）以毫秒为单位的过期时间。

`api_key`

生成的 API 密钥**密钥**（secret）。

`encoded`

API 密钥凭据 — 由 `id:api_key` 组成的、以冒号连接的字符串的 UTF-8 表示形式的 Base64 编码。

## 示例

以下示例创建一个名为 `my-cross-cluster-api-key` 的跨集群 API 密钥：

```txt
POST /_security/cross_cluster/api_key
{
  "name" : "my-cross-cluster-api-key",
  "expiration" : "1d",
  "access" : {
    "search" : [
      {
        "names" : [ "logs*" ]
      }
    ],
    "replication" : [
      {
        "names" : [ "archive*" ]
      }
    ]
  },
  "metadata" : {
    "description" : "phase one",
    "environment" : {
      "level" : 1,
      "trusted" : true,
      "tags" : [ "dev", "staging" ]
    }
  }
}
```

API 返回以下响应：

```json
{
  "id": "VuaCfGcBCdbkQm-e5aOx",
  "name": "my-cross-cluster-api-key",
  "expiration": 1544068612110,
  "api_key": "ui2lp2axTNmsyakw9tvNnw",
  "encoded": "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw=="
}
```

## 检索 API 密钥信息

可以通过获取 API 密钥 API 检索跨集群 API 密钥的信息：

```txt
GET /_security/api_key?id=VuaCfGcBCdbkQm-e5aOx
```

响应中包含 `id`、`name`、`type`（`cross_cluster`）、`creation`、`expiration`、`invalidated`、`username`、`realm`、`metadata`、`role_descriptors` 和 `access`。

生成的 `role_descriptors` 始终包含且仅包含一个名为 `cross_cluster` 的角色描述符。跨集群 API 密钥**没有**受限角色描述符（limited-by role descriptors）：

- `cluster` 权限：如果仅需搜索则为 `cross_cluster_search`；如果仅需复制则为 `cross_cluster_replication`；如果搜索和复制都需要则为两者。
- `indices` 权限：
  - 对于**搜索**访问（例如 `logs*`）：`read`、`read_cross_cluster`、`view_index_metadata`，且 `allow_restricted_indices` 为 `false`。
  - 对于**复制**访问（例如 `archive*`）：`cross_cluster_replication`、`cross_cluster_replication_internal`，且 `allow_restricted_indices` 为 `false`。

响应中的 `access` 与创建 API 密钥时指定的值完全一致（搜索：`logs*`；复制：`archive*`）。

## 使用

要使用生成的 API 密钥，请将其配置为基于 API 密钥的远程集群配置中的集群凭据（参见[配置远程集群](/remote_clusters/configuring_remote_clusters)）。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-create-cross-cluster-api-key.html)
