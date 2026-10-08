# 清除角色缓存 API

从本机角色缓存中逐出角色。

```txt
POST /_security/role/<roles>/_clear_cache
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 描述

有关本机 realm 的更多信息，请参阅 [Realm](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/realms.html) 和[本机用户身份验证](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/native-realm.html)。

## 路径参数

`<roles>`

（必需，字符串）要从角色缓存中逐出的角色的逗号分隔列表。要逐出所有角色，使用 `*`。不支持其他通配符模式。

## 示例

以下示例从角色缓存中逐出单个角色（`my_admin_role`）：

```txt
POST /_security/role/my_admin_role/_clear_cache
```

以下示例从角色缓存中逐出多个角色（`my_admin_role`、`my_test_role`）：

```txt
POST /_security/role/my_admin_role,my_test_role/_clear_cache
```

以下示例使用 `*` 从缓存中逐出所有角色：

```txt
POST /_security/role/*/_clear_cache
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-clear-role-cache.html)
