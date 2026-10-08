# 清除服务账户令牌缓存 API

从服务账户令牌缓存中逐出部分条目。

服务账户令牌存在两个独立的缓存：

1. 一个用于由 `service_tokens` 文件支持的令牌
2. 另一个用于由 `.security` 索引支持的令牌

此 API 清除**两个**缓存中匹配的条目。

此外：

- 由 `.security` 索引支持的令牌缓存在安全索引状态更改时**自动**清除。
- 由 `service_tokens` 文件支持的令牌缓存在文件更改时**自动**清除。

有关更多信息，请参阅[服务账户](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/service-accounts.html)。

```txt
POST /_security/service/{namespace}/{service}/credential/token/{token_name}/_clear_cache
```

## 前置条件

- 要使用此 API，你必须至少具有 `manage_security` [集群权限](../security_privileges/cluster_privileges)。

## 路径参数

`namespace`

（必需，字符串）命名空间的名称。

`service`

（必需，字符串）服务的名称。

`token_name`

（必需，字符串）要从服务账户令牌缓存中逐出的令牌名称的逗号分隔列表。使用通配符（`*`）逐出属于某个服务账户的所有令牌。不支持其他通配符模式。

## 示例

以下示例清除单个令牌（`token1`）的缓存：

```txt
POST /_security/service/elastic/fleet-server/credential/token/token1/_clear_cache
```

以下示例清除多个令牌的缓存：

```txt
POST /_security/service/elastic/fleet-server/credential/token/token1,token2/_clear_cache
```

以下示例使用通配符清除某个服务账户所有令牌的缓存：

```txt
POST /_security/service/elastic/fleet-server/credential/token/*/_clear_cache
```

> [原文链接](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/security-api-clear-service-token-caches.html)
