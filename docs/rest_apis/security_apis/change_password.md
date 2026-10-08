# 更改密码 API

更改**本机 realm** 中的用户和**内置用户**的密码。

- 你可以使用[创建或更新用户 API](./put_user) 更新用户除了 `username` 和 `password` 之外的所有信息。此 API 用于更改用户的密码。
- 有关本机 realm 的更多信息，请参阅 [Realm](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/realms.html) 和[本机用户身份验证](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/native-realm.html)。

```txt
POST /_security/user/_password
POST /_security/user/<username>/_password
```

## 前置条件

- 每个用户都可以更改**自己的**密码。
- 具有 `manage_security` 权限的用户可以更改**其他用户**的密码。

## 路径参数

`<username>`

（可选，字符串）要更改其密码的用户。如果省略，则更改**当前用户**的密码。

## 请求体

`password`

（字符串）新的密码值。密码必须至少 6 个字符长。

`password_hash`

（字符串）新密码的*哈希值*。必须使用为密码存储配置的相同哈希算法生成（请参阅[用户缓存和密码哈希算法](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-settings.html#hashing-algorithm-settings)中的 `xpack.security.authc.password_hashing.algorithm` 设置）。允许客户端出于性能和/或保密性原因预哈希密码。

:::note 注意

`password` 和 `password_hash` 必须二选一（其中一个为必需），但**不能**在同一请求中同时使用两者。

:::

## 示例

更新用户 `jacknich` 的密码：

```json
POST /_security/user/jacknich/_password
{
  "password": "new-test-password"
}
```

成功调用返回一个空的 JSON 结构：

```json
{}
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-change-password.html)
