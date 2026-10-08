# 更新 REST API 密钥 API

更新 REST API 密钥的访问范围、元数据和过期时间。

```txt
PUT /_security/api_key/<id>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_own_api_key` 集群权限。
- 用户只能更新自己创建或授予给自己的 API 密钥。要更新其他用户的 API 密钥，必须使用 run as 功能代表另一个用户提交请求（参见[代表其他用户提交请求](/secure_the_stack/submitting_requests_on_behalf_of_other_users)）。
- 不能将 API 密钥用作此 API 的身份验证凭据 — 必须使用属主用户的凭据。

## 描述

使用此 API 更新由创建 REST API 密钥 API 或授予 REST API 密钥 API 创建的 API 密钥。要对多个 API 密钥应用相同的更新，请使用批量更新 REST API 密钥 API 以减少开销。

无法更新已过期的 API 密钥，或已通过使 REST API 密钥失效 API 使其失效的 API 密钥。

API 密钥的访问范围由指定的 `role_descriptors` 加上请求时属主用户权限的快照派生而来。每次调用时都会自动刷新该快照。

:::important 重要

即使不指定 `role_descriptors`，调用此 API 也可能更改 API 密钥的访问范围 — 如果属主的权限自创建或上次修改以来发生了变化。

:::

## 路径参数

`id`

（必需，字符串）要更新的 API 密钥的 ID。

## 请求体

`role_descriptors`

（可选，对象）分配给 API 密钥的角色描述符。有效权限是所分配权限与属主权限的时间点快照的交集。提供一个空对象 `{}` 可移除已分配的权限（此时 API 密钥继承属主用户的全部权限）。结构与创建 REST API 密钥 API 中相同。

`metadata`

（可选，对象）与 API 密钥关联的任意元数据（支持嵌套结构）。以 `_` 开头的顶层键保留供系统使用。指定此参数时，它会完全替换现有的元数据。

`expiration`

（可选，字符串）API 密钥的过期时间。默认情况下，API 密钥永不过期。可以省略以保持不变。

## 响应体

`updated`

（布尔值）如果 API 密钥已更新则为 `true`；如果未检测到任何更改则为 `false`。

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

假设该 API 密钥属主用户的权限为：

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

以下示例更新该 API 密钥的角色描述符和元数据：

```txt
PUT /_security/api_key/VuaCfGcBCdbkQm-e5aOx
{
  "role_descriptors" : {
    "role-a" : {
      "indices" : [
        {
          "names" : ["*"],
          "privileges" : ["write"]
        }
      ]
    }
  },
  "metadata" : {
    "environment" : {
      "level" : 2,
      "trusted" : true,
      "tags" : ["production"]
    }
  }
}
```

API 返回以下响应：

```json
{
  "updated" : true
}
```

生成的有效权限是角色描述符与属主用户权限的交集：

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
PUT /_security/api_key/VuaCfGcBCdbkQm-e5aOx
{
  "role_descriptors" : { }
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

以下示例使用空请求体刷新属主用户权限的时间点快照。假设属主用户的权限已更改为：

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
PUT /_security/api_key/VuaCfGcBCdbkQm-e5aOx
```

生成的有效权限：

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

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-update-api-key.html)
