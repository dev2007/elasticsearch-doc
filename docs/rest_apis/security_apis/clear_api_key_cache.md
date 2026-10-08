# 清除 API 密钥缓存 API

从 API 密钥缓存中逐出部分条目。安全索引的状态更改时，缓存也会自动清除。

```txt
POST /_security/api_key/<ids>/_clear_cache
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 描述

有关 API 密钥的更多信息，请参阅：

- [创建 API 密钥 API](./create_api_key)
- [获取 API 密钥 API](./get_api_key)
- [使 API 密钥失效 API](./invalidate_api_key)

## 路径参数

`<ids>`

（必需，字符串）要从 API 密钥缓存中逐出的 API 密钥 ID 的逗号分隔列表。要逐出所有 API 密钥，使用 `*`。不支持其他通配符模式。

## 示例

以下示例清除单个 API 密钥（ID：`yVGMr3QByxdh1MSaicYx`）的缓存条目：

```txt
POST /_security/api_key/yVGMr3QByxdh1MSaicYx/_clear_cache
```

以下示例清除多个 API 密钥的缓存条目：

```txt
POST /_security/api_key/yVGMr3QByxdh1MSaicYx,YoiMaqREw0YVpjn40iMg/_clear_cache
```

以下示例使用 `*` 清除 API 密钥缓存中的所有条目：

```txt
POST /_security/api_key/*/_clear_cache
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-clear-api-key-cache.html)
