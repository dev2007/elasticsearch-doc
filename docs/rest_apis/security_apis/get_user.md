# 获取用户 API

检索原生 realm 中的用户和内置用户的信息。

```txt
GET /_security/user
GET /_security/user/<username>
```

## 前置条件

- 要使用此 API，你必须至少具有 `read_security` 集群权限。

## 描述

有关原生 realm 的更多信息，参见[realm 和原生用户身份验证](/secure_the_stack/native_realm_authentication)。

## 路径参数

`username`

（可选，字符串）用户的标识符。可以用逗号分隔的列表指定多个用户名。如果省略此参数，此 API 将检索所有用户的信息。

## 查询参数

`with_profile_uid`

（可选，布尔值）默认为 `false`。确定是否为用户检索其用户档案 `uid`（如果存在）。

## 响应体

成功的调用返回一个用户数组，其中包含用户的 JSON 表示。用户密码不包含在内。

用户字段包括：

- `username`：用户的标识符。
- `roles`：分配给用户的角色数组。
- `full_name`：用户全名。
- `email`：用户的电子邮件地址。
- `metadata`：任意的用户元数据（键值对对象）。
- `enabled`：用户是否启用（`true`/`false`）。
- `profile_uid`：用户的档案 UID（仅在 `with_profile_uid=true` 时包含）。

如果用户未在原生 realm 中定义，则请求返回 `404`。

## 示例

以下示例检索用户 `jacknich` 的信息：

```txt
GET /_security/user/jacknich
```

API 返回以下响应：

```json
{
  "jacknich" : {
    "username" : "jacknich",
    "roles" : [ "admin", "other_role1" ],
    "full_name" : "Jack Nicholson",
    "email" : "jacknich@example.com",
    "metadata" : {
      "intelligence" : 7
    },
    "enabled" : true
  }
}
```

以下示例检索用户 `jacknich` 的信息及其用户档案 UID：

```txt
GET /_security/user/jacknich?with_profile_uid=true
```

API 返回以下响应：

```json
{
  "jacknich" : {
    "username" : "jacknich",
    "roles" : [ "admin", "other_role1" ],
    "full_name" : "Jack Nicholson",
    "email" : "jacknich@example.com",
    "metadata" : {
      "intelligence" : 7
    },
    "enabled" : true,
    "profile_uid" : "u_79HkWkwmnBH5gqFKwoxggWPjEBOur1zLPXQPEl1VBW0_0"
  }
}
```

以下示例省略用户名以检索所有用户的信息：

```txt
GET /_security/user
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-get-user.html)
