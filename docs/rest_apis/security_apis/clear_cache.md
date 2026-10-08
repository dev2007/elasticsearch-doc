# 清除缓存 API

使用户从用户缓存中逐出。你可以完全清除缓存或逐出特定用户。

- 用户凭据缓存在每个节点的内存中，以避免对每个传入请求都连接到远程身份验证服务或访问磁盘。
- 你可以使用 realm 设置来配置用户缓存 — 有关更多信息，请参阅[控制用户缓存](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/user-cache.html)。
- 相关的缓存清除 API：

  - [清除角色缓存 API](./clear_role_cache) — 从角色缓存中逐出角色
  - [清除权限缓存 API](./clear_privilege_cache) — 从权限缓存中逐出权限
  - [清除 API 密钥缓存 API](./clear_api_key_cache) — 从 API 密钥缓存中逐出 API 密钥

```txt
POST /_security/realm/<realms>/_clear_cache
```

## 路径参数

`<realms>`

（必需，字符串）要清除的 realm 的逗号分隔列表。要清除所有 realm，使用 `*`。**不支持其他通配符模式。**

## 查询参数

`usernames`

（可选，列表）要从缓存中清除的用户的逗号分隔列表。如果省略，API 会从用户缓存中逐出**所有**用户。

## 示例

以下示例从 `file` realm 缓存中逐出所有用户：

```txt
POST /_security/realm/default_file/_clear_cache
```

以下示例从 `file` realm 缓存中逐出选定用户：

```txt
POST /_security/realm/default_file/_clear_cache?usernames=rdeniro,alpacino
```

以下示例清除多个 realm 的缓存：

```txt
POST /_security/realm/default_file,ldap1/_clear_cache
```

以下示例清除所有 realm 的缓存：

```txt
POST /_security/realm/*/_clear_cache
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-clear-cache.html)
