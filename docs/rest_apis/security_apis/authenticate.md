# 验证 API

使你能够提交带有基本身份验证头的请求来验证用户，并检索有关已验证用户的信息。

成功调用会返回一个 JSON 结构，显示用户信息，例如其用户名、分配给用户的角色、任何分配的元数据，以及对用户进行身份验证和授权的 realm 的信息。

```txt
GET /_security/_authenticate
```

## 示例

```txt
GET /_security/_authenticate
```

响应示例：

```json
{
  "username": "rdeniro",
  "roles": [
    "admin"
  ],
  "full_name": null,
  "email": null,
  "metadata": { },
  "enabled": true,
  "authentication_realm": {
    "name": "file",
    "type": "file"
  },
  "lookup_realm": {
    "name": "file",
    "type": "file"
  },
  "authentication_type": "realm"
}
```

## 响应体

`username`

（字符串）已验证用户的用户名。

`roles`

（字符串数组）分配给用户的角色。

`full_name`

（字符串）用户的全名。可以为 `null`。

`email`

（字符串）用户的电子邮件。可以为 `null`。

`metadata`

（对象）任何分配的元数据。可以为空对象。

`enabled`

（布尔值）用户是否已启用。

`authentication_realm`

（对象）对用户进行身份验证的 realm。包含 `name` 和 `type` 属性。

`lookup_realm`

（对象）用于查找的 realm。包含 `name` 和 `type` 属性。

`authentication_type`

（字符串）执行身份验证的方式，例如 `realm`。

## 响应码

- `401`

  如果用户无法通过身份验证，此 API 返回 401 状态码。

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-authenticate.html)
