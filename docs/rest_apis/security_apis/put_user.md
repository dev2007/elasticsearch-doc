# 创建或更新用户 API

在本机 realm 中添加和更新用户。添加新用户时**必需**提供密码，但更新现有用户时密码是**可选**的。若只需更改密码，请改用[更改密码 API](./change_password)。

```txt
POST /_security/user/<username>
PUT /_security/user/<username>
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`<username>`

（必需，字符串）用户的标识符。必须为 1–507 个字符；可以包含基本拉丁（ASCII）区块中的字母数字字符（a-z、A-Z、0-9）、空格、标点符号和可打印符号。开头和结尾不能有空格。

## 查询参数

`refresh`

（可选，字符串）有效值为 `true`、`false`、`wait_for` — 含义与索引 API 中相同，但此处默认值为 `true`。

## 请求体

`email`

（可选，字符串或 null）用户的电子邮件。

`full_name`

（可选，字符串或 null）用户的全名。

`metadata`

（可选，对象）要与用户关联的任意元数据。

`password`

（有条件，字符串）用户的密码；必须至少 6 个字符。添加用户时为必需（或使用 `password_hash` 作为替代）；更新用户时为可选，以便可以在不更改密码的情况下更改其他字段（例如角色）。

`password_hash`

（有条件，字符串）预哈希的密码，使用为密码存储配置的相同算法生成（`xpack.security.authc.password_hashing.algorithm`）。支持客户端出于性能和/或保密性原因进行预哈希。不能与 `password` 在同一请求中同时使用。

`roles`

（可选，字符串数组）确定访问权限的角色集合。使用空列表（`[]`）创建没有任何角色的用户。

`enabled`

（可选，布尔值）用户是否已启用。默认为 `true`。

## 示例

以下示例添加用户 `jacknich`：

```json
POST /_security/user/jacknich
{
  "password" : "l0ng-r4nd0m-p@ssw0rd",
  "roles" : [ "admin", "other_role1" ],
  "full_name" : "Jack Nicholson",
  "email" : "jacknich@example.com",
  "metadata" : {
    "intelligence" : 7
  }
}
```

成功响应：

```json
{
  "created": true
}
```

更新现有用户时，`created` 设置为 `false`。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-put-user.html)
