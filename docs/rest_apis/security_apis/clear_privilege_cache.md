# 清除权限缓存 API

从本机应用程序权限缓存中逐出权限。当应用程序的权限更新时，其缓存也会自动清除。

```txt
POST /_security/privilege/<applications>/_clear_cache
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 描述

清除权限缓存 API 从本机应用程序权限缓存中逐出权限。

## 路径参数

`<applications>`

（必需，字符串）要清除的应用程序的逗号分隔列表。要清除所有应用程序，使用 `*`。不支持其他通配符模式。

## 示例

以下示例清除单个应用程序（`myapp`）的缓存：

```txt
POST /_security/privilege/myapp/_clear_cache
```

以下示例清除多个应用程序的缓存：

```txt
POST /_security/privilege/myapp,my-other-app/_clear_cache
```

以下示例使用 `*` 清除所有应用程序的缓存：

```txt
POST /_security/privilege/*/_clear_cache
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-clear-privilege-cache.html)
