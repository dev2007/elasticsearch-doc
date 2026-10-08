# 使 REST API 密钥失效 API

使一个或多个 REST API 密钥失效。

```txt
DELETE /_security/api_key
```

## 前置条件

- 要使用此 API，你必须至少具有以下集群权限之一：
  - `manage_security`：使任何 REST API 密钥失效，包括跨集群 REST API 密钥。
  - `manage_api_key`：使任何 REST API 密钥失效，但不包括跨集群 REST API 密钥。
  - `manage_own_api_key`：仅使用户拥有的 REST API 密钥失效。

:::note 注意

使用 `manage_own_api_key` 权限时，失效请求必须以以下三种格式之一发出：

1. 将 `owner` 参数设置为 `true`；**或者**
2. 将 `username` 和 `realm_name` 参数都设置为与用户身份匹配；**或者**
3. 如果请求由 API 密钥发起（即 API 密钥使自身失效），则在 `ids` 字段中指定其自身的 ID。

:::

## 描述

此 API 使由创建 REST API 密钥 API 或授予 REST API 密钥 API 创建的 API 密钥失效。

已失效的 API 密钥将无法通过身份验证，但在至少配置的保留期内仍可以使用获取 REST API 密钥 API 和查询 REST API 密钥 API 查看，直到它们被自动删除。

## 请求体

`ids`

（可选，字符串数组）API 密钥 ID 列表。不能与 `name`、`realm_name` 或 `username` 同时使用。

`name`

（可选，字符串）API 密钥名称。不能与 `ids`、`realm_name` 或 `username` 同时使用。

`realm_name`

（可选，字符串）身份验证 realm 的名称。不能与 `ids` 或 `name` 同时使用，也不能在 `owner` 为 `true` 时使用。

`username`

（可选，字符串）用户的用户名。不能与 `ids` 或 `name` 同时使用，也不能在 `owner` 为 `true` 时使用。

`owner`

（可选，布尔值）默认为 `false`。用于查询当前已通过身份验证的用户拥有的 API 密钥的标志。当此值为 `true` 时，不能指定 `realm_name` 或 `username`（它们被假定为当前已通过身份验证的用户）。

:::note 注意

如果 `owner` 为 `false`（默认值），则必须指定 `ids`、`name`、`username` 和 `realm_name` 中的至少一个。

:::

## 响应体

成功的调用返回一个 JSON 结构，其中包含已失效的 API 密钥 ID、之前已失效的 API 密钥 ID，以及可能的错误列表。

`invalidated_api_keys`

作为此请求的一部分而失效的 API 密钥的 ID。

`previously_invalidated_api_keys`

之前已经失效的 API 密钥的 ID。

`error_count`

使 API 密钥失效时遇到的错误数量。

`error_details`

错误的详细信息。当 `error_count` 为 `0` 时，响应中不存在此字段。

## 示例

以下示例首先创建一个名为 `my-api-key` 的 API 密钥：

```txt
POST /_security/api_key
{
  "name": "my-api-key"
}
```

API 返回以下响应：

```json
{
  "id": "VuaCfGcBCdbkQm-e5aOx",
  "name": "my-api-key",
  "api_key": "ui2lp2axTNmsyakw9tvNnw",
  "encoded": "VnVhQ2ZHY0JDZGJrUW0tZTVhT3g6dWkybHAyYXhUTm1zeWFrdzl0dk5udw=="
}
```

以下示例按 ID 使 API 密钥失效：

```txt
DELETE /_security/api_key
{
  "ids" : [ "VuaCfGcBCdbkQm-e5aOx" ]
}
```

以下示例按名称使 API 密钥失效：

```txt
DELETE /_security/api_key
{
  "name" : "my-api-key"
}
```

以下示例使 `native1` realm 中的所有用户的 API 密钥失效：

```txt
DELETE /_security/api_key
{
  "realm_name" : "native1"
}
```

以下示例使用户 `myuser` 在所有 realm 中的 API 密钥失效：

```txt
DELETE /_security/api_key
{
  "username" : "myuser"
}
```

以下示例仅当 API 密钥由当前已通过身份验证的用户拥有时，才按 ID 使其失效：

```txt
DELETE /_security/api_key
{
  "ids" : [ "VuaCfGcBCdbkQm-e5aOx" ],
  "owner" : "true"
}
```

以下示例使当前已通过身份验证的用户拥有的所有 API 密钥失效：

```txt
DELETE /_security/api_key
{
  "owner" : "true"
}
```

以下示例使用户 `myuser` 在 `native1` realm 中的所有 API 密钥失效：

```txt
DELETE /_security/api_key
{
  "username" : "myuser",
  "realm_name" : "native1"
}
```

以下示例展示了包含错误的响应：

```json
{
  "invalidated_api_keys": [
    "api-key-id-1"
  ],
  "previously_invalidated_api_keys": [
    "api-key-id-2",
    "api-key-id-3"
  ],
  "error_count": 2,
  "error_details": [
    {
      "type": "exception",
      "reason": "error occurred while invalidating api keys",
      "caused_by": {
        "type": "illegal_argument_exception",
        "reason": "invalid api key id"
      }
    },
    {
      "type": "exception",
      "reason": "error occurred while invalidating api keys",
      "caused_by": {
        "type": "illegal_argument_exception",
        "reason": "invalid api key id"
      }
    }
  ]
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-invalidate-api-key.html)
