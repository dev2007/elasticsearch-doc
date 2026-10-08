# 批量更新 REST API 密钥 API

批量更新一个或多个 REST API 密钥。

```txt
POST /_security/api_key/_bulk_update
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_own_api_key` 集群权限。
- 用户只能更新自己创建或授予给自己的 API 密钥。要更新其他用户的 API 密钥，必须使用 run as 功能代表另一个用户提交请求（参见[代表其他用户提交请求](/secure_the_stack/submitting_requests_on_behalf_of_other_users)）。
- 不能将 API 密钥用作此 API 的身份验证凭据 — 必须使用属主用户的凭据。

## 描述

此 API 与更新 REST API 密钥 API 类似，但对多个 API 密钥应用相同的更新，与逐个更新相比可以显著提高性能。

无法更新已过期或已失效的 API 密钥。

支持更新 API 密钥的访问范围、元数据和过期时间。

每个 API 密钥的访问范围由指定的 `role_descriptors` 加上请求时属主用户权限的快照派生而来。每次调用时都会自动刷新属主权限快照。

:::important 重要

即使不指定 `role_descriptors`，调用此 API 也可能更改 API 密钥的访问范围 — 如果属主用户的权限自密钥创建或上次修改以来发生了变化。

:::

## 请求体

`ids`

（必需，字符串数组）要更新的 API 密钥的 ID。

`role_descriptors`

（可选，对象）分配给 API 密钥的角色描述符。有效权限是所分配权限与属主用户权限的时间点快照的交集。提供一个空对象 `{}` 可移除已分配的权限（此时 API 密钥继承属主用户的全部权限）。无论是否提供此参数，都会刷新属主权限快照。结构与创建 REST API 密钥 API 中相同。

`metadata`

（可选，对象）与 API 密钥关联的任意嵌套元数据。以 `_` 开头的顶层键保留供系统使用。指定的元数据会完全替换之前关联的元数据。

`expiration`

（可选，字符串）API 密钥的过期时间。默认情况下，API 密钥永不过期。可以省略以保持不变。

## 响应体

成功的请求返回一个 JSON 结构，其中包含：

`updated`

（字符串数组）所有已更新的 API 密钥的 ID。

`noops`

（字符串数组）已经具有请求的更改而无需更新的 API 密钥的 ID。

`errors`

（对象）仅在错误数量大于 `0` 时出现，包含：

- `count`：失败的更新数量。
- `details`：以 API 密钥 ID 为键的映射，每个条目可能包含：
  - `type`：异常类型，例如 `resource_not_found_exception`、`illegal_argument_exception`、`exception`。
  - `reason`：错误消息。
  - `caused_by`：包含其他错误详细信息的嵌套对象，例如 `version_conflict_engine_exception`。

## 示例

以下示例首先创建一个名为 `my-api-key` 的 API 密钥：

```txt
POST /_security/api_key
{
  "name" : "my-api-key",
  "role_descriptors" : {
    "role-a" : {
      "cluster" : ["all"],
      "indices" : [
        {
          "names" : ["index-a*"],
          "privileges" : ["read"]
        }
      ]
    }
  },
  "metadata" : {
    "application" : "my-application",
    "environment" : {
      "level" : 1,
      "trusted" : true,
      "tags" : ["dev", "staging"]
    }
  }
}
```

以下示例创建第二个 API 密钥：

```txt
POST /_security/api_key
{
  "name" : "my-other-api-key",
  "metadata" : {
    "application" : "my-application",
    "environment" : {
      "level" : 2,
      "trusted" : true,
      "tags" : ["dev", "staging"]
    }
  }
}
```

假设这些 API 密钥属主用户的权限为：

```json
{
  "cluster": [ "all" ],
  "indices": [
    {
      "names": [ "*" ],
      "privileges": [ "all" ]
    }
  ]
}
```

以下示例批量更新这两个 API 密钥的角色描述符、元数据和过期时间：

```txt
POST /_security/api_key/_bulk_update
{
  "ids": [ "VuaCfGcBCdbkQm-e5aOx", "H3_AhoIBA9hmeQJdg7ij" ],
  "role_descriptors": {
    "role-a": {
      "indices": [
        {
          "names": [ "*" ],
          "privileges": [ "write" ]
        }
      ]
    }
  },
  "metadata": {
    "environment": {
      "level": 2,
      "trusted": true,
      "tags": [ "production" ]
    }
  },
  "expiration": "30d"
}
```

API 返回以下响应：

```json
{
  "updated": [ "VuaCfGcBCdbkQm-e5aOx", "H3_AhoIBA9hmeQJdg7ij" ],
  "noops": []
}
```

更新后的有效权限是角色描述符与属主用户权限的交集：

```json
{
  "indices": [
    {
      "names": [ "*" ],
      "privileges": [ "write" ]
    }
  ]
}
```

以下示例通过提供空对象移除已分配的权限，使 API 密钥继承属主用户的全部权限：

```txt
POST /_security/api_key/_bulk_update
{
  "ids": [ "VuaCfGcBCdbkQm-e5aOx", "H3_AhoIBA9hmeQJdg7ij" ],
  "role_descriptors": {}
}
```

生成的有效权限与属主用户的权限相同：

```json
{
  "cluster": [ "all" ],
  "indices": [
    {
      "names": [ "*" ],
      "privileges": [ "all" ]
    }
  ]
}
```

以下示例仅提供 `ids` 以刷新属主用户权限的时间点快照。假设属主用户的权限已更改为：

```json
{
  "cluster": [ "manage_security" ],
  "indices": [
    {
      "names": [ "*" ],
      "privileges": [ "read" ]
    }
  ]
}
```

```txt
POST /_security/api_key/_bulk_update
{
  "ids": [ "VuaCfGcBCdbkQm-e5aOx", "H3_AhoIBA9hmeQJdg7ij" ]
}
```

两个 API 密钥生成的有效权限：

```json
{
  "cluster": [ "manage_security" ],
  "indices": [
    {
      "names": [ "*" ],
      "privileges": [ "read" ]
    }
  ]
}
```

以下示例展示了包含错误的响应：

```json
{
  "updated": [ "VuaCfGcBCdbkQm-e5aOx" ],
  "noops": [],
  "errors": {
    "count": 3,
    "details": {
      "g_PqP4IBcBaEQdwM5-WI": {
        "type": "resource_not_found_exception",
        "reason": "no API key owned by requesting user found for ID [g_PqP4IBcBaEQdwM5-WI]"
      },
      "OM4cg4IBGgpHBfLerY4B": {
        "type": "illegal_argument_exception",
        "reason": "cannot update invalidated API key [OM4cg4IBGgpHBfLerY4B]"
      },
      "Os4gg4IBGgpHBfLe2I7j": {
        "type": "exception",
        "reason": "bulk request execution failure",
        "caused_by": {
          "type": "version_conflict_engine_exception",
          "reason": "[1]: version conflict, required seqNo [1], primary term [1]. current document has seqNo [2] and primary term [1]"
        }
      }
    }
  }
}
```

- `errors` 字段仅在 `count` 大于 `0` 时出现。
- `details` 中的每个键都是发生错误的 API 密钥的 ID。
- 错误详细信息还可能包含 `caused_by` 字段。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-bulk-update-api-keys.html)
