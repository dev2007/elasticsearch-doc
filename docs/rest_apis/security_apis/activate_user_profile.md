# 激活用户配置文件 API

为终端用户创建或更新配置文件文档。

```txt
POST /_security/profile/_activate
```

## 前置条件

- 要使用此 API，你必须具有 `manage_user_profile` 集群权限。

## 描述

:::important 重要

用户配置文件功能仅供 Kibana 以及 Elastic 的可观测性、企业搜索和 Elastic Security 解决方案使用。个别用户和外部应用程序不应直接调用此 API。Elastic 保留在未来版本中更改或删除此功能而不事先通知的权利。

:::

激活用户配置文件 API 使用从用户身份验证对象中提取的信息为终端用户创建或更新配置文件文档，这些信息包括 `username`、`full_name`、`roles` 以及身份验证 realm。例如，在 JWT `access_token` 的情况下，配置文件用户的 `username` 是从对该令牌进行身份验证的 JWT realm 的 `claims.principal` 设置所指向的 JWT 令牌声明中提取的。

- 更新配置文件文档时，如果该文档之前被禁用，此 API 会将其启用。
- 更新不会更改 `labels` 或 `data` 字段的现有内容。
- 调用应用程序必须拥有目标用户的 `access_token`，或 `username` 和 `password` 的组合。
- 此 API 仅适用于需要为终端用户创建或更新配置文件的应用程序（例如 Kibana）。

## 请求体

`grant_type`

（必需，字符串）授权类型。有效值包括：

- `access_token`：提供来自 Elasticsearch 令牌服务的访问令牌，或 JWT（`access_token` 或 `id_token`）。
- `password`：提供目标用户的 `username` 和 `password`。

`access_token`

（仅在 `access_token` 授权类型下必需，字符串）用户的 Elasticsearch 访问令牌或 JWT。支持 `access` 和 `id` 两种 JWT 令牌类型（取决于 JWT realm 的配置）。对任何其他授权类型无效。

`username`

（仅在 `password` 授权类型下必需，字符串）标识用户的用户名。对任何其他授权类型无效。

`password`

（仅在 `password` 授权类型下必需，字符串）用户的密码。对任何其他授权类型无效。

`client_authentication`

（可选，对象）当使用带有 JWT 的 `access_token` 授权类型时，指定需要客户端身份验证的 JWT 的客户端身份验证信息（通常通过 `ES-Client-Authentication` 请求头提供），包含：

- `scheme`（必需，字符串）区分大小写的方案。当前唯一支持的值是 `SharedSecret`。
- `value`（必需，字符串）方案后面的值。例如，如果请求头为 `ES-Client-Authentication: SharedSecret myShar3dS3cret`，则 `value` 应为 `myShar3dS3cret`。

## 响应体

成功的调用返回一个 JSON 结构，其中包含：

`uid`

配置文件的唯一 ID，例如 `u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0`。

`enabled`

指示配置文件是否启用的布尔值。

`last_synchronized`

此操作的时间戳。

`user`

用户信息对象，包含 `username`、`roles`、`realm_name`、`full_name` 和 `email`。

`labels`

标签对象（创建时为空 `{}`）。

`data`

数据对象（创建时为空 `{}`）。

`_doc`

版本控制编号，包含 `_primary_term` 和 `_seq_no`。

## 示例

以下示例使用 `password` 授权类型激活用户 `jacknich` 的配置文件：

```txt
POST /_security/profile/_activate
{
  "grant_type" : "password",
  "username" : "jacknich",
  "password" : "l0ng-r4nd0m-p@ssw0rd"
}
```

API 返回以下响应：

```json
{
  "uid" : "u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0",
  "enabled" : true,
  "last_synchronized" : 1642650651037,
  "user" : {
    "username" : "jacknich",
    "roles" : [ "admin", "other_role1" ],
    "realm_name" : "native",
    "full_name" : "Jack Nicholson",
    "email" : "jacknich@example.com"
  },
  "labels" : { },
  "data" : { },
  "_doc" : {
    "_primary_term" : 88,
    "_seq_no" : 66
  }
}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-activate-user-profile.html)
